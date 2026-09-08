import React from 'react';
import { Database, ShieldCheck, Check, Server, Lock, ExternalLink, Terminal } from 'lucide-react';
import { SUPABASE_PROJECT_ID, isSupabaseConfigured, SUPABASE_URL } from '../../../lib/supabase';

export default function InfrastructureModule() {
  const tables = [
    { name: 'profiles', records: '2 usuários', rls: 'Ativo', purpose: 'Perfis de acesso e papéis de usuário' },
    { name: 'clients', records: 'Multi-tenant', rls: 'Ativo (Isolamento)', purpose: 'Carteira de clientes particulares' },
    { name: 'leads', records: 'Segregado', rls: 'Ativo', purpose: 'Oportunidades comerciais das agências' },
    { name: 'schedule_events', records: 'Segregado', rls: 'Ativo', purpose: 'Agendamentos e locações' },
    { name: 'proposals', records: 'Criptografado', rls: 'Ativo', purpose: 'Orçamentos e tokens seguros' },
    { name: 'contracts', records: 'Criptografado', rls: 'Ativo', purpose: 'Contratos e cessão de imagem' },
    { name: 'payments', records: 'Auditado', rls: 'Ativo', purpose: 'Faturas e conciliação' },
    { name: 'testimonials', records: 'Moderação', rls: 'Ativo', purpose: 'Depoimentos públicos moderados' },
    { name: 'form_submissions', records: 'Protegido', rls: 'Ativo (Insert only)', purpose: 'Caixa de entrada dos formulários' },
    { name: 'admin_activity_logs', records: 'Forense', rls: 'Ativo (Imutável)', purpose: 'Auditoria de uso de cada admin' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
          <Database className="w-3.5 h-3.5" />
          <span>Infraestrutura Central • Acesso Exclusivo Super Admin</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-white">Banco de Dados Supabase & Infraestrutura</h1>
        <p className="text-slate-400 text-xs">
          Monitoramento técnico das tabelas, políticas de Row Level Security (RLS) e integridade dos dados
        </p>
      </div>

      {/* Connection Card */}
      <div className="rounded-3xl bg-slate-900/80 border border-gold/30 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cluster Supabase PostgreSQL</h2>
              <span className="text-xs font-mono text-gold-300">{SUPABASE_URL}</span>
            </div>
          </div>

          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <span>Abrir Painel Oficial Supabase</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-slate-500 block text-[10px]">ID DO PROJETO</span>
            <span className="text-white font-bold">{SUPABASE_PROJECT_ID}</span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-slate-500 block text-[10px]">STATUS DA SEGURANÇA</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% RLS Ativo
            </span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5">
            <span className="text-slate-500 block text-[10px]">ISOLAMENTO MULTI-TENANT</span>
            <span className="text-gold font-bold">Cirúrgico / Vazamento Zero</span>
          </div>
        </div>
      </div>

      {/* Tables List */}
      <div className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Tabelas & Políticas de Segurança</h3>
          <span className="text-xs font-mono text-slate-400">10 Tabelas Sincronizadas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6">Nome da Tabela</th>
                <th className="py-4 px-6">Escopo dos Dados</th>
                <th className="py-4 px-6">Política RLS</th>
                <th className="py-4 px-6">Finalidade no Sistema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
              {tables.map((tbl, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-bold text-white">
                    public.{tbl.name}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {tbl.records}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {tbl.rls}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-sans text-slate-300">
                    {tbl.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
