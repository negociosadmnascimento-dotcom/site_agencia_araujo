import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Plus, MessageCircle, ArrowRight, X, Check, Trash2,
  Phone, Mail, DollarSign, FileText, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const LEADS_KEY = 'admin_leads';
const SITE_KEY = 'site_form_submissions';

const SEED_LEADS = [
  {
    id: 'seed_01',
    name: 'Diretoria Hospital Copa D\'Or',
    service: 'Fotos Corporativas Equipe Médica',
    phone: '(21) 98877-1122',
    email: 'rh@copador.com.br',
    source: 'WhatsApp Direto',
    estimatedValue: 'R$ 7.500,00',
    stage: 'contato',
    date: 'Hoje, 11:15',
    notes: 'Precisam de fotos de 15 médicos especialistas para o anuário.',
  },
  {
    id: 'seed_02',
    name: 'Restaurante Fogo & Brasa Barra',
    service: 'Gastronomia & Vídeo Reels',
    phone: '(21) 97766-3344',
    email: 'gerencia@fogoebrasa.com',
    source: 'Instagram',
    estimatedValue: 'R$ 3.900,00',
    stage: 'proposta',
    date: 'Ontem',
    notes: 'Proposta enviada por WhatsApp. Aguardando aprovação do sócio.',
  },
  {
    id: 'seed_03',
    name: 'Beatriz & Guilherme',
    service: 'Casamento & Pré-Wedding',
    phone: '(21) 98122-3344',
    email: 'bia.guilherme@gmail.com',
    source: 'Indicação',
    estimatedValue: 'R$ 9.800,00',
    stage: 'fechado',
    date: 'Há 2 dias',
    notes: 'Sinal de 50% pago via Pix. Contrato assinado.',
  },
];

const EMPTY_FORM = {
  name: '',
  service: '',
  phone: '',
  email: '',
  estimatedValue: '',
  notes: '',
  stage: 'novo',
  source: 'Manual',
};

export default function LeadsModule() {
  const { logActivity } = useAuth();
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadLeads = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
      // Also pick up any new site submissions not yet in leads
      const siteSubmissions = JSON.parse(localStorage.getItem(SITE_KEY) || '[]');
      const storedIds = stored.map(l => l.id);
      const fromSite = siteSubmissions
        .filter(s => !storedIds.includes('from_' + s.id))
        .map(s => ({
          id: 'from_' + s.id,
          name: s.name,
          service: s.service,
          phone: s.phone,
          email: s.email || '',
          source: 'Formulário do Site',
          estimatedValue: '',
          stage: 'novo',
          date: s.createdAt,
          notes: s.message,
        }));

      const seedIds = stored.map(l => l.id);
      const seeds = SEED_LEADS.filter(s => !seedIds.includes(s.id) && !stored.find(l => l.id === s.id));
      const all = [...fromSite, ...stored, ...seeds];
      setLeads(all);
    } catch (_) {
      setLeads(SEED_LEADS);
    }
  };

  const saveLeads = (updated) => {
    // Only persist non-seed leads
    const toStore = updated.filter(l => !l.id.startsWith('seed_'));
    localStorage.setItem(LEADS_KEY, JSON.stringify(toStore));
  };

  useEffect(() => {
    loadLeads();
    const interval = setInterval(loadLeads, 15000);
    return () => clearInterval(interval);
  }, []);

  const stages = [
    { key: 'novo', label: '1. Novo Lead', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { key: 'contato', label: '2. Em Atendimento', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { key: 'proposta', label: '3. Proposta Enviada', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
    { key: 'fechado', label: '4. Fechado / Ganho', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { key: 'perdido', label: '5. Arquivado', color: 'border-slate-600 text-slate-400 bg-slate-800/40' },
  ];

  const getNextStage = (current) => {
    const order = ['novo', 'contato', 'proposta', 'fechado'];
    const idx = order.indexOf(current);
    return idx !== -1 && idx < order.length - 1 ? order[idx + 1] : null;
  };

  const moveStage = (id, next) => {
    setLeads(prev => {
      const updated = prev.map(l => l.id === id ? { ...l, stage: next } : l);
      saveLeads(updated);
      return updated;
    });
    logActivity('MOVE_LEAD', 'leads', `Lead movido para etapa: ${next}`);
    showToast(`Lead avançado para "${stages.find(s => s.key === next)?.label}"!`);
  };

  const deleteLead = (id, name) => {
    if (!window.confirm(`Remover lead "${name}"?`)) return;
    setLeads(prev => {
      const updated = prev.filter(l => l.id !== id);
      saveLeads(updated);
      return updated;
    });
    logActivity('REMOCAO_LEAD', 'leads', `Removeu lead: ${name}`);
    showToast('Lead removido.', 'error');
  };

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLead.name.trim() || !newLead.phone.trim()) {
      showToast('Preencha pelo menos nome e telefone.', 'error');
      return;
    }
    const lead = {
      id: 'lead_' + Date.now(),
      ...newLead,
      date: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    };
    setLeads(prev => {
      const updated = [lead, ...prev];
      saveLeads(updated);
      return updated;
    });
    logActivity('NOVO_LEAD', 'leads', `Novo lead criado: ${lead.name}`);
    showToast(`Lead "${lead.name}" adicionado ao funil!`);
    setNewLead(EMPTY_FORM);
    setShowModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl flex items-center gap-2 transition-all animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Funil de Vendas • Pipeline de Oportunidades</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Funil de Oportunidades (Leads)</h1>
          <p className="text-slate-400 text-xs">
            Acompanhe o ciclo completo de cada contato, da primeira mensagem ao fechamento do contrato.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLeads}
            title="Atualizar leads"
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-gold/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stages.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage.key);
          return (
            <div key={stage.key} className="rounded-2xl bg-slate-900/60 border border-white/10 p-4 flex flex-col min-h-[480px]">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">{stageLeads.length}</span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageLeads.map(lead => {
                  const nextStage = getNextStage(lead.stage);
                  return (
                    <div
                      key={lead.id}
                      className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-gold/30 transition-all space-y-3 group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-white block">{lead.name}</span>
                          <button
                            onClick={() => deleteLead(lead.id, lead.name)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400/60 hover:text-red-400 transition-all shrink-0"
                            title="Remover"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gold-300 font-medium mt-0.5">{lead.service}</p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{lead.notes}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                        <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                          {lead.estimatedValue || '—'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                          {lead.source}
                        </span>
                      </div>

                      <div className="pt-1 flex items-center justify-between gap-2">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(lead.name)},%20sou%20da%20Agências%20Araújo!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                            title="Chamar no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {nextStage && (
                          <button
                            onClick={() => moveStage(lead.id, nextStage)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-gold hover:text-gold-light bg-gold/10 hover:bg-gold/20 px-2 py-1 rounded-lg transition-colors ml-auto"
                          >
                            <span>Avançar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl">
                    <span className="text-xs text-slate-500">Nenhum lead nesta etapa</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-gold/30 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
              <h2 className="text-lg font-serif font-bold text-white">Novo Lead Manual</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="Ex: Maria da Silva"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Telefone / WhatsApp *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={newLead.phone}
                      onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                      placeholder="(21) 99999-9999"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">E-mail</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={newLead.email}
                      onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Serviço de Interesse</label>
                  <input
                    type="text"
                    value={newLead.service}
                    onChange={e => setNewLead({ ...newLead, service: e.target.value })}
                    placeholder="Ex: Casamento, Corporativo..."
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Valor Estimado</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={newLead.estimatedValue}
                      onChange={e => setNewLead({ ...newLead, estimatedValue: e.target.value })}
                      placeholder="R$ 0,00"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Observações</label>
                  <div className="relative">
                    <FileText className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <textarea
                      rows={3}
                      value={newLead.notes}
                      onChange={e => setNewLead({ ...newLead, notes: e.target.value })}
                      placeholder="Detalhes, preferências, contexto..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none resize-none"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Etapa Inicial</label>
                  <select
                    value={newLead.stage}
                    onChange={e => setNewLead({ ...newLead, stage: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  >
                    <option value="novo">1. Novo Lead</option>
                    <option value="contato">2. Em Atendimento</option>
                    <option value="proposta">3. Proposta Enviada</option>
                    <option value="fechado">4. Fechado / Ganho</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-dark-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-lg flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
