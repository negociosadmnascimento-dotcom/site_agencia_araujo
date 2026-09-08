import React, { useState } from 'react';
import { 
  Shield, Users, Layers, LayoutTemplate, Box, UserCheck, 
  CreditCard, Globe, BarChart3, Settings, Key, FileSpreadsheet, 
  LifeBuoy, LogOut, ExternalLink, Menu, X, Database, ChevronRight, 
  Sparkles, CheckCircle2, AlertTriangle, Plus, Search, Filter, 
  Trash2, Edit3, Lock, Server, Cpu, RefreshCw, Eye
} from 'lucide-react';
import { useAuth, PLATFORM_SETTINGS } from '../../context/AuthContext';
import { isSupabaseConfigured, SUPABASE_PROJECT_ID } from '../../lib/supabase';

export default function SuperAdminLayout({ onBackToSite }) {
  const { user, logout, auditLogs, logActivity } = useAuth();
  const [activeTab, setActiveTab] = useState('metricas_globais');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sample Multi-Tenant Database
  const [tenants, setTenants] = useState([
    {
      id: 'tenant_001',
      name: 'Agência Araújo',
      nicho: 'Fotografia & Audiovisual',
      domain: 'agenciasaraujo.com.br',
      plan: 'Plano Pro (R$ 497/mês)',
      status: 'Ativo',
      adminEmail: 'admin@agenciasaraujo.com.br',
      visits: '1.248',
      leads: '43',
      storageUsed: '4.8 GB / 50 GB',
      createdAt: '15/01/2026',
      modulesCount: 13,
    },
    {
      id: 'tenant_002',
      name: 'Dr. Lucas Costa Cirurgia Plástica',
      nicho: 'Medicina & Estética',
      domain: 'drlucascosta.com.br',
      plan: 'Plano Enterprise (R$ 997/mês)',
      status: 'Ativo',
      adminEmail: 'contato@drlucascosta.com.br',
      visits: '3.420',
      leads: '89',
      storageUsed: '12.4 GB / 100 GB',
      createdAt: '02/02/2026',
      modulesCount: 10,
    },
    {
      id: 'tenant_003',
      name: 'Silva & Associados Advocacia',
      nicho: 'Jurídico & Tributário',
      domain: 'silvassociados.adv.br',
      plan: 'Plano Pro (R$ 497/mês)',
      status: 'Ativo',
      adminEmail: 'juridico@silvassociados.adv.br',
      visits: '890',
      leads: '28',
      storageUsed: '2.1 GB / 50 GB',
      createdAt: '10/02/2026',
      modulesCount: 8,
    },
    {
      id: 'tenant_004',
      name: 'Bella Vista Gastronomia',
      nicho: 'Restaurantes & Eventos',
      domain: 'bellavistabistro.com.br',
      plan: 'Plano Starter (R$ 197/mês)',
      status: 'Pendente Pagamento',
      adminEmail: 'reservas@bellavistabistro.com.br',
      visits: '2.150',
      leads: '64',
      storageUsed: '1.5 GB / 20 GB',
      createdAt: '18/02/2026',
      modulesCount: 7,
    },
  ]);

  // Nichos
  const [nichos] = useState([
    { id: 'fotografia', name: 'Fotografia & Cinema', icon: '📸', activeTenants: 4, templatesCount: 3 },
    { id: 'medicina', name: 'Clínicas & Medicina', icon: '🩺', activeTenants: 3, templatesCount: 2 },
    { id: 'advocacia', name: 'Advocacia & Compliance', icon: '⚖️', activeTenants: 2, templatesCount: 2 },
    { id: 'gastronomia', name: 'Gastronomia & Restaurantes', icon: '🍷', activeTenants: 2, templatesCount: 1 },
    { id: 'arquitetura', name: 'Arquitetura & Design', icon: '🏛️', activeTenants: 1, templatesCount: 2 },
  ]);

  // Templates
  const templates = [
    { id: 'tpl_photo_luxo', name: 'Luxo & Gold Editorial', nicho: 'Fotografia', version: '2.4.0', status: 'Ativo (Agência Araújo)' },
    { id: 'tpl_medical_clean', name: 'Clinical Pure White', nicho: 'Medicina', version: '1.8.2', status: 'Ativo' },
    { id: 'tpl_law_dark', name: 'Dark Executive Jurídico', nicho: 'Advocacia', version: '2.1.0', status: 'Ativo' },
    { id: 'tpl_bistro_modern', name: 'Gourmet Showcase', nicho: 'Gastronomia', version: '1.2.0', status: 'Ativo' },
  ];

  // Módulos da plataforma
  const platformModules = [
    { id: 'mod_dashboard', name: 'Dashboard & Visão Geral', defaultActive: true, category: 'Core' },
    { id: 'mod_site', name: 'Editor & Visualizador de Site', defaultActive: true, category: 'CMS' },
    { id: 'mod_clientes', name: 'Gestão de Clientes', defaultActive: true, category: 'CRM' },
    { id: 'mod_leads', name: 'Funil de Leads & Oportunidades', defaultActive: true, category: 'CRM' },
    { id: 'mod_agenda', name: 'Agenda & Calendário de Sessões', defaultActive: true, category: 'Operações' },
    { id: 'mod_propostas', name: 'Gerador de Propostas Comerciais', defaultActive: true, category: 'Vendas' },
    { id: 'mod_historico', name: 'Histórico Operacional', defaultActive: true, category: 'Operações' },
    { id: 'mod_depoimentos', name: 'Depoimentos & Avaliações', defaultActive: true, category: 'Marketing' },
    { id: 'mod_portfolio', name: 'Portfólio & Galerias', defaultActive: true, category: 'Marketing' },
    { id: 'mod_formularios', name: 'Inbox de Formulários do Site', defaultActive: true, category: 'Comunicação' },
    { id: 'mod_whatsapp', name: 'Integração Direta WhatsApp API', defaultActive: true, category: 'Comunicação' },
    { id: 'mod_pagamentos', name: 'Controle de Pagamentos & Faturamento', defaultActive: true, category: 'Financeiro' },
    { id: 'mod_contratos', name: 'Gerador & Assinatura de Contratos', defaultActive: true, category: 'Jurídico' },
  ];

  // Planos SaaS
  const plans = [
    { name: 'Starter', price: 'R$ 197', period: '/mês', tenants: 3, storage: '20 GB', leadsLimit: '200 / mês' },
    { name: 'Pro', price: 'R$ 497', period: '/mês', tenants: 7, storage: '50 GB', leadsLimit: 'Ilimitado', highlight: true },
    { name: 'Enterprise', price: 'R$ 997', period: '/mês', tenants: 2, storage: '100 GB', leadsLimit: 'Ilimitado + API Dedicada' },
  ];

  // Domínios
  const domains = [
    { domain: 'agenciasaraujo.com.br', tenant: 'Agência Araújo', ssl: 'Ativo (Let\'s Encrypt)', dns: 'Cloudflare Proxied', status: 'Conectado' },
    { domain: 'drlucascosta.com.br', tenant: 'Dr. Lucas Costa', ssl: 'Ativo (Let\'s Encrypt)', dns: 'Cloudflare Proxied', status: 'Conectado' },
    { domain: 'silvassociados.adv.br', tenant: 'Silva & Associados', ssl: 'Ativo (Let\'s Encrypt)', dns: 'Cloudflare Proxied', status: 'Conectado' },
    { domain: 'bellavistabistro.com.br', tenant: 'Bella Vista Gastronomia', ssl: 'Pendente', dns: 'Aguardando Apontamento CNAME', status: 'Pendente' },
  ];

  // Platform Customization State
  const [platformConfig, setPlatformConfig] = useState({
    platformName: PLATFORM_SETTINGS.name,
    supportEmail: PLATFORM_SETTINGS.supportEmail,
    primaryColor: '#6366F1',
    maintenanceMode: false,
    autoBackupDaily: true,
    strictRLS: true,
  });

  // Navigation Items matching the user's explicit specification
  const navItems = [
    { id: 'metricas_globais', label: 'Métricas Globais', icon: BarChart3, badge: 'Ao Vivo' },
    { id: 'tenants', label: 'Tenants / Clientes', icon: Users, badge: `${tenants.length}` },
    { id: 'nichos', label: 'Nichos de Mercado', icon: Layers },
    { id: 'templates', label: 'Templates de Sites', icon: LayoutTemplate },
    { id: 'modulos', label: 'Módulos da Plataforma', icon: Box },
    { id: 'usuarios', label: 'Usuários & Operadores', icon: UserCheck },
    { id: 'planos', label: 'Planos & Assinaturas', icon: CreditCard },
    { id: 'dominios', label: 'Domínios Customizados', icon: Globe },
    { id: 'configuracoes', label: 'Configurações Globais', icon: Settings },
    { id: 'permissoes', label: 'Permissões & RLS', icon: Key },
    { id: 'logs', label: 'Logs & Auditoria', icon: FileSpreadsheet, badge: 'Cirúrgico' },
    { id: 'suporte', label: 'Central de Suporte', icon: LifeBuoy },
  ];

  const handleToggleTenantStatus = (id) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Ativo' ? 'Desativado' : 'Ativo';
        logActivity('ALTERACAO_TENANT', 'tenants', `Status do tenant ${t.name} (${t.id}) alterado para ${nextStatus}`);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex selection:bg-indigo-500 selection:text-white">
      
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR SUPER ADMIN - 100% PLATFORM BRANDING (NO AGÊNCIA ARAÚJO!) */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#0A0E1A] border-r border-indigo-900/40 
        flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Platform Identity */}
        <div className="p-6 pb-4 border-b border-indigo-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={PLATFORM_SETTINGS.logo}
                alt={PLATFORM_SETTINGS.name}
                className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              />
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-wide text-white block truncate">
                  {PLATFORM_SETTINGS.name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 block truncate">
                  Central de Governança
                </span>
              </div>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Super Admin Status Tag */}
          <div className="mt-4 p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-indigo-200 font-mono uppercase">
                Super Administrador
              </span>
            </div>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
              Root Level
            </span>
          </div>
        </div>

        {/* Navigation Items (The 12 Platform Modules) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-indigo-900/40">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Governança da Plataforma
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-white font-semibold border-l-2 border-indigo-500 pl-3.5 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isActive 
                      ? 'bg-black/30 text-white border-white/20' 
                      : 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Sidebar: Supabase Cluster & Super Admin Profile */}
        <div className="p-4 border-t border-indigo-900/30 space-y-3 bg-[#070A12]/80">
          {/* Supabase Cluster Status */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-900/40 text-[11px] font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300">Cluster Supabase</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Online
            </span>
          </div>

          {/* User info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs border border-indigo-400">
                SA
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{user?.name || 'Super Admin'}</span>
                <span className="text-[10px] text-slate-400 block truncate">{user?.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Encerrar Sessão Root"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Link to View Public Site */}
          <button
            onClick={onBackToSite}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors border border-white/10"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Visualizar Site Público</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-indigo-900/30 bg-[#0A0E1A]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-indigo-400 font-semibold">Super Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white font-semibold capitalize">
                {navItems.find(i => i.id === activeTab)?.label || activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase Cloud Link */}
            <a
              href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700/50 hover:bg-indigo-900/80 text-xs font-mono text-indigo-300 flex items-center gap-2 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Supabase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onBackToSite}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Visitar Site</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-8 flex-1 overflow-x-hidden">
          
          {/* TAB 1: MÉTRICAS GLOBAIS */}
          {activeTab === 'metricas_globais' && (
            <div className="space-y-8">
              {/* SaaS Overview Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-[#0E1528] to-slate-900 border border-indigo-500/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono mb-3">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Console Global Root • Plataforma Multi-Tenant</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                      Visão Geral da Infraestrutura SaaS
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                      Monitoramento unificado de todos os clientes, receita recorrente (MRR), consumo de armazenamento e integridade de isolamento RLS.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab('tenants')}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Cliente / Tenant</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('dominios')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                    >
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span>Gerenciar Domínios</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI CARDS (MATCHING USER SPECIFICATION) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tenants Ativos</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">12</div>
                  <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> 100% dos tenants saudáveis
                  </div>
                </div>

                <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Receita Recorrente (MRR)</span>
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 font-mono">R$ 48.500</div>
                  <div className="mt-2 text-xs text-slate-400 font-mono">
                    +14% de crescimento no mês
                  </div>
                </div>

                <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Visitas Agregadas</span>
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-bold text-white font-mono">142.300</div>
                  <div className="mt-2 text-xs text-cyan-300 font-mono">
                    Trafegadas via Cloudflare Edge
                  </div>
                </div>

                <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Segurança de Dados</span>
                    <Key className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-purple-300 font-mono">100% RLS</div>
                  <div className="mt-2 text-xs text-slate-400 font-mono">
                    Isolamento cirúrgico de banco
                  </div>
                </div>
              </div>

              {/* Tenants Quick Table */}
              <div className="rounded-3xl bg-slate-900/70 border border-indigo-900/30 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-400" />
                      <span>Tenants Cadastrados Recentemente</span>
                    </h2>
                    <p className="text-xs text-slate-400">Status dos clientes conectados à infraestrutura</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('tenants')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                  >
                    Ver Todos os Tenants ({tenants.length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-indigo-900/40 text-slate-400 uppercase font-mono text-[11px]">
                        <th className="py-3 px-4">Tenant ID</th>
                        <th className="py-3 px-4">Nome da Empresa</th>
                        <th className="py-3 px-4">Nicho</th>
                        <th className="py-3 px-4">Domínio Oficial</th>
                        <th className="py-3 px-4">Plano</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-900/20">
                      {tenants.map(tenant => (
                        <tr key={tenant.id} className="hover:bg-indigo-950/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-indigo-300 font-bold">{tenant.id}</td>
                          <td className="py-3.5 px-4 font-semibold text-white">{tenant.name}</td>
                          <td className="py-3.5 px-4 text-slate-300">{tenant.nicho}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">{tenant.domain}</td>
                          <td className="py-3.5 px-4 text-slate-300">{tenant.plan}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              tenant.status === 'Ativo' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {tenant.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  if (tenant.id === 'tenant_001') {
                                    onBackToSite();
                                  } else {
                                    window.open(`https://${tenant.domain}`, '_blank');
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                                title={`Visitar site do cliente ${tenant.name}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Visitar Site</span>
                              </button>
                              <span className="text-slate-600">•</span>
                              <button
                                onClick={() => handleToggleTenantStatus(tenant.id)}
                                className="text-[11px] font-semibold text-slate-400 hover:text-white underline"
                              >
                                {tenant.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TENANTS / CLIENTES */}
          {activeTab === 'tenants' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">Gestão Central de Clientes (Tenants)</h1>
                  <p className="text-xs text-slate-400">Controle completo de cada empresa cadastrada no SaaS.</p>
                </div>
                <button
                  onClick={() => alert('Modal para criar novo tenant pronto para integração com Supabase')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Tenant</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tenants.map(tenant => (
                  <div key={tenant.id} className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 space-y-4 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-indigo-400 uppercase bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
                          {tenant.id} • {tenant.nicho}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">{tenant.name}</h3>
                        <p className="text-xs text-slate-400 font-mono">{tenant.domain}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase font-mono ${
                        tenant.status === 'Ativo' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {tenant.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-black/40 border border-white/5 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Visitas</span>
                        <span className="font-bold text-white font-mono">{tenant.visits}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Leads</span>
                        <span className="font-bold text-indigo-400 font-mono">{tenant.leads}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Módulos</span>
                        <span className="font-bold text-emerald-400 font-mono">{tenant.modulesCount} Ativos</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-3 border-t border-indigo-900/30">
                      <span className="text-slate-400 truncate">Admin: <code className="text-slate-300 font-mono">{tenant.adminEmail}</code></span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            if (tenant.id === 'tenant_001') {
                              onBackToSite();
                            } else {
                              window.open(`https://${tenant.domain}`, '_blank');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                          title={`Visitar site do cliente ${tenant.name}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Visitar Site</span>
                        </button>

                        <button
                          onClick={() => handleToggleTenantStatus(tenant.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            tenant.status === 'Ativo'
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                          }`}
                        >
                          {tenant.status === 'Ativo' ? 'Desativar' : 'Reativar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NICHOS */}
          {activeTab === 'nichos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Nichos de Mercado Suportados</h1>
                  <p className="text-xs text-slate-400">Configuração de nichos atendidos pela plataforma SaaS.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nichos.map(nicho => (
                  <div key={nicho.id} className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 space-y-3">
                    <div className="text-3xl">{nicho.icon}</div>
                    <h3 className="text-lg font-bold text-white">{nicho.name}</h3>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Tenants ativos: <strong className="text-white">{nicho.activeTenants}</strong></p>
                      <p>Templates vinculados: <strong className="text-white">{nicho.templatesCount} modelos</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Templates de Sites por Nicho</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map(tpl => (
                  <div key={tpl.id} className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
                        {tpl.nicho}
                      </span>
                      <span className="text-xs font-mono text-slate-400">v{tpl.version}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{tpl.name}</h3>
                    <p className="text-xs text-slate-400">Status de distribuição: <strong className="text-emerald-400">{tpl.status}</strong></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MÓDULOS */}
          {activeTab === 'modulos' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Catálogo de Módulos da Plataforma</h1>
                <p className="text-xs text-slate-400">Habilite ou desabilite recursos para cada cliente.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformModules.map(mod => (
                  <div key={mod.id} className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase">{mod.category}</span>
                      <h4 className="text-sm font-bold text-white">{mod.name}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Disponível
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: USUÁRIOS */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Usuários & Operadores Cadastrados</h1>
              <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-indigo-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Direção Geral (Super Admin)</span>
                      <span className="text-xs text-slate-400 font-mono">negociosadm.nascimento@gmail.com</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Super Admin (Root)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Agência Araújo (Tenant #001)</span>
                      <span className="text-xs text-slate-400 font-mono">admin@agenciasaraujo.com.br</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Tenant Admin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PLANOS & ASSINATURAS */}
          {activeTab === 'planos' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Planos SaaS & Faturamento MRR</h1>
                <p className="text-xs text-slate-400">Preços e limites dos planos comerciais.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(p => (
                  <div key={p.name} className={`rounded-2xl bg-slate-900/80 border p-6 space-y-4 ${
                    p.highlight ? 'border-indigo-500 shadow-xl shadow-indigo-600/20' : 'border-indigo-900/30'
                  }`}>
                    <h3 className="text-xl font-bold text-white">{p.name}</h3>
                    <div className="text-3xl font-bold text-emerald-400 font-mono">{p.price} <span className="text-xs text-slate-400 font-sans">{p.period}</span></div>
                    <div className="text-xs text-slate-300 space-y-2 border-t border-white/10 pt-4">
                      <p>Tenants ativos: <strong className="text-white">{p.tenants}</strong></p>
                      <p>Armazenamento: <strong className="text-white">{p.storage}</strong></p>
                      <p>Limite de Leads: <strong className="text-white">{p.leadsLimit}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: DOMÍNIOS */}
          {activeTab === 'dominios' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Domínios Customizados & Certificados SSL</h1>
                <p className="text-xs text-slate-400">Status dos domínios dos tenants e roteamento Cloudflare.</p>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-indigo-950/40 border-b border-indigo-900/30 text-slate-400 font-mono">
                    <tr>
                      <th className="py-3.5 px-4">Domínio</th>
                      <th className="py-3.5 px-4">Tenant Proprietário</th>
                      <th className="py-3.5 px-4">Certificado SSL</th>
                      <th className="py-3.5 px-4">Roteamento DNS</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-900/20">
                    {domains.map((d, i) => (
                      <tr key={i} className="hover:bg-indigo-950/30">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{d.domain}</td>
                        <td className="py-3.5 px-4 text-slate-300">{d.tenant}</td>
                        <td className="py-3.5 px-4 text-emerald-300 font-mono">{d.ssl}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">{d.dns}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            d.status === 'Conectado' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: CONFIGURAÇÕES DA PLATAFORMA */}
          {activeTab === 'configuracoes' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Configurações Globais da Plataforma SaaS</h1>
                <p className="text-xs text-slate-400">Personalize o branding do Super Admin e configure os parâmetros globais.</p>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 space-y-6 max-w-2xl">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">Nome do Provedor SaaS</label>
                  <input
                    type="text"
                    value={platformConfig.platformName}
                    onChange={e => setPlatformConfig({...platformConfig, platformName: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-indigo-900/60 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">E-mail Central de Suporte</label>
                  <input
                    type="email"
                    value={platformConfig.supportEmail}
                    onChange={e => setPlatformConfig({...platformConfig, supportEmail: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-indigo-900/60 text-white text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5">
                  <div>
                    <span className="text-sm font-bold text-white block">Políticas RLS Rigorosas Ativas</span>
                    <span className="text-xs text-slate-400">Garante que nenhum tenant leia dados de outro</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.strictRLS}
                    onChange={e => setPlatformConfig({...platformConfig, strictRLS: e.target.checked})}
                    className="w-5 h-5 rounded accent-indigo-600"
                  />
                </div>

                <button
                  onClick={() => {
                    logActivity('CONFIG_PLATAFORMA', 'settings', 'Configurações globais salvas pelo Super Admin');
                    alert('Configurações da plataforma salvas com sucesso!');
                  }}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30"
                >
                  Salvar Parâmetros Globais
                </button>
              </div>
            </div>
          )}

          {/* TAB 10: PERMISSÕES */}
          {activeTab === 'permissoes' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Matriz de Permissões & RLS Cirúrgica</h1>
              <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 space-y-4">
                <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200">
                  <p className="font-bold mb-1">🔐 Isolamento de Dados por Tenant ID no Supabase (RLS):</p>
                  <p>Cada consulta SQL de clientes executa com o filtro <code>WHERE tenant_id = auth.jwt() -&gt; 'tenant_id'</code>.</p>
                  <p className="mt-2 text-emerald-300">Super Admin opera com governança total para auditoria e suporte sob demanda.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: LOGS & AUDITORIA */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Trilha de Auditoria Cirúrgica</h1>
                  <p className="text-xs text-slate-400">Registro em tempo real de cada ação executada na plataforma.</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar Trilha</span>
                </button>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 overflow-hidden">
                <div className="divide-y divide-indigo-900/20">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-indigo-950/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">{log.admin_name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                            {log.action_type}
                          </span>
                        </div>
                        <p className="text-slate-300">{log.description}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{log.ip_address}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: SUPORTE */}
          {activeTab === 'suporte' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Central de Suporte aos Clientes</h1>
              <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 text-center py-12">
                <LifeBuoy className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">Nenhum chamado urgente pendente</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Todos os tenants estão operando normalmente com 100% de disponibilidade.
                </p>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
