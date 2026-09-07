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
import { Shield, Sparkles } from 'lucide-react';

export default function App() {
  const { isAuthenticated, isSuperAdmin, user } = useAuth();
  
  // Determine initial view from URL
  const getInitialView = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/admin' || hash === '#admin') {
      return 'admin';
    }
    if (path === '/login' || hash === '#login') {
      return 'login';
    }
    return 'site';
  };

  const [currentView, setCurrentView] = useState(getInitialView);

  // Sync with browser history and popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getInitialView());
    };

    const handleCustomNavigate = (e) => {
      if (e.detail) {
        navigateTo(e.detail);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('navigate-view', handleCustomNavigate);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('navigate-view', handleCustomNavigate);
    };
  }, []);

  // If user is authenticated and is on login screen, redirect to admin
  useEffect(() => {
    if (isAuthenticated && currentView === 'login') {
      navigateTo('admin');
    }
  }, [isAuthenticated, currentView]);

  const navigateTo = (view) => {
    setCurrentView(view);
    const targetUrl = view === 'site' ? '/' : `/${view}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({ view }, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. RENDER ADMIN LAYOUT IF IN ADMIN VIEW
  if (currentView === 'admin') {
    if (!isAuthenticated) {
      return <LoginView onBackToSite={() => navigateTo('site')} />;
    }
    return <AdminLayout onBackToSite={() => navigateTo('site')} />;
  }

  // 2. RENDER LOGIN VIEW IF IN LOGIN VIEW
  if (currentView === 'login') {
    return <LoginView onBackToSite={() => navigateTo('site')} />;
  }

  // 3. RENDER PUBLIC SITE
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-dark-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-gold-500 selection:text-black transition-colors duration-300">
      
      {/* If admin is logged in, show floating fast-access badge to return to Admin */}
      {isAuthenticated && (
        <div className="fixed top-20 right-4 z-40">
          <button
            onClick={() => navigateTo('admin')}
            className="px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-gold-300 border border-gold/40 shadow-xl shadow-gold/10 backdrop-blur-md text-xs font-mono font-bold flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-gold" />
            <span>Painel {isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
          </button>
        </div>
      )}

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
