import React, { useState } from 'react';
import { 
  Users, Search, Plus, Filter, MessageCircle, Mail, Phone, 
  Star, DollarSign, Calendar, MoreVertical, CheckCircle2, UserCheck, X
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';

export default function ClientsModule() {
  const { isSuperAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [clients, setClients] = useState([
    {
      id: 'cli_01',
      name: 'Dr. Roberto Silveira',
      role: 'Médico Cirurgião Plástico',
      category: 'Corporativo & Retratos',
      email: 'roberto.silveira@clinica.med.br',
      phone: '(21) 99888-7766',
      totalSpent: 'R$ 8.500,00',
      sessionsCount: 3,
      status: 'VIP',
      lastSession: '12/01/2026',
      notes: 'Prefere ensaios no consultório da Barra e luz suave.'
    },
    {
      name: 'Mariana & Lucas Alencar',
      role: 'Casal • Pré-Wedding & Cerimônia',
      category: 'Eventos & Social',
      email: 'mariana.alencar@gmail.com',
      phone: '(21) 98765-4321',
      totalSpent: 'R$ 12.400,00',
      sessionsCount: 2,
      status: 'Ativo',
      lastSession: '02/02/2026',
      notes: 'Pacote completo foto + filme 4k com drone no Arpoador.'
    },
    {
      id: 'cli_03',
      name: 'Le Vin Bistrô & Bar',
      role: 'Carlos Drummond • Gerente Geral',
      category: 'Gastronomia',
      email: 'contato@levinbistro.com.br',
      phone: '(21) 97654-3210',
      totalSpent: 'R$ 6.200,00',
      sessionsCount: 4,
      status: 'Recorrente',
      lastSession: '18/02/2026',
      notes: 'Contrato trimestral de fotos de pratos sazonais e coquetelaria.'
    },
    {
      id: 'cli_04',
      name: 'Camila Mendonça Ferreira',
      role: 'Arquiteta de Interiores',
      category: 'Retratos Pessoais',
      email: 'camila@mendoncaarq.com.br',
      phone: '(21) 99123-4567',
      totalSpent: 'R$ 3.800,00',
      sessionsCount: 1,
      status: 'Ativo',
      lastSession: '28/01/2026',
      notes: 'Ensaio de branding pessoal para nova revista de design.'
    },
    {
      id: 'cli_05',
      name: 'SAFRA Produções Rio',
      role: 'Eduardo Neves • Diretor de Eventos',
      category: 'Corporativo & Retratos',
      email: 'eduardo@safraeventos.com.br',
      phone: '(21) 98877-6655',
      totalSpent: 'R$ 17.500,00',
      sessionsCount: 5,
      status: 'VIP',
      lastSession: '15/02/2026',
      notes: 'Parceiro corporativo chave para congressos no Windsor Barra.'
    },
  ]);

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
      client.phone.includes(searchTerm);
    const matchesCat = selectedCategory === 'Todos' || client.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.name) return;
    setClients([
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
    ]);
    setNewClient({ name: '', role: '', category: 'Retratos Pessoais', email: '', phone: '', notes: '' });
    setShowAddModal(false);
    showToast(`Cliente "${newClient.name}" cadastrado com sucesso!`);
  };

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

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total de Clientes</span>
          <p className="text-2xl font-serif font-bold text-white mt-1">{clients.length}</p>
          <span className="text-[10px] text-emerald-400 font-medium">100% ativos na base</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-xs text-slate-400 uppercase font-semibold">Clientes VIP</span>
          <p className="text-2xl font-serif font-bold text-gold mt-1">2</p>
          <span className="text-[10px] text-slate-400 font-medium">Acima de R$ 8.000 em ensaios</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-xs text-slate-400 uppercase font-semibold">Recorrentes</span>
          <p className="text-2xl font-serif font-bold text-blue-400 mt-1">1</p>
          <span className="text-[10px] text-slate-400 font-medium">Contratos mensais / trimestrais</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-xs text-slate-400 uppercase font-semibold">LTV Médio (Super Admin)</span>
          <p className="text-2xl font-serif font-bold text-emerald-400 mt-1">
            {isSuperAdmin ? 'R$ 9.680' : '••••••••'}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Ticket médio por cliente</span>
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
                {isSuperAdmin && <th className="py-4 px-6">Total Investido</th>}
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
                      <span className="text-slate-400 text-xs">{client.role}</span>
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
                  {isSuperAdmin && (
                    <td className="py-4 px-6 font-mono font-bold text-gold">
                      {client.totalSpent}
                    </td>
                  )}
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
                    <a
                      href={`https://wa.me/55${client.phone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(client.name)},%20tudo%20bem?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold border border-emerald-500/30 transition-colors"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-green-400" />
                      <span>WhatsApp</span>
                    </a>
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
