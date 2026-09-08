import React, { useState } from 'react';
import { 
  Building, Users, ShieldCheck, Database, TrendingUp, 
  Palette, History, LogOut, ExternalLink, Menu, X, ChevronRight, Eye 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SUPABASE_PROJECT_ID } from '../../lib/supabase';

// Super Admin Modules
import PlatformOverviewModule from './modules/PlatformOverviewModule';
import AdminClientsModule from './modules/AdminClientsModule';
import AdminPerformanceModule from './modules/AdminPerformanceModule';
import HistoryModule from '../admin/modules/HistoryModule';
import SuperAdminCustomizerModule from './modules/SuperAdminCustomizerModule';
import InfrastructureModule from './modules/InfrastructureModule';

export default function SuperAdminLayout({ onBackToSite }) {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState('visao_geral');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clientToCustomize, setClientToCustomize] = useState(null);

  const navItems = [
    { id: 'visao_geral', label: 'Visão Geral Plataforma', icon: Building },
    { id: 'gestao_admins', label: 'Gestão de Admins (Clientes)', icon: Users, badge: 'Contas' },
    { id: 'performance', label: 'Desempenho & Performance', icon: TrendingUp },
    { id: 'auditoria', label: 'Auditoria de Uso dos Admins', icon: History, badge: 'Forense' },
    { id: 'personalizacao', label: 'Personalização & Whitelabel', icon: Palette },
    { id: 'infraestrutura', label: 'Banco Supabase & Segurança', icon: Database, badge: 'RLS 100%' },
  ];

  const handleOpenCustomizerForClient = (client) => {
    setClientToCustomize(client);
    setActiveModule('personalizacao');
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'visao_geral':
        return <PlatformOverviewModule onNavigate={(mod) => setActiveModule(mod)} />;
      case 'gestao_admins':
        return <AdminClientsModule onOpenCustomizer={handleOpenCustomizerForClient} />;
      case 'performance':
        return <AdminPerformanceModule />;
      case 'auditoria':
        return <HistoryModule />;
      case 'personalizacao':
        return <SuperAdminCustomizerModule initialClient={clientToCustomize} />;
      case 'infraestrutura':
        return <InfrastructureModule />;
      default:
        return <PlatformOverviewModule onNavigate={(mod) => setActiveModule(mod)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 flex selection:bg-gold-500 selection:text-black">
      
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SUPER ADMIN SIDEBAR (DEDICATED PLATINUM & GOLD EXECUTIVE) */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-[#0A0E17] via-[#06080C] to-black 
        border-r border-gold/30 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-butterfly-white.png"
                alt="Agências Araújo"
                className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              />
              <div>
                <span className="text-sm font-display font-bold tracking-wider text-white block">
                  DIREÇÃO GERAL
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-300">
                  Super Admin • Controle Total
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

          {/* Super Admin Status */}
          <div className="mt-4 p-2 rounded-xl bg-gold/10 border border-gold/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-bold text-gold-300 uppercase font-mono">
                Super Administrador
              </span>
            </div>
            <span className="text-[10px] font-mono text-gold-400 bg-gold/20 px-2 py-0.5 rounded font-bold">
              Nível Master
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
          <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block mb-2">
            Módulos da Plataforma
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gold-gradient text-dark-950 font-bold shadow-lg shadow-gold/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-dark-950' : 'text-gold'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    isActive ? 'bg-black/20 text-dark-950 border-black/30' : 'bg-gold/15 text-gold-300 border-gold/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Sidebar */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-black/40">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-gold" />
              <span className="text-slate-300">{SUPABASE_PROJECT_ID}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
              Pronto
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                alt="Super Admin"
                className="w-8 h-8 rounded-full object-cover border border-gold/50"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{user?.name || 'Direção Geral'}</span>
                <span className="text-[10px] text-slate-400 block truncate">{user?.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sair do painel"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onBackToSite}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors border border-white/5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gold" />
            <span>Ver Site Oficial</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-4 sm:px-8 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-gold font-semibold">Super Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white font-semibold">
                {navItems.find(n => n.id === activeModule)?.label || 'Visão Geral'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-gold" />
              <span className="hidden sm:inline">Ver Site Oficial</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-8 flex-1 overflow-x-hidden">
          {renderModule()}
        </main>
      </div>

    </div>
  );
}
