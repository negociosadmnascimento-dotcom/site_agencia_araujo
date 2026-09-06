import React from 'react';
import { Camera, ShieldCheck, Clock, Award, Heart, Sparkles, MapPin } from 'lucide-react';
import { CONTACT_INFO } from '../config/contact';

export default function AboutSection() {
  const pillars = [
    {
      title: "Sensibilidade & Afeto",
      desc: "Um olhar humano que entende que cada cliente traz um sonho, um sentimento e uma expectativa única.",
      icon: Heart,
    },
    {
      title: "Segurança Certificada",
      desc: "Especialmente em sessões newborn e gestantes, todo o manuseio obedece a rigorosos critérios de higiene e conforto.",
      icon: ShieldCheck,
    },
    {
      title: "Equipamentos de Cinema",
      desc: "Câmeras de altíssima definição, ótica de ponta e iluminação modeladora para nitidez inigualável.",
      icon: Camera,
    },
    {
      title: "Pontualidade & Compromisso",
      desc: "Prazos cumpridos com rigor, entregas de prévias ágeis e atendimento atencioso em todas as etapas.",
      icon: Clock,
    }
  ];

  return (
    <section id="sobre" className="py-24 relative overflow-hidden w-full">
      {/* Background Lighting */}
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gold-glow pointer-events-none -z-10" />

      {/* 100% full width responsive container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Official Logo Card enlarged and stretched to exact same height */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative rounded-3xl overflow-hidden glass-card border border-gold-500/40 p-6 sm:p-8 md:p-10 shadow-2xl bg-dark-950 flex flex-col justify-between items-center text-center h-full">
              
              {/* Subtle top ambient glow */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/25 rounded-full blur-3xl pointer-events-none" />

              {/* Header inside card */}
              <div className="w-full flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-gold-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  Identidade Oficial
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full">
                  Agências Araújo
                </span>
              </div>

              {/* Official Logo Display - Enlarged and occupying full div */}
              <div className="relative w-full flex-1 flex items-center justify-center py-6 px-2 my-auto">
                <img
                  src="/images/logo-transparent.png"
                  alt="Logo Oficial Agências Araújo"
                  className="w-full max-h-[380px] object-contain drop-shadow-[0_15px_35px_rgba(212,175,55,0.3)] transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Bottom Details */}
              <div className="w-full pt-4 border-t border-white/10">
                <p className="font-script text-2xl sm:text-3xl text-gold-300 mb-3 drop-shadow-sm">
                  "{CONTACT_INFO.tagline}"
                </p>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-4">
                  Marca consolidada no Rio de Janeiro, unindo arte, técnica e emoção na criação de acervos visuais que permanecem vivos por gerações.
                </p>

                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 bg-dark-900/90 border border-slate-800 px-4 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  <span>Rio de Janeiro • RJ</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Mission and Pillars */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-light text-xs font-semibold uppercase tracking-widest mb-4">
                <Award className="w-3.5 h-3.5 text-gold" />
                <span>Nossa Essência</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
                Mais que fotos, eternizamos <span className="gold-text">o que faz o seu coração bater</span> mais forte.
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">
                A <strong>Agências Araújo</strong> nasceu da paixão por eternizar momentos irrepetíveis. Sabemos que os primeiros dias de um bebê passam em um piscar de olhos, que um casamento é a celebração de uma vida inteira e que cada pessoa carrega uma beleza singular que merece ser revelada com respeito e estilo.
              </p>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-8">
                Nosso diferencial reside no acolhimento caloroso e no profissionalismo absoluto. Nossos ensaios não são rotinas mecânicas: são momentos prazerosos, descontraídos e emocionantes onde você se sente verdadeiramente à vontade.
              </p>
            </div>

            {/* 4 Pillars Mini-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-4">
              {pillars.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl bg-dark-900/80 border border-slate-800 hover:border-gold-500/30 transition-all flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center text-gold shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
