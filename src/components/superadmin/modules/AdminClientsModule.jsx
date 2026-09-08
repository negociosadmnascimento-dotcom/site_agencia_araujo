import React, { useState } from 'react';
import { 
  Users, Plus, Search, Filter, ShieldCheck, Power, Palette, 
  TrendingUp, CheckCircle, XCircle, MoreVertical, X, Sparkles, Building 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function AdminClientsModule({ onOpenCustomizer }) {
  const { logActivity } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // The client accounts (Admins / Agencies) managed by the Super Admin
  const [adminClients, setAdminClients] = useState(() => {
    try {
      const stored = localStorage.getItem('superadmin_managed_clients');
      return stored ? JSON.parse(stored) : [
        {
          id: 'adm_01',
          agencyName: 'Agências Araújo • Fotografia & Audiovisual RJ',
          responsibleName: 'Operador Admin Principal',
          email: 'admin@agenciasaraujo.com.br',
          plan: 'Plano Agency Unlimited',
          status: 'Ativo',
          leadsCount: 24,
          sessionsCount: 18,
          createdAt: '15/01/2026',
          lastActive: 'Hoje, 20:15',
          themePalette: 'Dourado Imperial',
        },
        {
          id: 'adm_02',
          agencyName: 'Estúdio Copacabana Fine Art',
          responsibleName: 'Felipe Vasconcellos',
          email: 'felipe@copacabanafineart.com.br',
          plan: 'Plano Studio Pro',
          status: 'Ativo',
          leadsCount: 12,
          sessionsCount: 8,
          createdAt: '01/02/2026',
          lastActive: 'Ontem, 18:30',
          themePalette: 'Prata Titânio',
        },
        {
          id: 'adm_03',
          agencyName: 'Lumière Barra Fotografia',
          responsibleName: 'Beatriz Castro',
          email: 'contato@lumierebarra.com.br',
          plan: 'Plano Starter',
          status: 'Desativado',
          leadsCount: 5,
          sessionsCount: 2,
          createdAt: '10/02/2026',
          lastActive: 'Há 5 dias',
          themePalette: 'Rose Gold',
        },
      ];
    } catch {
      return [];
    }
  });

  const [newClient, setNewClient] = useState({
    agencyName: '',
    responsibleName: '',
    email: '',
    plan: 'Plano Agency Unlimited',
    themePalette: 'Dourado Imperial',
  });

  const toggleStatus = (id) => {
    const updated = adminClients.map((client) => {
      if (client.id === id) {
        const nextStatus = client.status === 'Ativo' ? 'Desativado' : 'Ativo';
        logActivity?.('STATUS_ADMIN_ALTERADO', 'gestao_admins', `${nextStatus === 'Ativo' ? 'Ativou' : 'Desativou'} acesso da agência ${client.agencyName}`);
        return { ...client, status: nextStatus };
      }
      return client;
    });
    setAdminClients(updated);
    try {
      localStorage.setItem('superadmin_managed_clients', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.agencyName || !newClient.email) return;

    const created = {
      id: `adm_${Date.now()}`,
      agencyName: newClient.agencyName,
      responsibleName: newClient.responsibleName || 'Responsável Agência',
      email: newClient.email,
      plan: newClient.plan,
      status: 'Ativo',
      leadsCount: 0,
      sessionsCount: 0,
      createdAt: 'Hoje',
      lastActive: 'Pendente primeiro login',
      themePalette: newClient.themePalette,
    };

    const nextList = [created, ...adminClients];
    setAdminClients(nextList);
    try {
      localStorage.setItem('superadmin_managed_clients', JSON.stringify(nextList));
    } catch (e) {
      console.warn(e);
    }

    logActivity?.('NOVO_ADMIN_CADASTRADO', 'gestao_admins', `Super Admin cadastrou nova agência cliente: ${created.agencyName} (${created.email})`);
    setShowAddModal(false);
  };

  const filtered = adminClients.filter((c) => {
    const matchesSearch = c.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <Building className="w-3.5 h-3.5" />
            <span>Gestão de Contas • Clientes da Plataforma (Admins)</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Gerenciamento de Clientes (Admins)</h1>
          <p className="text-slate-400 text-xs">
            Controle total sobre criação de contas, ativação/desativação de acesso e personalização sob demanda
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente Admin</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">Total de Agências Clientes</span>
          <p className="text-2xl font-serif font-bold text-white mt-1">{adminClients.length}</p>
          <span className="text-[10px] text-emerald-400 font-medium">Contratos cadastrados</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">Contas Ativas</span>
          <p className="text-2xl font-serif font-bold text-emerald-400 mt-1">
            {adminClients.filter(c => c.status === 'Ativo').length}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Com acesso liberado ao painel</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-xs uppercase font-semibold text-slate-400">Contas Desativadas / Suspensas</span>
          <p className="text-2xl font-serif font-bold text-amber-400 mt-1">
            {adminClients.filter(c => c.status === 'Desativado').length}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Acesso temporariamente bloqueado</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por agência ou e-mail de acesso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:border-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['Todos', 'Ativo', 'Desativado'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterStatus === st
                  ? 'bg-gold-500 text-dark-950 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6">Agência / Cliente Admin</th>
                <th className="py-4 px-6">E-mail de Login</th>
                <th className="py-4 px-6">Plano / Contrato</th>
                <th className="py-4 px-6">Uso & Performance</th>
                <th className="py-4 px-6">Status da Conta</th>
                <th className="py-4 px-6 text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-bold text-white text-sm block">{client.agencyName}</span>
                      <span className="text-slate-400 text-xs">{client.responsibleName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-gold-300">
                    {client.email}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-slate-200">
                      {client.plan}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-[11px] space-y-0.5">
                      <span className="text-slate-300 block">{client.leadsCount} leads cadastrados</span>
                      <span className="text-slate-500 font-mono block">Último acesso: {client.lastActive}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      client.status === 'Ativo'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(client.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                          client.status === 'Ativo'
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                        title={client.status === 'Ativo' ? 'Suspender/Desativar Acesso' : 'Ativar Acesso'}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{client.status === 'Ativo' ? 'Desativar' : 'Ativar'}</span>
                      </button>

                      <button
                        onClick={() => onOpenCustomizer?.(client)}
                        className="px-3 py-1.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold-300 border border-gold/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Personalizar Identidade da Agência a pedido do cliente"
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Personalizar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-gold/30 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-white mb-1">Cadastrar Novo Cliente Admin</h2>
            <p className="text-xs text-slate-400 mb-6">Crie uma nova agência/operador com acesso exclusivo ao painel</p>

            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Agência / Estúdio</label>
                <input
                  type="text"
                  required
                  value={newClient.agencyName}
                  onChange={(e) => setNewClient({ ...newClient, agencyName: e.target.value })}
                  placeholder="Ex: Studio VIP Fotografia"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Responsável</label>
                  <input
                    type="text"
                    value={newClient.responsibleName}
                    onChange={(e) => setNewClient({ ...newClient, responsibleName: e.target.value })}
                    placeholder="Ex: Mariana Castro"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail de Login do Admin</label>
                  <input
                    type="email"
                    required
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="mariana@studiovip.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plano / Contrato</label>
                  <select
                    value={newClient.plan}
                    onChange={(e) => setNewClient({ ...newClient, plan: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  >
                    <option>Plano Agency Unlimited</option>
                    <option>Plano Studio Pro</option>
                    <option>Plano Starter Fotógrafo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Paleta Inicial</label>
                  <select
                    value={newClient.themePalette}
                    onChange={(e) => setNewClient({ ...newClient, themePalette: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  >
                    <option>Dourado Imperial</option>
                    <option>Rose Gold</option>
                    <option>Prata Titânio</option>
                    <option>Verde Esmeralda</option>
                  </select>
                </div>
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
                  Cadastrar Cliente Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
