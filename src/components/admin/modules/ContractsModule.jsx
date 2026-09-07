import React, { useState } from 'react';
import { 
  FileCheck, Plus, Search, Filter, MessageCircle, Copy, Check, 
  ExternalLink, ShieldCheck, Download, Calendar, User, X 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function ContractsModule() {
  const { isSuperAdmin, logActivity } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [copiedId, setCopiedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [contracts, setContracts] = useState([
    {
      id: 'ctr_01',
      contractNumber: 'CTR-2026-041',
      clientName: 'Dr. Roberto Silveira',
      clientCpf: '128.***.***-09',
      serviceTitle: 'Prestação de Serviços Fotográficos & Cessão de Imagem',
      eventDate: '08/03/2026',
      totalAmount: 'R$ 3.800,00',
      signedStatus: 'Assinado Digitalmente',
      signedAt: '02/03/2026 14:10',
      token: 'ctr_token_88921a',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      phone: '(21) 99888-7766',
    },
    {
      id: 'ctr_02',
      contractNumber: 'CTR-2026-042',
      clientName: 'Mariana & Lucas Alencar',
      clientCpf: '098.***.***-45',
      serviceTitle: 'Produção Audiovisual Completa Casamento + Drone RJ',
      eventDate: '10/03/2026',
      totalAmount: 'R$ 12.400,00',
      signedStatus: 'Aguardando Assinatura',
      signedAt: null,
      token: 'ctr_token_44102b',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      phone: '(21) 98765-4321',
    },
    {
      id: 'ctr_03',
      contractNumber: 'CTR-2026-043',
      clientName: 'Le Vin Bistrô Gourmet',
      clientCpf: 'CNPJ 34.***.***/0001-90',
      serviceTitle: 'Contrato Trimestral de Produção Gastronômica & Redes',
      eventDate: '14/03/2026',
      totalAmount: 'R$ 9.600,00',
      signedStatus: 'Assinado Digitalmente',
      signedAt: '25/02/2026 18:30',
      token: 'ctr_token_33119c',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      phone: '(21) 97654-3210',
    },
  ]);

  const [newCtr, setNewCtr] = useState({
    clientName: '',
    clientCpf: '',
    serviceTitle: 'Prestação de Serviços Fotográficos & Cessão de Imagem',
    totalAmount: '',
    phone: '',
    eventDate: '',
  });

  const handleCopyLink = (ctr) => {
    const link = `https://agenciasaraujo.com.br/contrato/${ctr.token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(ctr.id);
    logActivity('COPIA_LINK_CONTRATO', 'contratos', `Copiou link de assinatura digital do contrato ${ctr.contractNumber}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddContract = (e) => {
    e.preventDefault();
    if (!newCtr.clientName || !newCtr.totalAmount) return;

    const num = `CTR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const created = {
      id: `ctr_${Date.now()}`,
      contractNumber: num,
      clientName: newCtr.clientName,
      clientCpf: newCtr.clientCpf || 'Sob consulta',
      serviceTitle: newCtr.serviceTitle,
      eventDate: newCtr.eventDate || 'A definir',
      totalAmount: newCtr.totalAmount.startsWith('R$') ? newCtr.totalAmount : `R$ ${newCtr.totalAmount}`,
      signedStatus: 'Aguardando Assinatura',
      signedAt: null,
      token: `ctr_token_${Math.random().toString(36).substring(2, 10)}`,
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      phone: newCtr.phone || '(21) 98132-4411',
    };

    setContracts([created, ...contracts]);
    logActivity('EMISSAO_CONTRATO', 'contratos', `Emitiu minuta contratual ${num} para ${created.clientName}`);
    setShowAddModal(false);
  };

  const filtered = contracts.filter((c) => {
    const matchesSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || c.signedStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Módulo 13 • Jurídico & Contratos de Imagem</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Contratos & Cessão de Uso de Imagem</h1>
          <p className="text-slate-400 text-xs">
            Assinatura digital válida, termos de autorização e segurança jurídica de acordo com a Lei 9.610/98
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Novo Contrato</span>
        </button>
      </div>

      {/* Security alert */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-gold/20 text-xs text-slate-300 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
        <p>
          <strong>Isolamento Contratual Estrito:</strong> Cada cliente tem acesso criptografado e isolado exclusivamente ao seu próprio contrato e termo de imagem. Nenhum contrato de terceiros é visível externamente.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número do contrato ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:border-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['Todos', 'Assinado Digitalmente', 'Aguardando Assinatura'].map((st) => (
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

      {/* Contracts List */}
      <div className="space-y-4">
        {filtered.map((ctr) => (
          <div
            key={ctr.id}
            className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 space-y-4 shadow-xl hover:border-gold/30 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                  {ctr.contractNumber}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ctr.statusColor}`}>
                  {ctr.signedStatus}
                </span>
                {ctr.signedAt && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Assinado em {ctr.signedAt}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white pt-1">{ctr.clientName}</h3>
              <p className="text-xs text-gold-300 font-medium">{ctr.serviceTitle}</p>
              <p className="text-xs text-slate-400">Documento: {ctr.clientCpf} • Data Produção: {ctr.eventDate}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 lg:gap-8 shrink-0">
              <div className="text-left lg:text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Valor Contratual</span>
                <span className="text-xl font-serif font-bold text-white block">
                  {isSuperAdmin ? ctr.totalAmount : '••••••••'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(ctr)}
                  title="Copiar Link Seguro para Assinatura do Cliente"
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === ctr.id ? (
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
                  href={`https://wa.me/55${ctr.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(ctr.clientName)}!%20Seu%20contrato%20e%20termo%20de%20cessão%20de%20imagem%20está%20disponível%20para%20assinatura%20digital:%20https://agenciasaraujo.com.br/contrato/${ctr.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
                  title="Enviar Link de Assinatura via WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-gold/30 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-white mb-1">Emitir Novo Contrato</h2>
            <p className="text-xs text-slate-400 mb-6">Gera minuta jurídica com link isolado de assinatura digital</p>

            <form onSubmit={handleAddContract} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo do Contratante</label>
                <input
                  type="text"
                  required
                  value={newCtr.clientName}
                  onChange={(e) => setNewCtr({ ...newCtr, clientName: e.target.value })}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    value={newCtr.clientCpf}
                    onChange={(e) => setNewCtr({ ...newCtr, clientCpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={newCtr.phone}
                    onChange={(e) => setNewCtr({ ...newCtr, phone: e.target.value })}
                    placeholder="(21) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Contratual (R$)</label>
                  <input
                    type="text"
                    required
                    value={newCtr.totalAmount}
                    onChange={(e) => setNewCtr({ ...newCtr, totalAmount: e.target.value })}
                    placeholder="3.800,00"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data da Produção</label>
                  <input
                    type="text"
                    value={newCtr.eventDate}
                    onChange={(e) => setNewCtr({ ...newCtr, eventDate: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Objeto do Contrato</label>
                <input
                  type="text"
                  value={newCtr.serviceTitle}
                  onChange={(e) => setNewCtr({ ...newCtr, serviceTitle: e.target.value })}
                  placeholder="Prestação de Serviços Fotográficos & Cessão de Imagem"
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
                  Gerar Contrato Digital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
