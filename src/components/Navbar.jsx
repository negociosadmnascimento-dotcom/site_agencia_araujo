import React, { useState, useEffect } from 'react';
import { Instagram, Menu, X, Sun, Moon } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { CONTACT_INFO } from '../config/contact';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#inicio' },
    { name: 'Diferenciais', href: '#diferenciais' },
    { name: 'Serviços', href: '#servicos' },
    { name: 'Portfólio', href: '#portfolio' },
    { name: 'Agenda', href: '#agenda' },
    { name: 'Sobre Nós', href: '#sobre' },
    { name: 'Orçamento', href: '#orcamento' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-dark-950/95 backdrop-blur-md border-b border-stone-200 dark:border-gold-500/20 py-2.5 shadow-lg dark:shadow-2xl'
          : 'bg-gradient-to-b from-[#FAF9F6] dark:from-dark-950 via-[#FAF9F6]/80 dark:via-dark-950/70 to-transparent py-4'
      }`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-between">
        {/* Logo sem fundo com suporte a modo Claro e Escuro */}
        <a href="#inicio" className="flex items-center gap-3 group" title="Agências Araújo - Início">
          <div className="relative flex items-center">
            <img
              src="/images/logo-butterfly-dark.png"
              alt="Agências Araújo"
              className="h-11 sm:h-13 md:h-14 w-auto object-contain dark:hidden transition-transform duration-300 group-hover:scale-105"
            />
            <img
              src="/images/logo-butterfly-white.png"
              alt="Agências Araújo"
              className="h-11 sm:h-13 md:h-14 w-auto object-contain hidden dark:block transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]"
            />
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-6 xl:space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold transition-colors px-3 py-2 rounded-md hover:bg-stone-100 dark:hover:bg-white/5 relative group"
            >
              {link.name}
              <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </a>
          ))}
        </nav>

        {/* Actions (Instagram & WhatsApp & Theme Toggle) */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={CONTACT_INFO.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Siga no Instagram @agenciasaraujo"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:text-dark-950 dark:hover:text-white bg-stone-100 hover:bg-stone-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-stone-300/80 dark:border-slate-700/60 hover:border-gold-500/40 rounded-full transition-all duration-300 shadow-sm"
          >
            <Instagram className="w-4 h-4 text-pink-500 dark:text-pink-400" />
            <span>@agenciasaraujo</span>
          </a>

          <a
            href={`https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(CONTACT_INFO.whatsapp.defaultMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-dark-950 bg-gold-gradient hover:brightness-110 rounded-full shadow-lg shadow-gold/20 transition-all duration-300 hover:scale-105"
          >
            <WhatsAppIcon className="w-4 h-4 text-dark-950 fill-dark-950" />
            <span>Falar no WhatsApp</span>
          </a>

          {/* Botão Lua/Sol suave ao lado direito do botão WhatsApp */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label={isDark ? "Mudar para Modo Claro (Sol)" : "Mudar para Modo Escuro (Lua)"}
            title={isDark ? "Mudar para Modo Claro (Sol)" : "Mudar para Modo Escuro (Lua)"}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-stone-300 dark:border-slate-700/80 hover:border-gold-500/60 text-slate-700 dark:text-gold transition-all duration-300 hover:scale-110 shadow-sm group"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-gold-300 group-hover:text-gold transition-transform duration-500 rotate-0 group-hover:rotate-90" />
            ) : (
              <Moon className="w-4 h-4 text-slate-800 group-hover:text-gold-700 transition-transform duration-500 -rotate-12 group-hover:rotate-0" />
            )}
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
            title={isDark ? "Modo Claro (Sol)" : "Modo Escuro (Lua)"}
            className="p-2 rounded-full bg-stone-100 dark:bg-slate-900/80 border border-stone-300 dark:border-slate-700 text-slate-700 dark:text-gold transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-slate-800" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-dark-950 dark:hover:text-white transition-colors"
            aria-label="Alternar Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9F6]/98 dark:bg-dark-900/98 backdrop-blur-xl border-b border-stone-200 dark:border-gold-500/20 px-6 py-6 transition-all duration-300 shadow-2xl">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-800 dark:text-slate-200 hover:text-gold-600 dark:hover:text-gold py-2 border-b border-stone-200/60 dark:border-white/5"
              >
                {link.name}
              </a>
            ))}

            <div className="pt-4 flex flex-col gap-3">
              <a
                href={CONTACT_INFO.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-800 dark:text-white bg-stone-100 hover:bg-stone-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-stone-300 dark:border-slate-700 rounded-xl"
              >
                <Instagram className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                <span>Instagram @agenciasaraujo</span>
              </a>

              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(CONTACT_INFO.whatsapp.defaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-dark-950 bg-gold-gradient rounded-xl shadow-lg"
              >
                <WhatsAppIcon className="w-4 h-4 text-dark-950 fill-dark-950" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
