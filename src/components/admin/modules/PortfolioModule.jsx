import React, { useState } from 'react';
import { 
  Image, Plus, Filter, Sparkles, Eye, Check, Star, 
  ExternalLink, Layers, Camera, X 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function PortfolioModule() {
  const { isSuperAdmin, logActivity } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);

  const [portfolioItems, setPortfolioItems] = useState([
    {
      id: 'port_01',
      title: 'Cobertura em Grande Escala no Maracanã (Foto 1/3)',
      category: 'Retratos Pessoais',
      image: '/images/retrato-maracana-estadio.jpg',
      featured: true,
      featuredText: 'Capa Principal Ativa',
      views: '1.420 visualizações',
      date: '06/09/2026',
    },
    {
      id: 'port_02',
      title: 'Equipe Oficial em Cobertura de Casamento (Foto 2/3)',
      category: 'Retratos Pessoais',
      image: '/images/retrato-equipe-casamento.png',
      featured: false,
      featuredText: 'Galeria',
      views: '980 visualizações',
      date: '28/08/2026',
    },
    {
      id: 'port_03',
      title: 'Campanha Gastronômica & Coquetelaria Gourmet',
      category: 'Gastronomia',
      image: '/images/instagram/gastronomia.png',
      featured: true,
      featuredText: 'Destaque Gastronomia',
      views: '1.150 visualizações',
      date: '15/08/2026',
    },
    {
      id: 'port_04',
      title: 'Produção Audiovisual & Sunset Arpoador',
      category: 'Eventos & Espetáculos',
      image: '/images/instagram/eventos-espetaculos.png',
      featured: true,
      featuredText: 'Destaque Eventos',
      views: '2.040 visualizações',
      date: '10/08/2026',
    },
    {
      id: 'port_05',
      title: 'Diretoria Executiva & Branding Corporativo',
      category: 'Corporativo',
      image: '/images/instagram/retratos-corporativos.png',
      featured: false,
      featuredText: 'Galeria Corporativa',
      views: '830 visualizações',
      date: '02/08/2026',
    },
  ]);

  const [newItem, setNewItem] = useState({
    title: '',
    category: 'Retratos Pessoais',
    image: '',
  });

  const categories = ['Todos', 'Retratos Pessoais', 'Gastronomia', 'Eventos & Espetáculos', 'Corporativo'];

  const toggleFeatured = (id) => {
    setPortfolioItems(portfolioItems.map(item => {
      if (item.id === id) {
        const nextState = !item.featured;
        logActivity('PORTFOLIO_DESTAQUE', 'portfolio', `${nextState ? 'Destacou' : 'Removeu destaque de'} "${item.title}"`);
        return { ...item, featured: nextState, featuredText: nextState ? 'Destaque Home' : 'Galeria' };
      }
      return item;
    }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.title) return;

    const item = {
      id: `port_${Date.now()}`,
      title: newItem.title,
      category: newItem.category,
      image: newItem.image || '/images/instagram/maracana-full.png',
      featured: false,
      featuredText: 'Galeria',
      views: '0 visualizações',
      date: 'Hoje',
    };

    setPortfolioItems([item, ...portfolioItems]);
    logActivity('PORTFOLIO_ITEM_ADD', 'portfolio', `Adicionou nova foto ao portfólio: "${item.title}"`);
    setShowAddModal(false);
  };

  const filtered = portfolioItems.filter(p => selectedCategory === 'Todos' || p.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Módulo 09 • Portfólio & Acervo Fotográfico</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Acervo Visual & Galeria de Destaques</h1>
          <p className="text-slate-400 text-xs">
            Gerenciamento das capas das categorias, destaques da home e produções recentes
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Foto / Produção</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-gold-500 text-dark-950 font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-xl hover:border-gold/40 transition-all flex flex-col justify-between group"
          >
            {/* Image Box */}
            <div className="relative aspect-[4/3] bg-black overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = '/images/instagram/maracana-full.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
                  {item.category}
                </span>
                {item.featured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold text-dark-950 shadow-md">
                    ★ Destaque Home
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-bold text-white text-sm line-clamp-1">{item.title}</h3>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>{item.views}</span>
                  <span className="font-mono text-[11px]">{item.date}</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => toggleFeatured(item.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                    item.featured
                      ? 'bg-gold/15 text-gold border-gold/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                  }`}
                >
                  {item.featured ? 'Remover Destaque' : 'Definir como Destaque'}
                </button>

                <a
                  href={item.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                  title="Abrir em tamanho original"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-gold/30 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-white mb-1">Adicionar Imagem ao Portfólio</h2>
            <p className="text-xs text-slate-400 mb-6">Insira os detalhes para disponibilização na galeria</p>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título da Produção</label>
                <input
                  type="text"
                  required
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Ex: Ensaio Editorial Copacabana Palace"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                >
                  <option>Retratos Pessoais</option>
                  <option>Gastronomia</option>
                  <option>Eventos & Espetáculos</option>
                  <option>Corporativo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Caminho da Imagem ou URL</label>
                <input
                  type="text"
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  placeholder="/images/instagram/... ou URL externa"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20"
                >
                  Adicionar ao Portfólio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
