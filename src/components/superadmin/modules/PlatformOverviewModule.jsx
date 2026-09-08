import React from 'react';
import { 
  Building, Users, ShieldCheck, Database, TrendingUp, 
  ExternalLink, Sparkles, Activity, CheckCircle2, Clock 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { SUPABASE_PROJECT_ID, isSupabaseConfigured } from '../../../lib/supabase';

export default function PlatformOverviewModule({ onNavigate }) {
  const { auditLogs } = useAuth();

  const metrics = [
    {
      title: 'Agências Clientes (Admins)',
      value: '3 Agências',
      badge: '2 ativas • 1 em pausa',
      icon: Building,
      color: 'from-amber-500/20 to-gold/10 border-gold/40 text-gold',
    },
    {
      title: 'Total de Operadores Ativos',
      value: '5 Usuários',
      badge: '100% monitorados por IP',
      icon: Users,
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
    },
    {
      title: 'Auditoria de Ações Gravadas',
      value: `${auditLogs.length} Ações`,
      badge: 'Trilha forense imutável',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Infraestrutura Supabase',
      value: 'Online',
      badge: 'Projeto ' + SUPABASE_PROJECT_ID,
      icon: Database,
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 border border-gold/40 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-300 text-xs font-mono mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Direção Geral • Painel de Controle SaaS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Governança Central da Plataforma
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Gerenciamento exclusivo de clientes (Admins), infraestrutura de dados Supabase e auditoria cirúrgica.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate?.('gestao_admins')}
              className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
            >
              <Building className="w-4 h-4" />
              <span>Gerenciar Agências (Admins)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Technical Banner */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Banco de Dados Supabase (Exclusivo Super Admin):</span>
              <code className="text-xs text-gold-300 font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5">{SUPABASE_PROJECT_ID}</code>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300">
                Isolamento RLS Ativo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Políticas de isolamento cirúrgico ativas. Clientes não acessam dados de outros clientes e Admins não acessam a infraestrutura.
            </p>
          </div>
        </div>
        <a
          href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light hover:underline font-mono"
        >
          <span>Acessar Console Supabase</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl bg-gradient-to-b ${m.color} bg-slate-900/80 backdrop-blur-xl border p-5 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {m.title}
                </span>
                <div className="p-2 rounded-xl bg-black/30">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-serif font-bold text-white">
                {m.value}
              </div>

              <div className="mt-3 text-xs text-slate-400 font-medium">
                {m.badge}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Admin Activity Audit Feed */}
      <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-gold" />
              <span>Atividades Recentes dos Administradores</span>
            </h2>
            <p className="text-xs text-slate-400">Trilha de auditoria das ações realizadas pelos operadores das agências</p>
          </div>

          <button
            onClick={() => onNavigate?.('auditoria')}
            className="text-xs text-gold hover:text-gold-light font-semibold hover:underline"
          >
            Ver Auditoria Forense Completa →
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-black/30 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{log.admin_name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold/10 text-gold-300 border border-gold/30">
                    {log.action_type}
                  </span>
                </div>
                <p className="text-slate-300">{log.description}</p>
              </div>

              <div className="text-left sm:text-right font-mono text-slate-500 text-[11px] shrink-0">
                <span className="block">{log.timestamp}</span>
                <span className="block text-[10px] text-slate-600">{log.ip_address}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
