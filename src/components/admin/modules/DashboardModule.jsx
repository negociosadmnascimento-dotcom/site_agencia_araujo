import React, { useState, useEffect } from 'react';
import { 
  Eye, Users, Instagram, Calendar, 
  ArrowUpRight, Plus, Clock, FileText, CheckCircle2, 
  Camera, Sparkles, ChevronRight, Phone
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';

export default function DashboardModule({ onNavigate }) {
  const { user } = useAuth();
  const [leadCount, setLeadCount] = useState(43);
  const [unreadForms, setUnreadForms] = useState(0);

  useEffect(() => {
    const update = () => {
      try {
        const leads = JSON.parse(localStorage.getItem('admin_leads') || '[]');
        const siteLeads = JSON.parse(localStorage.getItem('site_form_submissions') || '[]');
        const readIds = JSON.parse(localStorage.getItem('admin_forms_read_ids') || '[]');
        setLeadCount(43 + leads.length + siteLeads.length);
        setUnreadForms(siteLeads.filter(s => !readIds.includes(s.id)).length);
      } catch (_) {}
    };
    update();
    const interval = setInterval(update, 15000);
    return () => clearInterval(interval);
  }, []);


  // Metrics requested specifically by the user:
  // 1.248 visitas, 43 leads, 27 cliques WhatsApp, 18 cliques Instagram
  const overviewStats = [
    {
      title: 'Visitas no Site',
      value: '1.248',
      change: '+24% este mês',
      icon: Eye,
      target: 'site',
      linkText: 'Ver Tráfego',
    },
    {
      title: 'Leads Captados',
      value: String(leadCount),
      change: '+8 novos esta semana',
      icon: Users,
      target: 'leads',
      linkText: 'Abrir CRM',
    },
    {
      title: 'Cliques WhatsApp',
      value: '27',
      change: 'Conversão direta 62%',
      icon: WhatsAppIcon,
      target: 'WhatsApp',
      linkText: 'Ver Conversas',
    },
    {
      title: 'Cliques Instagram',
      value: '18',
      change: '@agenciasaraujo',
      icon: Instagram,
      target: 'portfólio',
      linkText: 'Ver Portfólio',
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
      <div className="rounded-3xl bg-[#0C101A] border border-white/[0.08] p-6 sm:p-7 relative rounded-2xl shadow-lg">
        
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-3">
              <Camera className="w-3.5 h-3.5 text-gold" />
              <span>Agência Araújo • Fotografia & Audiovisual RJ</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {overviewStats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate?.(item.target)}
                className="group cursor-pointer rounded-2xl bg-[#0B0F19] hover:bg-[#0E1422] border border-white/[0.08] hover:border-[#D4AF37]/40 p-5 relative transition-all duration-200 shadow-md hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">
                    {item.title}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-[#D4AF37] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-serif font-bold text-white tracking-tight">
                    {item.value}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-[#D4AF37] transition-colors">
                    <span>{item.linkText}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                  <span>{item.change}</span>
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
                    <WhatsAppIcon className="w-4 h-4 text-green-400" />
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
                    <WhatsAppIcon className="w-4 h-4 text-green-400" />
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
