import React from 'react';
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

export default function App() {
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

