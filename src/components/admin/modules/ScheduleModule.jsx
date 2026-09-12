import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Camera, User, 
  Plus, CheckCircle, AlertCircle, MessageCircle, X, ChevronLeft, ChevronRight,
  Globe, Trash2, Check, RefreshCw, Sunrise, Sunset
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';

const SESSIONS_STORAGE_KEY = 'admin_sessions';

const DEFAULT_SESSIONS = [];

const toIsoDate = (dStr) => {
  if (!dStr) return '';
  if (dStr.includes('/')) {
    const parts = dStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return dStr;
};

export default function ScheduleModule() {
  const { isSuperAdmin, logActivity } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdminTimePicker, setShowAdminTimePicker] = useState(false);
  const [adminStartTime, setAdminStartTime] = useState('16:30');
  const [adminEndTime, setAdminEndTime] = useState('18:30');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [toast, setToast] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [pendingReminders, setPendingReminders] = useState([]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Carrega lembretes de clientes que concluíram estritamente a esteira e aguardam agendamento
  const loadPendingReminders = () => {
    try {
      const storedSessions = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
      const contracts = JSON.parse(localStorage.getItem('admin_contracts') || '[]');
      const explicitPending = JSON.parse(localStorage.getItem('admin_pending_schedules') || '[]');
      const dismissed = JSON.parse(localStorage.getItem('admin_dismissed_schedule_reminders') || '[]');
      const payments = JSON.parse(localStorage.getItem('admin_payments') || '[]');

      // Helper: confirmação financeira (Sinal Quitado ou Quitado)
      const isPaymentConfirmed = (uid, clientName, ctr) => {
        if (ctr && ctr.depositAmount && ctr.depositAmount !== 'R$ 0,00' && ctr.depositAmount !== 'R$ 0') {
          return true;
        }
        return payments.some(p => {
          const pUid = (p.universalId || '').trim().toLowerCase();
          const pClient = (p.clientName || '').trim().toLowerCase();
          const targetUid = (uid || '').trim().toLowerCase();
          const targetClient = (clientName || '').trim().toLowerCase();
          const matchUid = targetUid && (pUid === targetUid || p.invoice?.toLowerCase().includes(targetUid));
          const matchClient = targetClient && (pClient === targetClient || pClient.includes(targetClient));
          if (matchUid || matchClient) {
            return p.status === 'Sinal Recebido' || p.status === 'Total Quitado' || p.status === 'Sinal Quitado' || p.status === 'Quitado';
          }
          return false;
        });
      };

      const scheduledUids = new Set(storedSessions.map(s => s.universalId).filter(Boolean));
      const scheduledNames = new Set(storedSessions.map(s => (s.client || '').toLowerCase().trim()));

      const list = [];
      const seen = new Set();

      // 1. Clientes com contratos aceitos/assinados e pagamento confirmado
      for (const ctr of contracts) {
        if (!ctr || !ctr.clientName) continue;
        // REGRA ESTRITA DA ESTEIRA: Somente clientes com contrato ACEITO/ASSINADO avançam para agendamento!
        const isAccepted = ctr.signedStatus === 'Assinado Digitalmente' || ctr.signedStatus === 'Contrato Aceito';
        if (!isAccepted) continue;

        const uid = ctr.universalId || ctr.contractNumber;
        if (dismissed.includes(uid)) continue;
        if (scheduledUids.has(uid) || scheduledNames.has((ctr.clientName || '').toLowerCase().trim())) continue;
        if (!isPaymentConfirmed(uid, ctr.clientName, ctr)) continue;
        if (seen.has(uid)) continue;
        seen.add(uid);
        list.push({
          id: `rem_ctr_${ctr.id}`,
          uid,
          universalId: ctr.universalId || ctr.contractNumber,
          clientName: ctr.clientName,
          phone: ctr.phone || '',
          service: ctr.serviceTitle || 'Prestação de Serviços Fotográficos',
          depositAmount: ctr.depositAmount || 'R$ 0,00',
          remainingAmount: ctr.remainingAmount || ctr.totalAmount,
          contractNumber: ctr.contractNumber,
          token: ctr.token,
          sourceType: 'contract',
        });
      }

      // 2. Fila explícita despachada pós-aceite de contrato (garantindo esteira prévia e contrato assinado)
      const validPending = [];
      for (const p of explicitPending) {
        if (!p || !p.clientName) continue;
        const uid = p.universalId || p.id;
        const matchingCtr = contracts.find(c => 
          (uid && (c.universalId === uid || c.contractNumber === uid)) ||
          (p.contractNumber && c.contractNumber === p.contractNumber) ||
          (c.clientName && c.clientName.toLowerCase().trim() === p.clientName.toLowerCase().trim())
        );

        // Se não tem contrato assinado/aceito, expurga da fila da agenda
        if (!matchingCtr || (matchingCtr.signedStatus !== 'Assinado Digitalmente' && matchingCtr.signedStatus !== 'Contrato Aceito')) {
          continue;
        }

        validPending.push(p);

        if (dismissed.includes(uid)) continue;
        if (scheduledUids.has(uid) || scheduledNames.has((p.clientName || '').toLowerCase().trim())) continue;
        if (!isPaymentConfirmed(uid, p.clientName, matchingCtr)) continue;
        if (seen.has(uid)) continue;
        seen.add(uid);
        list.push({
          ...p,
          uid,
          sourceType: 'pipeline',
        });
      }

      if (validPending.length !== explicitPending.length) {
        try { localStorage.setItem('admin_pending_schedules', JSON.stringify(validPending)); } catch (_) {}
      }

      setPendingReminders(list);
    } catch (e) {
      console.warn('Erro ao carregar lembretes de agendamento:', e);
    }
  };

  // Carrega e sincroniza sessões do localStorage
  const loadSessions = () => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        setSessions(JSON.parse(stored));
      } else {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(DEFAULT_SESSIONS));
        setSessions(DEFAULT_SESSIONS);
      }
    } catch {
      setSessions(DEFAULT_SESSIONS);
    }
    loadPendingReminders();
  };

  useEffect(() => {
    async function syncFromSupabase() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('contratos').select('*');
          if (!error && data && data.length > 0) {
            const dismissedContracts = JSON.parse(localStorage.getItem('admin_dismissed_contracts') || '[]');
            const isDismissedCtr = (c) => {
              if (!c) return false;
              return (
                (c.id && dismissedContracts.includes(c.id)) ||
                (c.token && dismissedContracts.includes(c.token)) ||
                (c.universalId && dismissedContracts.includes(c.universalId)) ||
                (c.universal_id && dismissedContracts.includes(c.universal_id)) ||
                (c.contractNumber && dismissedContracts.includes(c.contractNumber)) ||
                (c.contract_number && dismissedContracts.includes(c.contract_number))
              );
            };

            const localContracts = JSON.parse(localStorage.getItem('admin_contracts') || '[]').filter(c => !isDismissedCtr(c));
            const localMap = new Map(localContracts.map(c => [c.token || c.id, c]));
            let changed = false;

            for (const row of data) {
              if (isDismissedCtr(row)) continue;
              const key = row.token || row.id;
              const existing = localMap.get(key) || {};
              const isSigned = row.status === 'Assinado Digitalmente' || row.status === 'aceito';
              if (isSigned && existing.signedStatus !== 'Assinado Digitalmente') {
                changed = true;
              }
              localMap.set(key, {
                ...existing,
                id: row.id || existing.id,
                contractNumber: row.contract_number || existing.contractNumber,
                universalId: row.universal_id || existing.universalId,
                clientName: row.client_name || existing.clientName,
                clientCpf: row.client_cpf || existing.clientCpf,
                phone: row.phone || existing.phone,
                serviceTitle: row.service_title || existing.serviceTitle,
                totalAmount: row.total_amount || existing.totalAmount,
                depositAmount: row.deposit_amount || existing.depositAmount,
                remainingAmount: row.remaining_amount || existing.remainingAmount,
                eventDate: row.event_date || existing.eventDate,
                eventTime: row.event_time || existing.eventTime,
                signedStatus: isSigned ? 'Assinado Digitalmente' : (existing.signedStatus || row.status || 'Aguardando Assinatura'),
                signedAt: row.assinado_em ? new Date(row.assinado_em).toLocaleString('pt-BR') : existing.signedAt,
                token: row.token || existing.token,
              });
            }

            if (changed || localContracts.length === 0) {
              const merged = Array.from(localMap.values()).filter(c => !isDismissedCtr(c));
              try { localStorage.setItem('admin_contracts', JSON.stringify(merged)); } catch (_) {}
              loadPendingReminders();
            }
          }
        } catch (err) {
          console.warn('Erro ao sincronizar contratos na agenda:', err);
        }
      }
    }

    syncFromSupabase();
    loadSessions();
    const handleStorage = () => {
      loadSessions();
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => {
      syncFromSupabase();
      loadSessions();
    }, 6000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const [newSession, setNewSession] = useState({
    date: '',
    time: '16:30 - 18:30',
    client: '',
    phone: '',
    type: 'Retratos Pessoais',
    location: 'Studio Barra da Tijuca, RJ',
    equipment: 'Kit Padrão Mirrorless Full Frame + Lentes Prime',
    universalId: '',
  });

  const handleStartScheduleForReminder = (rem) => {
    setNewSession({
      date: '',
      time: '16:30 - 18:30',
      client: rem.clientName,
      phone: rem.phone || '',
      type: rem.service || 'Retratos Pessoais',
      location: 'Studio Barra da Tijuca, RJ',
      equipment: 'Kit Padrão Mirrorless Full Frame + Lentes Prime',
      universalId: rem.universalId || rem.uid,
    });
    setShowAddModal(true);
  };

  // ── Remover cliente da fila de agendamento permanentemente ──
  const handleRemoveFromQueue = (rem) => {
    const uid = rem.universalId || rem.uid || rem.id;
    try {
      // 1. Remove da lista de pendências explícitas
      const explicitPending = JSON.parse(localStorage.getItem('admin_pending_schedules') || '[]');
      const updatedPending = explicitPending.filter(item => (item.universalId || item.uid || item.id) !== uid);
      localStorage.setItem('admin_pending_schedules', JSON.stringify(updatedPending));

      // 2. Registra na lista de descartados para não reaparecer
      const dismissed = JSON.parse(localStorage.getItem('admin_dismissed_schedule_reminders') || '[]');
      if (!dismissed.includes(uid)) {
        dismissed.push(uid);
        localStorage.setItem('admin_dismissed_schedule_reminders', JSON.stringify(dismissed));
      }

      loadPendingReminders();
      showToast(`Cliente ${rem.clientName} removido da fila de agendamento.`, 'info');
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Erro ao remover cliente da fila:', err);
    }
  };

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!newSession.client.trim()) return;

    const sessionObj = {
      id: `sess_${Date.now()}`,
      universalId: newSession.universalId || '',
      date: newSession.date || 'Em breve',
      time: newSession.time,
      client: newSession.client,
      phone: newSession.phone || '(21) 97429-9780',
      type: newSession.type,
      location: newSession.location,
      photographer: 'Equipe Agências Araújo',
      equipment: newSession.equipment,
      status: 'Confirmado',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      source: 'Painel Admin (Manual)',
      createdAt: new Date().toISOString(),
    };

    const updated = [sessionObj, ...sessions];
    setSessions(updated);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));

    // Remove do pending se veio de lembrete
    if (newSession.universalId) {
      try {
        const explicitPending = JSON.parse(localStorage.getItem('admin_pending_schedules') || '[]');
        const updatedPending = explicitPending.filter(p => p.universalId !== newSession.universalId);
        localStorage.setItem('admin_pending_schedules', JSON.stringify(updatedPending));
      } catch (_) {}
    }

    loadPendingReminders();
    window.dispatchEvent(new Event('storage'));

    setShowAddModal(false);
    showToast(`Sessão de "${newSession.client}" agendada! Ciclo da esteira concluído com sucesso.`);
    logActivity?.('AGENDA_NOVA_SESSAO', 'agenda', `Agendou sessão para ${sessionObj.client} [${sessionObj.universalId || 'Manual'}] em ${sessionObj.date}`);

    setNewSession({
      date: '',
      time: '16:30 - 18:30',
      client: '',
      phone: '',
      type: 'Retratos Pessoais',
      location: 'Studio Barra da Tijuca, RJ',
      equipment: 'Kit Padrão Mirrorless Full Frame + Lentes Prime',
      universalId: '',
    });
  };

  const handleStatusChange = (id, newStatus) => {
    let color = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (newStatus === 'Pendente Sinal') color = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (newStatus === 'Em Edição') color = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (newStatus === 'Cancelado') color = 'bg-rose-500/20 text-rose-300 border-rose-500/30';

    const updated = sessions.map(s => s.id === id ? { ...s, status: newStatus, statusColor: color } : s);
    setSessions(updated);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    showToast(`Status atualizado para: ${newStatus}`);
  };

  const handleDeleteSession = (id, clientName) => {
    if (!window.confirm(`Deseja remover a sessão de "${clientName}" da agenda? Isso liberará a data/horário no site público.`)) return;

    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    showToast(`Sessão de "${clientName}" removida. Vaga liberada no site.`, 'error');
  };

  const filtered = sessions.filter(s => filterStatus === 'Todos' || s.status === filterStatus);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Módulo 05 • Agenda & Produção Fotográfica</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Cronograma de Sessões & Gravações</h1>
          <p className="text-slate-400 text-xs">
            Controle de locações, horários e sincronização direta com a Agenda Online do site público
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSessions}
            title="Atualizar sessões"
            className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-gold/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Nova Sessão</span>
          </button>
        </div>
      </div>

      {/* Lembretes da Esteira Comercial (Última Etapa: Agendamento do Ensaio) */}
      {pendingReminders.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-slate-900 border border-amber-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h2 className="text-sm font-bold text-amber-300 font-serif">
                Última Etapa da Esteira • Aguardando Agendamento ({pendingReminders.length})
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 animate-pulse">
              {pendingReminders.length === 1 ? '1 Cliente para Agendar' : `${pendingReminders.length} Clientes para Agendar`}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Estes clientes concluíram as etapas comerciais anteriores (<strong>Lead ➔ Fechado ➔ Pagamento/Sinal ➔ Emissão de Contrato ➔ CRM</strong>) e estão aguardando a definição da data e horário do ensaio para execução.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingReminders.map((rem) => (
              <div 
                key={rem.id}
                className="p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3 shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-white text-sm block">{rem.clientName}</span>
                      <span className="text-xs text-gold-300 font-medium">{rem.service}</span>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-gold/90 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded">
                      {rem.universalId}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-2">
                    {rem.depositAmount && rem.depositAmount !== 'R$ 0,00' && (
                      <span className="text-cyan-300 font-mono">
                        Sinal: <strong>{rem.depositAmount}</strong>
                      </span>
                    )}
                    {rem.contractNumber && (
                      <span className="text-slate-400 font-mono">
                        Contrato: {rem.contractNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                  {rem.phone && (
                    <a
                      href={`https://wa.me/55${rem.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(rem.clientName)}!%20Seu%20contrato%20e%20sinal%20foram%20confirmados%20na%20Agências%20Araújo.%20Vamos%20definir%20o%20dia%20e%20melhor%20horário%20para%20o%20seu%20ensaio?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Combinar data via WhatsApp"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-green-400" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => handleRemoveFromQueue(rem)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Remover cliente da fila de agendamento"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Remover da Fila</span>
                    </button>
                    <button
                      onClick={() => handleStartScheduleForReminder(rem)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agendar Sessão</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['Todos', 'Confirmado', 'Pendente Sinal', 'Em Edição', 'Cancelado'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === st
                ? 'bg-gold-500 text-dark-950 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Sessions Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((sess) => (
          <div
            key={sess.id}
            className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 space-y-4 hover:border-gold/30 transition-all shadow-xl relative group"
          >
            {/* Top info */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sess.statusColor}`}>
                    {sess.status}
                  </span>

                  {sess.source?.includes('Site') ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      <Globe className="w-3 h-3" />
                      <span>Site Oficial</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10">
                      Painel Interno
                    </span>
                  )}

                  {sess.universalId && (
                    <span className="font-mono text-[9px] font-bold text-gold/90 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded">
                      {sess.universalId}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mt-2">{sess.client}</h3>
                <p className="text-xs text-gold-300 font-medium">{sess.type}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-white block bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                  {sess.date}
                </span>
                <span className="text-[11px] font-mono text-slate-400 block mt-1">
                  {sess.time}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                <span className="truncate">{sess.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 truncate">{sess.photographer}</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 text-[11px] truncate">{sess.equipment}</span>
              </div>
              {sess.notes && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300 italic">
                  "{sess.notes}"
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
              {/* Quick Status Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-mono">Status:</span>
                <select
                  value={sess.status}
                  onChange={(e) => handleStatusChange(sess.id, e.target.value)}
                  className="px-2 py-1 rounded-lg bg-black/60 border border-slate-700 text-white text-[11px] focus:border-gold focus:outline-none"
                >
                  <option value="Confirmado">Confirmado</option>
                  <option value="Pendente Sinal">Pendente Sinal</option>
                  <option value="Em Edição">Em Edição</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {sess.phone && (
                  <a
                    href={`https://wa.me/55${sess.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(sess.client)},%20confirmando%20nosso%20ensaio%20no%20dia%20${sess.date}%20às%20${sess.time}%20em%20${encodeURIComponent(sess.location)}!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-green-400" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <button
                  onClick={() => handleDeleteSession(sess.id, sess.client)}
                  title="Remover sessão da agenda"
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm border border-dashed border-white/10 rounded-3xl">
            Nenhuma sessão encontrada para este filtro.
          </div>
        )}
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-gold/30 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-white mb-1">Agendar Nova Sessão</h2>
            <p className="text-xs text-slate-400 mb-4">Cadastre o ensaio fotográfico e bloqueie o horário no site público</p>

            {newSession.universalId && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs text-amber-300 font-semibold">Esteira Comercial • Etapa Final de Agendamento</span>
                </div>
                <span className="font-mono text-xs font-bold text-gold bg-gold/10 px-2.5 py-1 rounded border border-gold/30">
                  {newSession.universalId}
                </span>
              </div>
            )}

            <form onSubmit={handleAddSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente / Empresa *</label>
                <input
                  type="text"
                  required
                  value={newSession.client}
                  onChange={(e) => setNewSession({ ...newSession, client: e.target.value })}
                  placeholder="Nome do cliente"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Data (DD/MM/AAAA) *</label>
                    {newSession.date && (
                      <span className="text-[10px] font-mono text-gold font-bold">📅 {newSession.date}</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={toIsoDate(newSession.date)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const [y, m, d] = val.split('-');
                          setNewSession({ ...newSession, date: `${d}/${m}/${y}` });
                        } else {
                          setNewSession({ ...newSession, date: '' });
                        }
                      }}
                      onClick={(e) => {
                        try { e.target.showPicker?.(); } catch (_) {}
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none [color-scheme:dark] cursor-pointer"
                    />
                    <CalendarIcon className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Clique para abrir o calendário</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Turno / Horário *</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (newSession.time && newSession.time.includes('-')) {
                          const parts = newSession.time.split('-');
                          setAdminStartTime(parts[0].trim().slice(0, 5));
                          setAdminEndTime(parts[1].trim().slice(0, 5));
                        }
                        setShowAdminTimePicker(true);
                      }}
                      className="text-[10px] text-gold hover:underline font-mono font-bold flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      <span>⏰ Abrir Relógio</span>
                    </button>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (newSession.time && newSession.time.includes('-')) {
                          const parts = newSession.time.split('-');
                          setAdminStartTime(parts[0].trim().slice(0, 5));
                          setAdminEndTime(parts[1].trim().slice(0, 5));
                        }
                        setShowAdminTimePicker(true);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 hover:border-gold text-white text-left text-sm focus:border-gold focus:outline-none font-mono flex items-center justify-between group transition-colors cursor-pointer"
                      title="Clique para abrir o relógio e escolher horário de início e término"
                    >
                      <span className="font-bold text-gold">{newSession.time || '16:30 - 18:30'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gold/20 text-gold font-bold flex items-center gap-1 group-hover:bg-gold group-hover:text-dark-950 transition-colors">
                        ⏰ Relógio
                      </span>
                    </button>
                    <Clock className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Clique para definir início e término</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Serviço</label>
                  <select
                    value={newSession.type}
                    onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none"
                  >
                    <option>Retratos Pessoais</option>
                    <option>Retratos Corporativos Executive</option>
                    <option>Ensaio Feminino / Moda</option>
                    <option>Gestante & Família</option>
                    <option>Campanha Gastronômica</option>
                    <option>Cobertura Maracanã / Eventos</option>
                    <option>Ensaio Pré-Wedding / Casamento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={newSession.phone}
                    onChange={(e) => setNewSession({ ...newSession, phone: e.target.value })}
                    placeholder="(21) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Locação no Rio de Janeiro</label>
                <input
                  type="text"
                  value={newSession.location}
                  onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                  placeholder="Ex: Studio Barra, Praia de Copacabana, Maracanã..."
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
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Relógio / Horário do Admin com Início e Término */}
      {showAdminTimePicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-gold/40 p-6 shadow-2xl relative text-white">
            <button
              type="button"
              onClick={() => setShowAdminTimePicker(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shadow-md">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-white">Definir Horário de Início e Término</h3>
                <p className="text-xs text-slate-400">Especifique o horário exato da reserva para a sessão</p>
              </div>
            </div>

            {/* Inputs Início e Término */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sunrise className="w-3.5 h-3.5 text-gold" />
                  <span>Início</span>
                </label>
                <input
                  type="time"
                  required
                  value={adminStartTime}
                  onChange={(e) => setAdminStartTime(e.target.value)}
                  onClick={(e) => {
                    try { e.target.showPicker?.(); } catch (_) {}
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-base focus:border-gold focus:outline-none [color-scheme:dark] cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Clique para abrir relógio</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sunset className="w-3.5 h-3.5 text-gold" />
                  <span>Término</span>
                </label>
                <input
                  type="time"
                  required
                  value={adminEndTime}
                  onChange={(e) => setAdminEndTime(e.target.value)}
                  onClick={(e) => {
                    try { e.target.showPicker?.(); } catch (_) {}
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-base focus:border-gold focus:outline-none [color-scheme:dark] cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Clique para abrir relógio</span>
              </div>
            </div>

            {/* Turnos Padrão */}
            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">
                Ou selecione um turno pré-configurado:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { time: '09:00 - 12:00', label: 'Manhã' },
                  { time: '13:30 - 16:00', label: 'Tarde' },
                  { time: '16:30 - 18:30', label: 'Golden Hour' },
                  { time: '19:30 - 22:30', label: 'Noite' },
                ].map((slot) => {
                  const isCurrent = `${adminStartTime} - ${adminEndTime}` === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => {
                        const [s, e] = slot.time.split(' - ');
                        setAdminStartTime(s);
                        setAdminEndTime(e);
                      }}
                      className={`p-2 rounded-xl border text-left text-xs transition-all ${
                        isCurrent
                          ? 'bg-gold/20 border-gold text-gold font-bold ring-1 ring-gold'
                          : 'bg-white/5 border-white/10 hover:border-gold/30 text-slate-300'
                      }`}
                    >
                      <div className="font-mono font-bold flex items-center justify-between">
                        <span>{slot.time}</span>
                        {isCurrent && <span className="text-[10px]">✓</span>}
                      </div>
                      <div className="text-[10px] text-slate-400">{slot.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-xl bg-gold/10 border border-gold/30 mb-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Horário que será salvo:
                </span>
                <div className="font-mono font-bold text-gold text-sm">
                  {adminStartTime} - {adminEndTime}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Válido
              </span>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdminTimePicker(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (adminStartTime && adminEndTime) {
                    setNewSession({ ...newSession, time: `${adminStartTime} - ${adminEndTime}` });
                    setShowAdminTimePicker(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar Horário</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
