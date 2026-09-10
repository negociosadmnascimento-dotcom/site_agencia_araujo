import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Globe, Users, UserCheck, Calendar, FileText, 
  History, MessageSquareQuote, Image, Inbox, MessageCircle, 
  CreditCard, FileCheck, LogOut, ExternalLink, Menu, 
  X, ChevronRight, Palette, CheckCircle2
} from 'lucide-react';
import { useAuth, DEFAULT_TENANT_SETTINGS } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

// Module Components
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
  const { user, logout, logActivity } = useAuth();
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState({ leads: 0, sessions: 0, forms: 0 });

  useEffect(() => {
    const updateCounts = async () => {
      try {
        const deletedLeadIds = JSON.parse(localStorage.getItem('admin_deleted_lead_ids') || '[]');
        const deletedFormIds = JSON.parse(localStorage.getItem('admin_forms_deleted_ids') || '[]');
        const readIds = JSON.parse(localStorage.getItem('admin_forms_read_ids') || '[]');
        const sessions = JSON.parse(localStorage.getItem('admin_sessions') || '[]');
        const confirmed = sessions.filter(s => (s.status || '').toLowerCase().includes('confirmado')).length;

        // Leads deduplicados
        let cloudLeads = [];
        if (isSupabaseConfigured && supabase) {
          try {
            const { data } = await supabase.from('leads').select('id, telefone');
            if (data) cloudLeads = data;
          } catch (_) {}
        }
        const localLeads = JSON.parse(localStorage.getItem('admin_leads') || '[]');
        const normalizePhone = (p) => (p || '').replace(/\D/g, '');
        const seenPhones = new Set();
        const seenLeadIds = new Set();
        let leadCount = 0;

        for (const l of [...cloudLeads, ...localLeads]) {
          if (!l || !l.id) continue;
          const idStr = String(l.id);
          const phone = normalizePhone(l.telefone || l.phone);
          if (deletedLeadIds.includes(idStr)) continue;
          if (seenLeadIds.has(idStr)) continue;
          if (phone && seenPhones.has(phone)) continue;
          seenLeadIds.add(idStr);
          if (phone) seenPhones.add(phone);
          leadCount++;
        }

        // Formulários não lidos deduplicados
        let cloudForms = [];
        if (isSupabaseConfigured && supabase) {
          try {
            const { data } = await supabase.from('form_submissions').select('id, phone, read');
            if (data) cloudForms = data;
          } catch (_) {}
        }
        const localForms = JSON.parse(localStorage.getItem('site_form_submissions') || '[]');
        const seenFormPhones = new Set();
        const seenFormIds = new Set();
        let unreadForms = 0;

        for (const f of [...cloudForms, ...localForms]) {
          if (!f || !f.id) continue;
          const idStr = String(f.id);
          const rawId = idStr.replace('sb_', '');
          const phone = normalizePhone(f.phone);
          if (deletedFormIds.includes(idStr) || deletedFormIds.includes(rawId)) continue;
          if (seenFormIds.has(idStr) || seenFormIds.has(rawId)) continue;
          if (phone && seenFormPhones.has(phone)) continue;
          seenFormIds.add(idStr);
          seenFormIds.add(rawId);
          if (phone) seenFormPhones.add(phone);

          const isRead = readIds.includes(idStr) || readIds.includes(rawId) || Boolean(f.read);
          if (!isRead) unreadForms++;
        }

        // Lembrete da Esteira: Clientes que concluíram a contratação mas ainda não têm data agendada
        const contracts = JSON.parse(localStorage.getItem('admin_contracts') || '[]');
        const explicitPending = JSON.parse(localStorage.getItem('admin_pending_schedules') || '[]');
        const dismissedReminders = JSON.parse(localStorage.getItem('admin_dismissed_schedule_reminders') || '[]');

        const scheduledUids = new Set(sessions.map(s => s.universalId).filter(Boolean));
        const scheduledNames = new Set(sessions.map(s => (s.client || '').toLowerCase().trim()));

        const pendingReminders = [];
        const seenScheduleUids = new Set();

        for (const p of explicitPending) {
          if (!p || !p.clientName) continue;
          const uid = p.universalId || p.id;
          if (dismissedReminders.includes(uid)) continue;
          if (scheduledUids.has(uid) || scheduledNames.has((p.clientName || '').toLowerCase().trim())) continue;
          if (seenScheduleUids.has(uid)) continue;
          seenScheduleUids.add(uid);
          pendingReminders.push(p);
        }

        for (const ctr of contracts) {
          if (!ctr || !ctr.clientName) continue;
          const uid = ctr.universalId || ctr.contractNumber;
          if (dismissedReminders.includes(uid)) continue;
          if (scheduledUids.has(uid) || scheduledNames.has((ctr.clientName || '').toLowerCase().trim())) continue;
          if (seenScheduleUids.has(uid)) continue;
          seenScheduleUids.add(uid);
          pendingReminders.push(ctr);
        }

        setCounts({
          leads: leadCount,
          sessions: confirmed,
          forms: unreadForms,
          pendingSchedule: pendingReminders.length,
        });
      } catch (_) {}
    };
    updateCounts();
    const handleStorage = () => updateCounts();
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(updateCounts, 5000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // The 13 photography tenant modules + Customization
  const navigationGroups = [
    {
      group: 'Visão Geral & Site',
      items: [
        { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'site', label: 'Conf. Institucional', icon: Globe },
      ]
    },
    {
      group: 'Comercial & Atendimento',
      items: [
        { 
          id: 'leads', 
          label: 'Leads (Funil)', 
          icon: UserCheck, 
          badge: counts.leads > 0 ? `${counts.leads} lead(s)` : null, 
          badgeColor: 'bg-gold/20 text-gold-300 border-gold/30' 
        },
        { id: 'clientes', label: 'Clientes', icon: Users },
        { 
          id: 'agenda', 
          label: 'Agenda de Ensaios', 
          icon: Calendar, 
          badge: counts.pendingSchedule > 0 
            ? `${counts.pendingSchedule} a agendar` 
            : (counts.sessions > 0 ? `${counts.sessions} confirmados` : null), 
          badgeColor: counts.pendingSchedule > 0 
            ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20 animate-pulse font-bold' 
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
        },
        { id: 'propostas', label: 'Propostas Comerciais', icon: FileText },
        { id: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle, badge: 'Online', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
        { 
          id: 'formulários', 
          label: 'Formulários Recebidos', 
          icon: Inbox,
          badge: counts.forms > 0 ? `${counts.forms} novo(s)` : null,
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        },
      ]
    },
    {
      group: 'Portfólio & Prova Social',
      items: [
        { id: 'portfólio', label: 'Portfólio & Fotos', icon: Image },
        { id: 'depoimentos', label: 'Depoimentos', icon: MessageSquareQuote },
        { id: 'histórico', label: 'Histórico de Ensaios', icon: History },
      ]
    },
    {
      group: 'Financeiro & Jurídico',
      items: [
        { id: 'pagamentos', label: 'Pagamentos Recebidos', icon: CreditCard },
        { id: 'contratos', label: 'Contratos de Ensaios', icon: FileCheck },
      ]
    },
    {
      group: 'Configuração da Agência',
      items: [
        { id: 'personalizar', label: 'Personalizar Agência', icon: Palette, badge: 'Identidade', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
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
      case 'personalizar':
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

      {/* SIDEBAR TENANT ADMIN - 100% AGÊNCIA ARAÚJO BRANDING */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-[#0A0E17] to-black 
        border-r border-gold/20 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Branding (Agência Araújo) */}
        <div className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={DEFAULT_TENANT_SETTINGS.logo}
                alt={DEFAULT_TENANT_SETTINGS.name}
                className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              />
              <div className="min-w-0">
                <span className="text-sm font-serif font-bold tracking-wider text-white block truncate">
                  AGÊNCIA ARAÚJO
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-300 block truncate">
                  Painel Administrativo
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

          {/* Business Status Pill */}
          <div className="mt-4 p-2.5 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white font-serif">
                Agência Ativa
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-300 bg-white/[0.05] px-2 py-0.5 rounded border border-white/10">
              Plano Pro
            </span>
          </div>
        </div>

        {/* Navigation Items (The 13 Modules) */}
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                      isActive
                        ? 'bg-white/[0.08] text-white font-semibold border-l-2 border-[#D4AF37] pl-3.5 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${item.badgeColor || 'bg-white/[0.05] border-white/10 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Sidebar: Tenant Admin Profile & Official Site */}
        <div className="p-4 border-t border-white/5 space-y-3 bg-black/40">
          {/* User info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatar || DEFAULT_TENANT_SETTINGS.logo}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border border-gold/40 bg-black/50"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{user?.name || 'Agência Araújo'}</span>
                <span className="text-[10px] text-slate-400 block truncate">{user?.email || 'admin@agenciasaraujo.com.br'}</span>
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
            <span>Visitar Site</span>
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
              <span className="text-gold font-serif">Agência Araújo</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white font-semibold capitalize">{activeModule}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModule('personalizar')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold-300 text-xs font-semibold transition-colors"
            >
              <Palette className="w-3.5 h-3.5 text-gold" />
              <span>Personalizar Marca</span>
            </button>

            <button
              onClick={onBackToSite}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gold" />
              <span className="hidden sm:inline">Visitar Site</span>
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
