import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Camera, User, 
  Plus, CheckCircle, AlertCircle, MessageCircle, X, ChevronLeft, ChevronRight,
  Globe, Trash2, Check, RefreshCw, Sunrise, Sunset
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';

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

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
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
  };

  useEffect(() => {
    loadSessions();
    const handleStorage = (e) => {
      if (e.key === SESSIONS_STORAGE_KEY) {
        loadSessions();
      }
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(loadSessions, 10000);
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
  });

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!newSession.client.trim()) return;

    const sessionObj = {
      id: `sess_${Date.now()}`,
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

    setShowAddModal(false);
    showToast(`Sessão de "${newSession.client}" adicionada e sincronizada na agenda pública!`);
    logActivity?.('AGENDA_NOVA_SESSAO', 'agenda', `Agendou sessão para ${sessionObj.client} em ${sessionObj.date}`);

    setNewSession({
      date: '',
      time: '16:30 - 18:30',
      client: '',
      phone: '',
      type: 'Retratos Pessoais',
      location: 'Studio Barra da Tijuca, RJ',
      equipment: 'Kit Padrão Mirrorless Full Frame + Lentes Prime',
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
            <p className="text-xs text-slate-400 mb-6">Cadastre o ensaio fotográfico e bloqueie o horário no site público</p>

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
