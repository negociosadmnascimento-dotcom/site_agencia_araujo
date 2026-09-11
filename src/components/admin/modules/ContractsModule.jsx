import React, { useState } from 'react';
import { 
  FileCheck, Plus, Search, Check, 
  ShieldCheck, X, RefreshCw, AlertTriangle, Clock
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';

export default function ContractsModule() {
  const { isSuperAdmin, logActivity } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  // Flag: was modal opened from a row (prefilled) or from the header (blank)?
  const [isCtrModalPrefilled, setIsCtrModalPrefilled] = useState(false);
  const [editingCtrId, setEditingCtrId] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const [contracts, setContracts] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_contracts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const emptyNewCtr = {
    clientName: '',
    clientCpf: '',
    serviceTitle: 'Prestação de Serviços Fotográficos & Cessão de Imagem',
    totalAmount: '',
    depositAmount: '',
    phone: '',
    eventDate: '',
    eventTime: '',
  };

  const [newCtr, setNewCtr] = useState(emptyNewCtr);

  // ── Pipeline Integrity: load payments to cross-reference ──
  const getPayments = () => {
    try {
      return JSON.parse(localStorage.getItem('admin_payments') || '[]');
    } catch {
      return [];
    }
  };

  const isPaymentConfirmed = (universalId) => {
    const payments = getPayments();
    return payments.some(
      (p) =>
        p.universalId === universalId &&
        (p.status === 'Sinal Quitado' || p.status === 'Quitado')
    );
  };

  // Get the sinal amount from confirmed payment, if any
  const getConfirmedSinal = (universalId) => {
    const payments = getPayments();
    const pay = payments.find(
      (p) =>
        p.universalId === universalId &&
        (p.status === 'Sinal Quitado' || p.status === 'Quitado')
    );
    return pay ? pay.depositAmount || '' : '';
  };

  // ── Open modal for "Emitir Novo Contrato" (blank/avulso) ──
  const openBlankContractModal = () => {
    setNewCtr(emptyNewCtr);
    setIsCtrModalPrefilled(false);
    setEditingCtrId(null);
    setShowAddModal(true);
  };

  // ── Open modal pre-filled from an existing contract card ──
  const openContractFor = (ctr) => {
    const uid = ctr.universalId || ctr.contractNumber;
    const confirmedSinal = getConfirmedSinal(uid);
    setNewCtr({
      clientName: ctr.clientName || '',
      clientCpf: ctr.clientCpf && ctr.clientCpf !== 'Sob consulta' ? ctr.clientCpf : '',
      serviceTitle: ctr.serviceTitle || 'Prestação de Serviços Fotográficos & Cessão de Imagem',
      totalAmount: ctr.totalAmount ? ctr.totalAmount.replace('R$ ', '') : '',
      depositAmount: ctr.depositAmount && ctr.depositAmount !== 'R$ 0,00' ? ctr.depositAmount.replace('R$ ', '') : (confirmedSinal ? confirmedSinal.replace('R$ ', '') : ''),
      phone: ctr.phone || '',
      eventDate: ctr.eventDate && ctr.eventDate !== 'A definir' ? ctr.eventDate : '',
      eventTime: ctr.eventTime || '',
    });
    setIsCtrModalPrefilled(true);
    setEditingCtrId(ctr.id);
    setShowAddModal(true);
  };

  // ── Mark contract as "Revisão Solicitada" ──
  const markAsRevision = (ctrId) => {
    const updated = contracts.map((c) =>
      c.id === ctrId
        ? { ...c, revisaoSolicitada: true, revisaoAt: new Date().toLocaleDateString('pt-BR') }
        : c
    );
    setContracts(updated);
    localStorage.setItem('admin_contracts', JSON.stringify(updated));
    const ctrNum = contracts.find(c => c.id === ctrId)?.contractNumber || ctrId;
    logActivity?.('REVISAO_CONTRATO', 'contratos', `Marcou revisão solicitada no contrato ${ctrNum}`);
    showToast('⚠ Revisão solicitada registrada — cliente aguarda retorno.');
  };

  // ── Build WhatsApp message with full contract details ──
  const buildWhatsAppMsg = (ctr) => {
    const sinalLine = ctr.depositAmount && ctr.depositAmount !== 'R$ 0,00'
      ? `\n✅ Sinal Pago: ${ctr.depositAmount}`
      : '';
    const saldoLine = ctr.remainingAmount && ctr.remainingAmount !== 'R$ 0,00'
      ? `\n💳 Saldo a Acertar na Produção: ${ctr.remainingAmount}`
      : '';
    const dataLine = ctr.eventDate && ctr.eventDate !== 'A definir'
      ? `\n📅 Data: ${ctr.eventDate}${ctr.eventTime ? ` às ${ctr.eventTime}` : ''}`
      : '';

    return `Olá ${ctr.clientName}! 🎉\nSegue seu contrato — Agências Araújo Fotografia:\n\n📋 Contrato: ${ctr.contractNumber}\n🆔 ID Universal: ${ctr.universalId || ctr.contractNumber}\n📸 Serviço: ${ctr.serviceTitle}${dataLine}\n💰 Valor Total: ${ctr.totalAmount}${sinalLine}${saldoLine}\n\n📝 Termos & Condições:\n• Cessão de imagem conforme Lei 9.610/98\n• Cancelamentos com até 72h de antecedência sem multa\n• Entrega das imagens em até 30 dias úteis após a produção\n• Direitos autorais reservados à Agências Araújo\n\nPara confirmar, responda com uma das opções:\n1️⃣ ACEITO — confirmo o contrato e os termos acima\n2️⃣ REVISAR — tenho dúvidas ou solicito alterações\n\nObrigado pela confiança! 📷✨\nAgências Araújo | (21) 97429-9780`;
  };

  const handleAddContract = (e) => {
    e.preventDefault();
    if (!newCtr.clientName || !newCtr.totalAmount) return;

    setIsSaving(true);
    const existingCtr = editingCtrId ? contracts.find(c => c.id === editingCtrId) : null;
    const num = existingCtr?.contractNumber || `CTR-2026-${Math.floor(100 + Math.random() * 900)}`;
    const formatVal = (v) => (v ? (String(v).startsWith('R$') ? v : `R$ ${v}`) : 'R$ 0,00');
    const totalNum = parseFloat((newCtr.totalAmount || '0').replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const depNum = parseFloat((newCtr.depositAmount || '0').replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const remNum = Math.max(0, totalNum - depNum);
    const formatCurrency = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const created = {
      id: existingCtr?.id || `ctr_${Date.now()}`,
      contractNumber: num,
      universalId: existingCtr?.universalId || num,
      clientName: newCtr.clientName,
      clientCpf: newCtr.clientCpf || 'Sob consulta',
      serviceTitle: newCtr.serviceTitle,
      eventDate: newCtr.eventDate || 'A definir',
      eventTime: newCtr.eventTime || '',
      totalAmount: formatVal(newCtr.totalAmount),
      depositAmount: newCtr.depositAmount ? formatVal(newCtr.depositAmount) : 'R$ 0,00',
      remainingAmount: formatCurrency(remNum),
      signedStatus: existingCtr?.signedStatus || 'Aguardando Assinatura',
      signedAt: existingCtr?.signedAt || null,
      revisaoSolicitada: false,
      revisaoAt: null,
      token: existingCtr?.token || `ctr_token_${Math.random().toString(36).substring(2, 10)}`,
      statusColor: existingCtr?.statusColor || 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      phone: newCtr.phone || '(21) 97429-9780',
    };

    setTimeout(() => {
      const updatedContracts = editingCtrId
        ? contracts.map(c => c.id === editingCtrId ? created : c)
        : [created, ...contracts];
      setContracts(updatedContracts);
      try {
        localStorage.setItem('admin_contracts', JSON.stringify(updatedContracts));

        // Also create matching payment if none exists (avulso contract)
        const existingPayments = JSON.parse(localStorage.getItem('admin_payments') || '[]');
        const alreadyHasPay = existingPayments.some((p) => p.universalId === num);
        if (!alreadyHasPay) {
          const autoPayment = {
            id: `pay_${Date.now()}`,
            invoice: `FAT-${num.replace('CTR-', '')}`,
            universalId: num,
            clientName: created.clientName,
            description: `Contrato ${num} • ${created.serviceTitle}`,
            amount: created.totalAmount,
            depositAmount: created.depositAmount,
            remainingAmount: created.remainingAmount,
            method: 'Aguardando Definição',
            status: depNum > 0 ? 'Sinal Quitado' : 'Pendente',
            dueDate: created.eventDate !== 'A definir' ? created.eventDate : '30/03/2026',
            paidAt: null,
            statusColor: depNum > 0
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          };
          existingPayments.unshift(autoPayment);
          localStorage.setItem('admin_payments', JSON.stringify(existingPayments));
        }
      } catch (err) {
        console.error('Erro ao persistir contrato:', err);
      }

      logActivity?.('EMISSAO_CONTRATO', 'contratos', `Emitiu minuta contratual ${num} para ${created.clientName}`);
      setIsSaving(false);
      setEditingCtrId(null);
      setShowAddModal(false);
      setNewCtr(emptyNewCtr);
      showToast(editingCtrId
        ? `Contrato ${num} atualizado com sucesso!`
        : (depNum > 0
            ? `Contrato ${num} gerado e disponível na lista!`
            : `Contrato ${num} gerado! Aparecerá na lista após confirmação do pagamento.`)
      );
    }, 800);
  };

  // ── Filter: pipeline integrity + search + status ──
  const filtered = contracts.filter((c) => {
    const uid = c.universalId || c.contractNumber;
    if (!isPaymentConfirmed(uid)) return false; // hide if no confirmed payment

    const matchesSearch =
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || c.signedStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Count contracts hidden due to pending payment (for info banner)
  const hiddenCount = contracts.filter((c) => {
    const uid = c.universalId || c.contractNumber;
    return !isPaymentConfirmed(uid);
  }).length;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl bg-emerald-600 text-white flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Módulo 13 • Jurídico &amp; Contratos de Imagem</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Contratos &amp; Cessão de Uso de Imagem</h1>
          <p className="text-slate-400 text-xs">
            Assinatura digital válida, termos de autorização e segurança jurídica de acordo com a Lei 9.610/98
          </p>
        </div>

        <button
          onClick={openBlankContractModal}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Emitir Contrato Avulso</span>
        </button>
      </div>

      {/* Security alert */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-gold/20 text-xs text-slate-300 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
        <p>
          <strong>Isolamento Contratual Estrito:</strong> Cada cliente tem acesso criptografado e isolado exclusivamente ao seu próprio contrato e termo de imagem. Nenhum contrato de terceiros é visível externamente.
        </p>
      </div>

      {/* Pipeline info banner */}
      {hiddenCount > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>{hiddenCount} contrato{hiddenCount > 1 ? 's' : ''}</strong> aguardando confirmação de pagamento (Sinal ou Quitação) para aparecer nesta lista.
          </span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número, cliente ou ID Universal (ex: CLI-2026-...)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:border-gold focus:outline-none font-mono"
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
        {filtered.length === 0 && (
          <div className="h-40 flex items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl">
            <span className="text-sm text-slate-500">
              {hiddenCount > 0
                ? 'Nenhum contrato disponível — aguardando confirmação de pagamento nos registros existentes.'
                : 'Nenhum contrato encontrado.'}
            </span>
          </div>
        )}

        {filtered.map((ctr) => (
          <div
            key={ctr.id}
            className={`rounded-3xl bg-slate-900/70 border p-6 space-y-4 shadow-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
              ctr.revisaoSolicitada
                ? 'border-amber-500/40 bg-amber-500/5'
                : 'border-white/10 hover:border-gold/30'
            }`}
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-gold bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                  {ctr.contractNumber}
                </span>
                <span className="font-mono text-[10px] font-bold text-gold/90 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-lg">
                  ID: {ctr.universalId || ctr.contractNumber}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ctr.statusColor}`}>
                  {ctr.signedStatus}
                </span>
                {ctr.revisaoSolicitada && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Revisão Solicitada {ctr.revisaoAt ? `(${ctr.revisaoAt})` : ''}
                  </span>
                )}
                {ctr.signedAt && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Assinado em {ctr.signedAt}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white pt-1">{ctr.clientName}</h3>
              <p className="text-xs text-gold-300 font-medium">{ctr.serviceTitle}</p>
              <p className="text-xs text-slate-400">
                Documento: {ctr.clientCpf}
                {ctr.eventDate && ctr.eventDate !== 'A definir' && (
                  <> • Data: {ctr.eventDate}{ctr.eventTime ? ` às ${ctr.eventTime}` : ''}</>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-start gap-4 lg:gap-8 shrink-0">
              <div className="text-left lg:text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Valor Contratual</span>
                <span className="text-xl font-serif font-bold text-white block">
                  {isSuperAdmin ? ctr.totalAmount : '••••••••'}
                </span>
                {ctr.depositAmount && ctr.depositAmount !== 'R$ 0,00' && (
                  <span className="text-[10px] text-cyan-300 font-sans block mt-0.5">
                    Sinal Pago: <strong>{isSuperAdmin ? ctr.depositAmount : '••••'}</strong>
                  </span>
                )}
                {ctr.remainingAmount && ctr.remainingAmount !== 'R$ 0,00' && (
                  <span className="text-[10px] text-amber-300 font-sans block">
                    Saldo a Acertar: <strong>{isSuperAdmin ? ctr.remainingAmount : '••••'}</strong>
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-2">
                {/* Emitir Contrato individual */}
                <button
                  onClick={() => openContractFor(ctr)}
                  className="px-3 py-1.5 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-[10px] font-semibold flex items-center gap-1.5 transition-colors w-full justify-end"
                  title="Emitir contrato para este cliente"
                >
                  <Plus className="w-3 h-3" />
                  Emitir Contrato
                </button>

                <div className="flex items-center gap-2">
                  {/* Marcar como Revisão Solicitada */}
                  {!ctr.revisaoSolicitada && ctr.signedStatus !== 'Assinado Digitalmente' && (
                    <button
                      onClick={() => markAsRevision(ctr.id)}
                      title="Marcar que o cliente solicitou revisão do contrato via WhatsApp"
                      className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-semibold text-amber-300 flex items-center gap-1.5 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Revisão
                    </button>
                  )}

                  {/* WhatsApp — envia contrato completo */}
                  <a
                    href={`https://wa.me/55${(ctr.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(buildWhatsAppMsg(ctr))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
                    title="Enviar contrato completo via WhatsApp (com opção Aceitar/Revisar)"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-green-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-gold/30 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-white mb-1">
              {isCtrModalPrefilled ? 'Emitir Contrato Vinculado' : 'Emitir Novo Contrato'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              {isCtrModalPrefilled
                ? 'Gera minuta jurídica com dados pré-preenchidos — confirme ou ajuste'
                : 'Gera minuta jurídica com link isolado de assinatura digital'}
            </p>

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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sinal Confirmado (R$)
                    {newCtr.depositAmount && (
                      <span className="text-cyan-400 text-[10px] ml-1">(auto)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={newCtr.depositAmount}
                    onChange={(e) => setNewCtr({ ...newCtr, depositAmount: e.target.value })}
                    placeholder="Ex: 1.200,00"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-cyan-500/30 text-white text-sm focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Horário da Produção
                  </label>
                  <input
                    type="time"
                    value={newCtr.eventTime}
                    onChange={(e) => setNewCtr({ ...newCtr, eventTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição do Contrato</label>
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
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Gerando Minuta...</span>
                    </>
                  ) : (
                    <span>Gerar Contrato Digital</span>
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
