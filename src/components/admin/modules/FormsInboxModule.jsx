import React, { useState, useEffect } from 'react';
import { 
  Inbox, Mail, MessageCircle, CheckCircle2, UserPlus, 
  Trash2, ShieldCheck, Search, RefreshCw 
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';

const STORAGE_KEY = 'site_form_submissions';
const READ_KEY = 'admin_forms_read_ids';
const DELETED_KEY = 'admin_forms_deleted_ids';

const SAMPLE_SUBMISSIONS = [
  {
    id: 'sample_01',
    name: 'Camila Mendonça Ferreira',
    email: 'camila.mendonca@gmail.com',
    phone: '(21) 99123-4567',
    service: 'Retratos Pessoais & Posicionamento',
    eventDate: '28/03/2026',
    message: 'Olá! Sou arquiteta e gostaria de renovar meus retratos profissionais para publicação em revista especializada.',
    createdAt: 'Ontem, 14:15',
    read: false,
    source: 'Formulário do Site',
  },
  {
    id: 'sample_02',
    name: 'Chef Rodrigo Guimarães',
    email: 'rodrigo@bistrocarioca.com.br',
    phone: '(21) 97766-5544',
    service: 'Gastronomia & Marcas',
    eventDate: '02/04/2026',
    message: 'Solicito orçamento para ensaio do novo menu degustação de inverno, incluindo fotos estilizadas de pratos e drinks autorais.',
    createdAt: '03/03/2026',
    read: true,
    source: 'Formulário do Site',
  },
];

export default function FormsInboxModule({ onNavigate }) {
  const { logActivity } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('Todos');
  const [submissions, setSubmissions] = useState([]);

  const loadSubmissions = () => {
    try {
      const readIds = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
      const deletedIds = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
      const real = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

      const allEntries = [...real, ...SAMPLE_SUBMISSIONS]
        .filter(s => !deletedIds.includes(s.id))
        .map(s => ({ ...s, read: readIds.includes(s.id) ? true : s.read }));

      setSubmissions(allEntries);
    } catch (_) {
      setSubmissions(SAMPLE_SUBMISSIONS);
    }
  };

  useEffect(() => {
    loadSubmissions();
    // Poll every 15s so new site submissions appear without reload
    const interval = setInterval(loadSubmissions, 15000);
    return () => clearInterval(interval);
  }, []);

  const persistReadIds = (ids) => {
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  };

  const persistDeletedIds = (ids) => {
    localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
  };

  const toggleRead = (id) => {
    setSubmissions(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        const next = !s.read;
        logActivity('LEITURA_FORMULARIO', 'formularios', `${next ? 'Marcou como lido' : 'Marcou como não lido'} formulário de ${s.name}`);
        return { ...s, read: next };
      });
      const readIds = updated.filter(s => s.read).map(s => s.id);
      persistReadIds(readIds);
      return updated;
    });
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Remover formulário de "${name}"?`)) return;
    setSubmissions(prev => {
      const next = prev.filter(s => s.id !== id);
      const deletedIds = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
      persistDeletedIds([...deletedIds, id]);
      return next;
    });
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
