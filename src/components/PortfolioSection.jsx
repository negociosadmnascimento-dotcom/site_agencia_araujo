import React, { useState } from 'react';
import { Camera, ZoomIn, X, Sparkles, Heart, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { CONTACT_INFO } from '../config/contact';

export default function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [selectedItem, setSelectedItem] = useState(null);

  const portfolioItems = [
    // Retratos Pessoais (3 fotos oficiais - Maracanã como capa do destaque)
    {
      id: 3,
      title: "Cobertura em Grande Escala no Maracanã",
      category: "retratos",
      categoryLabel: "Retratos Pessoais",
      image: "/images/retrato-maracana-estadio.jpg",
      tag: "Capa do Destaque • Maracanã",
      description: "Atuação dinâmica em coberturas de grande porte no icônico Estádio do Maracanã, com credenciamento oficial e equipamentos de alta performance fotográfica.",
      details: "Estádio do Maracanã • Equipamento Completo DSLR • Cobertura Dinâmica de Eventos",
      isCover: true,
      albumCount: 3,
    },
    {
      id: 1,
      title: "Cobertura de Evento com a Gente",
      category: "retratos",
      categoryLabel: "Retratos Pessoais",
      image: "/images/retrato-cobertura-equipe.jpg",
      tag: "Equipe Oficial em Ação",
      description: "Equipe Agências Araújo em ação para a cobertura completa e vibrante do seu evento no Rio de Janeiro, unindo simpatia, energia positiva e excelência técnica.",
      details: "Equipe Oficial Agências Araújo • Luz Natural Externa • Direção Acolhedora",
      isCover: false,
    },
    {
      id: 2,
      title: "Presença & Autoridade no Copacabana Palace",
      category: "retratos",
      categoryLabel: "Retratos Pessoais",
      image: "/images/retrato-copacabana-palace.jpg",
      tag: "Locação Nobre RJ",
      description: "Registro profissional na fachada do emblemático Copacabana Palace, refletindo sofisticação, simpatia e a presença marcante da Agências Araújo em grandes eventos.",
      details: "Copacabana Palace RJ • Iluminação Natural de Alta Definição • Retrato Profissional",
      isCover: false,
    },

    // Newborn (3 fotos oficiais - Anexo 1 como capa)
    {
      id: 4,
      title: "Newborn: Ternura em Manta Fúcsia",
      category: "newborn",
      categoryLabel: "Newborn & Bebês",
      image: "/images/newborn-manta-fucsia.jpg",
      tag: "Capa do Destaque • Newborn",
      description: "Registro delicado de recém-nascida adormecida em manta fúcsia aveludada sobre textura suave e pelúcia branca, com laço floral delicado e serenidade absoluta.",
      details: "Recém-Nascido • Ambiente Climatizado e Seguro • Posição Fisiológica Confortável",
      isCover: true,
      albumCount: 3,
    },
    {
      id: 7,
      title: "Newborn: Acolhimento em Tricô & Chupeta Rosa",
      category: "newborn",
      categoryLabel: "Newborn & Bebês",
      image: "/images/newborn-touca-trico.png",
      tag: "Espontaneidade & Doçura",
      description: "Bebê acordada de olhinhos atentos em casaquinho e touca de tricô artesanal off-white com detalhes em pérolas, em momento acolhedor e expressivo.",
      details: "Luz Difusa Natural • Tecidos Antialérgicos • Registro Espontâneo",
      isCover: false,
    },
    {
      id: 8,
      title: "Newborn: Doçura com Laço de Corações",
      category: "newborn",
      categoryLabel: "Newborn & Bebês",
      image: "/images/newborn-laco-coracoes.jpg",
      tag: "Sonho Cor-de-Rosa",
      description: "Ensaio temático com laço de tule rosa bordado de corações e luzes decorativas ao fundo (fairy lights), capturando a tranquilidade mágica de um sono profundo.",
      details: "Fairy Lights Bokeh • Iluminação Softbox Modeladora • Total Segurança",
      isCover: false,
    },

    // Casamentos & Eventos (3 fotos oficiais - Anexo 2 como capa)
    {
      id: 5,
      title: "Casamento: Celebração & O Grande Sim",
      category: "casamentos",
      categoryLabel: "Casamentos & Eventos",
      image: "/images/casamento-noivos-celebracao.jpg",
      tag: "Capa do Destaque • Casamento",
      description: "Noivos radiantes com braços abertos celebrando a união matrimonial, com buquê vibrante de flores vermelhas e brancas, vestido clássico com tiara e muita emoção.",
      details: "Casamento ao Ar Livre RJ • Iluminação Noturna Festiva • Cobertura Emocional Completa",
      isCover: true,
      albumCount: 3,
    },
    {
      id: 9,
      title: "Festa Infantil: O Soprar da Velinha em Família",
      category: "casamentos",
      categoryLabel: "Casamentos & Eventos",
      image: "/images/evento-aniversario-infantil.png",
      tag: "Festa & Família",
      description: "Comemoração cheia de alegria dos 2 aninhos da pequena Maria Clara com tema Turma da Mônica / Melancia, registrando a união e o amor dos pais junto à aniversariante.",
      details: "Festa de Aniversário Infantil • Cores Vibrantes • Espontaneidade & Afeto",
      isCover: false,
    },
    {
      id: 10,
      title: "15 Anos: Coreografia & Pista com Fogos Frios",
      category: "casamentos",
      categoryLabel: "Casamentos & Eventos",
      image: "/images/evento-15-anos-debutante.jpg",
      tag: "Debutante & Pista de Dança",
      description: "Momento espetacular da abertura de pista de 15 anos com coreografia de dança, debutante em destaque nos braços das amigas e efeitos especiais pirotécnicos com fogos frios (gerbs).",
      details: "Festa de 15 Anos • Iluminação Cênica & Efeitos Especiais • Registro Dinâmico",
      isCover: false,
    },

    // Ensaios & Moda (3 fotos oficiais - Anexo 3 como capa)
    {
      id: 6,
      title: "Ensaio Fashion: Atitude & Luz Âmbar",
      category: "moda",
      categoryLabel: "Ensaios & Moda",
      image: "/images/ensaio-fashion-oculos.jpg",
      tag: "Capa do Destaque • Moda",
      description: "Ensaio contemporâneo com iluminação artística em tons quentes e âmbar, destacando estilo marcante, óculos geométricos e conceito editorial moderno.",
      details: "Estúdio Agências Araújo • Iluminação Âmbar e Rim Light • 85mm f/1.8",
      isCover: true,
      albumCount: 3,
    },
    {
      id: 11,
      title: "Ensaio Gestante: Vestido Azul Fluido",
      category: "moda",
      categoryLabel: "Ensaios & Moda",
      image: "/images/ensaio-gestante-vestido-azul.jpg",
      tag: "Maternidade & Elegância",
      description: "A beleza radiante da maternidade em estúdio com vestido longo de cetim azul celeste em movimento fluido, realçando a luz e a força da mulher.",
      details: "Ensaio Gestante • Vestido Fluido • Iluminação Suave de Estúdio",
      isCover: false,
    },
    {
      id: 12,
      title: "Ensaio Gestante em Casal: Amor & Conexão",
      category: "moda",
      categoryLabel: "Ensaios & Moda",
      image: "/images/ensaio-gestante-casal.jpg",
      tag: "Amor & Cumplicidade",
      description: "Momento íntimo e afetuoso do casal acariciando a barriga em fundo preto cinematográfico, com elegância sóbria e cumplicidade verdadeira.",
      details: "Fundo Infinito Negro • Retrato de Casal • Iluminação de Contorno Rim Light",
      isCover: false,
    }
  ];

  const filters = [
    { id: 'todos', label: 'Todos os Trabalhos' },
    { id: 'moda', label: 'Ensaios & Moda' },
    { id: 'casamentos', label: 'Casamentos & Eventos' },
    { id: 'newborn', label: 'Newborn' },
    { id: 'retratos', label: 'Retratos Pessoais' },
  ];

  // Na aba "Todos os Trabalhos" mostra APENAS a foto de capa de cada destaque
  const filteredItems = activeFilter === 'todos'
    ? portfolioItems.filter(item => item.isCover)
    : portfolioItems.filter(item => item.category === activeFilter);

  // Itens para navegação no modal (dentro da mesma categoria ou lista atual)
  const categoryItems = selectedItem
    ? portfolioItems.filter(item => item.category === selectedItem.category)
    : [];

  const currentIndex = selectedItem
    ? categoryItems.findIndex(item => item.id === selectedItem.id)
    : -1;

  const handleNext = (e) => {
    e.stopPropagation();
    if (categoryItems.length <= 1) return;
    const nextIdx = (currentIndex + 1) % categoryItems.length;
    setSelectedItem(categoryItems[nextIdx]);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (categoryItems.length <= 1) return;
    const prevIdx = (currentIndex - 1 + categoryItems.length) % categoryItems.length;
    setSelectedItem(categoryItems[prevIdx]);
  };

  return (
    <section id="portfolio" className="py-24 bg-stone-100/50 dark:bg-dark-900/40 relative w-full transition-colors duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/40 text-gold-800 dark:text-gold-light text-xs font-semibold uppercase tracking-widest mb-3">
            <Camera className="w-3.5 h-3.5 text-gold" />
            <span>Nossa Galeria</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Portfólio <span className="gold-text">Agências Araújo</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {activeFilter === 'todos'
              ? "Exibindo as capas principais de cada destaque."
              : `Exibindo as produções de ${filters.find(f => f.id === activeFilter)?.label || 'destaque'}.`}
          </p>
        </div>

        {/* Filter Pills com nomes principais sem parênteses */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeFilter === f.id
                  ? 'bg-gold-gradient text-dark-950 shadow-lg shadow-gold/20 scale-105'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-stone-200 hover:border-gold-500/40 dark:bg-dark-950/80 dark:text-slate-300 dark:hover:text-white dark:border-slate-800 shadow-sm'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Portfolio Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative rounded-2xl overflow-hidden glass-card border border-slate-800/80 hover:border-gold-500/40 cursor-pointer shadow-xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-top sm:object-center transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent opacity-75 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-dark-950 bg-gold px-2.5 py-1 rounded-md shadow-md">
                    {item.categoryLabel}
                  </span>
                </div>

                {/* Zoom Icon Button */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105">
                  <ZoomIn className="w-4 h-4 text-gold" />
                </div>

                {/* Bottom Content Card */}
                <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col justify-end">
                  <span className="text-xs text-gold-300 font-medium mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold" />
                    {item.tag}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-gold-light transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {item.description}
                  </p>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Deseja ver mais ensaios e bastidores em tempo real?
          </p>
          <a
            href={CONTACT_INFO.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-900 border border-stone-300 dark:border-slate-700 hover:border-gold-500/50 text-slate-800 dark:text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-sm"
          >
            <span>Acompanhar Stories e Reels no Instagram @agenciasaraujo</span>
          </a>
        </div>

      </div>

      {/* Lightbox Modal com Navegação entre fotos */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 dark:bg-dark-950/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] overflow-y-auto bg-[#FAF9F6] dark:bg-dark-900 border border-stone-200 dark:border-gold-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-200/80 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-stone-300 dark:hover:bg-white/20 transition-colors z-10"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Enlarged Image with Next/Prev navigation */}
              <div className="md:col-span-7 relative rounded-2xl overflow-hidden bg-black max-h-[65vh] flex items-center justify-center border border-stone-300 dark:border-white/10 group">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain max-h-[65vh]"
                />

                {/* Next/Prev Buttons if multiple photos in category */}
                {categoryItems.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-950/80 hover:bg-gold hover:text-dark-950 text-white border border-white/20 flex items-center justify-center transition-all shadow-lg"
                      title="Foto anterior"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark-950/80 hover:bg-gold hover:text-dark-950 text-white border border-white/20 flex items-center justify-center transition-all shadow-lg"
                      title="Próxima foto"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Info Details */}
              <div className="md:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-800 dark:text-gold-light text-xs font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      {selectedItem.categoryLabel}
                    </div>
                    {categoryItems.length > 1 && (
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Foto {currentIndex + 1} de {categoryItems.length}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-3 leading-snug">
                    {selectedItem.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {selectedItem.description}
                  </p>

                  <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-dark-950/80 border border-stone-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 mb-5">
                    <div className="text-gold-700 dark:text-gold font-mono font-semibold uppercase text-[11px] mb-1">
                      Ficha Técnica do Registro:
                    </div>
                    <p>{selectedItem.details}</p>
                  </div>

                  {/* Thumbnails if category has multiple photos */}
                  {categoryItems.length > 1 && (
                    <div className="mb-6">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block mb-2">
                        Fotos deste Destaque:
                      </span>
                      <div className="flex items-center gap-2.5">
                        {categoryItems.map((thumbItem) => (
                          <button
                            key={thumbItem.id}
                            onClick={() => setSelectedItem(thumbItem)}
                            className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              thumbItem.id === selectedItem.id
                                ? 'border-gold scale-105 shadow-md shadow-gold/30'
                                : 'border-stone-300 dark:border-slate-700 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={thumbItem.image}
                              alt={thumbItem.title}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href="#orcamento"
                    onClick={() => setSelectedItem(null)}
                    className="w-full text-center py-3.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 transition-all"
                  >
                    Solicitar Orçamento para Este Ensaio
                  </a>

                  <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp.number}?text=${encodeURIComponent(`Olá! Vi a foto "${selectedItem.title}" no site da Agências Araújo e gostaria de saber o valor para um ensaio nesse estilo.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs uppercase tracking-wider transition-all hover:border-emerald-500/40 border border-stone-300 dark:border-transparent shadow-sm"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                    <span>Perguntar no WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
