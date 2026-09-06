import React from 'react';
import { Camera, Sparkles, ArrowRight, ShieldCheck, Award, Instagram, CheckCircle2 } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { CONTACT_INFO } from '../config/contact';

export default function HeroSection() {
  return (
    <section id="inicio" className="relative min-h-screen pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden flex items-center w-full">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-glow pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-cyan-glow pointer-events-none -z-10" />
      
      {/* Lens Optical Ring Background (Anexo 1 inspiration) */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none -z-20 bg-cover bg-center bg-no-repeat mix-blend-screen scale-105 filter blur-[1px]"
        style={{ backgroundImage: `url('/images/hero-lens.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] dark:from-dark-950 via-[#FAF9F6]/80 dark:via-dark-950/85 to-transparent -z-10 transition-colors duration-300" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-50 dark:bg-gold/10 border border-gold-300 dark:border-gold/30 text-gold-800 dark:text-gold-light text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-sm shadow-sm animate-pulse-slow">
              <Sparkles className="w-3.5 h-3.5 text-gold-600 dark:text-gold" />
              <span>Agências Araújo • Fotografia & Eventos RJ</span>
            </div>

            {/* Official Tagline */}
            <p className="font-script text-3xl md:text-4xl text-gold-700 dark:text-gold-300 mb-2 drop-shadow-sm tracking-wide">
              "{CONTACT_INFO.tagline}"
            </p>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12] mb-6">
              A ARTE DE <span className="gold-text">ETERNIZAR</span> CADA DETALHE DA SUA HISTÓRIA.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl mb-8">
              Capturamos sentimentos puros com técnica de precisão, iluminação cinematográfica e atendimento acolhedor. De ensaios newborn e femininos a grandes casamentos e produções de vídeo no Rio de Janeiro.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <a
                href="#orcamento"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-wider text-dark-950 bg-gold-gradient hover:brightness-110 rounded-xl shadow-xl shadow-gold/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Solicitar Orçamento Gratuito</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(CONTACT_INFO.whatsapp.defaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-7 py-4 text-sm font-semibold text-slate-800 hover:text-dark-950 dark:text-slate-200 dark:hover:text-white bg-stone-100 hover:bg-stone-200 dark:bg-slate-900/90 dark:hover:bg-slate-800/90 border border-stone-300 dark:border-slate-700/80 hover:border-gold-500/50 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] shadow-sm"
              >
                <WhatsAppIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400 fill-emerald-500 dark:fill-emerald-400" />
                <span>Conversar no WhatsApp</span>
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-200 dark:border-slate-800/80 w-full max-w-xl">
              <div>
                <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">+500</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Momentos Eternizados</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-gold-700 dark:text-gold">100%</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Clientes Encantados</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">Rio de Janeiro</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">& Região Metropolitana</div>
              </div>
            </div>
          </div>

          {/* Right Column: Creative Visual Centerpiece (Anexo 1 & Anexo 2) */}
          <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end">
            
            {/* Visual Frame Wrapper */}
            <div className="relative w-full max-w-md">
              
              {/* Backing decorative lens glow (Anexo 1 motif) */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-gold-500/30 via-cyan-500/20 to-transparent blur-xl -z-10 animate-pulse-slow" />

              {/* Main Portrait Card (Anexo 2) */}
              <div className="relative rounded-2xl overflow-hidden glass-card border border-gold-500/30 shadow-2xl group">
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
                  <img
                    src="/images/profile-photographer.png"
                    alt="Agências Araújo - Equipe de Fotografia e Produção"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Camera Metadata Overlay (Photography aesthetic) */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-300 bg-dark-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="flex items-center gap-1.5 text-gold-300">
                      <Camera className="w-3 h-3" />
                      50mm • f/1.4
                    </span>
                    <span className="text-slate-400">ISO 100 • 1/250s</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Ao Vivo RJ
                    </span>
                  </div>

                  {/* Bottom details card inside the image */}
                  <div className="absolute bottom-4 left-4 right-4 bg-dark-900/85 backdrop-blur-lg p-4 rounded-xl border border-gold-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          Agências Araújo
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold fill-gold/20" />
                        </h4>
                        <p className="text-xs text-gold-300 font-script text-base -mt-0.5">
                          Olhar que transforma momentos
                        </p>
                      </div>
                      <a
                        href={CONTACT_INFO.instagram.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 transition-colors border border-pink-500/30"
                        title="Ver no Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge Top Right */}
              <div className="hidden sm:flex absolute -top-4 -right-4 bg-white/95 dark:bg-dark-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-200 dark:border-white/10 shadow-xl items-center gap-2">
                <Award className="w-4 h-4 text-gold-600 dark:text-gold" />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Excelência Técnica & Sensibilidade</span>
              </div>

            </div>

          </div>

        </div>

        {/* The 4 Official Pillars Strip (From Official Logo) */}
        <div className="mt-16 pt-8 border-t border-stone-200 dark:border-slate-800/80">
          <div className="text-center text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 font-semibold mb-6">
            Especialidades Oficiais da Agências Araújo
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CONTACT_INFO.services.map((srv) => (
              <a
                key={srv.id}
                href="#servicos"
                className="group p-4 rounded-xl bg-white hover:bg-stone-50 dark:bg-dark-900/60 dark:hover:bg-dark-850/80 border border-stone-200 dark:border-slate-800 hover:border-gold-500/50 transition-all duration-300 flex items-center gap-3.5 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-lg bg-gold/15 group-hover:bg-gold/25 flex items-center justify-center text-gold-700 dark:text-gold transition-colors shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold transition-colors tracking-wide">
                    {srv.title.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{srv.subtitle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

