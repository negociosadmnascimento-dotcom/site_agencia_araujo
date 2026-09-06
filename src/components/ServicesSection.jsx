import React from 'react';
import { Baby, Camera, Wine, Video, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { CONTACT_INFO } from '../config/contact';

export default function ServicesSection() {
  const serviceCards = [
    {
      id: "newborn",
      title: "Newborn",
      category: "Bebês & Maternidade",
      image: "/images/portfolio-newborn.png",
      icon: Baby,
      tag: "Segurança Certificada",
      description: "Sessões delicadas realizadas nos primeiros dias de vida (5 a 20 dias). Ambiente 100% higienizado, climatizado e com técnicas fisiológicas de posicionamento seguro.",
      features: [
        "Acessórios, mantas e figurinos inclusos",
        "Ambiente aquecido com ruído branco relaxante",
        "Participação dos pais e irmãozinhos",
        "Fotos com alta precisão e pós-produção artística"
      ]
    },
    {
      id: "ensaios",
      title: "Ensaios Exclusivos",
      category: "Feminino, Moda & Gestante",
      image: "/images/portfolio-fashion.png",
      icon: Camera,
      tag: "Autoestima & Estilo",
      description: "Direção de poses acolhedora e iluminação de cinema em estúdio ou externa. Perfeito para celebrar fases marcantes, aniversários, 15 anos e gestação.",
      features: [
        "Consultoria de figurino e conceito visual",
        "Direção leve sem poses desconfortáveis",
        "Iluminação criativa (estúdio dramático ou luz natural)",
        "Galeria online privativa para seleção"
      ]
    },
    {
      id: "eventos",
      title: "Casamentos & Eventos",
      category: "Celebrações RJ",
      image: "/images/portfolio-casamento.png",
      icon: Wine,
      tag: "Memórias Vivas",
      description: "Cobertura completa e discreta de casamentos, formaturas, batizados e eventos corporativos no Rio de Janeiro. Registramos a emoção real sem interferir no fluxo da festa.",
      features: [
        "Making of, cerimônia e recepção completa",
        "Fotos dos detalhes, alianças e convidados",
        "Equipe sintonizada e pontual",
        "Prévia rápida para redes sociais em até 48h"
      ]
    },
    {
      id: "videomaker",
      title: "Vídeo Maker Cinematográfico",
      category: "Audiovisual & Reels",
      image: "/images/profile-photographer.png",
      icon: Video,
      tag: "Edição de Cinema",
      description: "Produções audiovisuais dinâmicas com lentes cinematográficas, captação de áudio cristalina, teasers de impacto para Instagram e documentários emocionantes.",
      features: [
        "Filmagens em 4K com color grading profissional",
        "Teasers verticais otimizados para Reels e TikTok",
        "Trilha sonora licenciada e edição rítmica",
        "Cobertura com múltiplos ângulos"
      ]
    }
  ];

  return (
    <section id="servicos" className="py-24 relative overflow-hidden w-full bg-white dark:bg-transparent transition-colors duration-300">
      {/* Background radial */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-gold-glow pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 dark:bg-gold/15 border border-amber-300/80 dark:border-gold/30 text-amber-950 dark:text-gold-300 text-xs font-bold uppercase tracking-widest mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-gold" />
            <span>Nossas Especialidades Oficiais</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Serviços com a Assinatura <span className="gold-text">Agências Araújo</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Conheça as áreas de atuação em destaque, executadas com amor à arte e perfeccionismo técnico.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceCards.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="rounded-3xl overflow-hidden glass-card border border-stone-200 dark:border-slate-800 hover:border-gold-500/50 transition-all duration-300 group flex flex-col justify-between shadow-lg"
              >
                {/* Image Header */}
                <div className="relative h-64 overflow-hidden bg-slate-900">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />

                  {/* Badges on image */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-dark-950 bg-gold px-3 py-1 rounded-full shadow-md">
                      {service.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                    <div>
                      <span className="text-xs uppercase font-mono tracking-wider text-gold-300 block mb-1">
                        {service.category}
                      </span>
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2 font-display">
                        <Icon className="w-6 h-6 text-gold" />
                        {service.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-2.5 mb-8">
                      {service.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-gold-600 dark:text-gold shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <a
                      href="#orcamento"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md shadow-gold/20"
                    >
                      <span>Solicitar Proposta</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>

                    <a
                      href={`https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(`Olá, Agências Araújo! Gostaria de um orçamento para o serviço de ${service.title}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 fill-emerald-500 dark:fill-emerald-400" />
                      <span>Dúvidas via WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

