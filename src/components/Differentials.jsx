import React from 'react';
import { HeartHandshake, Smile, Tag, Award, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { CONTACT_INFO } from '../config/contact';

export default function Differentials() {
  const differentials = [
    {
      id: 1,
      title: "Abordagem Emocional & Descontraída",
      tag: "Conexão Real",
      description: "Criamos um ambiente leve e espontâneo para que cada riso e olhar sejam naturais. Sem poses forçadas: eternizamos a sua essência com verdade e sentimento.",
      icon: Smile,
      color: "from-amber-500/20 to-gold-500/20",
      accent: "text-amber-400",
    },
    {
      id: 2,
      title: "Foco Total na Experiência do Cliente",
      tag: "Cuidado de Ponta a Ponta",
      description: "Acolhimento desde o primeiro alinhamento de expectativas, orientação em figurino e locações, até a entrega final em altíssima resolução com acabamento primoroso.",
      icon: HeartHandshake,
      color: "from-sky-500/20 to-blue-500/20",
      accent: "text-sky-400",
    },
    {
      id: 3,
      title: "Vantagens & Ofertas Exclusivas",
      tag: "Condições Especiais",
      description: "Ofertas exclusivas durante os ensaios, vantagens para reservas antecipadas e pacotes flexíveis pensados para você ter todas as suas memórias favoritas.",
      icon: Tag,
      color: "from-purple-500/20 to-pink-500/20",
      accent: "text-purple-400",
    },
    {
      id: 4,
      title: "Equipe Capacitada & Acolhedora",
      tag: "Segurança & Maestria",
      description: "Profissionais qualificados com domínio de iluminação de estúdio, direção afetiva e manuseio seguro de recém-nascidos, proporcionando total tranquilidade.",
      icon: Award,
      color: "from-emerald-500/20 to-teal-500/20",
      accent: "text-emerald-400",
    },
  ];

  return (
    <section id="diferenciais" className="relative py-24 bg-stone-50/60 dark:bg-dark-900/60 overflow-hidden border-y border-stone-200 dark:border-slate-800/60 w-full transition-colors duration-300">
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-gold-glow pointer-events-none -z-10" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-50 dark:bg-gold/10 border border-gold-300 dark:border-gold/30 text-gold-800 dark:text-gold-light text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-600 dark:text-gold" />
            <span>Por que escolher a Agências Araújo?</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Nossos <span className="gold-text">Diferenciais</span> de Excelência
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Mais do que simples cliques: criamos uma vivência memorável e personalizada para você e sua família no Rio de Janeiro.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {differentials.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative rounded-2xl glass-card p-7 transition-all duration-300 hover:-translate-y-2 hover:border-gold-500/50 hover:shadow-2xl flex flex-col justify-between"
              >
                {/* Accent glow on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-dark-950/80 border border-stone-200 dark:border-white/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform shadow-sm">
                      <Icon className={`w-6 h-6 ${item.accent}`} />
                    </div>
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-stone-100 dark:bg-white/5 px-2.5 py-1 rounded-md">
                      0{item.id}
                    </span>
                  </div>

                  <span className={`text-xs font-semibold tracking-wider uppercase ${item.accent} block mb-2`}>
                    {item.tag}
                  </span>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-gold-700 dark:group-hover:text-gold-light transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200 dark:border-white/5 flex items-center gap-1.5 text-xs font-medium text-gold-700 dark:text-gold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Padrão Oficial Agências Araújo</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlight Banner featuring original lens visual (Anexo 1) */}
        <div className="relative rounded-3xl overflow-hidden border border-stone-200 dark:border-gold-500/30 bg-white dark:bg-dark-950 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Visual side */}
            <div className="lg:col-span-6 relative h-80 sm:h-96 lg:h-[420px] overflow-hidden bg-slate-900">
              <img
                src="/images/photographer-camera.png"
                alt="Agências Araújo - Fotografia Profissional em Ação"
                className="w-full h-full object-cover object-top sm:object-center transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dark-950/30 to-dark-950 lg:block hidden dark:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent lg:hidden block dark:block" />
            </div>

            {/* Content side */}
            <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col items-start">
              <span className="text-xs uppercase font-mono tracking-widest text-gold-700 dark:text-gold-300 mb-2 font-semibold">
                Compromisso com o Seu Momento
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">
                Sua história merece ser contada com arte e perfeição.
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Cada ensaio é planejado de forma individual, respeitando o seu tempo, o ritmo dos bebês e a emoção dos noivos e convidados.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#orcamento"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 transition-all"
                >
                  <span>Agendar Consulta de Orçamento</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent("Olá! Vi os diferenciais da Agências Araújo e gostaria de tirar algumas dúvidas sobre os pacotes.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 hover:text-dark-950 dark:hover:text-white text-xs font-semibold uppercase tracking-wider border border-stone-300 dark:border-slate-700 transition-all hover:border-emerald-500/50 shadow-sm"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 fill-emerald-500 dark:fill-emerald-400" />
                  <span>Tirar Dúvidas no WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

