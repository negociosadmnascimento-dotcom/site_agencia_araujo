import React, { useState } from 'react';
import { 
  DollarSign, Plus, Search, Filter, ShieldCheck, CheckCircle2, 
  Clock, AlertCircle, Eye, EyeOff, Lock, ArrowUpRight, Download, X, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function PaymentsModule() {
  const { isSuperAdmin, logActivity } = useAuth();
  const [showNumbers, setShowNumbers] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [payments, setPayments] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_payments');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [newPay, setNewPay] = useState({
    clientName: '',
    description: '',
    amount: '',
    method: 'PIX Instantâneo',
    installments: '1',
    contractId: '',
    dueDate: '',
  });

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!newPay.clientName || !newPay.amount) return;

    setIsSaving(true);
    const now = new Date();
    const year = now.getFullYear();
    const seq = Math.floor(100 + Math.random() * 900);
    // Universal ID: links payment to contract
    const universalId = newPay.contractId || `ID-${year}-${seq}-${newPay.clientName.replace(/\s+/g,'').slice(0,4).toUpperCase()}`;
    const inv = `FAT-${year}-${seq}`;
    const methodLabel = newPay.method === 'Cartão de Crédito'
      ? (newPay.installments === '1' ? 'Cartão de Crédito à Vista' : `Cartão de Crédito ${newPay.installments}x`)
      : newPay.method;

    const created = {
      id: `pay_${Date.now()}`,
      invoice: inv,
      universalId,
      clientName: newPay.clientName,
      description: newPay.description || 'Ensaio Fotográfico',
      amount: newPay.amount.startsWith('R$') ? newPay.amount : `R$ ${newPay.amount}`,
      method: methodLabel,
      installments: newPay.method === 'Cartão de Crédito' ? newPay.installments : null,
      status: 'Pendente',
      dueDate: newPay.dueDate || new Date(now.getTime() + 7*86400000).toLocaleDateString('pt-BR'),
      paidAt: null,
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };

    setTimeout(() => {
      setPayments(prev => {
        const next = [created, ...prev];
        try { localStorage.setItem('admin_payments', JSON.stringify(next)); } catch (_) {}
        return next;
      });
      logActivity('NOVO_LANCAMENTO_FINANCEIRO', 'pagamentos', `Registrou fatura ${inv} [${universalId}] (${created.amount}) para ${created.clientName}`);
      setIsSaving(false);
      setNewPay({ clientName: '', description: '', amount: '', method: 'PIX Instantâneo', installments: '1', contractId: '', dueDate: '' });
      setShowAddModal(false);
      showToast(`Fatura ${inv} com ID Universal "${universalId}" registrada!`);
    }, 700);
  };

  const markAsPaid = (id) => {
    setPayments(prev => {
      const next = prev.map(p => {
        if (p.id === id) {
          logActivity('BAIXA_PAGAMENTO', 'pagamentos', `Confirmou recebimento da fatura ${p.invoice} de ${p.clientName}`);
          return { 
            ...p, 
            status: 'Quitado', 
            paidAt: 'Agora mesmo', 
            statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
          };
        }
        return p;
      });
      try { localStorage.setItem('admin_payments', JSON.stringify(next)); } catch (_) {}
      return next;
    });
    showToast("Pagamento quitado com sucesso!");
  };

  const filtered = payments.filter((p) => {
    const matchesSearch = p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || p.invoice.toLowerCase().includes(searchTerm.toLowerCase()) || (p.universalId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl bg-emerald-600 text-white flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Módulo 12 • Gestão Financeira & Recebimentos</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Controle Financeiro & Faturamento</h1>
          <p className="text-slate-400 text-xs">
            Acompanhamento de entradas, sinais de agendamento e quitação de pacotes fotográficos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button
              onClick={() => setShowNumbers(!showNumbers)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5"
              title="Ocultar/Exibir valores"
            >
              {showNumbers ? <EyeOff className="w-4 h-4 text-gold" /> : <Eye className="w-4 h-4 text-gold" />}
              <span>{showNumbers ? 'Ocultar Valores' : 'Revelar Valores'}</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Pagamento</span>
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-gold/30 text-xs text-slate-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
          <p>
            {isSuperAdmin
              ? 'Ambiente Seguro do Super Admin: Visão completa de todas as transações, extrato detalhado e conciliação bancária.'
              : 'Ambiente Admin Operacional: Lançamento de faturas operacionais com proteção e auditoria centralizada.'}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-gold/20 text-gold shrink-0">
          RLS ATIVO
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">Total Recebido (Mês)</span>
          <p className="text-2xl font-serif font-bold text-emerald-400 mt-2">
            {isSuperAdmin && showNumbers ? 'R$ 13.533,00' : 'R$ ••••••••'}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">3 pagamentos confirmados</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">A Receber / Pendente</span>
          <p className="text-2xl font-serif font-bold text-amber-400 mt-2">
            {isSuperAdmin && showNumbers ? 'R$ 3.200,00' : 'R$ ••••••••'}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">1 fatura em aberto</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">Previsão Faturamento Total</span>
          <p className="text-2xl font-serif font-bold text-white mt-2">
            {isSuperAdmin && showNumbers ? 'R$ 16.733,00' : 'R$ ••••••••'}
          </p>
          <span className="text-[10px] text-gold-300 font-mono">100% conciliado</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, fatura ou ID Universal (ex: CTR-2026-...)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:border-gold focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          {['Todos', 'Quitado', 'Pendente'].map((st) => (
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

      {/* Payments Table */}
      <div className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6">Fatura & Cliente</th>
                <th className="py-4 px-6">ID Universal</th>
                <th className="py-4 px-6">Descrição do Serviço</th>
                <th className="py-4 px-6">Método</th>
                <th className="py-4 px-6">Vencimento</th>
                <th className="py-4 px-6">Valor</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filtered.map((pay) => (
                <tr key={pay.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-mono text-gold-300 text-xs font-bold block">{pay.invoice}</span>
                      <span className="font-bold text-white text-xs mt-0.5 block">{pay.clientName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">{pay.universalId || '—'}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-300 max-w-xs">
                    <span className="truncate block">{pay.description}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] font-mono text-slate-300">
                      {pay.method}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-400">
                    {pay.dueDate}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-white text-sm">
                    {isSuperAdmin && showNumbers ? pay.amount : '••••••••'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${pay.statusColor}`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {pay.status === 'Pendente' ? (
                      <button
                        onClick={() => markAsPaid(pay.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors"
                      >
                        Confirmar Baixa
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500">
                        {pay.paidAt}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-gold/30 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-white mb-1">Lançar Novo Pagamento</h2>
            <p className="text-xs text-slate-400 mb-6">Cadastre uma fatura para acompanhamento e conciliação</p>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente</label>
                <input
                  type="text"
                  required
                  value={newPay.clientName}
                  onChange={(e) => setNewPay({ ...newPay, clientName: e.target.value })}
                  placeholder="Nome do cliente"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={newPay.description}
                  onChange={(e) => setNewPay({ ...newPay, description: e.target.value })}
                  placeholder="Ex: Sinal 50% Ensaio Maracanã"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor (R$)</label>
                  <input
                    type="text"
                    required
                    value={newPay.amount}
                    onChange={(e) => setNewPay({ ...newPay, amount: e.target.value })}
                    placeholder="3.500,00"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Forma de Pagamento</label>
                  <select
                    value={newPay.method}
                    onChange={(e) => setNewPay({ ...newPay, method: e.target.value, installments: '1' })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  >
                    <option>PIX Instantâneo</option>
                    <option>Cartão de Crédito</option>
                    <option>Transferência Bancária</option>
                    <option>Boleto Bancário</option>
                  </select>
                </div>
              </div>

              {/* Installments — only for Cartão de Crédito */}
              {newPay.method === 'Cartão de Crédito' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Parcelamento</label>
                  <select
                    value={newPay.installments}
                    onChange={(e) => setNewPay({ ...newPay, installments: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-emerald-500/40 text-white text-sm focus:border-gold focus:outline-none"
                  >
                    <option value="1">1x — À Vista (sem juros)</option>
                    <option value="2">2x — sem juros</option>
                    <option value="3">3x — sem juros</option>
                    <option value="4">4x — sem juros</option>
                    <option value="5">5x — sem juros</option>
                    <option value="6">6x — sem juros</option>
                    <option value="7">7x — com juros</option>
                    <option value="8">8x — com juros</option>
                    <option value="9">9x — com juros</option>
                    <option value="10">10x — com juros</option>
                    <option value="11">11x — com juros</option>
                    <option value="12">12x — com juros</option>
                  </select>
                </div>
              )}

              {/* Universal ID — links to contract */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ID do Contrato Vinculado <span className="text-slate-500 font-normal">(opcional — gerado automaticamente se vazio)</span>
                </label>
                <input
                  type="text"
                  value={newPay.contractId}
                  onChange={(e) => setNewPay({ ...newPay, contractId: e.target.value })}
                  placeholder="Ex: CTR-2026-041 ou ID-2026-123-SILV"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Mesmo ID para buscar contrato e pendência de pagamento</p>
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
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <span>Registrar Fatura</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
