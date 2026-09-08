import React from 'react';
import { TrendingUp, Award, BarChart3, Users, Clock, CheckCircle } from 'lucide-react';

export default function AdminPerformanceModule() {
  const performanceData = [
    {
      agency: 'Agências Araújo • Fotografia RJ',
      admin: 'Operador Admin Principal',
      leadsTotal: 24,
      convertedLeads: 14,
      conversionRate: '58.3%',
      proposalsSent: 9,
      avgResponseTime: '8 minutos',
      status: 'Excelente',
      scoreColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    },
    {
      agency: 'Estúdio Copacabana Fine Art',
      admin: 'Felipe Vasconcellos',
      leadsTotal: 12,
      convertedLeads: 5,
      conversionRate: '41.6%',
      proposalsSent: 6,
      avgResponseTime: '22 minutos',
      status: 'Bom',
      scoreColor: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    },
    {
      agency: 'Lumière Barra Fotografia',
      admin: 'Beatriz Castro',
      leadsTotal: 5,
      convertedLeads: 1,
      conversionRate: '20.0%',
      proposalsSent: 2,
      avgResponseTime: '2 horas',
      status: 'Atenção (Em Pausa)',
      scoreColor: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Métricas de Negócio • Eficiência Operacional</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-white">Performance & Desempenho dos Admins</h1>
        <p className="text-slate-400 text-xs">
          Acompanhe a taxa de conversão, velocidade de resposta e volume de cada agência cliente na plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {performanceData.map((item, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 shadow-xl space-y-4 hover:border-gold/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
              <div>
                <h3 className="font-bold text-white text-base">{item.agency}</h3>
                <span className="text-xs text-slate-400">Responsável: {item.admin}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${item.scoreColor}`}>
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-black/30">
                <span className="text-slate-400 block">Total de Leads</span>
                <span className="text-lg font-bold text-white block mt-1">{item.leadsTotal}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/30">
                <span className="text-slate-400 block">Taxa de Conversão</span>
                <span className="text-lg font-bold text-gold block mt-1">{item.conversionRate}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/30">
                <span className="text-slate-400 block">Propostas Enviadas</span>
                <span className="text-lg font-bold text-blue-400 block mt-1">{item.proposalsSent}</span>
              </div>

              <div className="p-3 rounded-xl bg-black/30">
                <span className="text-slate-400 block">Tempo Médio Resposta</span>
                <span className="text-lg font-bold text-emerald-400 block mt-1 font-mono">{item.avgResponseTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
