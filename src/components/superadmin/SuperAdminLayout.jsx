import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Layers, LayoutTemplate, Box, UserCheck, 
  CreditCard, Globe, BarChart3, Settings, Key, FileSpreadsheet, 
  LifeBuoy, LogOut, ExternalLink, Menu, X, Database, ChevronRight, 
  Sparkles, CheckCircle2, AlertTriangle, Plus, Search, Filter, 
  Trash2, Edit3, Lock, Server, Cpu, RefreshCw, Eye, Check, Clock,
  DollarSign, TrendingUp, ArrowUpRight, Palette, Building2, HelpCircle
} from 'lucide-react';
import { useAuth, PLATFORM_SETTINGS } from '../../context/AuthContext';
import { isSupabaseConfigured, SUPABASE_PROJECT_ID } from '../../lib/supabase';

// Default initial datasets
const DEFAULT_TENANTS = [
  {
    id: 'tenant_001',
    name: 'Agência Araújo',
    nicho: 'Fotografia & Cinema',
    domain: 'agenciasaraujo.com.br',
    plan: 'Pro',
    price: 497,
    status: 'Ativo',
    adminEmail: 'admin@agenciasaraujo.com.br',
    phone: '(21) 97429-9780',
    visits: 1248,
    leads: 43,
    storageUsed: '4.8 GB / 50 GB',
    createdAt: '15/01/2026',
    modulesCount: 13,
  },
  {
    id: 'tenant_002',
    name: 'Dr. Lucas Costa Cirurgia Plástica',
    nicho: 'Clínicas & Medicina',
    domain: 'drlucascosta.com.br',
    plan: 'Enterprise',
    price: 997,
    status: 'Ativo',
    adminEmail: 'contato@drlucascosta.com.br',
    phone: '(21) 98888-7777',
    visits: 3420,
    leads: 89,
    storageUsed: '12.4 GB / 100 GB',
    createdAt: '02/02/2026',
    modulesCount: 10,
  },
  {
    id: 'tenant_003',
    name: 'Silva & Associados Advocacia',
    nicho: 'Advocacia & Compliance',
    domain: 'silvassociados.adv.br',
    plan: 'Pro',
    price: 497,
    status: 'Ativo',
    adminEmail: 'juridico@silvassociados.adv.br',
    phone: '(21) 97777-6666',
    visits: 890,
    leads: 28,
    storageUsed: '2.1 GB / 50 GB',
    createdAt: '10/02/2026',
    modulesCount: 8,
  },
  {
    id: 'tenant_004',
    name: 'Bella Vista Gastronomia',
    nicho: 'Gastronomia & Restaurantes',
    domain: 'bellavistabistro.com.br',
    plan: 'Starter',
    price: 197,
    status: 'Pendente Pagamento',
    adminEmail: 'reservas@bellavistabistro.com.br',
    phone: '(21) 96666-5555',
    visits: 2150,
    leads: 64,
    storageUsed: '1.5 GB / 20 GB',
    createdAt: '18/02/2026',
    modulesCount: 7,
  },
];

const DEFAULT_NICHOS = [
  { id: 'fotografia', name: 'Fotografia & Cinema', icon: '📸', desc: 'Estúdios, fotógrafos e produtoras audiovisuais' },
  { id: 'medicina', name: 'Clínicas & Medicina', icon: '🩺', desc: 'Consultórios médicos, dentistas e estética' },
  { id: 'advocacia', name: 'Advocacia & Compliance', icon: '⚖️', desc: 'Bancas jurídicas, tributaristas e consultoria' },
  { id: 'gastronomia', name: 'Gastronomia & Restaurantes', icon: '🍷', desc: 'Bistrôs, buffets, restaurantes e bares' },
  { id: 'arquitetura', name: 'Arquitetura & Design', icon: '🏛️', desc: 'Escritórios de arquitetura e design de interiores' },
];

const DEFAULT_TEMPLATES = [
  { id: 'tpl_photo_luxo', name: 'Luxo & Gold Editorial', nicho: 'Fotografia & Cinema', version: '2.4.0', status: 'Ativo (Agência Araújo)', previewUrl: 'https://agenciasaraujo.com.br' },
  { id: 'tpl_medical_clean', name: 'Clinical Pure White', nicho: 'Clínicas & Medicina', version: '1.8.2', status: 'Ativo', previewUrl: 'https://drlucascosta.com.br' },
  { id: 'tpl_law_dark', name: 'Dark Executive Jurídico', nicho: 'Advocacia & Compliance', version: '2.1.0', status: 'Ativo', previewUrl: 'https://silvassociados.adv.br' },
  { id: 'tpl_bistro_modern', name: 'Gourmet Showcase', nicho: 'Gastronomia & Restaurantes', version: '1.2.0', status: 'Ativo', previewUrl: 'https://bellavistabistro.com.br' },
];

const DEFAULT_PLANS = [
  { id: 'plan_starter', name: 'Starter', price: 'R$ 197', priceNum: 197, period: '/mês', storage: '20 GB', leadsLimit: '200 / mês', highlight: false },
  { id: 'plan_pro', name: 'Pro', price: 'R$ 497', priceNum: 497, period: '/mês', storage: '50 GB', leadsLimit: 'Ilimitado', highlight: true },
  { id: 'plan_enterprise', name: 'Enterprise', price: 'R$ 997', priceNum: 997, period: '/mês', storage: '100 GB', leadsLimit: 'Ilimitado + API Dedicada', highlight: false },
];

const DEFAULT_MODULES = [
  { id: 'mod_dashboard', name: 'Dashboard & Visão Geral', defaultActive: true, category: 'Core', desc: 'Métricas, estatísticas de acesso e visão operacional' },
  { id: 'mod_site', name: 'Conf. Institucional & Site', defaultActive: true, category: 'CMS', desc: 'Gestão visual do site público, banners e serviços' },
  { id: 'mod_clientes', name: 'Gestão de Clientes', defaultActive: true, category: 'CRM', desc: 'Cadastro, histórico e relacionamento com clientes' },
  { id: 'mod_leads', name: 'Funil de Leads (Kanban)', defaultActive: true, category: 'CRM', desc: 'Oportunidades comerciais em estágios de conversão' },
  { id: 'mod_agenda', name: 'Agenda & Horários', defaultActive: true, category: 'Operações', desc: 'Calendário interativo, bloqueio de turnos e reservas' },
  { id: 'mod_propostas', name: 'Propostas Comerciais', defaultActive: true, category: 'Vendas', desc: 'Emissão e envio de orçamentos em PDF/WhatsApp' },
  { id: 'mod_historico', name: 'Histórico Operacional', defaultActive: true, category: 'Operações', desc: 'Linha do tempo de todas as ações dos usuários' },
  { id: 'mod_depoimentos', name: 'Depoimentos & WhatsApp', defaultActive: true, category: 'Marketing', desc: 'Prints de WhatsApp e avaliações reais de clientes' },
  { id: 'mod_portfolio', name: 'Portfólio & Galerias', defaultActive: true, category: 'Marketing', desc: 'Upload e exibição de fotos e produções' },
  { id: 'mod_formularios', name: 'Inbox de Formulários', defaultActive: true, category: 'Comunicação', desc: 'Captação direta de pedidos de orçamento do site' },
  { id: 'mod_whatsapp', name: 'Central WhatsApp API', defaultActive: true, category: 'Comunicação', desc: 'Disparo de modelos oficiais e automação rápida' },
  { id: 'mod_pagamentos', name: 'Controle Financeiro', defaultActive: true, category: 'Financeiro', desc: 'Recebimentos, parcelas, PIX e pendências por ID' },
  { id: 'mod_contratos', name: 'Contratos & Assinaturas', defaultActive: true, category: 'Jurídico', desc: 'Geração de minutas jurídicas com ID universal' },
];

const DEFAULT_DOMAINS = [
  { domain: 'negocios.nascimento.com.br', tenant: 'Root • Central SaaS (Super Admin)', ssl: 'Ativo (Let\'s Encrypt)', dns: 'CNAME apontado', status: 'Conectado' },
  { domain: 'agenciasaraujo.com.br', tenant: 'Agência Araújo', ssl: 'Ativo (Let\'s Encrypt)', dns: 'Cloudflare Proxied', status: 'Conectado' },
  { domain: 'drlucascosta.com.br', tenant: 'Dr. Lucas Costa', ssl: 'Ativo (Let\'s Encrypt)', dns: 'Cloudflare Proxied', status: 'Conectado' },
  { domain: 'silvassociados.adv.br', tenant: 'Silva & Associados', ssl: 'Ativo (Let\'s Encrypt)', dns: 'Cloudflare Proxied', status: 'Conectado' },
  { domain: 'bellavistabistro.com.br', tenant: 'Bella Vista Gastronomia', ssl: 'Pendente', dns: 'Aguardando CNAME', status: 'Pendente' },
];

export default function SuperAdminLayout({ onBackToSite }) {
  const { user, logout, auditLogs, logActivity, platformConfig, updatePlatformConfig } = useAuth();
  const [activeTab, setActiveTab] = useState('metricas_globais');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. TENANTS STATE (LOCALSTORAGE SYNC)
  const [tenants, setTenants] = useState(() => {
    try {
      const saved = localStorage.getItem('saas_tenants');
      return saved ? JSON.parse(saved) : DEFAULT_TENANTS;
    } catch {
      return DEFAULT_TENANTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('saas_tenants', JSON.stringify(tenants));
    } catch (_) {}
  }, [tenants]);

  // 2. NICHOS STATE
  const [nichos, setNichos] = useState(() => {
    try {
      const saved = localStorage.getItem('saas_nichos');
      return saved ? JSON.parse(saved) : DEFAULT_NICHOS;
    } catch {
      return DEFAULT_NICHOS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('saas_nichos', JSON.stringify(nichos));
    } catch (_) {}
  }, [nichos]);

  // 3. TEMPLATES STATE
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('saas_templates');
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('saas_templates', JSON.stringify(templates));
    } catch (_) {}
  }, [templates]);

  // 4. PLANS STATE
  const [plans, setPlans] = useState(() => {
    try {
      const saved = localStorage.getItem('saas_plans');
      return saved ? JSON.parse(saved) : DEFAULT_PLANS;
    } catch {
      return DEFAULT_PLANS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('saas_plans', JSON.stringify(plans));
    } catch (_) {}
  }, [plans]);

  // 5. MODULES STATE
  const [modules, setModules] = useState(() => {
    try {
      const saved = localStorage.getItem('saas_platform_modules');
      return saved ? JSON.parse(saved) : DEFAULT_MODULES;
    } catch {
      return DEFAULT_MODULES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('saas_platform_modules', JSON.stringify(modules));
    } catch (_) {}
  }, [modules]);

  // 6. BRANDING / CONFIG LOCAL STATE
  const [localConfig, setLocalConfig] = useState(() => ({
    name: platformConfig?.name || 'NexCore SaaS Platform',
    tagline: platformConfig?.tagline || 'Gestão Central de Tenants & Infraestrutura Multi-Empresa',
    logo: platformConfig?.logo || '/images/platform-emblem.svg',
    favicon: platformConfig?.favicon || '/favicon.ico',
    primaryColor: platformConfig?.primaryColor || '#6366F1',
    supportEmail: platformConfig?.supportEmail || 'negociosadm.nascimento@gmail.com',
    governanceDomain: platformConfig?.governanceDomain || 'negocios.nascimento.com.br',
    operatorName: platformConfig?.operatorName || 'Direção Geral (Super Admin)',
    strictRLS: platformConfig?.strictRLS ?? true,
    maintenanceMode: platformConfig?.maintenanceMode ?? false,
    autoBackupDaily: platformConfig?.autoBackupDaily ?? true,
  }));

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  const handleSaveConfig = () => {
    setIsSavingConfig(true);
    setConfigSaveSuccess(false);

    setTimeout(() => {
      updatePlatformConfig?.(localConfig);
      setIsSavingConfig(false);
      setConfigSaveSuccess(true);
      showToast('✓ Configurações e White-Label salvas com sucesso!');
      logActivity?.('SAVE_GLOBAL_CONFIG', 'settings', 'Super Admin atualizou identidade e parâmetros globais');
      setTimeout(() => setConfigSaveSuccess(false), 4000);
    }, 900);
  };

  // 7. FILTERS FOR MÉTRICAS GLOBAIS
  const [filterPlan, setFilterPlan] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPeriod, setFilterPeriod] = useState('Últimos 30 dias');

  // Filtered tenants calculation
  const filteredTenants = tenants.filter(t => {
    const matchPlan = filterPlan === 'Todos' || t.plan.toLowerCase() === filterPlan.toLowerCase();
    const matchStatus = filterStatus === 'Todos' || t.status.toLowerCase() === filterStatus.toLowerCase();
    return matchPlan && matchStatus;
  });

  const totalFilteredMRR = filteredTenants.reduce((acc, t) => {
    const planObj = plans.find(p => p.name.toLowerCase() === t.plan.toLowerCase());
    return acc + (planObj ? planObj.priceNum : (t.price || 0));
  }, 0);

  const totalFilteredVisits = filteredTenants.reduce((acc, t) => acc + (t.visits || 0), 0);
  const totalFilteredLeads = filteredTenants.reduce((acc, t) => acc + (t.leads || 0), 0);

  // 8. MODALS STATE
  // Tenant Modal
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [tenantFormData, setTenantFormData] = useState({
    name: '',
    nicho: 'Fotografia & Cinema',
    domain: '',
    plan: 'Pro',
    adminEmail: '',
    phone: '(21) 97429-9780',
    status: 'Ativo',
  });

  const handleCreateTenant = (e) => {
    e.preventDefault();
    if (!tenantFormData.name.trim() || !tenantFormData.domain.trim()) {
      showToast('Preencha o nome da empresa e domínio.', 'error');
      return;
    }

    const selectedPlanObj = plans.find(p => p.name.toLowerCase() === tenantFormData.plan.toLowerCase());
    const newId = `tenant_00${tenants.length + 1}`;
    const newTenant = {
      id: newId,
      name: tenantFormData.name,
      nicho: tenantFormData.nicho,
      domain: tenantFormData.domain.replace(/^https?:\/\//, ''),
      plan: tenantFormData.plan,
      price: selectedPlanObj ? selectedPlanObj.priceNum : 497,
      status: tenantFormData.status,
      adminEmail: tenantFormData.adminEmail || `admin@${tenantFormData.domain.replace(/^https?:\/\//, '')}`,
      phone: tenantFormData.phone,
      visits: 0,
      leads: 0,
      storageUsed: '0.1 GB / 50 GB',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      modulesCount: modules.length,
    };

    const updated = [newTenant, ...tenants];
    setTenants(updated);
    setShowTenantModal(false);
    showToast(`✓ Tenant "${newTenant.name}" (${newTenant.id}) cadastrado com sucesso!`);
    logActivity?.('NOVO_TENANT', 'tenants', `Cadastrou tenant ${newTenant.name} (${newTenant.domain})`);

    setTenantFormData({
      name: '',
      nicho: 'Fotografia & Cinema',
      domain: '',
      plan: 'Pro',
      adminEmail: '',
      phone: '(21) 97429-9780',
      status: 'Ativo',
    });
  };

  const handleDeleteTenant = (id, name) => {
    if (!window.confirm(`Tem certeza que deseja excluir o tenant "${name}"? Essa ação removerá o acesso desta empresa.`)) return;
    const updated = tenants.filter(t => t.id !== id);
    setTenants(updated);
    showToast(`Tenant "${name}" removido.`, 'error');
    logActivity?.('EXCLUSAO_TENANT', 'tenants', `Removeu tenant ${name} (${id})`);
  };

  const handleToggleTenantStatus = (id) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Ativo' ? 'Desativado' : 'Ativo';
        logActivity?.('ALTERACAO_TENANT', 'tenants', `Status de ${t.name} alterado para ${nextStatus}`);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    showToast('Status do tenant atualizado!');
  };

  // Nicho Modal
  const [showNichoModal, setShowNichoModal] = useState(false);
  const [editingNicho, setEditingNicho] = useState(null);
  const [nichoForm, setNichoForm] = useState({ name: '', icon: '💼', desc: '' });

  const handleSaveNicho = (e) => {
    e.preventDefault();
    if (!nichoForm.name.trim()) return;

    if (editingNicho) {
      setNichos(prev => prev.map(n => n.id === editingNicho.id ? { ...n, ...nichoForm } : n));
      showToast(`Nicho "${nichoForm.name}" atualizado!`);
    } else {
      const newN = {
        id: `nicho_${Date.now()}`,
        ...nichoForm,
      };
      setNichos(prev => [...prev, newN]);
      showToast(`Nicho "${nichoForm.name}" adicionado!`);
    }
    setShowNichoModal(false);
    setEditingNicho(null);
  };

  const handleDeleteNicho = (id, name) => {
    if (!window.confirm(`Deseja remover o nicho "${name}"?`)) return;
    setNichos(prev => prev.filter(n => n.id !== id));
    showToast(`Nicho "${name}" removido.`, 'error');
  };

  // Template Modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ name: '', nicho: 'Fotografia & Cinema', version: '1.0.0', status: 'Ativo', previewUrl: '' });

  const handleSaveTemplate = (e) => {
    e.preventDefault();
    if (!templateForm.name.trim()) return;

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...templateForm } : t));
      showToast(`Template "${templateForm.name}" atualizado!`);
    } else {
      const newT = {
        id: `tpl_${Date.now()}`,
        ...templateForm,
      };
      setTemplates(prev => [...prev, newT]);
      showToast(`Template "${templateForm.name}" adicionado!`);
    }
    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id, name) => {
    if (!window.confirm(`Deseja remover o template "${name}"?`)) return;
    setTemplates(prev => prev.filter(t => t.id !== id));
    showToast(`Template "${name}" removido.`, 'error');
  };

  // Plan Modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({ name: '', price: 'R$ 497', priceNum: 497, period: '/mês', storage: '50 GB', leadsLimit: 'Ilimitado', highlight: false });

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!planForm.name.trim()) return;

    const num = parseInt(planForm.price.replace(/\D/g, '')) || 0;

    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...planForm, priceNum: num } : p));
      showToast(`Plano "${planForm.name}" atualizado!`);
    } else {
      const newP = {
        id: `plan_${Date.now()}`,
        ...planForm,
        priceNum: num,
      };
      setPlans(prev => [...prev, newP]);
      showToast(`Plano "${planForm.name}" adicionado!`);
    }
    setShowPlanModal(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = (id, name) => {
    if (!window.confirm(`Deseja remover o plano "${name}"?`)) return;
    setPlans(prev => prev.filter(p => p.id !== id));
    showToast(`Plano "${name}" removido.`, 'error');
  };

  // Module Modal
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleForm, setModuleForm] = useState({ name: '', category: 'Custom', desc: '' });

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!moduleForm.name.trim()) return;
    const newMod = {
      id: `mod_${Date.now()}`,
      name: moduleForm.name,
      category: moduleForm.category,
      desc: moduleForm.desc || 'Módulo customizado da plataforma',
      defaultActive: true,
    };
    setModules(prev => [...prev, newMod]);
    setShowModuleModal(false);
    showToast(`Módulo "${newMod.name}" adicionado com sucesso!`);
    setModuleForm({ name: '', category: 'Custom', desc: '' });
  };

  // NAVIGATION ITEMS
  const navItems = [
    { id: 'metricas_globais', label: 'Métricas Globais', icon: BarChart3, badge: 'Ao Vivo' },
    { id: 'tenants', label: 'Tenants / Clientes', icon: Users, badge: `${tenants.length}` },
    { id: 'nichos', label: 'Nichos de Mercado', icon: Layers, badge: `${nichos.length}` },
    { id: 'templates', label: 'Templates de Sites', icon: LayoutTemplate, badge: `${templates.length}` },
    { id: 'modulos', label: 'Módulos da Plataforma', icon: Box, badge: `${modules.length}` },
    { id: 'personalizacao', label: 'Personalização & White-Label', icon: Sparkles, badge: 'Root' },
    { id: 'usuarios', label: 'Usuários & Operadores', icon: UserCheck },
    { id: 'planos', label: 'Planos & Assinaturas', icon: CreditCard, badge: `${plans.length}` },
    { id: 'dominios', label: 'Domínios Customizados', icon: Globe },
    { id: 'configuracoes', label: 'Configurações Globais', icon: Settings },
    { id: 'permissoes', label: 'Permissões & RLS', icon: Key },
    { id: 'logs', label: 'Logs & Auditoria', icon: FileSpreadsheet, badge: 'Cirúrgico' },
    { id: 'suporte', label: 'Central de Suporte', icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl flex items-center gap-2 animate-slideIn ${
          toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR SUPER ADMIN - 100% INDEPENDENT PLATFORM BRANDING */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#0A0E1A] border-r border-indigo-900/40 
        flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Platform Identity */}
        <div className="p-6 pb-4 border-b border-indigo-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-wide text-white block truncate">
                  {localConfig.name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 block truncate">
                  {localConfig.governanceDomain}
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

        {/* Navigation Items */}
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

        {/* Bottom Sidebar */}
        <div className="p-4 border-t border-indigo-900/30 space-y-3 bg-[#070A12]/80">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-900/40 text-[11px] font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300">Cluster Supabase</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Online
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs border border-indigo-400 shrink-0">
                SA
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{user?.name || localConfig.operatorName}</span>
                <span className="text-[10px] text-slate-400 block truncate">{user?.email || localConfig.supportEmail}</span>
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
              <span className="text-indigo-400 font-semibold">{localConfig.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white font-semibold">
                {navItems.find(i => i.id === activeTab)?.label || activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
              onClick={() => setActiveTab('tenants')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-semibold text-indigo-300 flex items-center gap-1.5 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Tenants ({tenants.length})</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-8 flex-1 overflow-x-hidden">
          
          {/* TAB 1: MÉTRICAS GLOBAIS COM FILTROS E GRÁFICOS */}
          {activeTab === 'metricas_globais' && (
            <div className="space-y-8">
              {/* SaaS Overview Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-[#0E1528] to-slate-900 border border-indigo-500/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono mb-3">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Console Global Root • {localConfig.governanceDomain}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                      Métricas & Performance da Plataforma
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                      Receita recorrente (MRR), tráfego consolidado, conversão de leads e distribuição por plano contratado.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowTenantModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar Novo Tenant</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('personalizacao')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                    >
                      <Palette className="w-4 h-4 text-indigo-400" />
                      <span>Personalização</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* FILTERS BAR CONECTADO COM PLANOS E STATUS */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-900/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  <span>Filtrar Métricas:</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Filtro por Plano */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Plano:</span>
                    <select
                      value={filterPlan}
                      onChange={e => setFilterPlan(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-black/60 border border-indigo-900/60 text-white text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Todos">Todos os Planos</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.name}>{p.name} ({p.price})</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por Status */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-black/60 border border-indigo-900/60 text-white text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Todos">Todos os Status</option>
                      <option value="Ativo">Apenas Ativos</option>
                      <option value="Pendente Pagamento">Pendente Pagamento</option>
                      <option value="Desativado">Desativados</option>
                    </select>
                  </div>

                  {/* Filtro de Período */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Período:</span>
                    <select
                      value={filterPeriod}
                      onChange={e => setFilterPeriod(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-black/60 border border-indigo-900/60 text-white text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Hoje">Hoje</option>
                      <option value="Últimos 7 dias">Últimos 7 dias</option>
                      <option value="Últimos 30 dias">Últimos 30 dias</option>
                      <option value="Últimos 12 meses">Últimos 12 meses</option>
                    </select>
                  </div>

                  {(filterPlan !== 'Todos' || filterStatus !== 'Todos') && (
                    <button
                      onClick={() => { setFilterPlan('Todos'); setFilterStatus('Todos'); }}
                      className="text-xs text-indigo-400 hover:underline ml-2"
                    >
                      Limpar Filtros
                    </button>
                  )}
                </div>
              </div>

              {/* KPI CARDS DINÂMICOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tenants Filtrados</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-bold text-white font-mono">{filteredTenants.length}</div>
                  <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> {tenants.filter(t => t.status === 'Ativo').length} ativos na plataforma
                  </div>
                </div>

                <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Receita MRR Filtrada</span>
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 font-mono">
                    R$ {totalFilteredMRR.toLocaleString('pt-BR')}
                  </div>
                  <div className="mt-2 text-xs text-slate-400 font-mono">
                    {filterPlan !== 'Todos' ? `Filtrado por Plano ${filterPlan}` : 'MRR consolidado de todos os clientes'}
                  </div>
                </div>

                <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Visitas Consolidadas</span>
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-bold text-white font-mono">
                    {totalFilteredVisits.toLocaleString('pt-BR')}
                  </div>
                  <div className="mt-2 text-xs text-cyan-300 font-mono">
                    Trafegadas via Edge Cloudflare
                  </div>
                </div>

                <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Leads Convertidos</span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-purple-300 font-mono">
                    {totalFilteredLeads.toLocaleString('pt-BR')}
                  </div>
                  <div className="mt-2 text-xs text-slate-400 font-mono">
                    Taxa de conversão: {totalFilteredVisits > 0 ? ((totalFilteredLeads / totalFilteredVisits) * 100).toFixed(1) : '3.4'}%
                  </div>
                </div>
              </div>

              {/* GRÁFICOS DE PERFORMANCE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Gráfico 1: Evolução da Receita MRR (8 Colunas) */}
                <div className="lg:col-span-8 rounded-3xl bg-slate-900/80 border border-indigo-900/40 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                        <span>Evolução do MRR & Faturamento da Plataforma</span>
                      </h3>
                      <p className="text-xs text-slate-400">Histórico de receita recorrente nos últimos meses</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 font-mono">
                      +28.4% YoY
                    </span>
                  </div>

                  {/* SVG Chart */}
                  <div className="h-64 w-full pt-4">
                    <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid lines */}
                      <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                      <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                      <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

                      {/* Area Fill */}
                      <path
                        d="M 20 160 Q 120 140 220 120 T 420 70 T 580 35 L 580 180 L 20 180 Z"
                        fill="url(#mrrGradient)"
                      />

                      {/* Line */}
                      <path
                        d="M 20 160 Q 120 140 220 120 T 420 70 T 580 35"
                        fill="none"
                        stroke="#818CF8"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Data Points */}
                      {[
                        { x: 20, y: 160, val: 'R$ 14k', m: 'Abr' },
                        { x: 130, y: 138, val: 'R$ 21k', m: 'Mai' },
                        { x: 240, y: 115, val: 'R$ 28k', m: 'Jun' },
                        { x: 350, y: 92, val: 'R$ 35k', m: 'Jul' },
                        { x: 460, y: 65, val: 'R$ 41k', m: 'Ago' },
                        { x: 580, y: 35, val: 'R$ 48.5k', m: 'Set' },
                      ].map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="5" fill="#C7D2FE" stroke="#4F46E5" strokeWidth="2" />
                          <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#E0E7FF" fontSize="11" fontWeight="bold" fontFamily="monospace">
                            {pt.val}
                          </text>
                          <text x={pt.x} y="195" textAnchor="middle" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                            {pt.m}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Gráfico 2: Distribuição por Plano (4 Colunas) */}
                <div className="lg:col-span-4 rounded-3xl bg-slate-900/80 border border-indigo-900/40 p-6 space-y-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Distribuição por Plano</span>
                    </h3>
                    <p className="text-xs text-slate-400">Proporção da base de clientes por plano contratado</p>
                  </div>

                  <div className="space-y-4">
                    {plans.map((p, idx) => {
                      const count = tenants.filter(t => t.plan.toLowerCase() === p.name.toLowerCase()).length;
                      const pct = tenants.length > 0 ? Math.round((count / tenants.length) * 100) : 0;
                      const colors = [
                        'from-cyan-500 to-blue-600',
                        'from-indigo-500 to-purple-600',
                        'from-amber-400 to-amber-600',
                      ];

                      return (
                        <div key={p.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-white">{p.name} ({p.price})</span>
                            <span className="font-mono text-slate-300 font-bold">{count} tenants ({pct}%)</span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${colors[idx % colors.length]}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
                    <span className="font-bold block mb-0.5">Ticket Médio por Tenant:</span>
                    <div className="font-mono font-bold text-emerald-400 text-lg">
                      R$ {tenants.length > 0 ? Math.round(totalFilteredMRR / (filteredTenants.length || 1)) : 0} / mês
                    </div>
                  </div>
                </div>

              </div>

              {/* Tenants Quick Table */}
              <div className="rounded-3xl bg-slate-900/70 border border-indigo-900/30 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-400" />
                      <span>Tenants Conectados ({filteredTenants.length})</span>
                    </h2>
                    <p className="text-xs text-slate-400">Instâncias ativas sob governança da plataforma</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('tenants')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                  >
                    Gerenciar Tenants →
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
                      {filteredTenants.map(tenant => (
                        <tr key={tenant.id} className="hover:bg-indigo-950/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-indigo-300 font-bold">{tenant.id}</td>
                          <td className="py-3.5 px-4 font-semibold text-white">{tenant.name}</td>
                          <td className="py-3.5 px-4 text-slate-300">{tenant.nicho}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">{tenant.domain}</td>
                          <td className="py-3.5 px-4 text-slate-300 font-semibold">{tenant.plan}</td>
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
                              <a
                                href={`https://${tenant.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Visitar</span>
                              </a>
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

          {/* TAB 2: TENANTS / CLIENTES (COM MODAL DE CADASTRO REAL) */}
          {activeTab === 'tenants' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">Gestão Central de Clientes (Tenants)</h1>
                  <p className="text-xs text-slate-400">Controle completo de cada empresa cadastrada no SaaS multi-tenant.</p>
                </div>
                <button
                  onClick={() => setShowTenantModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Tenant</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tenants.map(tenant => (
                  <div key={tenant.id} className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 space-y-4 hover:border-indigo-500/40 transition-all shadow-xl">
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
                      <span className="text-slate-400 truncate">
                        Admin: <code className="text-slate-300 font-mono">{tenant.adminEmail}</code>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`https://${tenant.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Visitar Site</span>
                        </a>

                        <button
                          onClick={() => handleToggleTenantStatus(tenant.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            tenant.status === 'Ativo'
                              ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                          }`}
                        >
                          {tenant.status === 'Ativo' ? 'Desativar' : 'Reativar'}
                        </button>

                        <button
                          onClick={() => handleDeleteTenant(tenant.id, tenant.name)}
                          title="Excluir Tenant"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NICHOS DE MERCADO (COM CRUD: EDITAR, INSERIR, EXCLUIR) */}
          {activeTab === 'nichos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">Nichos de Mercado Suportados</h1>
                  <p className="text-xs text-slate-400">Cadastre novos segmentos comerciais para a plataforma SaaS.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingNicho(null);
                    setNichoForm({ name: '', icon: '💼', desc: '' });
                    setShowNichoModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Nicho</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nichos.map(nicho => (
                  <div key={nicho.id} className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="text-3xl p-2 rounded-xl bg-black/40 border border-white/5 w-fit mb-3">
                          {nicho.icon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingNicho(nicho);
                              setNichoForm({ name: nicho.name, icon: nicho.icon, desc: nicho.desc || '' });
                              setShowNichoModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-600/20 transition-colors"
                            title="Editar Nicho"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNicho(nicho.id, nicho.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Excluir Nicho"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white">{nicho.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{nicho.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-indigo-900/30 text-xs text-slate-400 flex items-center justify-between font-mono">
                      <span>Tenants ativos:</span>
                      <strong className="text-indigo-300">
                        {tenants.filter(t => t.nicho.toLowerCase().includes(nicho.name.toLowerCase().split(' ')[0])).length}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TEMPLATES DE SITES (COM CRUD: EDITAR, INSERIR, EXCLUIR) */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">Templates de Sites por Nicho</h1>
                  <p className="text-xs text-slate-400">Modelos prontos de alta conversão para cada segmento de cliente.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTemplate(null);
                    setTemplateForm({ name: '', nicho: nichos[0]?.name || 'Fotografia & Cinema', version: '1.0.0', status: 'Ativo', previewUrl: '' });
                    setShowTemplateModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Template</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map(tpl => (
                  <div key={tpl.id} className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40 font-bold">
                          {tpl.nicho}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">v{tpl.version}</span>
                          <button
                            onClick={() => {
                              setEditingTemplate(tpl);
                              setTemplateForm({ name: tpl.name, nicho: tpl.nicho, version: tpl.version, status: tpl.status, previewUrl: tpl.previewUrl || '' });
                              setShowTemplateModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-600/20"
                            title="Editar Template"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20"
                            title="Excluir Template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white">{tpl.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">Status: <strong className="text-emerald-400">{tpl.status}</strong></p>
                    </div>

                    <div className="pt-3 border-t border-indigo-900/30 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono">ID: {tpl.id}</span>
                      {tpl.previewUrl && (
                        <a
                          href={tpl.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-400 hover:underline font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir Demonstração</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MÓDULOS DA PLATAFORMA (COM EXPLICAÇÃO E GESTÃO) */}
          {activeTab === 'modulos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">Módulos da Plataforma SaaS</h1>
                  <p className="text-xs text-slate-400">Catálogo de recursos e ferramentas que podem ser ativadas para os tenants.</p>
                </div>
                <button
                  onClick={() => setShowModuleModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Módulo</span>
                </button>
              </div>

              {/* Box Educativo: O que é e como funciona */}
              <div className="p-6 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <span>O que são e qual a finalidade dos "Módulos da Plataforma"?</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <strong className="text-white block">1. Monetização & Upsell:</strong>
                    <p className="text-slate-400">Permite criar planos diferenciados. O plano Starter só tem CRM; o plano Pro libera WhatsApp e Agenda; o Enterprise libera Contratos e Financeiro.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <strong className="text-white block">2. Feature Flags em Tempo Real:</strong>
                    <p className="text-slate-400">Você pode ligar ou desligar qualquer módulo para um tenant específico com um clique, sem precisar alterar código ou redeployar o sistema.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <strong className="text-white block">3. Especialização por Nicho:</strong>
                    <p className="text-slate-400">Um fotógrafo precisa de Portfólio e Agenda de Ensaios; uma clínica médica precisa de Prontuário; um advogado precisa de Minutas e Processos.</p>
                  </div>
                </div>
              </div>

              {/* Lista dos Módulos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map(mod => (
                  <div key={mod.id} className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-5 flex flex-col justify-between space-y-3 hover:border-indigo-500/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-indigo-400 uppercase bg-indigo-950 px-2 py-0.5 rounded font-bold border border-indigo-800/40">
                          {mod.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                          Disponível
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">{mod.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{mod.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>Código: {mod.id}</span>
                      <span className="text-indigo-300">Multi-Tenant</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PERSONALIZAÇÃO & WHITE-LABEL (ITEM SOLICITADO PELO USUÁRIO) */}
          {activeTab === 'personalizacao' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Personalização & White-Label Root</h1>
                <p className="text-xs text-slate-400">Ajuste o nome da sua plataforma SaaS, logotipo, domínio e cores corporativas.</p>
              </div>

              {configSaveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>✓ Identidade visual e parâmetros White-Label salvos com sucesso! As alterações foram sincronizadas.</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form Col (7 Colunas) */}
                <div className="lg:col-span-7 rounded-3xl bg-slate-900/80 border border-indigo-900/30 p-6 sm:p-8 space-y-5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-indigo-900/40 pb-3">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <span>Identidade Visual do Super Admin</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Nome Oficial da Plataforma *
                    </label>
                    <input
                      type="text"
                      value={localConfig.name}
                      onChange={e => setLocalConfig({ ...localConfig, name: e.target.value })}
                      placeholder="Ex: NexCore SaaS Platform"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-indigo-900/60 text-white text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">Aparece no topo da sidebar, no login e nas notificações.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Slogan / Tagline Institucional
                    </label>
                    <input
                      type="text"
                      value={localConfig.tagline}
                      onChange={e => setLocalConfig({ ...localConfig, tagline: e.target.value })}
                      placeholder="Ex: Gestão Central de Tenants & Infraestrutura Multi-Empresa"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-indigo-900/60 text-white text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Domínio de Governança
                      </label>
                      <input
                        type="text"
                        value={localConfig.governanceDomain}
                        onChange={e => setLocalConfig({ ...localConfig, governanceDomain: e.target.value })}
                        placeholder="negocios.nascimento.com.br"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-indigo-900/60 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        E-mail de Suporte / Contato Root
                      </label>
                      <input
                        type="email"
                        value={localConfig.supportEmail}
                        onChange={e => setLocalConfig({ ...localConfig, supportEmail: e.target.value })}
                        placeholder="negociosadm.nascimento@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-indigo-900/60 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Nome do Operador Root
                    </label>
                    <input
                      type="text"
                      value={localConfig.operatorName}
                      onChange={e => setLocalConfig({ ...localConfig, operatorName: e.target.value })}
                      placeholder="Direção Geral (Super Admin)"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-indigo-900/60 text-white text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Cor Primária */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Cor Primária do Super Admin
                    </label>
                    <div className="flex items-center gap-3">
                      {['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setLocalConfig({ ...localConfig, primaryColor: color })}
                          className={`w-8 h-8 rounded-xl border-2 transition-all ${
                            localConfig.primaryColor === color ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input
                        type="text"
                        value={localConfig.primaryColor}
                        onChange={e => setLocalConfig({ ...localConfig, primaryColor: e.target.value })}
                        className="px-3 py-1 rounded-xl bg-black/50 border border-indigo-900/60 text-xs font-mono text-white w-24 text-center"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-indigo-900/30 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isSavingConfig}
                      onClick={handleSaveConfig}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isSavingConfig ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Salvando Identidade...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Salvar Personalização</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Preview Col (5 Colunas) */}
                <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-indigo-900/30 p-6 sm:p-8 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-indigo-900/40 pb-3">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>Pré-visualização da Sua Marca</span>
                  </h3>

                  <div className="p-4 rounded-2xl bg-[#0A0E1A] border border-indigo-500/40 space-y-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-2xl p-0.5 flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: localConfig.primaryColor }}
                      >
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">{localConfig.name}</span>
                        <span className="text-[10px] font-mono text-indigo-300 block">{localConfig.governanceDomain}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 italic">"{localConfig.tagline}"</p>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Operador:</span>
                        <strong className="text-white">{localConfig.operatorName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contato Oficial:</span>
                        <strong className="text-indigo-300 font-mono">{localConfig.supportEmail}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
                    <p className="font-semibold mb-1">💡 Isolamento de Marca 100%:</p>
                    <p className="text-slate-400">O seu ambiente Super Admin é totalmente independente. Nenhum cliente/tenant enxerga essas telas ou os dados de outras empresas.</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: USUÁRIOS & OPERADORES */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Usuários & Operadores Cadastrados</h1>
                <p className="text-xs text-slate-400">Níveis de acesso root e administradores de cada tenant.</p>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 space-y-4">
                <div className="p-4 rounded-xl bg-black/40 border border-indigo-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                      SA
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">{localConfig.operatorName}</span>
                      <span className="text-xs text-indigo-300 font-mono">{user?.email || localConfig.supportEmail}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    Root / Super Admin
                  </span>
                </div>

                {tenants.map(t => (
                  <div key={t.id} className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm">
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">{t.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{t.adminEmail}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Tenant Admin ({t.id})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: PLANOS & ASSINATURAS (COM CRUD: EDITAR, INSERIR, EXCLUIR) */}
          {activeTab === 'planos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">Planos SaaS & Assinaturas MRR</h1>
                  <p className="text-xs text-slate-400">Configure preços, limites e termos de cada plano comercial.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setPlanForm({ name: '', price: 'R$ 497', priceNum: 497, period: '/mês', storage: '50 GB', leadsLimit: 'Ilimitado', highlight: false });
                    setShowPlanModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Plano</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(p => {
                  const assignedCount = tenants.filter(t => t.plan.toLowerCase() === p.name.toLowerCase()).length;
                  return (
                    <div key={p.id} className={`rounded-2xl bg-slate-900/80 border p-6 space-y-4 relative flex flex-col justify-between ${
                      p.highlight ? 'border-indigo-500 shadow-xl shadow-indigo-600/20' : 'border-indigo-900/30'
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-white">{p.name}</h3>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingPlan(p);
                                setPlanForm({ name: p.name, price: p.price, priceNum: p.priceNum || 0, period: p.period, storage: p.storage, leadsLimit: p.leadsLimit, highlight: p.highlight });
                                setShowPlanModal(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-600/20"
                              title="Editar Plano"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePlan(p.id, p.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20"
                              title="Excluir Plano"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-3xl font-bold text-emerald-400 font-mono">
                          {p.price} <span className="text-xs text-slate-400 font-sans">{p.period}</span>
                        </div>

                        <div className="text-xs text-slate-300 space-y-2 border-t border-white/10 pt-4 mt-4">
                          <p>Tenants assinantes: <strong className="text-white">{assignedCount} empresas</strong></p>
                          <p>Armazenamento: <strong className="text-white">{p.storage}</strong></p>
                          <p>Limite de Leads: <strong className="text-white">{p.leadsLimit}</strong></p>
                        </div>
                      </div>

                      {p.highlight && (
                        <div className="pt-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded w-fit block">
                            ★ Plano Recomendado
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 9: DOMÍNIOS CUSTOMIZADOS */}
          {activeTab === 'dominios' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Domínios Customizados & Certificados SSL</h1>
                <p className="text-xs text-slate-400">Status de apontamento CNAME e certificados SSL de cada instância.</p>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-indigo-950/40 border-b border-indigo-900/30 text-slate-400 font-mono">
                    <tr>
                      <th className="py-3.5 px-4">Domínio</th>
                      <th className="py-3.5 px-4">Instância / Tenant</th>
                      <th className="py-3.5 px-4">Certificado SSL</th>
                      <th className="py-3.5 px-4">Roteamento DNS</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-900/20">
                    {DEFAULT_DOMAINS.map((d, i) => (
                      <tr key={i} className="hover:bg-indigo-950/30">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{d.domain}</td>
                        <td className="py-3.5 px-4 text-slate-300">{d.tenant}</td>
                        <td className="py-3.5 px-4 text-emerald-300 font-mono">{d.ssl}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">{d.dns}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            d.status === 'Conectado' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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

          {/* TAB 10: CONFIGURAÇÕES GLOBAIS (COM VALIDAÇÃO E FEEDBACK VISUAL DE SALVAR) */}
          {activeTab === 'configuracoes' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Configurações Globais & Segurança da Infraestrutura</h1>
                <p className="text-xs text-slate-400">Parâmetros de isolamento, backups automáticos e segurança root.</p>
              </div>

              {configSaveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>✓ Configurações Globais salvas com sucesso! Parâmetros aplicados a toda a infraestrutura.</span>
                </div>
              )}

              <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 sm:p-8 space-y-6 max-w-3xl shadow-xl">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Domínio Oficial do Super Admin
                  </label>
                  <input
                    type="text"
                    value={localConfig.governanceDomain}
                    onChange={e => setLocalConfig({...localConfig, governanceDomain: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-indigo-900/60 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Acesso restrito sem vínculo com nenhum tenant.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    E-mail Central de Notificações do Sistema
                  </label>
                  <input
                    type="email"
                    value={localConfig.supportEmail}
                    onChange={e => setLocalConfig({...localConfig, supportEmail: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-indigo-900/60 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5">
                    <div>
                      <span className="text-sm font-bold text-white block">Políticas RLS (Row Level Security) Ativas</span>
                      <span className="text-xs text-slate-400">Garante que nenhum tenant leia dados de outro no banco de dados</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={localConfig.strictRLS}
                      onChange={e => setLocalConfig({...localConfig, strictRLS: e.target.checked})}
                      className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5">
                    <div>
                      <span className="text-sm font-bold text-white block">Backups Automáticos Diários</span>
                      <span className="text-xs text-slate-400">Snapshots criptografados da base de dados e arquivos</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={localConfig.autoBackupDaily}
                      onChange={e => setLocalConfig({...localConfig, autoBackupDaily: e.target.checked})}
                      className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5">
                    <div>
                      <span className="text-sm font-bold text-white block">Modo Manutenção Global</span>
                      <span className="text-xs text-slate-400">Desativa temporariamente o acesso de clientes para updates</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={localConfig.maintenanceMode}
                      onChange={e => setLocalConfig({...localConfig, maintenanceMode: e.target.checked})}
                      className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-indigo-900/30 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSavingConfig}
                    onClick={handleSaveConfig}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSavingConfig ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Salvando Parâmetros...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Salvar Parâmetros Globais</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: PERMISSÕES & RLS */}
          {activeTab === 'permissoes' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Matriz de Permissões & Isolamento RLS</h1>
              <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 space-y-4">
                <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200">
                  <p className="font-bold mb-1">🔐 Isolamento de Dados por Tenant ID no Supabase (Row Level Security):</p>
                  <p>Cada consulta SQL executa com o filtro obrigatório <code>WHERE tenant_id = auth.jwt() -&gt; 'tenant_id'</code>.</p>
                  <p className="mt-2 text-emerald-300">O Super Admin opera como Root com permissão para auditoria, migração e governança sem restrições de tenant.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: LOGS & AUDITORIA */}
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

          {/* TAB 13: SUPORTE */}
          {activeTab === 'suporte' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Central de Suporte aos Clientes</h1>
              <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/30 p-6 text-center py-12">
                <LifeBuoy className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">Nenhum chamado urgente pendente</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Todos os {tenants.length} tenants estão operando normalmente com 100% de disponibilidade.
                </p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: CADASTRAR NOVO TENANT (SUBSTITUINDO O ALERT) */}
      {showTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 sm:p-8 shadow-2xl relative text-white">
            <button
              onClick={() => setShowTenantModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif text-white">Cadastrar Novo Tenant</h2>
                <p className="text-xs text-slate-400">Adicione uma nova empresa cliente na infraestrutura SaaS</p>
              </div>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Empresa / Tenant *</label>
                <input
                  type="text"
                  required
                  value={tenantFormData.name}
                  onChange={e => setTenantFormData({ ...tenantFormData, name: e.target.value })}
                  placeholder="Ex: Studio Lumina Fotos"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nicho de Mercado *</label>
                  <select
                    value={tenantFormData.nicho}
                    onChange={e => setTenantFormData({ ...tenantFormData, nicho: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {nichos.map(n => (
                      <option key={n.id} value={n.name}>{n.icon} {n.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plano SaaS *</label>
                  <select
                    value={tenantFormData.plan}
                    onChange={e => setTenantFormData({ ...tenantFormData, plan: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.name}>{p.name} ({p.price})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Domínio Oficial ou Subdomínio *</label>
                <input
                  type="text"
                  required
                  value={tenantFormData.domain}
                  onChange={e => setTenantFormData({ ...tenantFormData, domain: e.target.value })}
                  placeholder="Ex: studiolumina.com.br"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail do Administrador *</label>
                  <input
                    type="email"
                    required
                    value={tenantFormData.adminEmail}
                    onChange={e => setTenantFormData({ ...tenantFormData, adminEmail: e.target.value })}
                    placeholder="admin@studiolumina.com.br"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp de Contato</label>
                  <input
                    type="text"
                    value={tenantFormData.phone}
                    onChange={e => setTenantFormData({ ...tenantFormData, phone: e.target.value })}
                    placeholder="(21) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status Inicial</label>
                <select
                  value={tenantFormData.status}
                  onChange={e => setTenantFormData({ ...tenantFormData, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Ativo">Ativo (Acesso Liberado)</option>
                  <option value="Pendente Pagamento">Pendente Pagamento</option>
                  <option value="Em Implantação">Em Implantação</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-indigo-900/30">
                <button
                  type="button"
                  onClick={() => setShowTenantModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Cadastrar Tenant</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CRIAR / EDITAR NICHO */}
      {showNichoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 shadow-2xl relative text-white">
            <button onClick={() => setShowNichoModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold font-serif mb-1">
              {editingNicho ? 'Editar Nicho de Mercado' : 'Adicionar Novo Nicho'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Configure o segmento atendido pela sua plataforma.</p>

            <form onSubmit={handleSaveNicho} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Emoji / Ícone</label>
                  <input
                    type="text"
                    required
                    value={nichoForm.icon}
                    onChange={e => setNichoForm({ ...nichoForm, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-center text-xl text-white"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Nicho *</label>
                  <input
                    type="text"
                    required
                    value={nichoForm.name}
                    onChange={e => setNichoForm({ ...nichoForm, name: e.target.value })}
                    placeholder="Ex: Imobiliárias & Corretores"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={nichoForm.desc}
                  onChange={e => setNichoForm({ ...nichoForm, desc: e.target.value })}
                  placeholder="Breve resumo das empresas atendidas..."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowNichoModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Salvar Nicho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CRIAR / EDITAR TEMPLATE */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 shadow-2xl relative text-white">
            <button onClick={() => setShowTemplateModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold font-serif mb-1">
              {editingTemplate ? 'Editar Template de Site' : 'Adicionar Novo Template'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Cadastre um modelo de layout disponível para os clientes.</p>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Template *</label>
                <input
                  type="text"
                  required
                  value={templateForm.name}
                  onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Ex: Dark Executive Pro"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nicho Associado</label>
                  <select
                    value={templateForm.nicho}
                    onChange={e => setTemplateForm({ ...templateForm, nicho: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-xs"
                  >
                    {nichos.map(n => (
                      <option key={n.id} value={n.name}>{n.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Versão</label>
                  <input
                    type="text"
                    value={templateForm.version}
                    onChange={e => setTemplateForm({ ...templateForm, version: e.target.value })}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">URL de Demonstração / Preview</label>
                <input
                  type="text"
                  value={templateForm.previewUrl}
                  onChange={e => setTemplateForm({ ...templateForm, previewUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Salvar Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CRIAR / EDITAR PLANO */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 shadow-2xl relative text-white">
            <button onClick={() => setShowPlanModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold font-serif mb-1">
              {editingPlan ? 'Editar Plano SaaS' : 'Adicionar Novo Plano'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Defina o preço, limites de leads e armazenamento do plano.</p>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Plano *</label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="Ex: Scale"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preço (R$) *</label>
                  <input
                    type="text"
                    required
                    value={planForm.price}
                    onChange={e => setPlanForm({ ...planForm, price: e.target.value })}
                    placeholder="R$ 497"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-sm font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Armazenamento</label>
                  <input
                    type="text"
                    value={planForm.storage}
                    onChange={e => setPlanForm({ ...planForm, storage: e.target.value })}
                    placeholder="Ex: 50 GB"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Limite de Leads</label>
                  <input
                    type="text"
                    value={planForm.leadsLimit}
                    onChange={e => setPlanForm({ ...planForm, leadsLimit: e.target.value })}
                    placeholder="Ex: Ilimitado"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-white/5">
                <input
                  type="checkbox"
                  id="planHighlight"
                  checked={planForm.highlight}
                  onChange={e => setPlanForm({ ...planForm, highlight: e.target.checked })}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <label htmlFor="planHighlight" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Destacar este plano como "Mais Popular / Recomendado"
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CADASTRAR NOVO MÓDULO */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 shadow-2xl relative text-white">
            <button onClick={() => setShowModuleModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold font-serif mb-1">Cadastrar Novo Módulo</h3>
            <p className="text-xs text-slate-400 mb-4">Adicione uma nova funcionalidade ao catálogo do SaaS.</p>

            <form onSubmit={handleAddModule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Módulo *</label>
                <input
                  type="text"
                  required
                  value={moduleForm.name}
                  onChange={e => setModuleForm({ ...moduleForm, name: e.target.value })}
                  placeholder="Ex: Disparador de E-mails em Massa"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria *</label>
                <select
                  value={moduleForm.category}
                  onChange={e => setModuleForm({ ...moduleForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-xs"
                >
                  <option value="Core">Core (Essencial)</option>
                  <option value="CRM">CRM (Vendas & Clientes)</option>
                  <option value="Marketing">Marketing & Conversão</option>
                  <option value="Operações">Operações & Agenda</option>
                  <option value="Financeiro">Financeiro & Pagamentos</option>
                  <option value="Comunicação">Comunicação & Mensageria</option>
                  <option value="Custom">Customizado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Finalidade / Descrição</label>
                <textarea
                  rows={2}
                  value={moduleForm.desc}
                  onChange={e => setModuleForm({ ...moduleForm, desc: e.target.value })}
                  placeholder="Explique o que esta ferramenta oferece ao cliente..."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Salvar Módulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
