import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Differentials from './components/Differentials';
import ServicesSection from './components/ServicesSection';
import PortfolioSection from './components/PortfolioSection';
import AboutSection from './components/AboutSection';
import InstagramSection from './components/InstagramSection';
import QuoteForm from './components/QuoteForm';
import WhatsAppFloat from './components/WhatsAppFloat';
import Footer from './components/Footer';

// Admin Components
import LoginView from './components/admin/LoginView';
import AdminLayout from './components/admin/AdminLayout';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { isAuthenticated, isSuperAdmin, loginAs } = useAuth();
  
  // Determine initial view from URL path
  const getInitialView = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // 1. Dedicated Super Admin Secret Path
    if (path.startsWith('/super-admin') || path.startsWith('/superadmin') || hash === '#super-admin') {
      return 'super_admin';
    }

    // 2. Dedicated Admin Operador Secret Path
    if (path.startsWith('/admin') || path.startsWith('/gestao-admin') || hash === '#admin') {
      return 'admin';
    }

    // 3. Default: 100% Public Site (no admin traces)
    return 'site';
  };

  const [currentView, setCurrentView] = useState(getInitialView);

  // Sync with browser history and popstate
  useEffect(() => {
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
    if (!isAuthenticated) {
      return <LoginView portalMode="super_admin" onBackToSite={() => navigateTo('site')} />;
    }
    return <AdminLayout onBackToSite={() => navigateTo('site')} />;
  }

  // 2. RENDER ADMIN VIEW (SEPARATE LINK: /admin)
  if (currentView === 'admin') {
    if (!isAuthenticated) {
      return <LoginView portalMode="admin" onBackToSite={() => navigateTo('site')} />;
    }
    return <AdminLayout onBackToSite={() => navigateTo('site')} />;
  }

  // 3. RENDER 100% PUBLIC SITE (COMPLETELY CLEAN - ZERO ADMIN BUTTONS/BADGES)
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
