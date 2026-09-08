import React from 'react';
import { 
  Eye, Users, MessageCircle, Instagram, Calendar, 
  ArrowUpRight, Plus, Clock, FileText, CheckCircle2, 
  Camera, Sparkles, ChevronRight, Phone
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function DashboardModule({ onNavigate }) {
  const { user } = useAuth();

  // Metrics requested specifically by the user:
  // 1.248 visitas, 43 leads, 27 cliques WhatsApp, 18 cliques Instagram
  const overviewStats = [
    {
      title: 'Visitas no Site',
      value: '1.248',
      change: '+24% este mês',
      icon: Eye,
      color: 'from-amber-500/20 to-gold/10 border-gold/30 text-gold',
      linkText: 'Ver Tráfego',
      target: 'site'
    },
    {
      title: 'Leads Captados',
      value: '43',
      change: '+8 novos esta semana',
      icon: Users,
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
      linkText: 'Abrir CRM',
      target: 'leads'
    },
    {
      title: 'Cliques WhatsApp',
      value: '27',
      change: 'Conversão direta 62%',
      icon: MessageCircle,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      linkText: 'Ver Conversas',
      target: 'WhatsApp'
    },
    {
      title: 'Cliques Instagram',
      value: '18',
      change: '@agenciasaraujo',
      icon: Instagram,
      color: 'from-pink-500/20 to-purple-500/10 border-pink-500/30 text-pink-400',
      linkText: 'Ver Portfólio',
      target: 'portfólio'
    },
  ];

  // Upcoming Sessions requested: Casamento Marina (Sábado), Ensaio Gestante (Domingo)
  const upcomingSessions = [
    {
      client: 'Marina & Gustavo',
      type: 'Casamento Clássico (Cerimônia & Festa)',
      date: 'Sábado • 16:30',
      location: 'Copacabana Palace / Mansão Santa Teresa, RJ',
      status: 'Confirmado',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      phone: '(21) 98132-4411'
    },
    {
      client: 'Juliana & Rodrigo',
      type: 'Ensaio Gestante Golden Hour',
      date: 'Domingo • 16:00',
      location: 'Praia do Arpoador / Vista Chinesa, RJ',
      status: 'Confirmado',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      phone: '(21) 99123-4567'
    },
    {
      client: 'Dr. Roberto Silveira',
      type: 'Retratos Corporativos Executive',
      date: 'Segunda-feira • 10:00',
      location: 'Studio Barra da Tijuca, RJ',
      status: 'Confirmado',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      phone: '(21) 99888-7766'
    }
  ];

  // Recent Leads requested: João Silva (Casamento), Maria Souza (15 anos)
  const recentLeads = [
    {
      name: 'João Silva',
      service: 'Fotografia de Casamento Completo 2026',
      phone: '(21) 98765-4321',
      time: 'Há 15 minutos',
      source: 'WhatsApp Direto',
      status: 'Novo Lead',
      statusColor: 'bg-gold/20 text-gold-300 border-gold/30'
    },
    {
      name: 'Maria Souza',
      service: 'Festa de 15 Anos (Debutante Luxo)',
      phone: '(21) 97654-3210',
      time: 'Há 1 hora',
      source: 'Formulário do Site',
      status: 'Em Atendimento',
      statusColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      name: 'Camila Ferreira',
      service: 'Ensaio Branding & Posicionamento',
      phone: '(21) 99123-4567',
      time: 'Há 3 horas',
      source: 'Instagram',
      status: 'Proposta Enviada',
      statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#10141E] to-slate-900 border border-gold/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-3">
              <Camera className="w-3.5 h-3.5 text-gold" />
              <span>Agência Araújo • Fotografia & Audiovisual RJ (Tenant #001)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Olá, Agência Araújo
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Aqui está a visão consolidada do seu negócio: tráfego do site, novos contatos de ensaios e atendimentos em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate?.('leads')}
              className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Lead</span>
            </button>
            <button
              onClick={() => onNavigate?.('agenda')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4 text-gold" />
              <span>Ver Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW STATS (MATCHING USER SPECIFICATION) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Visão Geral de Desempenho
          </h2>
          <span className="text-[11px] font-mono text-gold-300">Tempo Real</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {overviewStats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate?.(item.target)}
                className={`cursor-pointer rounded-2xl bg-gradient-to-b ${item.color} bg-slate-900/80 backdrop-blur-xl border p-5 relative overflow-hidden transition-all hover:translate-y-[-2px] hover:border-gold/60`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    {item.title}
                  </span>
                  <div className="p-2 rounded-xl bg-black/40">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-serif font-bold text-white tracking-wide">
                    {item.value}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-gold">
                    <span>{item.linkText}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-400 font-medium">
                  {item.change}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMNS: PRÓXIMOS ENSAIOS & ÚLTIMOS LEADS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Próximos Ensaios (Casamento Marina, Ensaio Gestante, etc.) */}
        <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" />
                <span>Próximos Ensaios</span>
              </h3>
              <p className="text-xs text-slate-400">Ensaios fotográficos confirmados na agenda</p>
            </div>
            <button
              onClick={() => onNavigate?.('agenda')}
              className="text-xs text-gold hover:text-gold-light font-semibold hover:underline flex items-center gap-1"
            >
              <span>Ver Agenda Completa</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingSessions.map((session, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-gold/30 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm truncate">{session.client}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${session.statusColor}`}>
                      {session.status}
                    </span>
                  </div>
                  <p className="text-xs text-gold-300 font-medium truncate">{session.type}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{session.location}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-slate-300 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                    {session.date}
                  </span>
                  <a
                    href={`https://wa.me/55${session.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(session.client)}!%20Confirmando%20nosso%20ensaio%20fotográfico.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Chamar no WhatsApp"
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos Leads (João Silva, Maria Souza, etc.) */}
        <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                <span>Últimos Leads</span>
              </h3>
              <p className="text-xs text-slate-400">Solicitações recentes recebidas via site e WhatsApp</p>
            </div>
            <button
              onClick={() => onNavigate?.('leads')}
              className="text-xs text-gold hover:text-gold-light font-semibold hover:underline flex items-center gap-1"
            >
              <span>Ver Funil CRM</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentLeads.map((lead, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-gold/30 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{lead.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${lead.statusColor}`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-xs text-gold-300 font-medium truncate">{lead.service}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{lead.phone} • {lead.source}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lead.time}
                  </span>
                  <a
                    href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(lead.name)},%20recebemos%20sua%20solicitação%20na%20Agência%20Araújo!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                    title="Atender via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Direct Quick Action Links */}
      <div className="p-4 rounded-2xl bg-black/30 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="w-4 h-4 text-gold" />
          <span>Precisa personalizar seu site, fotos ou cores da agência?</span>
        </div>
        <button
          onClick={() => onNavigate?.('personalizar')}
          className="px-4 py-2 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/40 text-gold-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
        >
          Ir para Personalização da Agência
        </button>
      </div>

    </div>
  );
}
