import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Camera, User, 
  Plus, CheckCircle, AlertCircle, MessageCircle, X, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function ScheduleModule() {
  const { isSuperAdmin } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [sessions, setSessions] = useState([
    {
      id: 'sess_01',
      date: '08/03/2026',
      time: '10:00 - 13:00',
      client: 'Dr. Roberto Silveira',
      phone: '(21) 99888-7766',
      type: 'Retratos Corporativos Executive',
      location: 'Studio Barra da Tijuca (Av. das Américas, 3500)',
      photographer: 'Fotógrafo Principal • Agências Araújo',
      equipment: 'Canon R5 C + 50mm 1.2L + Kit Luz Octabox 120cm',
      status: 'Confirmado',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'sess_02',
      date: '10/03/2026',
      time: '16:00 - 18:30',
      client: 'Mariana & Lucas Alencar',
      phone: '(21) 98765-4321',
      type: 'Ensaio Pré-Wedding Sunset',
      location: 'Praia do Arpoador & Copacabana, RJ',
      photographer: 'Direção Geral & Drone Pilot',
      equipment: 'Sony FX3 + Drone DJI Mavic 3 Cine + 24-70mm GM II',
      status: 'Pendente Sinal',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'sess_03',
      date: '14/03/2026',
      time: '09:00 - 14:00',
      client: 'Le Vin Bistrô Gourmet',
      phone: '(21) 97654-3210',
      type: 'Fotografia Gastronômica & Drinks Menu Outono',
      location: 'Rua Garcia d\'Ávila, Ipanema, RJ',
      photographer: 'Especialista em Food Styling & Luz Natural',
      equipment: 'Lente Macro 100mm L + Flash Godox AD400 Pro + Refletores',
      status: 'Confirmado',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'sess_04',
      date: '15/03/2026',
      time: '13:30 - 19:00',
      client: 'Cobertura Especial Maracanã',
      phone: '(21) 98132-4411',
      type: 'Cobertura em Grande Escala / VIP Lounge',
      location: 'Estádio Jornalista Mário Filho (Maracanã), RJ',
      photographer: 'Equipe Araújo Completa (2 Câmeras + 1 Vídeo)',
      equipment: '70-200mm 2.8L IS III + 2x Corpos Mirrorless + Gimbal DJI RS3',
      status: 'Confirmado',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'sess_05',
      date: '02/03/2026',
      time: '15:00 - 17:30',
      client: 'Camila Mendonça Ferreira',
      phone: '(21) 99123-4567',
      type: 'Branding & Retratos Arquiteta',
      location: 'Parque Lage & Jardim Botânico, RJ',
      photographer: 'Fotógrafo Principal',
      equipment: '85mm 1.4 + Luz Contínua LED Nanlite',
      status: 'Em Edição',
      statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
  ]);

  const [newSession, setNewSession] = useState({
    date: '',
    time: '10:00 - 12:00',
    client: '',
    phone: '',
    type: 'Retratos Pessoais',
    location: 'Rio de Janeiro, RJ',
    equipment: 'Kit Padrão Mirrorless Full Frame + Lentes Prime',
  });

  const handleAddSession = (e) => {
    e.preventDefault();
    if (!newSession.client) return;
    setSessions([
      ...sessions,
      {
        id: `sess_${Date.now()}`,
        date: newSession.date || 'Em breve',
        time: newSession.time,
        client: newSession.client,
        phone: newSession.phone || '(21) 98132-4411',
        type: newSession.type,
        location: newSession.location,
        photographer: 'Equipe Agências Araújo',
        equipment: newSession.equipment,
        status: 'Confirmado',
        statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      }
    ]);
    setShowAddModal(false);
    showToast(`Sessão de "${newSession.client}" adicionada à agenda!`);
  };

  const filtered = sessions.filter(s => filterStatus === 'Todos' || s.status === filterStatus);

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl bg-emerald-600 text-white flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {toast}
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
            Controle de locações, horários, equipe técnica e equipamentos alocados no Rio de Janeiro
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Nova Sessão</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['Todos', 'Confirmado', 'Pendente Sinal', 'Em Edição'].map((st) => (
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
            className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 space-y-4 hover:border-gold/30 transition-all shadow-xl"
          >
            {/* Top info */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sess.statusColor}`}>
                  {sess.status}
                </span>
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
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">{sess.phone}</span>
              
              <a
                href={`https://wa.me/55${sess.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(sess.client)},%20confirmando%20nosso%20ensaio%20no%20dia%20${sess.date}%20às%20${sess.time}%20em%20${encodeURIComponent(sess.location)}!`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Enviar Lembrete</span>
              </a>
            </div>
          </div>
        ))}
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
            <p className="text-xs text-slate-400 mb-6">Cadastre o ensaio fotográfico ou gravação audiovisual</p>

            <form onSubmit={handleAddSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente / Empresa</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data</label>
                  <input
                    type="text"
                    required
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horário</label>
                  <input
                    type="text"
                    value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                    placeholder="14:00 - 17:00"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Serviço</label>
                  <select
                    value={newSession.type}
                    onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  >
                    <option>Retratos Pessoais</option>
                    <option>Retratos Corporativos Executive</option>
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
    </div>
  );
}
