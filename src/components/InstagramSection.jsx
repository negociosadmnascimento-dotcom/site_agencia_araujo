import React from 'react';
import { Instagram, Heart, MessageCircle, ArrowUpRight, Play } from 'lucide-react';
import { CONTACT_INFO } from '../config/contact';

export default function InstagramSection() {
  const posts = [
    {
      id: 1,
      type: "reel",
      badge: "Reels",
      image: "/images/instagram-1-gratidao.jpg",
      url: "https://www.instagram.com/reel/DS-D7YcDcI2/?stkn=amQ1c3VrZXp4cXZ1",
      title: "Gratidão & Retrospectiva",
      caption: "Gratidão define! ✨ Encerramos mais um ano com agradecimento a cada cliente que confiou no nosso trabalho e caminhou com a gente. 💼🚀",
      likes: "482",
      comments: "39",
    },
    {
      id: 2,
      type: "post",
      badge: "Feed",
      image: "/images/instagram-2-feedback.jpg",
      url: "https://www.instagram.com/p/Dcgf8nIx57s/?stkn=c3IxZ3N5ajZzamM5",
      title: "Sua Opinião Importa",
      caption: "Conta pra gente como foi sua experiência! ⭐ O seu feedback nos ajuda a crescer e aprimorar cada ensaio e cobertura de evento. ❤️",
      likes: "320",
      comments: "45",
    },
    {
      id: 3,
      type: "reel",
      badge: "Reels",
      image: "/images/instagram-3-casamento.jpg",
      url: "https://www.instagram.com/reel/DXW3V06DaWH/?stkn=MTIyamU5amxtZ2phOQ==",
      title: "Casamento: O Sim & Relicário",
      caption: "Há presentes que preenchem espaços ✨ No dia do casamento, a noiva recebeu um relicário emocionante para abençoar o 'sim' mais importante da sua vida. 🤍🕊️",
      likes: "790",
      comments: "56",
    },
    {
      id: 4,
      type: "reel",
      badge: "Reels",
      image: "/images/instagram-4-newborn-melina.jpg",
      url: "https://www.instagram.com/reel/Dc1a2rZpv1Q/?stkn=MWg3NXFyenZ5ODNoMg==",
      title: "Depoimento: Newborn Melina",
      caption: "Um pedacinho de um dos momentos mais especiais! Agradecimento especial à Manu e Clara da Agência Araújo por todo amor e cuidado com a Melina. 😍👶",
      likes: "203",
      comments: "11",
    },
  ];

  return (
    <section className="py-20 bg-stone-100/70 dark:bg-dark-900/80 border-t border-stone-200/80 dark:border-slate-800/80 relative overflow-hidden w-full transition-colors duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-700 dark:text-pink-300 text-xs font-semibold uppercase tracking-widest mb-3">
              <Instagram className="w-3.5 h-3.5 text-pink-500" />
              <span>Conexão Social</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Siga a <span className="gold-text">@agenciasaraujo</span> no Instagram
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl">
              Acompanhe ensaios fresquinhos, vídeos de bastidores (Reels), depoimentos e as últimas produções no Rio de Janeiro.
            </p>
          </div>

          <a
            href={CONTACT_INFO.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 transition-all hover:scale-105"
          >
            <Instagram className="w-4 h-4" />
            <span>Seguir no Instagram</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Feed Preview Cards com Links Diretos e Capas Oficiais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Ver "${post.title}" no Instagram`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden glass-card border border-white/10 hover:border-pink-500/60 transition-all duration-500 shadow-xl flex flex-col justify-end"
            >
              {/* Cover Image */}
              <img
                src={post.image}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              {/* Subtle permanent bottom gradient for readability on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950/85 via-dark-950/20 to-black/20 group-hover:opacity-0 transition-opacity duration-300" />

              {/* Type Badge (Reels / Post) */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-white shadow-md">
                  {post.type === 'reel' ? (
                    <>
                      <Play className="w-3 h-3 fill-pink-400 text-pink-400" />
                      <span>Reels</span>
                    </>
                  ) : (
                    <>
                      <Instagram className="w-3 h-3 text-pink-400" />
                      <span>Post</span>
                    </>
                  )}
                </span>
              </div>

              {/* Top right Direct Link Icon */}
              <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-white group-hover:text-pink-400 group-hover:border-pink-500/50 transition-colors shadow-md">
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              {/* Idle State Title (visible directly) */}
              <div className="relative z-10 p-4 transition-opacity duration-300 group-hover:opacity-0">
                <span className="text-[11px] font-mono text-pink-300 uppercase tracking-wider block mb-0.5">
                  {post.badge}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white drop-shadow-md line-clamp-1">
                  {post.title}
                </h3>
              </div>

              {/* Interactive Hover Overlay with Details */}
              <div className="absolute inset-0 z-20 bg-dark-950/92 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 text-center">
                <div className="flex justify-center pt-2">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-md">
                    <Instagram className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-pink-300 mb-1.5">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-200 line-clamp-4 leading-relaxed">
                    {post.caption}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pb-1">
                  <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-slate-300" />
                      {post.comments}
                    </span>
                  </div>

                  <div className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                    <span>Ver no Instagram</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}

