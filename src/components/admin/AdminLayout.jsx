import React, { useState } from 'react';
import { 
  LayoutDashboard, Globe, Users, UserCheck, Calendar, FileText, 
  History, MessageSquareQuote, Image, Inbox, MessageCircle, 
  CreditCard, FileCheck, LogOut, ExternalLink, Menu, 
  X, ChevronRight, Sparkles, User, Palette, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Module Components for the Admin
import DashboardModule from './modules/DashboardModule';
import SiteModule from './modules/SiteModule';
import ClientsModule from './modules/ClientsModule';
import LeadsModule from './modules/LeadsModule';
import ScheduleModule from './modules/ScheduleModule';
import ProposalsModule from './modules/ProposalsModule';
import HistoryModule from './modules/HistoryModule';
import TestimonialsModule from './modules/TestimonialsModule';
import PortfolioModule from './modules/PortfolioModule';
import FormsInboxModule from './modules/FormsInboxModule';
import WhatsAppModule from './modules/WhatsAppModule';
import PaymentsModule from './modules/PaymentsModule';
import ContractsModule from './modules/ContractsModule';
import CustomizationModule from './modules/CustomizationModule';

export default function AdminLayout({ onBackToSite }) {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The modules of the Admin (Operational Agency)
  const navigationGroups = [
    {
      group: 'Visão Geral',
      items: [
        { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'site', label: 'Site', icon: Globe },
      ]
    },
    {
      group: 'Comercial & CRM',
      items: [
        { id: 'clientes', label: 'Clientes', icon: Users },
        { id: 'leads', label: 'Leads', icon: UserCheck },
        { id: 'agenda', label: 'Agenda', icon: Calendar },
        { id: 'propostas', label: 'Propostas', icon: FileText },
      ]
    },
    {
      group: 'Operacional & Conteúdo',
      items: [
        { id: 'histórico', label: 'Histórico Operacional', icon: History },
        { id: 'depoimentos', label: 'Depoimentos', icon: MessageSquareQuote },
        { id: 'portfólio', label: 'Portfólio', icon: Image },
        { 
          id: 'formulários', 
          label: 'Formulários', 
          icon: Inbox, 
          badge: '1 novo',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        },
        { 
          id: 'WhatsApp', 
          label: 'WhatsApp', 
          icon: MessageCircle, 
          badge: 'Online',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        },
      ]
    },
    {
      group: 'Financeiro & Jurídico',
      items: [
        { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
        { id: 'contratos', label: 'Contratos', icon: FileCheck },
      ]
    },
    {
      group: 'Identidade da Agência',
      items: [
        { id: 'personalizacao', label: 'Personalização', icon: Palette },
      ]
    }
  ];

  const renderCurrentModule = () => {
    switch (activeModule) {
      case 'Dashboard':
        return <DashboardModule onNavigate={(mod) => setActiveModule(mod)} />;
      case 'site':
        return <SiteModule />;
      case 'clientes':
        return <ClientsModule />;
      case 'leads':
        return <LeadsModule />;
      case 'agenda':
        return <ScheduleModule />;
      case 'propostas':
        return <ProposalsModule />;
      case 'histórico':
        return <HistoryModule />;
      case 'depoimentos':
        return <TestimonialsModule />;
      case 'portfólio':
        return <PortfolioModule />;
      case 'formulários':
        return <FormsInboxModule onNavigate={(mod) => setActiveModule(mod)} />;
      case 'WhatsApp':
        return <WhatsAppModule />;
      case 'pagamentos':
        return <PaymentsModule />;
      case 'contratos':
        return <ContractsModule />;
      case 'personalizacao':
        return <CustomizationModule />;
      default:
        return <DashboardModule onNavigate={(mod) => setActiveModule(mod)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#06080C] text-slate-100 flex selection:bg-gold-500 selection:text-black">
      
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (100% OPERATIONAL - NO SUPER ADMIN CLUES, NO DATABASE PILLS) */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-[#0A0E17] to-black 
        border-r border-gold/20 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Branding */}
        <div className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-butterfly-white.png"
                alt="Agências Araújo"
                className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              />
              <div>
                <span className="text-sm font-display font-bold tracking-wider text-white block">
                  AGÊNCIAS ARAÚJO
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-300">
                  Painel da Agência
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

          {/* Simple Operator Badge without toggle */}
          <div className="mt-4 p-2 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-white uppercase font-mono">
                Ambiente de Gestão Ativo
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
              Operador
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {navigationGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                {group.group}
              </span>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveModule(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gold-gradient text-dark-950 font-bold shadow-lg shadow-gold/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-dark-950' : 'text-gold'}`} />
                      <span className="capitalize">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        isActive ? 'bg-black/20 text-dark-950 border-black/30' : item.badgeColor
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Sidebar: Profile & View Site */}
        <div className="p-4 border-t border-white/5 space-y-3 bg-black/40">
          {/* User info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border border-gold/40"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{user?.name || 'Operador'}</span>
                <span className="text-[10px] text-slate-400 block truncate">{user?.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sair do painel"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* View Site */}
          <button
            onClick={onBackToSite}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors border border-white/5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gold" />
            <span>Ver Site Oficial</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Painel</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white font-semibold capitalize">{activeModule}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-gold" />
              <span className="hidden sm:inline">Ver Site</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-8 flex-1 overflow-x-hidden">
          {renderCurrentModule()}
        </main>
      </div>

    </div>
  );
}
