import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Clock, MapPin, Camera, User, Phone, Mail,
  CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Sparkles, Send,
  ShieldCheck, ArrowRight, Sun, Sunset, Moon, Sunrise
} from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { CONTACT_INFO } from '../config/contact';

const SESSIONS_STORAGE_KEY = 'admin_sessions';

// Horários fixos padrão de atendimento da Agência
const DEFAULT_TIME_SLOTS = [
  { id: 'slot_morning', time: '09:00 - 12:00', label: 'Manhã (Luz Suave / Estúdio)', icon: Sunrise },
  { id: 'slot_afternoon', time: '13:30 - 16:00', label: 'Início da Tarde (Corporativo / Gastronomia)', icon: Sun },
  { id: 'slot_golden', time: '16:30 - 18:30', label: 'Golden Hour (Pôr do Sol no RJ)', icon: Sunset, highlight: true },
  { id: 'slot_night', time: '19:30 - 22:30', label: 'Noite (Eventos / Lounge)', icon: Moon },
];

// Sessões iniciais para demonstração se o localStorage ainda estiver vazio
const INITIAL_BOOKINGS = [
  {
    id: 'sess_01',
    date: '08/03/2026',
    time: '09:00 - 12:00',
    client: 'Dr. Roberto Silveira',
    type: 'Retratos Corporativos Executive',
    status: 'Confirmado',
    location: 'Studio Barra da Tijuca (Av. das Américas, 3500)',
  },
  {
    id: 'sess_02',
    date: '10/03/2026',
    time: '16:30 - 18:30',
    client: 'Mariana & Lucas Alencar',
    type: 'Ensaio Pré-Wedding Sunset',
    status: 'Confirmado',
    location: 'Praia do Arpoador & Copacabana, RJ',
  },
  {
    id: 'sess_03',
    date: '14/03/2026',
    time: '09:00 - 12:00',
    client: 'Le Vin Bistrô Gourmet',
    type: 'Fotografia Gastronômica & Drinks Menu Outono',
    status: 'Confirmado',
    location: "Rua Garcia d'Ávila, Ipanema, RJ",
  },
  {
    id: 'sess_04',
    date: '15/03/2026',
    time: '16:30 - 18:30',
    client: 'Cobertura Especial Maracanã',
    type: 'Cobertura em Grande Escala / VIP Lounge',
    status: 'Confirmado',
    location: 'Estádio Jornalista Mário Filho (Maracanã), RJ',
  },
  {
    id: 'sess_05',
    date: '20/03/2026',
    time: '16:30 - 18:30',
    client: 'Camila Mendonça Ferreira',
    type: 'Branding & Retratos Arquiteta',
    status: 'Confirmado',
    location: 'Parque Lage & Jardim Botânico, RJ',
  },
];

// Normalizador de datas (aceita DD/MM/AAAA ou AAAA-MM-DD)
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

const toDisplayDate = (isoStr) => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
};

export default function ScheduleSection() {
  // Inicializa visualização no mês de Março de 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(2); // 0 = Jan, 2 = Março
  const [selectedDate, setSelectedDate] = useState('2026-03-12');
  const [selectedSlot, setSelectedSlot] = useState('16:30 - 18:30');
  const [sessions, setSessions] = useState([]);

  // Estado do formulário de reserva
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'Casamento & Pré-Wedding',
    location: 'Praia do Arpoador / Zona Sul, RJ',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Carrega e sincroniza sessões do localStorage
  const loadSessions = () => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        setSessions(JSON.parse(stored));
      } else {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
        setSessions(INITIAL_BOOKINGS);
      }
    } catch {
      setSessions(INITIAL_BOOKINGS);
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

  // Formatação de telefone
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 6) val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    else if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    else if (val.length > 0) val = `(${val}`;
    setFormData({ ...formData, phone: val });
  };

  // Funções de navegação de mês
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Cálculo de dias do mês
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Verifica disponibilidade de uma data específica
  const getDateStatus = (dayNum) => {
    const isoStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dateBookings = sessions.filter((s) => {
      const sDate = toIsoDate(s.date);
      return sDate === isoStr && s.status !== 'Cancelado';
    });

    if (dateBookings.length === 0) {
      return { status: 'available', label: 'Disponível', count: 0 };
    }
    if (dateBookings.length >= DEFAULT_TIME_SLOTS.length) {
      return { status: 'full', label: 'Indisponível (Esgotado)', count: dateBookings.length };
    }
    return { status: 'partial', label: 'Poucas Vagas', count: dateBookings.length };
  };

  // Verifica disponibilidade de um horário no dia selecionado
  const isSlotBooked = (slotTime) => {
    return sessions.some((s) => {
      const sDate = toIsoDate(s.date);
      return (
        sDate === selectedDate &&
        s.status !== 'Cancelado' &&
        (s.time.includes(slotTime.split(' ')[0]) || slotTime.includes(s.time.split(' ')[0]))
      );
    });
  };

  // Envio da solicitação de agendamento conectada com Admin
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage('Por favor, informe seu nome completo e WhatsApp para prosseguir.');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setErrorMessage('Por favor, selecione uma data e horário disponíveis no calendário.');
      return;
    }

    if (isSlotBooked(selectedSlot)) {
      setErrorMessage('Este horário acabou de ser reservado. Por favor, selecione outro horário ou data.');
      return;
    }

    setIsSubmitting(true);

    const displayDateStr = toDisplayDate(selectedDate);

    // Cria a sessão com os dados do cliente
    const newSessionObject = {
      id: 'sess_' + Date.now(),
      date: displayDateStr,
      time: selectedSlot,
      client: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      type: formData.service,
      location: formData.location,
      photographer: 'Equipe Oficial • Agências Araújo',
      equipment: 'Kit Mirrorless Full Frame + Lentes Prime',
      status: 'Pendente Sinal',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      notes: formData.notes ? `[Agendamento via Site]: ${formData.notes}` : 'Agendamento solicitado através da Agenda Online do Site Oficial',
      source: 'Site Oficial (Agenda)',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      try {
        // 1. Grava no localStorage de sessões (conectado ao ScheduleModule do Admin)
        const currentSessions = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
        const updatedSessions = [newSessionObject, ...currentSessions];
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
        setSessions(updatedSessions);

        // 2. Registra também na caixa de entrada de formulários (FormsInboxModule)
        const currentForms = JSON.parse(localStorage.getItem('site_form_submissions') || '[]');
        currentForms.unshift({
          id: 'sub_' + Date.now(),
          name: formData.name,
          email: formData.email || '',
          phone: formData.phone,
          service: `[Agenda] ${formData.service}`,
          eventDate: `${displayDateStr} (${selectedSlot})`,
          message: `Solicitação de agendamento de ensaio para ${displayDateStr} às ${selectedSlot} em ${formData.location}. ${formData.notes}`,
          createdAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
          read: false,
          source: 'Agenda Online',
        });
        localStorage.setItem('site_form_submissions', JSON.stringify(currentForms));

        // 3. Registra no pipeline de Leads (LeadsModule)
        const currentLeads = JSON.parse(localStorage.getItem('admin_leads') || '[]');
        currentLeads.unshift({
          id: 'lead_' + Date.now(),
          name: formData.name,
          service: formData.service,
          phone: formData.phone,
          email: formData.email || '',
          source: 'Agenda Online do Site',
          estimatedValue: 'A definir',
          stage: 'novo',
          date: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
          notes: `Data Solicitada: ${displayDateStr} às ${selectedSlot} | Locação: ${formData.location}`,
        });
        localStorage.setItem('admin_leads', JSON.stringify(currentLeads));
      } catch (err) {
        console.error('Erro ao persistir agendamento:', err);
      }

      setIsSubmitting(false);
      setSubmittedBooking({
        ...newSessionObject,
        formattedDate: displayDateStr,
      });

      // Dispara WhatsApp com os dados pré-formatados
      const whatsappMsg =
        `*SOLICITAÇÃO DE AGENDAMENTO DE ENSAIO - AGÊNCIAS ARAÚJO*\n\n` +
        `👤 *Cliente:* ${formData.name}\n` +
        `📱 *WhatsApp:* ${formData.phone}\n` +
        `📅 *Data Escolhida:* ${displayDateStr}\n` +
        `⏰ *Horário:* ${selectedSlot}\n` +
        `📸 *Serviço:* ${formData.service}\n` +
        `📍 *Locação no RJ:* ${formData.location}\n` +
        (formData.notes ? `💬 *Observações:* ${formData.notes}\n` : '') +
        `\n_Enviado pelo sistema de Agenda Online em agenciasaraujo.com.br_`;

      const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(whatsappMsg)}`;
      window.open(whatsappUrl, '_blank');
    }, 600);
  };

  const resetForm = () => {
    setSubmittedBooking(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      service: 'Casamento & Pré-Wedding',
      location: 'Praia do Arpoador / Zona Sul, RJ',
      notes: '',
    });
  };

  return (
    <section id="agenda" className="py-24 relative overflow-hidden bg-stone-50 dark:bg-[#06080C] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gold/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* Cabeçalho da Seção */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold-700 dark:text-gold-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
            <CalendarIcon className="w-3.5 h-3.5 text-gold" />
            <span>Disponibilidade & Agenda de Ensaios</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
            Consulte Nossas Datas & <span className="gold-text">Agende Seu Ensaio</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Acompanhe em tempo real os dias e horários livres no Rio de Janeiro. Escolha a data ideal e garanta sua produção com atendimento VIP.
          </p>

          {/* Legenda de Disponibilidade */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-6 p-3 rounded-2xl bg-white dark:bg-dark-900/80 border border-stone-200 dark:border-white/10 text-xs font-medium shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-slate-700 dark:text-slate-300">Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="text-slate-700 dark:text-slate-300">Poucas Vagas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              <span className="text-slate-700 dark:text-slate-300">Indisponível / Esgotado</span>
            </div>
          </div>
        </div>

        {/* Grade Principal: Calendário + Horários + Formulário */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
          {/* Coluna Esquerda (7 Colunas): Calendário Interativo & Horários */}
          <div className="lg:col-span-7 space-y-6">
            {/* Box do Calendário */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-900/90 border border-stone-200 dark:border-gold/30 shadow-2xl relative">
              {/* Header do Mês com navegação */}
              <div className="flex items-center justify-between pb-6 border-b border-stone-200 dark:border-white/10">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-gold font-bold block">
                    Ano {currentYear}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    type="button"
                    className="p-2 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-stone-200 dark:border-white/10 transition-colors"
                    title="Mês Anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    type="button"
                    className="p-2 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-slate-700 dark:text-white border border-stone-200 dark:border-white/10 transition-colors"
                    title="Próximo Mês"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Cabeçalho dos Dias da Semana */}
              <div className="grid grid-cols-7 gap-2 pt-4 pb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                {daysOfWeek.map((d, i) => (
                  <div key={i} className={i === 0 || i === 6 ? 'text-gold' : ''}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Grade de Dias */}
              <div className="grid grid-cols-7 gap-2">
                {/* Espaços vazios antes do dia 1 */}
                {[...Array(firstDayIndex)].map((_, i) => (
                  <div key={`empty-${i}`} className="h-14 sm:h-16 rounded-2xl bg-transparent opacity-0" />
                ))}

                {/* Dias do mês atual */}
                {[...Array(totalDaysInMonth)].map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayIso = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = selectedDate === dayIso;
                  const { status } = getDateStatus(dayNum);

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDate(dayIso)}
                      className={`h-14 sm:h-16 rounded-2xl p-1.5 flex flex-col justify-between items-center transition-all duration-200 relative group ${
                        isSelected
                          ? 'bg-gold-gradient text-dark-950 font-bold shadow-lg shadow-gold/30 ring-2 ring-gold scale-105 z-10'
                          : 'bg-stone-50 dark:bg-black/40 hover:bg-stone-100 dark:hover:bg-white/10 border border-stone-200/80 dark:border-white/5 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className={`text-sm sm:text-base font-semibold ${isSelected ? 'text-dark-950 font-black' : ''}`}>
                        {dayNum}
                      </span>

                      {/* Indicador de status visual */}
                      <div className="flex items-center justify-center gap-1 w-full">
                        {status === 'available' && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-dark-950' : 'bg-emerald-400'
                            }`}
                            title="Dia com horários disponíveis"
                          />
                        )}
                        {status === 'partial' && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-dark-950' : 'bg-amber-400 animate-pulse'
                            }`}
                            title="Poucas vagas restantes"
                          />
                        )}
                        {status === 'full' && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-dark-950' : 'bg-rose-500'
                            }`}
                            title="Dia totalmente reservado"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Horários para o Dia Escolhido */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-900/90 border border-stone-200 dark:border-gold/30 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-stone-200 dark:border-white/10">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-gold font-bold">
                    Passo 2 de 3
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Horários para {toDisplayDate(selectedDate)}
                  </h4>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Selecione o turno desejado
                </span>
              </div>

              {/* Cards de Turnos e Horários */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {DEFAULT_TIME_SLOTS.map((slot) => {
                  const Icon = slot.icon;
                  const isBooked = isSlotBooked(slot.time);
                  const isSelected = selectedSlot === slot.time && !isBooked;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between min-h-[105px] ${
                        isBooked
                          ? 'bg-stone-100 dark:bg-black/20 border-stone-300 dark:border-white/5 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-gold/15 border-gold dark:border-gold shadow-lg shadow-gold/10 ring-1 ring-gold text-slate-900 dark:text-white'
                          : 'bg-stone-50 dark:bg-black/40 hover:bg-stone-100 dark:hover:bg-white/5 border-stone-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-gold/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-gold' : 'text-slate-400'}`} />
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {slot.time}
                          </span>
                        </div>

                        {isBooked ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/15 text-rose-500 border border-rose-500/30">
                            Indisponível
                          </span>
                        ) : isSelected ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Selecionado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Disponível
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-slate-500 dark:text-slate-400 block line-clamp-1">
                        {slot.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Coluna Direita (5 Colunas): Formulário Conectado ao Admin */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-900/90 border border-stone-200 dark:border-gold/30 shadow-2xl relative">
              {submittedBooking ? (
                /* Card de Confirmação de Sucesso */
                <div className="py-8 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-gold font-bold block mb-1">
                      Agendamento Registrado!
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
                      Solicitação Enviada com Sucesso
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
                      Sua sessão foi cadastrada diretamente na <strong>Agenda de Ensaios</strong> da Agências Araújo.
                    </p>
                  </div>

                  {/* Resumo do Agendamento */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-black/50 border border-stone-200 dark:border-white/10 text-left text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cliente:</span>
                      <strong className="text-slate-900 dark:text-white">{submittedBooking.client}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Data & Turno:</span>
                      <strong className="text-gold">{submittedBooking.formattedDate} às {submittedBooking.time}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tipo de Sessão:</span>
                      <strong className="text-slate-900 dark:text-white">{submittedBooking.type}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Locação no RJ:</span>
                      <strong className="text-slate-900 dark:text-white truncate max-w-[200px]">{submittedBooking.location}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-white/5">
                      <span className="text-slate-400">Status no Painel Admin:</span>
                      <span className="text-amber-400 font-bold">Pendente Sinal (Reservado)</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="space-y-3 pt-2">
                    <a
                      href={`https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(
                        `*CONFIRMAÇÃO DE AGENDAMENTO*\nOlá! Acabei de solicitar o agendamento no site para ${submittedBooking.formattedDate} às ${submittedBooking.time} (${submittedBooking.type}). Nome: ${submittedBooking.client}. Aguardo confirmação dos detalhes!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:brightness-110 transition-all"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-dark-950 fill-dark-950" />
                      <span>Falar no WhatsApp para Confirmar</span>
                    </a>

                    <button
                      onClick={resetForm}
                      className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Realizar Outro Agendamento
                    </button>
                  </div>
                </div>
              ) : (
                /* Formulário de Coleta de Dados */
                <form onSubmit={handleScheduleSubmit} className="space-y-5">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-gold font-bold">
                      Passo 3 de 3
                    </span>
                    <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                      Confirmar Reserva
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Todos os dados serão sincronizados instantaneamente com o painel do fotógrafo.
                    </p>
                  </div>

                  {/* Resumo da Data/Hora selecionada no passo 1 e 2 */}
                  <div className="p-3.5 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <CalendarIcon className="w-4 h-4 text-gold shrink-0" />
                      <span className="font-semibold">{toDisplayDate(selectedDate)}</span>
                      <span className="text-slate-400">•</span>
                      <Clock className="w-4 h-4 text-gold shrink-0" />
                      <span className="font-mono font-bold text-gold">{selectedSlot}</span>
                    </div>

                    <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">
                      Vaga Livre
                    </span>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Nome Completo */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Seu Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Dra. Larissa Alencar"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-black/50 border border-stone-300 dark:border-slate-700 focus:border-gold focus:outline-none text-slate-900 dark:text-white text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      WhatsApp com DDD *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="(21) 99999-9999"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-black/50 border border-stone-300 dark:border-slate-700 focus:border-gold focus:outline-none text-slate-900 dark:text-white text-xs sm:text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* E-mail */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      E-mail (Opcional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="larissa@exemplo.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-black/50 border border-stone-300 dark:border-slate-700 focus:border-gold focus:outline-none text-slate-900 dark:text-white text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Tipo de Ensaio */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Tipo de Ensaio / Produção *
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-black/50 border border-stone-300 dark:border-slate-700 focus:border-gold focus:outline-none text-slate-900 dark:text-white text-xs sm:text-sm"
                    >
                      <option value="Casamento & Pré-Wedding">Casamento & Pré-Wedding</option>
                      <option value="Retratos Corporativos Executive">Retratos Corporativos Executive</option>
                      <option value="Ensaio Feminino / Moda">Ensaio Feminino / Moda</option>
                      <option value="Gestante & Família">Gestante & Família</option>
                      <option value="15 Anos & Debutante">15 Anos & Debutante</option>
                      <option value="Newborn & Bebês">Newborn & Bebês</option>
                      <option value="Fotografia Gastronômica & Marcas">Fotografia Gastronômica & Marcas</option>
                      <option value="Cobertura em Grande Escala / Eventos">Cobertura em Grande Escala / Eventos</option>
                    </select>
                  </div>

                  {/* Locação no RJ */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Locação Desejada no Rio de Janeiro *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ex: Praia do Arpoador, Estúdio Barra, Parque Lage..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-black/50 border border-stone-300 dark:border-slate-700 focus:border-gold focus:outline-none text-slate-900 dark:text-white text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Observações ou Preferências
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Ex: Gostaria de fotos com vestido longo na praia e iluminação natural..."
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-black/50 border border-stone-300 dark:border-slate-700 focus:border-gold focus:outline-none text-slate-900 dark:text-white text-xs sm:text-sm resize-none"
                    />
                  </div>

                  {/* Botão de Envio */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-xl shadow-gold/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                        Registrando na Agenda...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Solicitar Reserva na Agenda</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sincronização direta com a produção da Agências Araújo</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
