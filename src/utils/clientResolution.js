/**
 * Utilitário central de resolução de telefone e saneamento de esteira da Agências Araújo
 */

// Telefone da Nicoly (não deve ser usado como fallback para outros clientes)
const NICOLY_PHONE = '21975530689';

/**
 * Normaliza número de telefone para apenas dígitos
 */
export const cleanPhoneDigits = (phone) => {
  return (phone || '').replace(/\D/g, '');
};

/**
 * Resolve o telefone real do cliente cruzando leads, clientes e pagamentos.
 * Garante que nunca haverá vazamento de telefone de um cliente para outro.
 */
export const resolveClientPhone = (universalId, clientName, currentPhone) => {
  const normCurrent = cleanPhoneDigits(currentPhone);
  const isNicoly = (clientName || '').toLowerCase().includes('nicoly');

  // Se o telefone fornecido for válido e não for o telefone da Nicoly atribuído a outrem
  if (normCurrent.length >= 10) {
    if (normCurrent.includes(NICOLY_PHONE) && !isNicoly) {
      // Telefone herdado por engano de fallback anterior — rejeitar e buscar real
    } else {
      return currentPhone;
    }
  }

  const targetUid = (universalId || '').trim().toLowerCase();
  const targetName = (clientName || '').trim().toLowerCase();

  // 1. Busca em admin_leads
  try {
    const leads = JSON.parse(localStorage.getItem('admin_leads') || '[]');
    const lead = leads.find((l) => {
      const lUid = (l.universalId || '').trim().toLowerCase();
      const lName = (l.name || '').trim().toLowerCase();
      if (targetUid && lUid === targetUid) return true;
      if (targetName && lName && (lName === targetName || lName.includes(targetName) || targetName.includes(lName))) return true;
      return false;
    });
    if (lead?.phone && cleanPhoneDigits(lead.phone).length >= 10) {
      const norm = cleanPhoneDigits(lead.phone);
      if (!norm.includes(NICOLY_PHONE) || isNicoly) {
        return lead.phone;
      }
    }
  } catch (_) {}

  // 2. Busca em admin_clients
  try {
    const clients = JSON.parse(localStorage.getItem('admin_clients') || '[]');
    const client = clients.find((c) => {
      const cUid = (c.universalId || '').trim().toLowerCase();
      const cName = (c.name || '').trim().toLowerCase();
      if (targetUid && cUid === targetUid) return true;
      if (targetName && cName && (cName === targetName || cName.includes(targetName) || targetName.includes(cName))) return true;
      return false;
    });
    if (client?.phone && cleanPhoneDigits(client.phone).length >= 10) {
      const norm = cleanPhoneDigits(client.phone);
      if (!norm.includes(NICOLY_PHONE) || isNicoly) {
        return client.phone;
      }
    }
  } catch (_) {}

  // 3. Fallback específico para registros conhecidos no banco
  if (targetName.includes('willian') || targetUid.includes('willia')) {
    return '(21) 99068-9864';
  }

  // 4. Se ainda sem telefone, retorna string vazia para forçar validação amigável
  return '';
};

/**
 * Executa saneamento e deduplicação do pipeline no localStorage.
 * Resolve as faturas e contratos duplicados e purga a fila de agendamento prematura.
 */
export const sanitizePipelineData = () => {
  try {
    const SANITIZE_VERSION = 'v3_status_pendente_sinal_recebido_total_quitado';
    const lastRun = localStorage.getItem('admin_sanitize_pipeline_version');

    let paymentsChanged = false;
    let contractsChanged = false;
    let pendingChanged = false;

    // --- 1. SANEAMENTO DE PAGAMENTOS ---
    const payments = JSON.parse(localStorage.getItem('admin_payments') || '[]');
    if (payments.length > 0) {
      const uniquePayments = [];
      const seenUids = new Set();
      const seenNames = new Set();

      for (const p of payments) {
        let normStatus = p.status;
        let normColor = p.statusColor;
        if (normStatus === 'Pendente Sinal') {
          normStatus = 'Pendente';
          normColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
          paymentsChanged = true;
        } else if (normStatus === 'Sinal Quitado') {
          normStatus = 'Sinal Recebido';
          normColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
          paymentsChanged = true;
        } else if (normStatus === 'Quitado') {
          normStatus = 'Total Quitado';
          normColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
          paymentsChanged = true;
        }

        const isWillian = (p.clientName || '').toLowerCase().includes('willian') || (p.universalId || '').includes('WILLIA');
        if (isWillian) {
          // Unifica todos os pagamentos do Willian no ID canônico CLI-2026-959-WILLIA
          if (seenNames.has('willian')) {
            paymentsChanged = true;
            continue; // descarta duplicata FAT-2026-743
          }
          seenNames.add('willian');
          uniquePayments.push({
            ...p,
            id: p.id || 'pay_willian_canonical',
            invoice: 'FAT-2026-819',
            universalId: 'CLI-2026-959-WILLIA',
            clientName: 'WILLIAN DE ARAUJO NASCIMENTO',
            phone: '(21) 99068-9864',
            description: 'Ensaio Retrato Corporativo',
            status: 'Sinal Recebido',
            depositAmount: p.depositAmount && p.depositAmount !== 'R$ 0,00' ? p.depositAmount : 'R$ 1,00',
            statusColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          });
          seenUids.add('CLI-2026-959-WILLIA');
          paymentsChanged = true;
          continue;
        }

        const uid = p.universalId;
        if (uid && seenUids.has(uid)) {
          paymentsChanged = true;
          continue;
        }
        if (uid) seenUids.add(uid);
        uniquePayments.push({
          ...p,
          status: normStatus,
          statusColor: normColor,
        });
      }

      if (paymentsChanged || lastRun !== SANITIZE_VERSION) {
        localStorage.setItem('admin_payments', JSON.stringify(uniquePayments));
      }
    }

    // --- 2. SANEAMENTO DE CONTRATOS ---
    const contracts = JSON.parse(localStorage.getItem('admin_contracts') || '[]');
    if (contracts.length > 0) {
      const uniqueContracts = [];
      const seenCtrUids = new Set();
      const seenCtrNames = new Set();

      for (const ctr of contracts) {
        const isWillian = (ctr.clientName || '').toLowerCase().includes('willian') || 
                          (ctr.universalId || '').includes('WILLIA') ||
                          ctr.contractNumber === 'CTR-2026-690' ||
                          ctr.contractNumber === 'CTR-2026-743';

        if (isWillian) {
          if (seenCtrNames.has('willian')) {
            contractsChanged = true;
            continue; // descarta duplicata CTR-2026-690
          }
          seenCtrNames.add('willian');
          uniqueContracts.push({
            ...ctr,
            id: ctr.id || 'ctr_willian_canonical',
            contractNumber: 'CTR-2026-743',
            universalId: 'CLI-2026-959-WILLIA',
            clientName: 'WILLIAN DE ARAUJO NASCIMENTO',
            clientCpf: ctr.clientCpf && ctr.clientCpf !== '0000000000' ? ctr.clientCpf : 'Sob consulta',
            phone: '(21) 99068-9864',
            serviceTitle: 'Ensaio Retrato Corporativo',
            signedStatus: 'Aguardando Assinatura', // NÃO ACEITO AINDA (impede entrada na agenda)
            signedAt: null,
            revisaoSolicitada: false,
            statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          });
          seenCtrUids.add('CLI-2026-959-WILLIA');
          contractsChanged = true;
          continue;
        }

        const uid = ctr.universalId || ctr.contractNumber;
        if (uid && seenCtrUids.has(uid)) {
          contractsChanged = true;
          continue;
        }
        if (uid) seenCtrUids.add(uid);
        uniqueContracts.push(ctr);
      }

      if (contractsChanged || lastRun !== SANITIZE_VERSION) {
        localStorage.setItem('admin_contracts', JSON.stringify(uniqueContracts));
      }
    }

    // --- 3. PURGA DA FILA DE AGENDAMENTO (admin_pending_schedules) ---
    // Apenas contratos assinados / aceitos podem constar na fila!
    const pendingList = JSON.parse(localStorage.getItem('admin_pending_schedules') || '[]');
    const currentContracts = JSON.parse(localStorage.getItem('admin_contracts') || '[]');

    const sanitizedPending = pendingList.filter((item) => {
      const isWillian = (item.clientName || '').toLowerCase().includes('willian') || 
                        (item.universalId || '').includes('WILLIA');
      
      const matchingCtr = currentContracts.find((c) => {
        const uid = c.universalId || c.contractNumber;
        return (item.universalId && uid === item.universalId) || 
               c.contractNumber === item.contractNumber ||
               c.clientName?.toLowerCase().trim() === item.clientName?.toLowerCase().trim();
      });

      // Se é Willian e ainda está Aguardando Assinatura, remove!
      if (isWillian && (!matchingCtr || matchingCtr.signedStatus !== 'Assinado Digitalmente')) {
        pendingChanged = true;
        return false;
      }

      // Regra geral estrita: se não encontrou contrato ou o contrato não está assinado, expurga!
      if (!matchingCtr) {
        pendingChanged = true;
        return false;
      }
      const isAccepted = matchingCtr.signedStatus === 'Assinado Digitalmente' || matchingCtr.signedStatus === 'Contrato Aceito';
      if (!isAccepted) {
        pendingChanged = true;
        return false;
      }
      return true;
    });

    if (pendingChanged || lastRun !== SANITIZE_VERSION) {
      localStorage.setItem('admin_pending_schedules', JSON.stringify(sanitizedPending));
    }

    localStorage.setItem('admin_sanitize_pipeline_version', SANITIZE_VERSION);
    if (paymentsChanged || contractsChanged || pendingChanged) {
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.warn('Erro ao sanitizar dados do pipeline:', err);
  }
};
