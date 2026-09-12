import React, { useState } from 'react';
import { 
  Users, Search, Plus, Filter, MessageCircle, Mail, Phone, 
  Star, DollarSign, Calendar, MoreVertical, CheckCircle2, UserCheck, X, Trash2,
  Eye, EyeOff
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';
import { useValuesVisibility } from '../../../utils/valuesVisibility';

export default function ClientsModule() {
  const { isSuperAdmin } = useAuth();
  const { showValues, toggleShowValues } = useValuesVisibility();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const INITIAL_CLIENTS = [
    {
      id: 'cli_nicoly_0909',
      universalId: 'CLI-2026-784-NICOLY',
      name: 'Nicoly Gomes de Castro',
      role: 'Cliente Particular',
      category: 'Retratos Pessoais',
      email: 'nicolygomes021@gmail.com',
      phone: '(21) 97553-0689',
      totalSpent: 'R$ 0,00',
      sessionsCount: 0,
      status: 'Em Prospecção',
      lastSession: 'Pendente (Previsto Nov/26)',
      notes: 'Ensaio Gestante & Família em estúdio com namorado. Contato via WhatsApp em 09/09.',
    }
  ];

  const [clients, setClients] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_clients');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
      return INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  const persistClients = (newClients) => {
    setClients(newClients);
    try {
      localStorage.setItem('admin_clients', JSON.stringify(newClients));
    } catch (_) {}
  };

  const [newClient, setNewClient] = useState({
    name: '',
    role: '',
    category: 'Retratos Pessoais',
    email: '',
    phone: '',
    notes: '',
  });

  const categories = ['Todos', 'Retratos Pessoais', 'Corporativo & Retratos', 'Gastronomia', 'Eventos & Social'];

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.universalId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || client.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.name) return;
    const updated = [
      ...clients,
      {
        id: `cli_${Date.now()}`,
        name: newClient.name,
        role: newClient.role || 'Cliente Particular',
        category: newClient.category,
        email: newClient.email || 'contato@cliente.com',
        phone: newClient.phone || '(21) 99999-9999',
        totalSpent: 'R$ 0,00',
        sessionsCount: 0,
        status: 'Em Prospecção',
        lastSession: 'Pendente',
        notes: newClient.notes || '',
      }
    ];
    persistClients(updated);
    setNewClient({ name: '', role: '', category: 'Retratos Pessoais', email: '', phone: '', notes: '' });
    setShowAddModal(false);
    showToast(`Cliente "${newClient.name}" cadastrado com sucesso!`);
  };

  const handleDeleteClient = (id, name) => {
    if (!window.confirm(`Remover cliente "${name}" da base de clientes?`)) return;
    const updated = clients.filter((c) => c.id !== id);
    persistClients(updated);
    showToast(`Cliente "${name}" removido.`);
  };

  // Cálculos dinâmicos em tempo real a partir dos clientes reais
  const vipCount = clients.filter(c => {
    const spent = parseFloat((c.totalSpent || '0').replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
    return c.status === 'VIP' || spent >= 3000;
  }).length;

  const recurringCount = clients.filter(c => (Number(c.sessionsCount) || 0) > 1 || c.status === 'Recorrente').length;

  const totalSpentAll = clients.reduce((acc, c) => {
    const spent = parseFloat((c.totalSpent || '0').replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
    return acc + spent;
  }, 0);

  const avgLtv = clients.length > 0 ? (totalSpentAll / clients.length) : 0;
  const formattedLtv = avgLtv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl bg-emerald-600 text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {toast}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Módulo 03 • CRM de Clientes</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Base de Clientes & Contatos</h1>
          <p className="text-slate-400 text-xs">
            Gerenciamento de relacionamentos, histórico de ensaios e comunicação direta via WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleShowValues}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            title="Ocultar / Exibir valores em R$"
          >
            {showValues ? <EyeOff className="w-4 h-4 text-gold" /> : <Eye className="w-4 h-4 text-gold" />}
            <span>{showValues ? 'Ocultar Valores' : 'Revelar Valores'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Dinâmicos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total de Clientes</span>
          <p className="text-2xl font-serif font-bold text-white mt-1">{clients.length}</p>
          <span className="text-[10px] text-emerald-400 font-medium">100% ativos na base</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-xs text-slate-400 uppercase font-semibold">Clientes VIP</span>
          <p className="text-2xl font-serif font-bold text-gold mt-1">{vipCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">
            {vipCount > 0 ? `${vipCount} cliente(s) acima de R$ 3.000` : 'Nenhum cliente VIP ainda'}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-xs text-slate-400 uppercase font-semibold">Recorrentes</span>
          <p className="text-2xl font-serif font-bold text-blue-400 mt-1">{recurringCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">
            {recurringCount > 0 ? `${recurringCount} contratos recorrentes` : 'Aguardando novas sessões'}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-xs text-slate-400 uppercase font-semibold">LTV Médio</span>
          <p className="text-2xl font-serif font-bold text-emerald-400 mt-1">
            {showValues ? formattedLtv : '••••••••'}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Ticket médio real por cliente</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs focus:border-gold focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-gold-500 text-dark-950 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6">Cliente & Ocupação</th>
                <th className="py-4 px-6">Segmento</th>
                <th className="py-4 px-6">Contato & WhatsApp</th>
                <th className="py-4 px-6">Ensaios</th>
                <th className="py-4 px-6">Total Investido</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredClients.map((client, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <span className="font-bold text-white text-sm block">{client.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-slate-400 text-xs">{client.role}</span>
                        {client.universalId && (
                          <span className="font-mono text-[9px] font-bold text-gold/90 bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded">
                            {client.universalId}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300">
                      {client.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-200">{client.phone}</span>
                        <a
                          href={`https://wa.me/55${client.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(client.name)},%20aqui%20é%20da%20Agências%20Araújo.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          title="Conversar no WhatsApp"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 text-green-400" />
                        </a>
                      </div>
                      <span className="text-[11px] text-slate-500 block">{client.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-center">
                    <span className="px-2 py-0.5 rounded bg-black/40 border border-white/5">
                      {client.sessionsCount} sessões
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-gold">
                    {showValues ? client.totalSpent : '••••••••'}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        client.status === 'VIP'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : client.status === 'Ativo'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`https://wa.me/55${client.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(client.name)},%20tudo%20bem?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold border border-emerald-500/30 transition-colors"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-green-400" />
                        <span>WhatsApp</span>
                      </a>
                      <button
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        title="Remover cliente"
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

            <h2 className="text-xl font-serif font-bold text-white mb-1">Cadastrar Novo Cliente</h2>
            <p className="text-xs text-slate-400 mb-6">Adicione os dados para acompanhamento e emissão de propostas</p>

            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Ex: João da Silva"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo / Empresa</label>
                  <input
                    type="text"
                    value={newClient.role}
                    onChange={(e) => setNewClient({ ...newClient, role: e.target.value })}
                    placeholder="Ex: Diretor Executivo"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Segmento</label>
                  <select
                    value={newClient.category}
                    onChange={(e) => setNewClient({ ...newClient, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  >
                    <option>Retratos Pessoais</option>
                    <option>Corporativo & Retratos</option>
                    <option>Gastronomia</option>
                    <option>Eventos & Social</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp (com DDD)</label>
                  <input
                    type="tel"
                    required
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="(21) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="cliente@email.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observações do Cliente</label>
                <textarea
                  rows={2}
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  placeholder="Preferências de locação, estilo fotográfico, etc."
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
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
