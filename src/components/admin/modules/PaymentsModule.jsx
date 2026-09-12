import React, { useState } from 'react';
import { 
  DollarSign, Plus, Search, Filter, ShieldCheck, CheckCircle2, 
  Clock, AlertCircle, Eye, EyeOff, Lock, ArrowUpRight, Download, X, RefreshCw, Trash2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';
import { resolveClientPhone } from '../../../utils/clientResolution';
import { useValuesVisibility } from '../../../utils/valuesVisibility';

export default function PaymentsModule() {
  const { isSuperAdmin, logActivity } = useAuth();
  const { showValues, toggleShowValues } = useValuesVisibility();
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const [payments, setPayments] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_payments');
      const list = stored ? JSON.parse(stored) : [];
      return list.map(p => {
        let status = p.status;
        let statusColor = p.statusColor;
        if (status === 'Pendente Sinal') {
          status = 'Pendente';
          statusColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        } else if (status === 'Sinal Quitado') {
          status = 'Sinal Recebido';
          statusColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
        } else if (status === 'Quitado') {
          status = 'Total Quitado';
          statusColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        }
        return { ...p, status, statusColor };
      });
    } catch {
      return [];
    }
  });

  const [newPay, setNewPay] = useState({
    clientName: '',
    description: '',
    amount: '',
    depositAmount: '',
    method: 'PIX Instantâneo',
    installments: '1',
    contractId: '',
    dueDate: '',
  });

  // Flag para indicar se o modal de pagamento foi aberto vinculado a um cliente da esteira (avulso = false)
  const [isPayModalPrefilled, setIsPayModalPrefilled] = useState(false);
  const [editingPayId, setEditingPayId] = useState(null);

  // Abre o modal de pagamento avulso (em branco)
  const openBlankPayModal = () => {
    setNewPay({ clientName: '', phone: '', description: '', amount: '', depositAmount: '', method: 'PIX Instantâneo', installments: '1', contractId: '', dueDate: '' });
    setIsPayModalPrefilled(false);
    setEditingPayId(null);
    setShowAddModal(true);
  };

  // Abre o modal de pagamento pré-preenchido com dados de um registro existente
  const openPayModalFor = (pay) => {
    const resolvedPhone = resolveClientPhone(pay.universalId, pay.clientName, pay.phone);
    setNewPay({
      clientName: pay.clientName || '',
      phone: resolvedPhone || '',
      description: pay.description || '',
      amount: pay.amount ? pay.amount.replace('R$ ', '') : '',
      depositAmount: pay.depositAmount && pay.depositAmount !== 'R$ 0,00' ? pay.depositAmount.replace('R$ ', '') : '',
      method: pay.method || 'PIX Instantâneo',
      installments: '1',
      contractId: pay.universalId || '',
      dueDate: pay.dueDate || '',
    });
    setIsPayModalPrefilled(true);
    setEditingPayId(pay.id);
    setShowAddModal(true);
  };

  const parseAmount = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/[^\d,-]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // ── Gatilho Automático: Dispara criação de Contrato quando há sinal ou quitação ──
  const triggerAutoContract = (pay) => {
    try {
      const contracts = JSON.parse(localStorage.getItem('admin_contracts') || '[]');
      const targetUid = pay.universalId;
      const clientNameNorm = (pay.clientName || '').toLowerCase().trim();
      const resolvedPhone = resolveClientPhone(targetUid, pay.clientName, pay.phone);

      // Trava de deduplicação estrita: verifica se já existe contrato para este cliente
      const existingIdx = contracts.findIndex(c => 
        (targetUid && c.universalId === targetUid) ||
        (c.contractNumber && targetUid && c.contractNumber === targetUid) ||
        (c.clientName && c.clientName.toLowerCase().trim() === clientNameNorm)
      );

      if (existingIdx >= 0) {
        // Atualiza contrato existente sem duplicar
        const existing = contracts[existingIdx];
        const updated = {
          ...existing,
          universalId: existing.universalId || targetUid,
          phone: resolvedPhone || existing.phone,
          depositAmount: pay.depositAmount && pay.depositAmount !== 'R$ 0,00' ? pay.depositAmount : existing.depositAmount,
          remainingAmount: pay.remainingAmount || existing.remainingAmount,
          totalAmount: pay.amount || existing.totalAmount,
          token: existing.token || `ctr_token_${Math.random().toString(36).substring(2, 10)}`,
        };
        contracts[existingIdx] = updated;
        localStorage.setItem('admin_contracts', JSON.stringify(contracts));

        // Sincroniza contrato atualizado no Supabase para acesso público do link
        if (isSupabaseConfigured && supabase && updated.token) {
          try {
            supabase.from('contratos').upsert({
              token: updated.token,
              universal_id: updated.universalId,
              contract_number: updated.contractNumber,
              client_name: updated.clientName,
              client_cpf: updated.clientCpf || 'Sob consulta',
              phone: updated.phone,
              service_title: updated.serviceTitle,
              total_amount: updated.totalAmount,
              deposit_amount: updated.depositAmount,
              remaining_amount: updated.remainingAmount,
              event_date: updated.eventDate || 'A definir',
              status: updated.signedStatus || 'Aguardando Assinatura',
            }, { onConflict: 'token' }).catch(e => console.warn('Supabase auto-contract update error:', e));
          } catch (_) {}
        }

        return updated;
      }

      // Se não existe, cria novo contrato
      const now = new Date();
      const year = now.getFullYear();
      const seq = Math.floor(100 + Math.random() * 900);
      const ctrNum = `CTR-${year}-${seq}`;
      const token = `ctr_token_${Math.random().toString(36).substring(2, 10)}`;

      const totalNum = parseAmount(pay.amount);
      const depNum = parseAmount(pay.depositAmount);
      const remNum = Math.max(0, totalNum - depNum);

      const newContract = {
        id: `ctr_${Date.now()}`,
        contractNumber: ctrNum,
        universalId: targetUid || `CLI-${year}-${seq}-${pay.clientName.replace(/\s+/g, '').slice(0, 6).toUpperCase()}`,
        clientName: pay.clientName,
        clientCpf: 'Sob consulta',
        phone: resolvedPhone,
        serviceTitle: pay.description || 'Prestação de Serviços Fotográficos & Cessão de Imagem',
        eventDate: pay.dueDate || 'A definir',
        totalAmount: pay.amount,
        depositAmount: pay.depositAmount || 'R$ 0,00',
        remainingAmount: pay.remainingAmount || formatCurrency(remNum),
        signedStatus: 'Aguardando Assinatura',
        signedAt: null,
        token,
        statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      };
      contracts.unshift(newContract);
      localStorage.setItem('admin_contracts', JSON.stringify(contracts));

      // Sincroniza contrato com o Supabase para validação pública no link
      if (isSupabaseConfigured && supabase) {
        try {
          supabase.from('contratos').upsert({
            token: newContract.token,
            universal_id: newContract.universalId,
            contract_number: newContract.contractNumber,
            client_name: newContract.clientName,
            client_cpf: newContract.clientCpf,
            phone: newContract.phone,
            service_title: newContract.serviceTitle,
            total_amount: newContract.totalAmount,
            deposit_amount: newContract.depositAmount,
            remaining_amount: newContract.remainingAmount,
            event_date: newContract.eventDate,
            status: newContract.signedStatus,
          }, { onConflict: 'token' }).catch(() => {});
        } catch (_) {}
      }

      logActivity?.('AUTO_CONTRATO', 'contratos', `Contrato ${ctrNum} emitido automaticamente após confirmação financeira [${newContract.universalId}]`);
      return newContract;
    } catch (err) {
      console.error('Erro ao gerar contrato automático:', err);
    }
    return null;
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!newPay.clientName || !newPay.amount) return;

    setIsSaving(true);
    const now = new Date();
    const year = now.getFullYear();
    const seq = Math.floor(100 + Math.random() * 900);
    const universalId = newPay.contractId || `CLI-${year}-${seq}-${newPay.clientName.replace(/\s+/g,'').slice(0,6).toUpperCase()}`;
    const inv = `FAT-${year}-${seq}`;
    const methodLabel = newPay.method === 'Cartão de Crédito'
      ? (newPay.installments === '1' ? 'Cartão de Crédito à Vista' : `Cartão de Crédito ${newPay.installments}x`)
      : newPay.method;

    const formattedAmount = newPay.amount.startsWith('R$') ? newPay.amount : `R$ ${newPay.amount}`;
    const formattedDeposit = newPay.depositAmount 
      ? (newPay.depositAmount.startsWith('R$') ? newPay.depositAmount : `R$ ${newPay.depositAmount}`)
      : 'R$ 0,00';
    
    const totalVal = parseAmount(formattedAmount);
    const depVal = parseAmount(formattedDeposit);
    const remVal = Math.max(0, totalVal - depVal);
    const remStr = formatCurrency(remVal);

    const hasDeposit = depVal > 0;
    const isFull = totalVal > 0 && depVal >= totalVal;
    const initialStatus = isFull ? 'Total Quitado' : hasDeposit ? 'Sinal Recebido' : 'Pendente';
    const statusColor = isFull 
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : hasDeposit 
        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
        : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

    const resolvedPhone = newPay.phone || resolveClientPhone(universalId, newPay.clientName);

    const created = {
      id: editingPayId || `pay_${Date.now()}`,
      invoice: inv,
      universalId,
      clientName: newPay.clientName,
      phone: resolvedPhone,
      description: newPay.description || 'Ensaio Fotográfico',
      amount: formattedAmount,
      depositAmount: formattedDeposit,
      remainingAmount: remStr,
      method: methodLabel,
      installments: newPay.method === 'Cartão de Crédito' ? newPay.installments : null,
      status: initialStatus,
      dueDate: newPay.dueDate || new Date(now.getTime() + 7*86400000).toLocaleDateString('pt-BR'),
      paidAt: hasDeposit ? `${initialStatus} no lançamento` : null,
      statusColor,
    };

    setTimeout(() => {
      setPayments(prev => {
        let next;
        if (editingPayId) {
          next = prev.map(p => p.id === editingPayId ? {
            ...p,
            ...created,
            id: p.id,
            invoice: p.invoice || created.invoice,
            phone: resolvedPhone || p.phone,
          } : p);
        } else {
          // Previne duplicação acidental se fatura com mesmo universalId ou nome já existir
          const dupIdx = prev.findIndex(p => 
            (p.universalId && p.universalId === universalId) || 
            (p.clientName && p.clientName.toLowerCase().trim() === newPay.clientName.toLowerCase().trim())
          );
          if (dupIdx >= 0) {
            next = prev.map((p, idx) => idx === dupIdx ? {
              ...p,
              ...created,
              id: p.id,
              invoice: p.invoice || created.invoice,
            } : p);
          } else {
            next = [created, ...prev];
          }
        }
        try { localStorage.setItem('admin_payments', JSON.stringify(next)); } catch (_) {}
        return next;
      });
      logActivity?.('NOVO_LANCAMENTO_FINANCEIRO', 'pagamentos', `Registrou fatura ${inv} [${universalId}] (${created.amount}) para ${created.clientName} - Status: ${initialStatus}`);
      
      // Se status foi atualizado com sinal ou quitação, dispara emissão/atualização de contrato
      if (hasDeposit) {
        triggerAutoContract(created);
      }

      setIsSaving(false);
      setEditingPayId(null);
      setNewPay({ 
        clientName: '', 
        phone: '',
        description: '', 
        amount: '', 
        depositAmount: '',
        method: 'PIX Instantâneo', 
        installments: '1', 
        contractId: '', 
        dueDate: '' 
      });
      setShowAddModal(false);
      showToast(editingPayId
        ? `Lançamento de "${created.clientName}" atualizado! Status: "${initialStatus}".`
        : `Fatura ${inv} com ID Universal "${universalId}" registrada com sucesso!`
      );
    }, 600);
  };

  // ── Métricas Financeiras Dinâmicas ─────────────────────────────────────────
  const paidPayments = payments.filter(p => p.status === 'Total Quitado' || p.status === 'Quitado');
  const signalPayments = payments.filter(p => p.status === 'Sinal Recebido' || p.status === 'Sinal Quitado');
  
  // Total já recebido (sinais + pagamentos integrais)
  const totalPaid = paidPayments.reduce((acc, p) => acc + parseAmount(p.amount), 0) +
                    signalPayments.reduce((acc, p) => acc + parseAmount(p.depositAmount), 0);

  // Total ainda pendente (pendentes inteiros + saldos restantes de sinais)
  const pendingPayments = payments.filter(p => p.status === 'Pendente' || p.status === 'Pendente Sinal');
  const totalPending = pendingPayments.reduce((acc, p) => acc + parseAmount(p.amount), 0) +
                       signalPayments.reduce((acc, p) => acc + parseAmount(p.remainingAmount), 0);

  const totalForecast = payments.reduce((acc, p) => acc + parseAmount(p.amount), 0);

  const handleDeletePayment = (id, invoice) => {
    if (!window.confirm(`Excluir o lançamento da fatura ${invoice}?`)) return;
    const next = payments.filter(p => p.id !== id);
    setPayments(next);
    try { localStorage.setItem('admin_payments', JSON.stringify(next)); } catch (_) {}
    showToast(`Fatura ${invoice} excluída.`);
    logActivity?.('EXCLUSAO_PAGAMENTO', 'pagamentos', `Excluiu fatura ${invoice}`);
  };

  const filtered = payments.filter((p) => {
    const matchesSearch = p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.invoice.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.universalId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || 
                          p.status === filterStatus || 
                          (filterStatus === 'Pendente' && (p.status === 'Pendente' || p.status === 'Pendente Sinal')) ||
                          (filterStatus === 'Sinal Recebido' && (p.status === 'Sinal Recebido' || p.status === 'Sinal Quitado')) ||
                          (filterStatus === 'Total Quitado' && (p.status === 'Total Quitado' || p.status === 'Quitado'));
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
          <button
            type="button"
            onClick={toggleShowValues}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            title="Ocultar / Exibir valores em R$"
          >
            {showValues ? <EyeOff className="w-4 h-4 text-gold" /> : <Eye className="w-4 h-4 text-gold" />}
            <span>{showValues ? 'Ocultar Valores' : 'Revelar Valores'}</span>
          </button>

          <button
            onClick={openBlankPayModal}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Lançar Pagamento Avulso</span>
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

      {/* KPI Cards Dinâmicos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">Total Recebido (Mês)</span>
          <p className="text-2xl font-serif font-bold text-emerald-400 mt-2">
            {showValues ? totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ ••••••••'}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            {paidPayments.length} pagamento(s) confirmado(s)
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">A Receber / Pendente</span>
          <p className="text-2xl font-serif font-bold text-amber-400 mt-2">
            {showValues ? totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ ••••••••'}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            {pendingPayments.length} fatura(s) em aberto
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">Previsão Faturamento Total</span>
          <p className="text-2xl font-serif font-bold text-white mt-2">
            {showValues ? totalForecast.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ ••••••••'}
          </p>
          <span className="text-[10px] text-gold-300 font-mono">
            {payments.length} lançamento(s) no total
          </span>
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
          {['Todos', 'Pendente', 'Sinal Recebido', 'Total Quitado'].map((st) => (
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
                <th className="py-4 px-6">Valores (Total / Sinal / Saldo)</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filtered.map((pay) => {
                const depNum = parseAmount(pay.depositAmount);
                const isFullyPaid = pay.status === 'Total Quitado' || pay.status === 'Quitado';

                return (
                  <tr key={pay.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-mono text-gold-300 text-xs font-bold block">{pay.invoice}</span>
                        <span className="font-bold text-white text-xs mt-0.5 block">{pay.clientName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-[10px] font-bold text-gold/90 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded">
                        {pay.universalId || '—'}
                      </span>
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
                    <td className="py-4 px-6 font-mono">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-sm block">
                          {showValues ? pay.amount : '••••••••'}
                        </span>
                        {depNum > 0 && (
                          <span className="text-[10px] text-cyan-300 block font-sans">
                            Sinal: <strong>{showValues ? pay.depositAmount : '••••'}</strong>
                          </span>
                        )}
                        {pay.remainingAmount && parseAmount(pay.remainingAmount) > 0 && !isFullyPaid && (
                          <span className="text-[10px] text-amber-300 block font-sans">
                            Saldo: <strong>{showValues ? pay.remainingAmount : '••••'}</strong>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {/* Status badge informativo sem botões de ação internos */}
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${pay.statusColor}`}>
                        {pay.status}
                      </span>
                    </td>

                    {/* Coluna Ações: Lançar Pagamento individual vinculado + Deletar */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPayModalFor(pay)}
                          title="Lançar pagamento vinculado a este cliente"
                          className="px-2.5 py-1.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 text-[10px] font-semibold transition-colors whitespace-nowrap flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Lançar Pag.</span>
                        </button>
                        <button
                          onClick={() => handleDeletePayment(pay.id, pay.invoice)}
                          title="Excluir fatura"
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

            <h2 className="text-xl font-serif font-bold text-white mb-1">
              {isPayModalPrefilled ? 'Lançar Pagamento Vinculado' : 'Lançar Pagamento Avulso'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              {isPayModalPrefilled
                ? 'Fatura pré-preenchida com os dados do cliente — confirme ou ajuste os valores e o sinal'
                : 'Cadastre uma fatura avulsa com valor total e sinal de agendamento'}
            </p>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente *</label>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição do Serviço *</label>
                <input
                  type="text"
                  required
                  value={newPay.description}
                  onChange={(e) => setNewPay({ ...newPay, description: e.target.value })}
                  placeholder="Ex: Ensaio Gestante & Família em Estúdio"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Total (R$) *</label>
                  <input
                    type="text"
                    required
                    value={newPay.amount}
                    onChange={(e) => setNewPay({ ...newPay, amount: e.target.value })}
                    placeholder="850,00"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor do Sinal (R$) <span className="text-cyan-400 text-[10px]">(Entrada)</span>
                  </label>
                  <input
                    type="text"
                    value={newPay.depositAmount}
                    onChange={(e) => setNewPay({ ...newPay, depositAmount: e.target.value })}
                    placeholder="Ex: 400,00"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Resumo Dinâmico em Tempo Real */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Valor Total:</span>
                  <span className="font-mono text-white font-semibold">
                    {newPay.amount ? (newPay.amount.startsWith('R$') ? newPay.amount : `R$ ${newPay.amount}`) : 'R$ 0,00'}
                  </span>
                </div>
                <div className="flex justify-between text-cyan-300">
                  <span>Sinal Informado (Entrada):</span>
                  <span className="font-mono font-semibold">
                    {newPay.depositAmount ? (newPay.depositAmount.startsWith('R$') ? newPay.depositAmount : `R$ ${newPay.depositAmount}`) : 'R$ 0,00'}
                  </span>
                </div>
                <div className="flex justify-between text-amber-300 border-t border-white/5 pt-1.5 font-bold">
                  <span>Saldo Restante a Quitar:</span>
                  <span className="font-mono">
                    {formatCurrency(Math.max(0, parseAmount(newPay.amount) - parseAmount(newPay.depositAmount)))}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-1.5 text-slate-300">
                  <span>Status Resultante:</span>
                  {(() => {
                    const tVal = parseAmount(newPay.amount);
                    const dVal = parseAmount(newPay.depositAmount);
                    if (tVal > 0 && dVal >= tVal) {
                      return (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Total Quitado ✓
                        </span>
                      );
                    }
                    if (dVal > 0) {
                      return (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Sinal Recebido ⚡ (Dispara Contrato)
                        </span>
                      );
                    }
                    return (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pendente
                      </span>
                    );
                  })()}
                </div>
              </div>

              {parseAmount(newPay.depositAmount) > 0 && (
                <p className="text-[11px] text-cyan-300 leading-relaxed bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                  ⚡ <strong>Avanço da Esteira:</strong> Ao salvar com sinal ou quitação, a minuta contratual será emitida/atualizada automaticamente no menu <strong>Contratos</strong>.
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
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
                    <option>Dinheiro em Espécie</option>
                    <option>Boleto Bancário</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Vencimento Previsto</label>
                  <input
                    type="text"
                    value={newPay.dueDate}
                    onChange={(e) => setNewPay({ ...newPay, dueDate: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
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
                  ID Universal Vinculado <span className="text-slate-500 font-normal">(gerado automaticamente se vazio)</span>
                </label>
                <input
                  type="text"
                  value={newPay.contractId}
                  onChange={(e) => setNewPay({ ...newPay, contractId: e.target.value })}
                  placeholder="Ex: CLI-2026-784-NICOLY"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Garante rastreabilidade única entre Lead, Pagamento e Contrato</p>
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
                      <span>Processando...</span>
                    </>
                  ) : (
                    <span>{isPayModalPrefilled ? 'Salvar Lançamento do Cliente' : 'Registrar Fatura'}</span>
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
