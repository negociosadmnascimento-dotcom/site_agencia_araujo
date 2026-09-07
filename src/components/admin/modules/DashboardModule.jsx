import React, { useState } from 'react';
import { 
  TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, 
  MessageCircle, Plus, Eye, Clock, CheckCircle, ShieldCheck, 
  AlertTriangle, ExternalLink, Sparkles, Database, FileText
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { isSupabaseConfigured, SUPABASE_PROJECT_ID } from '../../../lib/supabase';

export default function DashboardModule({ onNavigate }) {
  const { user, isSuperAdmin } = useAuth();
  const [showFinancials, setShowFinancials] = useState(true);

  // Mock initial dashboard data (ready to sync with Supabase tables)
  const stats = [
    {
      title: 'Faturamento do Mês',
      value: isSuperAdmin ? (showFinancials ? 'R$ 48.500,00' : '••••••••') : 'R$ ••••••••',
      badge: '+18.2% vs mês anterior',
      icon: DollarSign,
      color: 'from-amber-500/20 to-gold/10 border-gold/40 text-gold',
      superOnly: true,
    },
    {
      title: 'Leads Ativos',
      value: '24',
      badge: '6 novos hoje',
      icon: Users,
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
    },
    {
      title: 'Ensaios Agendados',
      value: '18',
      badge: '4 esta semana no RJ',
      icon: Calendar,
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
    },
    {
      title: 'Propostas em Negociação',
      value: '9',
      badge: 'R$ 14.800 em aberto',
      icon: FileText,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
  ];

  const upcomingSessions = [
    {
      client: 'Dr. Roberto Silveira',
      type: 'Retratos Corporativos Executive',
      location: 'Studio Barra da Tijuca, RJ',
      date: 'Amanhã, 10:00',
      status: 'Confirmado',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      whatsapp: '5521998887766'
    },
    {
      client: 'Mariana & Lucas',
      type: 'Ensaio Pré-Wedding',
      location: 'Praia de Copacabana / Arpoador',
      date: 'Sexta, 16:30',
      status: 'Pendente Sinal',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      whatsapp: '5521987654321'
    },
    {
      client: 'Le Vin Bistrô Gourmet',
      type: 'Campanha Gastronômica & Drinks',
      location: 'Ipanema, RJ',
      date: 'Sábado, 09:00',
      status: 'Confirmado',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      whatsapp: '5521976543210'
    },
    {
      client: 'Cobertura Especial Maracanã',
      type: 'Grande Escala / VIP Lounge',
      location: 'Estádio Jornalista Mário Filho (Maracanã)',
      date: 'Domingo, 14:00',
      status: 'Confirmado',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      whatsapp: '5521981324411'
    },
  ];

  const recentLeads = [
    {
      name: 'Camila Ferreira',
      service: 'Retratos Pessoais & Branding',
      phone: '(21) 99123-4567',
      time: 'Há 12 minutos',
      source: 'Formulário do Site'
    },
    {
      name: 'Grupo Safra Rio',
      service: 'Cobertura Evento Corporativo',
      phone: '(21) 98877-6655',
      time: 'Há 1 hora',
      source: 'WhatsApp Direto'
    },
    {
      name: 'Chef Alessandro Rossi',
      service: 'Fotografia Gastronômica Menu 2026',
      phone: '(21) 97766-5544',
      time: 'Há 3 horas',
      source: 'Instagram'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#0E1524] to-slate-900 border border-gold/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSuperAdmin ? 'Ambiente Super Admin • Acesso Total' : 'Ambiente Admin Operacional'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Bem-vindo, {user?.name || 'Administrador'}!
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Painel de controle unificado de Agências Araújo Fotografia & Audiovisual RJ. Acompanhe atendimentos, ensaios e métricas em tempo real.
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

      {/* Supabase Connection Pill Box */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Banco de Dados Supabase:</span>
              <code className="text-xs text-gold-300 font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5">{SUPABASE_PROJECT_ID}</code>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {isSupabaseConfigured ? 'Pronto & Ativo' : 'Aguardando Chave Anon'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSupabaseConfigured 
                ? 'Conectado à nuvem. Dados sincronizados em tempo real.'
                : 'A estrutura SQL completa já está gerada em supabase/schema.sql. Basta inserir a chave anon no arquivo .env para sincronização live.'}
            </p>
          </div>
        </div>
        <a
          href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light hover:underline font-mono"
        >
          <span>Abrir Console Supabase</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl bg-gradient-to-b ${item.color} bg-slate-900/80 backdrop-blur-xl border p-5 relative overflow-hidden transition-all hover:translate-y-[-2px]`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {item.title}
                </span>
                <div className="p-2 rounded-xl bg-black/30">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-serif font-bold text-white">
                  {item.value}
                </span>
                {item.superOnly && isSuperAdmin && (
                  <button
                    onClick={() => setShowFinancials(!showFinancials)}
                    title="Alternar visibilidade do faturamento"
                    className="text-slate-400 hover:text-gold p-1"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{item.badge}</span>
                {item.superOnly && !isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                    <ShieldCheck className="w-3 h-3" /> Super Admin
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Grid: Upcoming Sessions & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Sessions Card */}
        <div className="rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" />
                <span>Próximas Sessões Agendadas</span>
              </h2>
              <p className="text-xs text-slate-400">Ensaios fotográficos e gravações em locações no Rio de Janeiro</p>
            </div>
            <button
              onClick={() => onNavigate?.('agenda')}
              className="text-xs text-gold hover:text-gold-light font-semibold hover:underline"
            >
              Ver Todas
            </button>
          </div>

          <div className="space-y-3">
            {upcomingSessions.map((session, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-gold/30 transition-all flex items-center justify-between gap-4"
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
                    href={`https://wa.me/${session.whatsapp}?text=Olá!%20Confirmando%20nosso%20ensaio%20da%20Agências%20Araújo.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Chamar cliente no WhatsApp"
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads / Messages Card */}
        <div className="rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                <span>Leads & Solicitações Recentes</span>
              </h2>
              <p className="text-xs text-slate-400">Pessoas e empresas que entraram em contato hoje</p>
            </div>
            <button
              onClick={() => onNavigate?.('leads')}
              className="text-xs text-gold hover:text-gold-light font-semibold hover:underline"
            >
              Ver Funil
            </button>
          </div>

          <div className="space-y-3">
            {recentLeads.map((lead, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-gold/30 transition-all flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{lead.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                      {lead.source}
                    </span>
                  </div>
                  <p className="text-xs text-gold-300 font-medium truncate">{lead.service}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{lead.phone}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lead.time}
                  </span>
                  <a
                    href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(lead.name)},%20recebemos%20sua%20solicitação%20na%20Agências%20Araújo!`}
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

          {/* Quick Actions Row */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate?.('formularios')}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-gold" />
              <span>Ver Formulários Site</span>
            </button>
            <button
              onClick={() => onNavigate?.('whatsapp')}
              className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Central WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
