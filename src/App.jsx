import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Differentials from './components/Differentials';
import ServicesSection from './components/ServicesSection';
import PortfolioSection from './components/PortfolioSection';
import ScheduleSection from './components/ScheduleSection';
import AboutSection from './components/AboutSection';
import InstagramSection from './components/InstagramSection';
import QuoteForm from './components/QuoteForm';
import TestimonialsSection from './components/TestimonialsSection';
import WhatsAppFloat from './components/WhatsAppFloat';
import Footer from './components/Footer';

// Admin & Super Admin Components
import LoginView from './components/admin/LoginView';
import AdminLayout from './components/admin/AdminLayout';
import SuperAdminLayout from './components/superadmin/SuperAdminLayout';
import ContractAcceptanceView from './components/ContractAcceptanceView';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAuthenticated, isSuperAdmin, isTenantAdmin, user } = useAuth();
  
  // Determine initial view from URL path
  const getInitialView = () => {
    const hostname = window.location.hostname.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // 1. Dedicated Super Admin Governance Domain (negocios.nascimento.com.br)
    if (hostname.includes('nascimento.com.br') || hostname === 'negocios.nascimento.com.br') {
      return 'super_admin';
    }

    // 2. Dedicated Super Admin Path
    if (path.startsWith('/super-admin') || path.startsWith('/superadmin') || hash === '#super-admin') {
      return 'super_admin';
    }

    // 3. Dedicated Tenant Admin Path
    if (path.startsWith('/admin') || path.startsWith('/gestao-admin') || hash === '#admin') {
      return 'admin';
    }

    // 4. Digital Contract Acceptance View (Client Token)
    if (path.startsWith('/contrato') || hash.startsWith('#contrato')) {
      return 'contrato';
    }

    // 5. Default: 100% Public Site (no admin buttons or traces)
    return 'site';
  };

  const [currentView, setCurrentView] = useState(getInitialView);

  // Sync with browser history and popstate, plus automatic one-time purge of legacy demo seeds
  useEffect(() => {
    // 1. One-time purge of legacy demo entries from browser localStorage
    try {
      const PURGE_KEY = 'agencia_demo_purged_v2';
      if (!localStorage.getItem(PURGE_KEY)) {
        const DEMO_IDS = [
          'lead_01', 'lead_02', 'lead_03', 'lead_04', 
          'sample_01', 'sample_02', 
          'sess_01', 'sess_02', 'sess_03', 'sess_04', 'sess_05', 
          'pay_01', 'pay_02', 'pay_03', 'pay_04', 
          'ctr_01', 'ctr_02', 'ctr_03', 
          'cli_01', 'cli_02', 'cli_03', 'cli_04', 'cli_05'
        ];
        const DEMO_NAMES = [
          'Camila Mendonça', "Diretoria Hospital Copa D'Or", 'Restaurante Fogo & Brasa Barra', 'Beatriz & Guilherme',
          'Dr. Roberto Silveira', 'Mariana & Lucas Alencar', 'Le Vin Bistrô & Bar', 'SAFRA Produções Rio',
          'Chef Rodrigo Guimarães'
        ];

        ['admin_leads', 'site_form_submissions', 'admin_sessions', 'admin_payments', 'admin_contracts', 'admin_clients'].forEach(key => {
          try {
            const items = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(items)) {
              const cleaned = items.filter(item => {
                if (!item) return false;
                if (DEMO_IDS.includes(item.id)) return false;
                if (item.name && DEMO_NAMES.includes(item.name)) return false;
                if (item.client && DEMO_NAMES.includes(item.client)) return false;
                if (item.clientName && DEMO_NAMES.includes(item.clientName)) return false;
                return true;
              });
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          } catch (_) {}
        });
        localStorage.setItem(PURGE_KEY, 'done');
      }
    } catch (_) {}

    // 2. Limpeza e deduplicação única para o navegador local
    try {
      const DEDUP_KEY = 'agencia_dedup_cleanup_v3';
      if (!localStorage.getItem(DEDUP_KEY)) {
        const deletedLeadIds = JSON.parse(localStorage.getItem('admin_deleted_lead_ids') || '[]');
        const deletedFormIds = JSON.parse(localStorage.getItem('admin_forms_deleted_ids') || '[]');
        const normalize = (p) => (p || '').replace(/\D/g, '');

        // Deduplica leads locais
        const leads = JSON.parse(localStorage.getItem('admin_leads') || '[]');
        const seenLeadPhones = new Set();
        const cleanLeads = [];
        for (const l of leads) {
          if (!l || !l.id || deletedLeadIds.includes(String(l.id))) continue;
          const phone = normalize(l.phone);
          if (phone && seenLeadPhones.has(phone)) continue;
          if (phone) seenLeadPhones.add(phone);
          cleanLeads.push(l);
        }
        localStorage.setItem('admin_leads', JSON.stringify(cleanLeads));

        // Deduplica formulários locais
        const forms = JSON.parse(localStorage.getItem('site_form_submissions') || '[]');
        const seenFormPhones = new Set();
        const cleanForms = [];
        for (const f of forms) {
          if (!f || !f.id || deletedFormIds.includes(String(f.id))) continue;
          const phone = normalize(f.phone);
          if (phone && seenFormPhones.has(phone)) continue;
          if (phone) seenFormPhones.add(phone);
          cleanForms.push(f);
        }
        localStorage.setItem('site_form_submissions', JSON.stringify(cleanForms));

        // Deduplica clientes locais
        const clients = JSON.parse(localStorage.getItem('admin_clients') || '[]');
        const seenClientPhones = new Set();
        const cleanClients = [];
        for (const c of clients) {
          if (!c || !c.id) continue;
          const phone = normalize(c.phone);
          if (phone && seenClientPhones.has(phone)) continue;
          if (phone) seenClientPhones.add(phone);
          cleanClients.push(c);
        }
        localStorage.setItem('admin_clients', JSON.stringify(cleanClients));

        localStorage.setItem(DEDUP_KEY, 'done');
      }
    } catch (_) {}

    // 3. Handle popstate
    const handlePopState = () => {
      setCurrentView(getInitialView());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    let targetUrl = '/';
    if (view === 'super_admin') targetUrl = '/super-admin';
    if (view === 'admin') targetUrl = '/admin';

    if (window.location.pathname !== targetUrl) {
      window.history.pushState({ view }, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. RENDER SUPER ADMIN VIEW (SEPARATE LINK: /super-admin)
  if (currentView === 'super_admin') {
    // Only super_admin role is allowed into SuperAdminLayout
    if (!isAuthenticated || user?.role !== 'super_admin') {
      return <LoginView portalMode="super_admin" onBackToSite={() => navigateTo('site')} />;
    }
    return <SuperAdminLayout onBackToSite={() => navigateTo('site')} />;
  }

  // 2. RENDER ADMIN VIEW (SEPARATE LINK: /admin)
  if (currentView === 'admin') {
    if (!isAuthenticated) {
      return <LoginView portalMode="admin" onBackToSite={() => navigateTo('site')} />;
    }
    return <AdminLayout onBackToSite={() => navigateTo('site')} />;
  }

  // 3. RENDER DIGITAL CONTRACT ACCEPTANCE VIEW (LINK: /contrato/:token)
  if (currentView === 'contrato') {
    return <ContractAcceptanceView onBackToSite={() => navigateTo('site')} />;
  }

  // 4. RENDER 100% PUBLIC SITE (COMPLETELY CLEAN - ZERO ADMIN BUTTONS/BADGES)
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-dark-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-gold-500 selection:text-black transition-colors duration-300">
      {/* Header Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <HeroSection />
        <Differentials />
        <ServicesSection />
        <PortfolioSection />
        <ScheduleSection />
        <TestimonialsSection />
        <AboutSection />
        <InstagramSection />
        <QuoteForm />
      </main>

      {/* Permanent Floating WhatsApp CTA */}
      <WhatsAppFloat />

      {/* Footer */}
      <Footer />
    </div>
  );
}
