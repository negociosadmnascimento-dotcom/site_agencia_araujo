import React, { useState } from 'react';
import { 
  Star, Plus, CheckCircle, XCircle, Trash2, Eye, ShieldCheck, 
  MessageSquareQuote, User, X 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function TestimonialsModule() {
  const { isSuperAdmin, logActivity } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  const [testimonials, setTestimonials] = useState([
    {
      id: 'dep_01',
      name: 'Dr. Roberto Silveira',
      role: 'Médico Cirurgião Plástico',
      event: 'Retratos Corporativos Executive',
      rating: 5,
      text: 'A experiência com a equipe da Agências Araújo superou todas as expectativas. A condução da iluminação e o posicionamento de marca elevaram a percepção do meu consultório a outro nível.',
      approved: true,
      featured: true,
      date: '15/02/2026',
    },
    {
      id: 'dep_02',
      name: 'Mariana Alencar',
      role: 'Noiva',
      event: 'Ensaio Pré-Wedding no Arpoador',
      rating: 5,
      text: 'As fotos do pôr do sol no Rio ficaram cinematográficas! O cuidado aos detalhes e o profissionalismo de toda a equipe foram impecáveis. Recomendo de olhos fechados.',
      approved: true,
      featured: true,
      date: '05/02/2026',
    },
    {
      id: 'dep_03',
      name: 'Carlos Drummond',
      role: 'Gerente Geral • Le Vin Bistrô',
      event: 'Fotografia Gastronômica & Drinks',
      rating: 5,
      text: 'Aumentamos nossa taxa de engajamento no Instagram em mais de 40% após postar as novas fotos dos pratos feitas pela Araújo. Qualidade ímpar no RJ.',
      approved: true,
      featured: false,
      date: '20/01/2026',
    },
    {
      id: 'dep_04',
      name: 'Eduardo Neves',
      role: 'Diretor de Eventos • SAFRA Rio',
      event: 'Cobertura em Grande Escala Maracanã',
      rating: 5,
      text: 'Trabalho de alto padrão e agilidade na entrega de teasers durante o evento. Parceria que se consolidou com excelência.',
      approved: false,
      featured: false,
      date: '28/02/2026',
    },
  ]);

  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    role: '',
    event: 'Retratos Pessoais',
    rating: 5,
    text: '',
  });

  const toggleApproval = (id) => {
    setTestimonials(testimonials.map(t => {
      if (t.id === id) {
        const nextState = !t.approved;
        logActivity('MODERACAO_DEPOIMENTO', 'depoimentos', `${nextState ? 'Aprovou' : 'Desaprovou'} depoimento de ${t.name}`);
        return { ...t, approved: nextState };
      }
      return t;
    }));
  };

  const toggleFeatured = (id) => {
    setTestimonials(testimonials.map(t => {
      if (t.id === id) {
        const nextState = !t.featured;
        logActivity('DESTAQUE_DEPOIMENTO', 'depoimentos', `${nextState ? 'Marcou como destaque' : 'Removeu destaque'} de ${t.name}`);
        return { ...t, featured: nextState };
      }
      return t;
    }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTestimonial.name || !newTestimonial.text) return;

    const item = {
      id: `dep_${Date.now()}`,
      name: newTestimonial.name,
      role: newTestimonial.role || 'Cliente Satisfeito',
      event: newTestimonial.event,
      rating: newTestimonial.rating,
      text: newTestimonial.text,
      approved: true,
      featured: false,
      date: 'Hoje',
    };

    setTestimonials([item, ...testimonials]);
    logActivity('NOVO_DEPOIMENTO', 'depoimentos', `Cadastrou novo depoimento de ${item.name}`);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Módulo 08 • Prova Social & Avaliações</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Depoimentos & Avaliações de Clientes</h1>
          <p className="text-slate-400 text-xs">
            Modere comentários, aprove avaliações para o site público e selecione destaques
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Depoimento</span>
        </button>
      </div>

      {/* Grid of Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 space-y-4 shadow-xl hover:border-gold/30 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top rating & status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    t.approved 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {t.approved ? 'Aprovado no Site' : 'Pendente Moderação'}
                  </span>
                  {t.featured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold/20 text-gold-300 border border-gold/40">
                      ★ Destaque
                    </span>
                  )}
                </div>
              </div>

              {/* Text */}
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{t.text}"
              </p>
            </div>

            {/* Author details & controls */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white text-sm block">{t.name}</span>
                <span className="text-xs text-slate-400 block">{t.role} • {t.event}</span>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => toggleApproval(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    t.approved
                      ? 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {t.approved ? 'Ocultar' : 'Aprovar'}
                </button>

                <button
                  onClick={() => toggleFeatured(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    t.featured
                      ? 'bg-gold/20 text-gold border-gold/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                  }`}
                >
                  {t.featured ? 'Destaque Ativo' : 'Destacar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-gold/30 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-white mb-1">Cadastrar Depoimento</h2>
            <p className="text-xs text-slate-400 mb-6">Adicione uma avaliação oficial de cliente para exibição pública</p>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    value={newTestimonial.name}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                    placeholder="Ex: Dra. Patrícia Lima"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo / Profissão</label>
                  <input
                    type="text"
                    value={newTestimonial.role}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                    placeholder="Ex: Dermatologista"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Serviço / Ocasião</label>
                <input
                  type="text"
                  value={newTestimonial.event}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, event: e.target.value })}
                  placeholder="Ex: Retratos Corporativos Executive"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Texto do Depoimento</label>
                <textarea
                  rows={3}
                  required
                  value={newTestimonial.text}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                  placeholder="Relato do cliente sobre a experiência fotográfica..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
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
                  Salvar e Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
