import React, { useState, useEffect } from 'react';
import { 
  Inbox, Mail, MessageCircle, CheckCircle2, UserPlus, 
  Trash2, ShieldCheck, Search, RefreshCw 
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';

const STORAGE_KEY = 'site_form_submissions';
const READ_KEY = 'admin_forms_read_ids';
const DELETED_KEY = 'admin_forms_deleted_ids';

const SAMPLE_SUBMISSIONS = [];

export default function FormsInboxModule({ onNavigate }) {
  const { logActivity } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('Todos');
  const [submissions, setSubmissions] = useState([]);

  const loadSubmissions = async () => {
    try {
      const readIds = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
      const deletedIds = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
      let cloudSubmissions = [];

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('form_submissions')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            cloudSubmissions = data.map(r => ({
              id: 'sb_' + r.id,
              rawId: r.id,
              name: r.name,
              email: r.email || '',
              phone: r.phone,
              service: r.service || 'Orçamento do Site',
              eventDate: r.event_date || 'A combinar',
              message: r.message,
              createdAt: r.created_at ? new Date(r.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Hoje',
              read: r.read || false,
              source: r.source || 'Formulário do Site (Cloud)',
            }));
          }
        } catch (sbErr) {
          console.warn('Supabase fetch forms fallback:', sbErr);
        }
      }

      const real = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const normalizePhone = (p) => (p || '').replace(/\D/g, '');
      const seenIds = new Set();
      const seenPhones = new Set();
      const unique = [];

      for (const s of [...cloudSubmissions, ...real]) {
        if (!s || !s.id) continue;
        const strId = String(s.id);
        const rawId = s.rawId ? String(s.rawId) : strId.replace('sb_', '');
        const normPhone = normalizePhone(s.phone);

        // Se foi excluído, ignora
        if (deletedIds.includes(strId) || deletedIds.includes(rawId)) continue;

        if (seenIds.has(strId) || seenIds.has(rawId)) continue;
        if (normPhone && seenPhones.has(normPhone)) continue;

        seenIds.add(strId);
        seenIds.add(rawId);
        if (normPhone) seenPhones.add(normPhone);

        const isRead = readIds.includes(strId) || readIds.includes(rawId) || Boolean(s.read);
        unique.push({ ...s, read: isRead });
      }

      setSubmissions(unique);
    } catch (_) {
      setSubmissions([]);
    }
  };

  useEffect(() => {
    loadSubmissions();
    const interval = setInterval(loadSubmissions, 15000);
    return () => clearInterval(interval);
  }, []);

  const persistReadIds = (ids) => {
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  };

  const persistDeletedIds = (ids) => {
    localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
  };

  const toggleRead = async (id) => {
    const rawId = String(id).replace('sb_', '');
    let nextState = false;

    setSubmissions(prev => {
      const updated = prev.map(s => {
        if (s.id !== id && s.rawId !== rawId) return s;
        nextState = !s.read;
        logActivity('LEITURA_FORMULARIO', 'formularios', `${nextState ? 'Marcou como lido' : 'Marcou como não lido'} formulário de ${s.name}`);
        return { ...s, read: nextState };
      });
      const readIds = updated.filter(s => s.read).map(s => s.id);
      persistReadIds(readIds);
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('form_submissions').update({ read: nextState }).eq('id', rawId);
      } catch (err) {
        console.warn('Erro ao atualizar leitura no Supabase:', err);
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remover formulário de "${name}"?`)) return;
    const rawId = String(id).replace('sb_', '');
    const deletedIds = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
    if (!deletedIds.includes(String(id))) deletedIds.push(String(id));
    if (!deletedIds.includes(rawId)) deletedIds.push(rawId);
    persistDeletedIds(deletedIds);

    setSubmissions(prev => prev.filter(s => s.id !== id && s.id !== rawId && s.rawId !== rawId));

    // Remove do Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('form_submissions').delete().eq('id', rawId);
      } catch (sbErr) {
        console.warn('Erro ao excluir no Supabase:', sbErr);
      }
    }

    // Remove do localStorage
    try {
      const localForms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const filtered = localForms.filter(f => f.id !== id && f.id !== rawId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (_) {}

    logActivity('REMOCAO_FORMULARIO', 'formularios', `Removeu formulário de ${name}`);
  };

  const handleConvertToLead = (sub) => {
    // Add to leads pipeline
    try {
      const leads = JSON.parse(localStorage.getItem('admin_leads') || '[]');
      const already = leads.find(l => l.email === sub.email && l.phone === sub.phone);
      if (!already) {
        leads.unshift({
          id: 'lead_' + Date.now(),
          name: sub.name,
          service: sub.service,
          phone: sub.phone,
          email: sub.email,
          source: 'Formulário do Site',
          estimatedValue: '',
          stage: 'novo',
          date: sub.createdAt,
          notes: sub.message,
        });
        localStorage.setItem('admin_leads', JSON.stringify(leads));
      }
    } catch (_) {}

    // Mark as read
    toggleRead(sub.id);
    logActivity('CONVERSAO_LEAD', 'leads', `Converteu formulário de ${sub.name} em oportunidade no funil de vendas`);
    onNavigate?.('leads');
  };

  const filtered = submissions.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRead =
      filterRead === 'Todos' ||
      (filterRead === 'Não Lidos' ? !s.read : s.read);
    return matchesSearch && matchesRead;
  });

  const unreadCount = submissions.filter(s => !s.read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <Inbox className="w-3.5 h-3.5" />
            <span>Formulários Recebidos • Caixa de Entrada do Site</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Solicitações do Formulário do Site</h1>
          <p className="text-slate-400 text-xs">
            Mensagens recebidas pelo formulário de orçamento público em agenciasaraujo.com.br — novas entradas aparecem automaticamente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSubmissions}
            title="Atualizar caixa de entrada"
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-gold/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/30 text-gold-300">
            {unreadCount} {unreadCount === 1 ? 'não lido' : 'não lidos'}
          </span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 text-xs text-slate-300 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <p>
          <strong>Segurança Cirúrgica:</strong> Visitantes do site têm permissão apenas de envio (INSERT). Nenhum visitante externo consegue ler orçamentos enviados por outros contatos.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou serviço..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:border-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['Todos', 'Não Lidos', 'Lidos'].map(st => (
            <button
              key={st}
              onClick={() => setFilterRead(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterRead === st
                  ? 'bg-gold-500 text-dark-950 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-sm border border-dashed border-white/10 rounded-3xl">
            Nenhuma solicitação encontrada.
          </div>
        )}

        {filtered.map(sub => (
          <div
            key={sub.id}
            className={`rounded-3xl border p-6 transition-all shadow-xl space-y-4 ${
              sub.read
                ? 'bg-slate-900/50 border-white/5'
                : 'bg-slate-900/90 border-gold/40 shadow-gold/5 ring-1 ring-gold/20'
            }`}
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${sub.read ? 'bg-slate-600' : 'bg-gold animate-ping'}`} />
                <h3 className="font-bold text-white text-base">{sub.name}</h3>
                <span className="text-xs text-slate-500 font-mono">({sub.createdAt})</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-white/5 border border-white/10 text-gold-300">
                {sub.service}
              </span>
            </div>

            {/* Message Body */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-200 leading-relaxed italic">
              "{sub.message}"
            </div>

            {/* Info & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-white/5 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono">
                <span>Tel: <strong className="text-slate-200">{sub.phone}</strong></span>
                {sub.email && <span>Email: <strong className="text-slate-200">{sub.email}</strong></span>}
                {sub.eventDate && <span>Data: <strong className="text-gold">{sub.eventDate}</strong></span>}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => toggleRead(sub.id)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-colors"
                >
                  {sub.read ? 'Marcar Não Lido' : 'Marcar Lido'}
                </button>

                <button
                  onClick={() => handleConvertToLead(sub)}
                  className="px-3 py-1.5 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Converter em Lead</span>
                </button>

                <a
                  href={`https://wa.me/55${sub.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(sub.name)},%20recebemos%20sua%20solicitação%20no%20site%20da%20Agências%20Araújo!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-green-400" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => handleDelete(sub.id, sub.name)}
                  className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
                  title="Remover solicitação"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
