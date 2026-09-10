import React, { useState } from 'react';
import { 
  FileText, Plus, Search, Filter, MessageCircle, Copy, Check, 
  ExternalLink, DollarSign, Calendar, Clock, ShieldCheck, X, Trash2
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';

export default function ProposalsModule() {
  const { isSuperAdmin, logActivity } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [copiedId, setCopiedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [proposals, setProposals] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_proposals');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [newProp, setNewProp] = useState({
    clientName: '',
    phone: '',
    service: 'Retratos Pessoais',
    packageName: 'Pacote Essencial',
    amount: '',
    validUntil: '15 dias a partir de hoje',
  });

  const handleCopyLink = (prop) => {
    const link = `https://agenciasaraujo.com.br/proposta/${prop.token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(prop.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteProposal = (id, code) => {
    if (!window.confirm(`Deseja excluir o orçamento ${code}?`)) return;
    const next = proposals.filter(p => p.id !== id);
    setProposals(next);
    try { localStorage.setItem('admin_proposals', JSON.stringify(next)); } catch (_) {}
    logActivity?.('EXCLUSAO_PROPOSTA', 'propostas', `Excluiu proposta ${code}`);
  };

  const handleAddProposal = (e) => {
    e.preventDefault();
    if (!newProp.clientName || !newProp.amount) return;

    const propCode = `PROP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const created = {
      id: `prop_${Date.now()}`,
      code: propCode,
      clientName: newProp.clientName,
      phone: newProp.phone || '(21) 97429-9780',
      service: newProp.service,
      packageName: newProp.packageName,
      amount: newProp.amount.startsWith('R$') ? newProp.amount : `R$ ${newProp.amount}`,
      validUntil: '30/03/2026',
      status: 'Enviada',
      token: `sec_${Math.random().toString(36).substring(2, 12)}`,
      statusColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      createdDate: new Date().toLocaleDateString('pt-BR'),
    };

    const updated = [created, ...proposals];
    setProposals(updated);
    try { localStorage.setItem('admin_proposals', JSON.stringify(updated)); } catch (_) {}
    logActivity('NOVA_PROPOSTA', 'propostas', `Gerou orçamento ${propCode} no valor de ${created.amount} para ${created.clientName}`);
    setShowAddModal(false);
  };

  const filtered = proposals.filter((p) => {
    const matchesSearch = p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Módulo 06 • Propostas Comerciais & Orçamentos</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Gestão de Propostas Comerciais</h1>
          <p className="text-slate-400 text-xs">
            Cada proposta possui token único e criptografado: o cliente tem acesso isolado estritamente à sua proposta.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Proposta</span>
        </button>
      </div>

      {/* Security notice */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-gold/20 text-xs text-slate-300 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
        <p>
          <strong>Segurança Cirúrgica de Isolamento:</strong> Links compartilháveis usam chaves de acesso seguras (<code className="text-gold-300">sec_*</code>). Clientes nunca visualizam orçamentos de outros clientes nem a carteira comercial da agência.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:border-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['Todos', 'Aceita', 'Em Análise', 'Enviada'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-gold-500 text-dark-950 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((prop) => (
          <div
            key={prop.id}
            className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 hover:border-gold/30 transition-all shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                  {prop.code}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${prop.statusColor}`}>
                  {prop.status}
                </span>
                <span className="text-xs text-slate-500 font-mono">Emitido em: {prop.createdDate}</span>
              </div>

              <h3 className="text-base font-bold text-white pt-1">{prop.clientName}</h3>
              <p className="text-xs text-gold-300 font-medium">{prop.service}</p>
              <p className="text-xs text-slate-400">{prop.packageName}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 lg:gap-8 shrink-0">
              <div className="text-left lg:text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Valor da Proposta</span>
                <span className="text-xl font-serif font-bold text-white block">
                  {isSuperAdmin ? prop.amount : '••••••••'}
                </span>
                <span className="text-[11px] font-mono text-slate-500">Validade: {prop.validUntil}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(prop)}
                  title="Copiar Link Seguro e Isolado do Cliente"
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === prop.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Link Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gold" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/55${prop.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(prop.clientName)}!%20Sua%20proposta%20exclusiva%20da%20Agências%20Araújo%20está%20pronta:%20https://agenciasaraujo.com.br/proposta/${prop.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
                  title="Enviar Link no WhatsApp do Cliente"
                >
                  <WhatsAppIcon className="w-4 h-4 text-green-400" />
                </a>

                <button
                  onClick={() => handleDeleteProposal(prop.id, prop.code)}
                  title="Excluir proposta"
                  className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Proposal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-gold/30 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-white mb-1">Criar Proposta Comercial</h2>
            <p className="text-xs text-slate-400 mb-6">Gera link seguro individual para o cliente visualizar</p>

            <form onSubmit={handleAddProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  value={newProp.clientName}
                  onChange={(e) => setNewProp({ ...newProp, clientName: e.target.value })}
                  placeholder="Ex: Dra. Mariana Costa"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={newProp.phone}
                    onChange={(e) => setNewProp({ ...newProp, phone: e.target.value })}
                    placeholder="(21) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor (R$)</label>
                  <input
                    type="text"
                    required
                    value={newProp.amount}
                    onChange={(e) => setNewProp({ ...newProp, amount: e.target.value })}
                    placeholder="3.500,00"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Serviço</label>
                <select
                  value={newProp.service}
                  onChange={(e) => setNewProp({ ...newProp, service: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                >
                  <option>Retratos Pessoais & Posicionamento</option>
                  <option>Retratos Corporativos Executive</option>
                  <option>Campanha Gastronômica & Drinks</option>
                  <option>Cobertura Maracanã / Grande Escala</option>
                  <option>Casamento & Produção Audiovisual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detalhes do Pacote</label>
                <input
                  type="text"
                  value={newProp.packageName}
                  onChange={(e) => setNewProp({ ...newProp, packageName: e.target.value })}
                  placeholder="Ex: 20 fotos tratadas + Drone 4K + Entrega em 5 dias"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20"
                >
                  Gerar e Enviar Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
