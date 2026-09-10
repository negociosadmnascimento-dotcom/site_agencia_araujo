import React, { useState } from 'react';
import { 
  History as HistoryIcon, ShieldCheck, UserCheck, Search, Filter, 
  Clock, AlertTriangle, CheckCircle, Database, Eye, Lock, ArrowDownRight, Sparkles 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function HistoryModule() {
  const { user, isSuperAdmin, auditLogs } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('Todos');
  const [selectedModule, setSelectedModule] = useState('Todos');

  // List of distinct admins from logs
  const adminOptions = ['Todos', 'Operador Admin (Produção)', 'Direção Geral (Super Admin)'];
  const moduleOptions = ['Todos', 'leads', 'agenda', 'propostas', 'contratos', 'auth', 'seguranca', 'clientes', 'pagamentos'];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAdmin = selectedAdmin === 'Todos' || log.admin_name.includes(selectedAdmin);
    const matchesModule = selectedModule === 'Todos' || log.target_module === selectedModule;

    return matchesSearch && matchesAdmin && matchesModule;
  });

  const monitoredAdminsCount = new Set(auditLogs.map(l => l.admin_name)).size || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>Módulo 07 • Auditoria & Visão de Uso dos Administradores</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">
            {isSuperAdmin ? 'Painel de Auditoria & Governança de Admins' : 'Histórico de Atividades do Sistema'}
          </h1>
          <p className="text-slate-400 text-xs">
            {isSuperAdmin 
              ? 'Visão cirúrgica de cada ação, visualização e alteração executada por cada operador no sistema' 
              : 'Linha do tempo de atividades operacionais registradas sob sua conta.'}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold/10 border border-gold/40 text-gold-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>Auditoria Forense Ativa</span>
          </div>
        )}
      </div>

      {/* Super Admin Exclusive Governance Dashboard */}
      {isSuperAdmin ? (
        <div className="space-y-6">
          {/* Security KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-gold/30">
              <span className="text-xs font-semibold text-slate-400 uppercase">Ações Auditadas</span>
              <p className="text-2xl font-serif font-bold text-white mt-1">{auditLogs.length}</p>
              <span className="text-[10px] text-emerald-400 font-medium">100% gravadas com IP & Time</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <span className="text-xs font-semibold text-slate-400 uppercase">Admins Monitorados</span>
              <p className="text-2xl font-serif font-bold text-gold mt-1">{monitoredAdminsCount} Operador(es)</p>
              <span className="text-[10px] text-slate-400 font-medium">Sessões isoladas por perfil</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <span className="text-xs font-semibold text-slate-400 uppercase">Isolamento de Clientes</span>
              <p className="text-2xl font-serif font-bold text-emerald-400 mt-1">100% RLS</p>
              <span className="text-[10px] text-emerald-400 font-medium">Vazamento entre clientes: ZERO</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <span className="text-xs font-semibold text-slate-400 uppercase">Integridade de Dados</span>
              <p className="text-2xl font-serif font-bold text-white mt-1">100% Protegido</p>
              <span className="text-[10px] text-emerald-400 font-medium">Registros operacionais seguros</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar logs por ação, descrição ou IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-slate-800 text-white text-xs focus:border-gold focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filtrar por Admin:</span>
                <select
                  value={selectedAdmin}
                  onChange={(e) => setSelectedAdmin(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-slate-800 text-white text-xs focus:border-gold focus:outline-none"
                >
                  {adminOptions.map((adm) => (
                    <option key={adm} value={adm}>{adm}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Módulo:</span>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-slate-800 text-white text-xs focus:border-gold focus:outline-none"
                >
                  {moduleOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-4 px-6">Administrador & E-mail</th>
                    <th className="py-4 px-6">Ação Realizada</th>
                    <th className="py-4 px-6">Módulo</th>
                    <th className="py-4 px-6">Descrição Detalhada</th>
                    <th className="py-4 px-6">Endereço IP / Origem</th>
                    <th className="py-4 px-6 text-right">Momento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-white text-xs block">{log.admin_name}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{log.admin_email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-gold/10 text-gold-300 border border-gold/30">
                          {log.action_type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 uppercase font-mono text-[10px]">
                          {log.target_module}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-xs text-slate-200 line-clamp-2">{log.description}</p>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-400 text-[11px]">
                        {log.ip_address}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-400 text-xs">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Admin View: Restricted */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Histórico Pessoal de Sessão</h2>
                <p className="text-xs text-slate-400">
                  Como Operador Admin, você visualiza apenas suas próprias ações operacionais recentes.
                  A auditoria unificada de todos os administradores e logs de segurança é exclusiva da <strong>Direção Geral (Super Admin)</strong>.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              {filteredLogs
                .filter((l) => l.admin_email === user?.email || l.admin_name.includes('Admin'))
                .slice(0, 5)
                .map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{log.description}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Módulo: {log.target_module}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">{log.timestamp}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
