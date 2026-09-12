import React, { useState, useEffect } from 'react';
import { 
  FileCheck, Plus, Search, Check, 
  ShieldCheck, X, RefreshCw, AlertTriangle, Clock, CheckCircle2,
  Eye, EyeOff, Trash2
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';
import { resolveClientPhone } from '../../../utils/clientResolution';
import { useValuesVisibility } from '../../../utils/valuesVisibility';

export default function ContractsModule() {
  const { isSuperAdmin, logActivity } = useAuth();
  const { showValues, toggleShowValues } = useValuesVisibility();
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

  // ── Helper: Verifica se o contrato foi explicitamente descartado da fila pelo Tenant ──
  const isContractDismissed = (item) => {
    if (!item) return false;
    try {
      const dismissed = JSON.parse(localStorage.getItem('admin_dismissed_contracts') || '[]');
      return (
        (item.id && dismissed.includes(item.id)) ||
        (item.token && dismissed.includes(item.token)) ||
        (item.universal_id && dismissed.includes(item.universal_id)) ||
        (item.universalId && dismissed.includes(item.universalId)) ||
        (item.contract_number && dismissed.includes(item.contract_number)) ||
        (item.contractNumber && dismissed.includes(item.contractNumber))
      );
    } catch {
      return false;
    }
  };

  // ── Pipeline Integrity: Carrega faturas da etapa anterior (Pagamentos) ──
  const getPayments = () => {
    try {
      return JSON.parse(localStorage.getItem('admin_payments') || '[]');
    } catch {
      return [];
    }
  };

  const [contracts, setContracts] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_contracts');
      const dismissed = JSON.parse(localStorage.getItem('admin_dismissed_contracts') || '[]');
      if (!stored) return [];
      const list = JSON.parse(stored);
      return list.filter(c => 
        !dismissed.includes(c.id) &&
        !dismissed.includes(c.token) &&
        !dismissed.includes(c.universalId) &&
        !dismissed.includes(c.contractNumber)
      );
    } catch {
      return [];
    }
  });

  // ── Helper: Upsert de contrato no Supabase garantindo campos padronizados ──
  const upsertContractToSupabase = async (ctr) => {
    if (!isSupabaseConfigured || !supabase || !ctr) return null;
    const token = ctr.token || `ctr_token_${Math.random().toString(36).substring(2, 10)}`;
    const resolvedPhone = resolveClientPhone(ctr.universalId, ctr.clientName, ctr.phone) || ctr.phone || '';
    const payload = {
      token,
      universal_id: ctr.universalId || ctr.contractNumber,
      contract_number: ctr.contractNumber,
      client_name: ctr.clientName,
      client_cpf: ctr.clientCpf && ctr.clientCpf !== '0000000000' ? ctr.clientCpf : 'Sob consulta',
      phone: resolvedPhone,
      service_title: ctr.serviceTitle || 'Prestação de Serviços Fotográficos & Cessão de Imagem',
      total_amount: ctr.totalAmount || 'R$ 0,00',
      deposit_amount: ctr.depositAmount || 'R$ 0,00',
      remaining_amount: ctr.remainingAmount || 'R$ 0,00',
      event_date: ctr.eventDate || 'A definir',
      event_time: ctr.eventTime || '',
      status: ctr.signedStatus === 'Assinado Digitalmente' ? 'Assinado Digitalmente' : (ctr.signedStatus || 'Aguardando Assinatura'),
      assinado_em: ctr.signedStatus === 'Assinado Digitalmente' && ctr.signedAt ? new Date().toISOString() : null,
      revisao_solicitada: Boolean(ctr.revisaoSolicitada),
      revisao_at: ctr.revisaoAt || null,
    };
    try {
      const { error } = await supabase
        .from('contratos')
        .upsert(payload, { onConflict: 'token' });
      if (error) {
        console.warn('Erro ao persistir contrato no Supabase:', error);
      }
      return { ...ctr, token };
    } catch (err) {
      console.warn('Exceção ao persistir contrato no Supabase:', err);
      return ctr;
    }
  };

  // ── Sincronização bidirecional em tempo real com o Supabase e Esteira Anterior (Pagamentos) ──
  useEffect(() => {
    async function syncFromSupabase() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('contratos').select('*');
          const cloudTokens = new Set();
          const payments = getPayments();

          if (!error && data && data.length > 0) {
            const activeCloudRows = data.filter(r => !isContractDismissed(r));
            activeCloudRows.forEach(r => { if (r.token) cloudTokens.add(r.token); });

            setContracts(prev => {
              const localMap = new Map(prev.filter(c => !isContractDismissed(c)).map(c => [c.token || c.id, c]));

              for (const row of activeCloudRows) {
                const key = row.token || row.id;
                const existing = localMap.get(key) || {};
                const isSigned = row.status === 'Assinado Digitalmente' || row.status === 'aceito';

                // Cruzamento estrito com a etapa anterior (Pagamentos)
                const uid = row.universal_id || existing.universalId || row.contract_number || existing.contractNumber;
                const client = row.client_name || existing.clientName;
                const matchingPay = payments.find(p => {
                  const pUid = (p.universalId || '').trim().toLowerCase();
                  const pClient = (p.clientName || '').trim().toLowerCase();
                  const targetUid = (uid || '').trim().toLowerCase();
                  const targetClient = (client || '').trim().toLowerCase();
                  return (
                    (targetUid && (pUid === targetUid || (p.invoice && p.invoice.toLowerCase().includes(targetUid)))) ||
                    (targetClient && pClient && (pClient === targetClient || pClient.includes(targetClient) || targetClient.includes(pClient)))
                  );
                });

                const payTotal = matchingPay?.amount;
                const payDeposit = matchingPay?.depositAmount && matchingPay.depositAmount !== 'R$ 0,00' ? matchingPay.depositAmount : null;
                const payRemaining = matchingPay?.remainingAmount && matchingPay.remainingAmount !== 'R$ 0,00' ? matchingPay.remainingAmount : null;
                const payDate = matchingPay?.dueDate && matchingPay.dueDate !== 'A definir' ? matchingPay.dueDate : null;

                const effectiveTotal = payTotal || row.total_amount || existing.totalAmount;
                const effectiveDeposit = payDeposit || row.deposit_amount || existing.depositAmount;
                const effectiveRemaining = payRemaining || row.remaining_amount || existing.remainingAmount;
                const effectiveDate = payDate || row.event_date || existing.eventDate;

                // Se valores financeiros foram alterados na esteira anterior (Pagamentos), contrato deve ser re-assinado
                const valuesDiffer = (payTotal && (row.total_amount !== payTotal || existing.totalAmount !== payTotal)) ||
                                     (payDeposit && (row.deposit_amount !== payDeposit || existing.depositAmount !== payDeposit));

                const finalStatus = valuesDiffer
                  ? 'Aguardando Assinatura'
                  : (isSigned ? 'Assinado Digitalmente' : (existing.signedStatus || row.status || 'Aguardando Assinatura'));
                const finalSignedAt = finalStatus === 'Assinado Digitalmente'
                  ? (row.assinado_em ? new Date(row.assinado_em).toLocaleString('pt-BR') : existing.signedAt)
                  : null;

                const updatedCtr = {
                  ...existing,
                  id: row.id || existing.id,
                  contractNumber: row.contract_number || existing.contractNumber,
                  universalId: row.universal_id || existing.universalId,
                  clientName: row.client_name || existing.clientName,
                  clientCpf: row.client_cpf || existing.clientCpf,
                  phone: row.phone || existing.phone,
                  serviceTitle: row.service_title || existing.serviceTitle,
                  totalAmount: effectiveTotal,
                  depositAmount: effectiveDeposit,
                  remainingAmount: effectiveRemaining,
                  eventDate: effectiveDate,
                  eventTime: row.event_time || existing.eventTime,
                  signedStatus: finalStatus,
                  signedAt: finalSignedAt,
                  revisaoSolicitada: finalStatus === 'Assinado Digitalmente' ? false : Boolean(row.revisao_solicitada),
                  revisaoAt: row.revisao_at || existing.revisaoAt,
                  token: row.token || existing.token,
                  statusColor: finalStatus === 'Assinado Digitalmente'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : (row.revisao_solicitada ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'),
                };

                localMap.set(key, updatedCtr);

                // Se valores mudaram em relação à nuvem, atualiza Supabase
                if (valuesDiffer) {
                  upsertContractToSupabase(updatedCtr);
                }
              }

              const merged = Array.from(localMap.values()).filter(c => !isContractDismissed(c));
              try { localStorage.setItem('admin_contracts', JSON.stringify(merged)); } catch (_) {}
              return merged;
            });
          }

          // PUSH AUTOMÁTICO: se houver contratos locais válidos que ainda não estão no Supabase, envia-os!
          try {
            const localStored = JSON.parse(localStorage.getItem('admin_contracts') || '[]').filter(c => !isContractDismissed(c));
            for (const localCtr of localStored) {
              if (localCtr.token && !cloudTokens.has(localCtr.token)) {
                await upsertContractToSupabase(localCtr);
              }
            }
          } catch (_) {}
        } catch (err) {
          console.warn('Erro ao sincronizar contratos do Supabase:', err);
        }
      }
    }

    syncFromSupabase();
    const handleStorage = () => { syncFromSupabase(); };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(syncFromSupabase, 6000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

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


  // ── Pipeline Integrity: Verifica se há pagamento confirmado (Sinal ou Quitado) ──
  const isPaymentConfirmed = (ctr) => {
    if (!ctr) return false;
    const payments = getPayments();
    const uid = (ctr.universalId || '').trim().toLowerCase();
    const ctrNum = (ctr.contractNumber || '').trim().toLowerCase();
    const client = (ctr.clientName || '').trim().toLowerCase();

    // Localiza faturas associadas a este contrato por ID Universal, Número de Contrato ou Nome
    const matchingPayments = payments.filter((p) => {
      const pUid = (p.universalId || '').trim().toLowerCase();
      const pClient = (p.clientName || '').trim().toLowerCase();
      const pDesc = (p.description || '').trim().toLowerCase();
      const pInv = (p.invoice || '').trim().toLowerCase();

      const matchByUid = uid && (pUid === uid || pDesc.includes(uid) || pInv.includes(uid));
      const matchByCtr = ctrNum && (pUid === ctrNum || pDesc.includes(ctrNum) || pInv.includes(ctrNum.replace('ctr-', 'fat-')));
      const matchByClient = client && pClient && (pClient === client || pClient.includes(client) || client.includes(pClient));

      return matchByUid || matchByCtr || matchByClient;
    });

    if (matchingPayments.length === 0) {
      // Se não há fatura encontrada no financeiro, só exibe se já assinado digitalmente
      return ctr.signedStatus === 'Assinado Digitalmente';
    }

    // Se há faturas associadas, OBRIGATORIAMENTE ao menos uma precisa estar confirmada (Sinal Recebido ou Total Quitado)
    return matchingPayments.some(
      (p) => p.status === 'Sinal Recebido' || p.status === 'Total Quitado' || p.status === 'Sinal Quitado' || p.status === 'Quitado'
    );
  };

  // Obtém o valor do sinal confirmado da fatura correspondente
  const getConfirmedSinal = (ctr) => {
    if (!ctr) return '';
    const payments = getPayments();
    const uid = (ctr.universalId || '').trim().toLowerCase();
    const ctrNum = (ctr.contractNumber || '').trim().toLowerCase();
    const client = (ctr.clientName || '').trim().toLowerCase();

    const pay = payments.find((p) => {
      const pUid = (p.universalId || '').trim().toLowerCase();
      const pClient = (p.clientName || '').trim().toLowerCase();
      const pDesc = (p.description || '').trim().toLowerCase();
      const pInv = (p.invoice || '').trim().toLowerCase();
      const isConfirmed = p.status === 'Sinal Recebido' || p.status === 'Total Quitado' || p.status === 'Sinal Quitado' || p.status === 'Quitado';
      if (!isConfirmed) return false;

      const matchByUid = uid && (pUid === uid || pDesc.includes(uid) || pInv.includes(uid));
      const matchByCtr = ctrNum && (pUid === ctrNum || pDesc.includes(ctrNum) || pInv.includes(ctrNum.replace('ctr-', 'fat-')));
      const matchByClient = client && pClient && (pClient === client || pClient.includes(client) || client.includes(pClient));

      return matchByUid || matchByCtr || matchByClient;
    });
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
    const confirmedSinal = getConfirmedSinal(ctr);
    const resolvedPhone = resolveClientPhone(ctr.universalId, ctr.clientName, ctr.phone);
    setNewCtr({
      clientName: ctr.clientName || '',
      clientCpf: ctr.clientCpf && ctr.clientCpf !== 'Sob consulta' ? ctr.clientCpf : '',
      serviceTitle: ctr.serviceTitle || 'Prestação de Serviços Fotográficos & Cessão de Imagem',
      totalAmount: ctr.totalAmount ? ctr.totalAmount.replace('R$ ', '') : '',
      depositAmount: ctr.depositAmount && ctr.depositAmount !== 'R$ 0,00' ? ctr.depositAmount.replace('R$ ', '') : (confirmedSinal ? confirmedSinal.replace('R$ ', '') : ''),
      phone: resolvedPhone || '',
      eventDate: ctr.eventDate && ctr.eventDate !== 'A definir' ? ctr.eventDate : '',
      eventTime: ctr.eventTime || '',
    });
    setIsCtrModalPrefilled(true);
    setEditingCtrId(ctr.id);
    setShowAddModal(true);
  };

  // ── Mark contract as "Revisão Solicitada" ──
  const markAsRevision = async (ctrId) => {
    const today = new Date().toLocaleDateString('pt-BR');
    let target = null;
    const updated = contracts.map((c) => {
      if (c.id === ctrId) {
        target = { ...c, revisaoSolicitada: true, revisaoAt: today };
        return target;
      }
      return c;
    });
    setContracts(updated);
    try { localStorage.setItem('admin_contracts', JSON.stringify(updated)); } catch (_) {}

    if (target) {
      await upsertContractToSupabase(target);
    }

    const ctrNum = target?.contractNumber || ctrId;
    logActivity?.('REVISAO_CONTRATO', 'contratos', `Marcou revisão solicitada no contrato ${ctrNum}`);
    showToast('⚠ Revisão solicitada registrada — cliente aguarda retorno.');
  };

  // ── Confirmar Aceite Manual do Contrato (pelo Admin) ──
  const handleConfirmAceite = async (ctrId) => {
    const nowIso = new Date().toISOString();
    const nowFormatted = new Date().toLocaleString('pt-BR');
    let acceptedCtr = null;

    const updated = contracts.map((c) => {
      if (c.id === ctrId) {
        acceptedCtr = {
          ...c,
          signedStatus: 'Assinado Digitalmente',
          signedAt: nowFormatted,
          revisaoSolicitada: false,
          statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
        return acceptedCtr;
      }
      return c;
    });

    setContracts(updated);
    try { localStorage.setItem('admin_contracts', JSON.stringify(updated)); } catch (_) {}

    // Sincroniza com Supabase
    if (acceptedCtr) {
      await upsertContractToSupabase(acceptedCtr);
    }

    // Despacha para a Agenda de Ensaios (última etapa da esteira após aceite do contrato!)
    if (acceptedCtr) {
      try {
        const pendingList = JSON.parse(localStorage.getItem('admin_pending_schedules') || '[]');
        const uid = acceptedCtr.universalId || acceptedCtr.contractNumber;
        if (!pendingList.some(item => (item.universalId || item.id) === uid)) {
          pendingList.unshift({
            id: `sched_rem_${Date.now()}`,
            universalId: uid,
            clientName: acceptedCtr.clientName,
            phone: acceptedCtr.phone,
            service: acceptedCtr.serviceTitle,
            depositAmount: acceptedCtr.depositAmount,
            contractNumber: acceptedCtr.contractNumber,
            createdAt: nowIso,
          });
          localStorage.setItem('admin_pending_schedules', JSON.stringify(pendingList));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (_) {}
    }

    logActivity?.('ACEITE_CONTRATO', 'contratos', `Confirmou aceite digital do contrato ${acceptedCtr?.contractNumber}`);
    showToast(`Contrato ${acceptedCtr?.contractNumber} aceito! Cliente avançou para a Agenda de Ensaios.`);
  };

  // ── Build WhatsApp message with full contract details + Link Oficial ──
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
    const link = `https://agenciasaraujo.com.br/contrato/${ctr.token}`;

    return `Olá ${ctr.clientName}! 🎉\nSegue seu contrato oficial — Agências Araújo Fotografia:\n\n📋 Contrato: ${ctr.contractNumber}\n🆔 ID Universal: ${ctr.universalId || ctr.contractNumber}\n📸 Serviço: ${ctr.serviceTitle}${dataLine}\n💰 Valor Total: ${ctr.totalAmount}${sinalLine}${saldoLine}\n\n📝 Termos & Condições:\n• Cessão de imagem conforme Lei 9.610/98\n• Cancelamentos com até 72h de antecedência sem multa\n• Entrega das imagens em até 30 dias úteis após a produção\n• Direitos autorais reservados à Agências Araújo\n\n👉 Visualização e Aceite Digital Oficial:\n${link}\n\nPara confirmar, você também pode responder diretamente aqui:\n1️⃣ ACEITO — confirmo o contrato e os termos acima\n2️⃣ REVISAR — tenho dúvidas ou solicito alterações\n\nObrigado pela confiança! 📷✨\nAgências Araújo | (21) 97429-9780`;
  };

  // ── Mensagem de Confirmação & Agradecimento WhatsApp (Visual com Frase de Efeito) ──
  const buildWhatsAppThankYouMsg = (ctr) => {
    return `🎉 Parabéns, ${ctr.clientName}! Confirmamos o aceite do seu contrato ${ctr.contractNumber}!\n\nObrigado pela preferência e pela confiança na Agências Araújo! 📷✨\n"Eternizando momentos, contando histórias com arte, sensibilidade e excelência."\n\nSua produção já foi encaminhada para a nossa Agenda de Ensaios. Em breve nossa equipe entrará em contato para definir a data e horário ideal da sua sessão fotográfica!\n\nQualquer dúvida, estamos à disposição! 🥂✨\nAgências Araújo | (21) 97429-9780`;
  };

  // ── Envio Seguro do Contrato via WhatsApp com ativação na nuvem garantida ──
  const handleSendContractWhatsApp = async (ctr) => {
    let effectiveCtr = { ...ctr };
    if (!effectiveCtr.token) {
      effectiveCtr.token = `ctr_token_${Math.random().toString(36).substring(2, 10)}`;
      setContracts(prev => {
        const upd = prev.map(c => c.id === effectiveCtr.id ? effectiveCtr : c);
        try { localStorage.setItem('admin_contracts', JSON.stringify(upd)); } catch (_) {}
        return upd;
      });
    }

    const targetPhone = resolveClientPhone(effectiveCtr.universalId, effectiveCtr.clientName, effectiveCtr.phone);
    let cleanDigits = (targetPhone || '').replace(/\D/g, '');

    if (!cleanDigits || cleanDigits.length < 10) {
      const inputPhone = prompt(`Informe o WhatsApp de ${effectiveCtr.clientName} (com DDD, ex: 21990689864):`);
      if (inputPhone && inputPhone.replace(/\D/g, '').length >= 10) {
        cleanDigits = inputPhone.replace(/\D/g, '');
        effectiveCtr.phone = inputPhone;
      } else {
        return;
      }
    }

    showToast(`Ativando link público e enviando contrato de ${effectiveCtr.clientName}...`);
    await upsertContractToSupabase(effectiveCtr);

    const msg = buildWhatsAppMsg(effectiveCtr);
    window.open(`https://wa.me/55${cleanDigits}?text=${encodeURIComponent(msg)}`, '_blank');
    logActivity?.('ENVIO_WHATSAPP_CONTRATO', 'contratos', `Enviou link de contrato para ${effectiveCtr.clientName} (${cleanDigits})`);
  };

  // ── Envio de Agradecimento WhatsApp (Aceite confirmado) ──
  const handleSendThankYouWhatsApp = (ctr) => {
    const targetPhone = resolveClientPhone(ctr.universalId, ctr.clientName, ctr.phone);
    let cleanDigits = (targetPhone || '').replace(/\D/g, '');

    if (!cleanDigits || cleanDigits.length < 10) {
      const inputPhone = prompt(`Informe o WhatsApp de ${ctr.clientName} (com DDD, ex: 21990689864):`);
      if (inputPhone && inputPhone.replace(/\D/g, '').length >= 10) {
        cleanDigits = inputPhone.replace(/\D/g, '');
      } else {
        return;
      }
    }

    const msg = buildWhatsAppThankYouMsg(ctr);
    window.open(`https://wa.me/55${cleanDigits}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── Remover Contrato da Fila permanentemente ──
  const handleRemoveContract = async (ctrId) => {
    const target = contracts.find((c) => c.id === ctrId);
    if (!target) return;

    const ctrLabel = target.contractNumber
      ? `${target.contractNumber} (${target.clientName})`
      : target.clientName;

    if (!window.confirm(`Deseja remover o contrato ${ctrLabel} da fila de contratos?`)) {
      return;
    }

    // 1. Remove do state local
    const updated = contracts.filter((c) => c.id !== ctrId && c.token !== target.token && c.contractNumber !== target.contractNumber);
    setContracts(updated);
    try {
      localStorage.setItem('admin_contracts', JSON.stringify(updated));
    } catch (_) {}

    // 2. Registra nos descartados para não reaparecer no polling do Supabase
    try {
      const dismissed = JSON.parse(localStorage.getItem('admin_dismissed_contracts') || '[]');
      const keysToAdd = [target.id, target.token, target.universalId, target.contractNumber].filter(Boolean);
      keysToAdd.forEach((k) => {
        if (!dismissed.includes(k)) dismissed.push(k);
      });
      localStorage.setItem('admin_dismissed_contracts', JSON.stringify(dismissed));
    } catch (_) {}

    // 3. Remove da fila de agendamento na agenda (admin_pending_schedules)
    try {
      const pendingList = JSON.parse(localStorage.getItem('admin_pending_schedules') || '[]');
      const uid = target.universalId || target.contractNumber;
      const filteredPending = pendingList.filter(item => 
        (item.universalId || item.id) !== uid &&
        item.contractNumber !== target.contractNumber &&
        item.clientName !== target.clientName
      );
      localStorage.setItem('admin_pending_schedules', JSON.stringify(filteredPending));
    } catch (_) {}

    // 4. Deleta do Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        if (target.token) {
          await supabase.from('contratos').delete().eq('token', target.token);
        }
        if (target.contractNumber) {
          await supabase.from('contratos').delete().eq('contract_number', target.contractNumber);
        }
      } catch (err) {
        console.warn('Erro ao remover contrato do Supabase:', err);
      }
    }

    logActivity?.('EXCLUSAO_CONTRATO', 'contratos', `Removeu contrato ${ctrLabel} da fila`);
    window.dispatchEvent(new Event('storage'));
    showToast(`Contrato ${target.contractNumber || ''} removido da fila com sucesso.`);
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
    // Reutiliza universalId do cliente se existir lead cadastrado
    let assignedUid = existingCtr?.universalId;
    if (!assignedUid || assignedUid.startsWith('CTR-')) {
      try {
        const leads = JSON.parse(localStorage.getItem('admin_leads') || '[]');
        const matchLead = leads.find(l => l.name && l.name.toLowerCase().trim() === newCtr.clientName.toLowerCase().trim());
        if (matchLead?.universalId) {
          assignedUid = matchLead.universalId;
        }
      } catch (_) {}
    }
    if (!assignedUid) {
      assignedUid = num;
    }

    const resolvedPhone = resolveClientPhone(assignedUid, newCtr.clientName, newCtr.phone);

    const created = {
      id: existingCtr?.id || `ctr_${Date.now()}`,
      contractNumber: num,
      universalId: assignedUid,
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
      phone: resolvedPhone,
    };

    setTimeout(async () => {
      const updatedContracts = editingCtrId
        ? contracts.map(c => c.id === editingCtrId ? created : c)
        : [created, ...contracts];
      setContracts(updatedContracts);
      try {
        localStorage.setItem('admin_contracts', JSON.stringify(updatedContracts));

        // Sincroniza ou atualiza pagamento correspondente sem criar duplicatas
        const existingPayments = JSON.parse(localStorage.getItem('admin_payments') || '[]');
        const existingPayIdx = existingPayments.findIndex((p) => 
          (assignedUid && p.universalId === assignedUid) ||
          p.universalId === num ||
          (created.clientName && p.clientName && p.clientName.toLowerCase().trim() === created.clientName.toLowerCase().trim())
        );

        if (existingPayIdx >= 0) {
          // Atualiza pagamento existente com valores e telefone atualizados
          const currPay = existingPayments[existingPayIdx];
          existingPayments[existingPayIdx] = {
            ...currPay,
            amount: created.totalAmount || currPay.amount,
            depositAmount: depNum > 0 ? created.depositAmount : currPay.depositAmount,
            remainingAmount: created.remainingAmount || currPay.remainingAmount,
            phone: resolvedPhone || currPay.phone,
            universalId: assignedUid || currPay.universalId,
          };
          localStorage.setItem('admin_payments', JSON.stringify(existingPayments));
        } else {
          const autoPayment = {
            id: `pay_${Date.now()}`,
            invoice: `FAT-${num.replace('CTR-', '')}`,
            universalId: assignedUid,
            clientName: created.clientName,
            phone: resolvedPhone,
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

        // Sincroniza contrato na nuvem (Supabase) para acesso público pelo token
        await upsertContractToSupabase(created);
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
    if (!isPaymentConfirmed(c)) return false; // oculta se não houver confirmação financeira (sinal ou quitação)

    const uid = c.universalId || c.contractNumber;
    const matchesSearch =
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || c.signedStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Quantidade de contratos aguardando pagamento confirmado
  const hiddenCount = contracts.filter((c) => !isPaymentConfirmed(c)).length;

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
            onClick={openBlankContractModal}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Emitir Contrato Avulso</span>
          </button>
        </div>
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
                  {showValues ? ctr.totalAmount : '••••••••'}
                </span>
                {ctr.depositAmount && ctr.depositAmount !== 'R$ 0,00' && (
                  <span className="text-[10px] text-cyan-300 font-sans block mt-0.5">
                    Sinal Pago: <strong>{showValues ? ctr.depositAmount : '••••'}</strong>
                  </span>
                )}
                {ctr.remainingAmount && ctr.remainingAmount !== 'R$ 0,00' && (
                  <span className="text-[10px] text-amber-300 font-sans block">
                    Saldo a Acertar: <strong>{showValues ? ctr.remainingAmount : '••••'}</strong>
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-2">
                {/* Linha 1: Ações de Emissão e Aceite */}
                <div className="flex items-center gap-2">
                  {/* Se ainda NÃO assinou: Botão para Confirmar Aceite diretamente */}
                  {ctr.signedStatus !== 'Assinado Digitalmente' && (
                    <button
                      onClick={() => handleConfirmAceite(ctr.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Confirmar que o cliente aceitou os termos (avança para a fila de agendamento)"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Confirmar Aceite</span>
                    </button>
                  )}

                  {/* Se JÁ assinou: Botão para Enviar Agradecimento Oficial no WhatsApp */}
                  {ctr.signedStatus === 'Assinado Digitalmente' && (
                    <button
                      onClick={() => handleSendThankYouWhatsApp(ctr)}
                      className="px-3 py-1.5 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold-300 text-[10px] font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Enviar agradecimento oficial e frase de efeito no WhatsApp do cliente"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-gold-400" />
                      <span>Agradecimento WhatsApp</span>
                    </button>
                  )}

                  {/* Emitir / Editar Contrato individual */}
                  <button
                    onClick={() => openContractFor(ctr)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px] font-semibold flex items-center gap-1.5 transition-colors"
                    title="Editar minuta ou ajustar valores"
                  >
                    <Plus className="w-3 h-3 text-gold" />
                    <span>Editar Minuta</span>
                  </button>
                </div>

                {/* Linha 2: Ações de Comunicação e Revisão */}
                <div className="flex items-center gap-2">
                  {/* Marcar como Revisão Solicitada */}
                  {!ctr.revisaoSolicitada && ctr.signedStatus !== 'Assinado Digitalmente' && (
                    <button
                      onClick={() => markAsRevision(ctr.id)}
                      title="Marcar que o cliente solicitou revisão do contrato via WhatsApp"
                      className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-semibold text-amber-300 flex items-center gap-1.5 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Revisão</span>
                    </button>
                  )}

                  {/* WhatsApp — envia contrato completo + link digital com telefone correto e ativação em tempo real */}
                  <button
                    onClick={() => handleSendContractWhatsApp(ctr)}
                    className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Enviar contrato e link oficial de aceite via WhatsApp"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-green-400" />
                    <span>Enviar Contrato</span>
                  </button>

                  {/* Remover da Fila */}
                  <button
                    onClick={() => handleRemoveContract(ctr.id)}
                    className="px-2.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Remover contrato da fila"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Remover da Fila</span>
                  </button>
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
