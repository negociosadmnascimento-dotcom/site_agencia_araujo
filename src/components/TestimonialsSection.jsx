import React, { useState, useEffect } from 'react';
import { Star, MessageSquareQuote, ZoomIn, X, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { INITIAL_TESTIMONIALS } from './admin/modules/TestimonialsModule';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_testimonials');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Apenas os aprovados no painel admin
          const approved = parsed.filter(t => t.approved !== false);
          if (approved.length > 0) {
            setTestimonials(approved);
          }
        }
      }
    } catch (_) {}
  }, []);

  return (
    <section id="depoimentos" className="py-24 bg-gradient-to-b from-[#FAF9F6] via-white to-[#FAF9F6] dark:from-dark-950 dark:via-[#080B11] dark:to-dark-950 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 dark:bg-gold-500/10 border border-gold/30 text-gold-700 dark:text-gold-300 text-xs font-mono mb-4 uppercase tracking-widest">
            <MessageSquareQuote className="w-3.5 h-3.5 text-gold-500" />
            <span>Prova Social & Transparência Real</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Depoimentos Reais de <span className="text-gradient-gold italic">Clientes Satisfeitos</span>
          </h2>

          <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Nada fala mais alto do que a satisfação autêntica de quem confiou suas memórias, ensaios e produções à Agências Araújo. Veja conversas e relatos espontâneos.
          </p>

          <div className="flex items-center justify-center gap-6 mt-6 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Prints 100% Verificados</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
              <span>5.0 de Avaliação Média</span>
            </span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl bg-white dark:bg-[#0E131F] border border-stone-200 dark:border-white/[0.08] p-6 shadow-xl dark:shadow-2xl hover:border-gold/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Badge WhatsApp vs Rating */}
                <div className="flex items-center justify-between mb-4">
                  {t.type === 'whatsapp_print' ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-green-500" />
                      <span>Conversa Real no WhatsApp</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                      ))}
                    </div>
                  )}

                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {t.date || 'Cliente Verificado'}
                  </span>
                </div>

                {/* WhatsApp Print Image with Zoom */}
                {t.type === 'whatsapp_print' && t.image ? (
                  <div 
                    onClick={() => setZoomImage(t.image)}
                    className="relative rounded-2xl overflow-hidden bg-slate-950 border border-stone-200 dark:border-white/10 group-hover:border-gold/40 transition-all cursor-pointer mb-5 shadow-inner"
                  >
                    <img
                      src={t.image}
                      alt={`Depoimento de ${t.name} no WhatsApp`}
                      className="w-full h-80 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-[2px]">
                      <ZoomIn className="w-4 h-4 text-gold" />
                      <span>Clique para Ler em Tela Cheia</span>
                    </div>

                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-mono flex items-center gap-1">
                      <ZoomIn className="w-3 h-3 text-gold" />
                      <span>Toque para Ampliar</span>
                    </div>
                  </div>
                ) : null}

                {/* Quote Text */}
                {(t.quote || t.text) && (
                  <div className="relative mb-4">
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic font-serif">
                      "{t.quote || t.text}"
                    </p>
                  </div>
                )}
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-stone-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {t.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.role} • <span className="text-gold-600 dark:text-gold-400 font-medium">{t.event}</span>
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-gold/10 dark:bg-gold-500/10 border border-gold/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-gold-500 fill-gold-500/30" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">
            Quer viver uma experiência inesquecível e receber fotos extraordinárias?
          </p>
          <a
            href="#orcamento"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Solicitar Meu Orçamento Personalizado</span>
          </a>
        </div>

      </div>

      {/* Lightbox Zoom Modal for Mobile and Desktop */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-md cursor-pointer animate-fade-in"
        >
          <div className="relative max-w-md w-full max-h-[95vh] flex flex-col items-center">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              title="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomImage}
              alt="Print ampliado do WhatsApp"
              className="max-h-[85vh] w-auto rounded-3xl shadow-2xl border border-white/20 object-contain"
            />
            <span className="text-xs text-slate-400 mt-3 font-mono">Toque em qualquer lugar para fechar</span>
          </div>
        </div>
      )}
    </section>
  );
}
