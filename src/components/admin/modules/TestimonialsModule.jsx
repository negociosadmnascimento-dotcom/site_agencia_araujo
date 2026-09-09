import React, { useState } from 'react';
import { 
  Star, Plus, Trash2, Eye, ShieldCheck, 
  MessageSquareQuote, User, X, Upload, RefreshCw, Check, 
  Sparkles, Image as ImageIcon, ZoomIn
} from 'lucide-react';
import WhatsAppIcon from '../../../components/icons/WhatsAppIcon';
import { useAuth } from '../../../context/AuthContext';

export const INITIAL_TESTIMONIALS = [
  {
    id: 'dep_real_01',
    type: 'whatsapp_print',
    name: 'Raiane',
    role: 'Cliente Particular',
    event: 'Ensaio Fotográfico & Vídeo Maker',
    image: '/images/depoimento-whatsapp-raiane.png',
    quote: 'Manu as fotos ficaram lindas demais, obrigada sério mesmo... Gostei sim, irei te contratar outras vezes que for preciso! ❤️',
    rating: 5,
    approved: true,
    featured: true,
    date: 'Julho/2026',
  }
];

export default function TestimonialsModule() {
  const { isSuperAdmin, logActivity } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [testimonials, setTestimonials] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_testimonials');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_TESTIMONIALS;
    } catch {
      return INITIAL_TESTIMONIALS;
    }
  });

  const [newTestimonial, setNewTestimonial] = useState({
    type: 'whatsapp_print', // 'whatsapp_print' | 'text'
    name: '',
    role: '',
    event: 'Retratos Pessoais',
    rating: 5,
    text: '',
    quote: '',
    image: '',
  });

  const saveToStorage = (updated) => {
    setTestimonials(updated);
    try {
      localStorage.setItem('admin_testimonials', JSON.stringify(updated));
    } catch (err) {
      console.warn('Erro ao salvar no localStorage:', err);
    }
  };

  const toggleApproval = (id) => {
    const updated = testimonials.map(t => {
      if (t.id === id) {
        const nextState = !t.approved;
        logActivity('MODERACAO_DEPOIMENTO', 'depoimentos', `${nextState ? 'Aprovou' : 'Ocultou'} depoimento de ${t.name}`);
        return { ...t, approved: nextState };
      }
      return t;
    });
    saveToStorage(updated);
    showToast('Status de exibição no site atualizado!');
  };

  const toggleFeatured = (id) => {
    const updated = testimonials.map(t => {
      if (t.id === id) {
        const nextState = !t.featured;
        logActivity('DESTAQUE_DEPOIMENTO', 'depoimentos', `${nextState ? 'Marcou como destaque' : 'Removeu destaque'} de ${t.name}`);
        return { ...t, featured: nextState };
      }
      return t;
    });
    saveToStorage(updated);
    showToast('Destaque atualizado com sucesso!');
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Remover depoimento de "${name}"?`)) return;
    const updated = testimonials.filter(t => t.id !== id);
    saveToStorage(updated);
    logActivity('EXCLUSAO_DEPOIMENTO', 'depoimentos', `Excluiu depoimento de ${name}`);
    showToast('Depoimento removido.');
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setNewTestimonial(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTestimonial.name) return;
    if (newTestimonial.type === 'whatsapp_print' && !newTestimonial.image) {
      alert('Por favor, selecione uma imagem do print do WhatsApp.');
      return;
    }
    if (newTestimonial.type === 'text' && !newTestimonial.text) {
      alert('Por favor, escreva o texto do depoimento.');
      return;
    }

    setIsSaving(true);
    const item = {
      id: `dep_${Date.now()}`,
      type: newTestimonial.type,
      name: newTestimonial.name,
      role: newTestimonial.role || 'Cliente Particular',
      event: newTestimonial.event || 'Ensaio Geral',
      rating: newTestimonial.rating || 5,
      text: newTestimonial.text,
      quote: newTestimonial.quote || newTestimonial.text,
      image: newTestimonial.image,
      approved: true,
      featured: false,
      date: 'Hoje',
    };

    setTimeout(() => {
      const updated = [item, ...testimonials];
      saveToStorage(updated);
      logActivity('NOVO_DEPOIMENTO', 'depoimentos', `Cadastrou novo depoimento de ${item.name} (${item.type === 'whatsapp_print' ? 'Print WhatsApp' : 'Texto'})`);
      setIsSaving(false);
      setShowAddModal(false);
      setImagePreview('');
      setNewTestimonial({
        type: 'whatsapp_print',
        name: '',
        role: '',
        event: 'Retratos Pessoais',
        rating: 5,
        text: '',
        quote: '',
        image: '',
      });
      showToast(`Depoimento de "${item.name}" publicado com sucesso!`);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl bg-emerald-600 text-white flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Módulo 08 • Prova Social & Avaliações Reais</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Depoimentos & Prints do WhatsApp</h1>
          <p className="text-slate-400 text-xs">
            Gerencie depoimentos reais, faça upload de prints do WhatsApp e controle quais aparecem no menu "Depoimentos" do site público.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Inserir Novo Print / Depoimento</span>
        </button>
      </div>

      {/* Grid of Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="rounded-3xl bg-slate-900/70 border border-white/10 p-5 space-y-4 shadow-xl hover:border-gold/30 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                {t.type === 'whatsapp_print' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-green-400" />
                    <span>Print do WhatsApp</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    t.approved 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {t.approved ? 'No Site' : 'Oculto'}
                  </span>
                  {t.featured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold/20 text-gold-300 border border-gold/40">
                      ★ Destaque
                    </span>
                  )}
                </div>
              </div>

              {/* Print Image if WhatsApp Type */}
              {t.type === 'whatsapp_print' && t.image ? (
                <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/5 group-hover:border-gold/30 transition-all mb-3">
                  <img
                    src={t.image}
                    alt={`Print de ${t.name}`}
                    className="w-full h-64 object-cover object-top hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setZoomImage(t.image)}
                  />
                  <button
                    onClick={() => setZoomImage(t.image)}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold flex items-center gap-1 hover:bg-black/90 transition-colors"
                  >
                    <ZoomIn className="w-3 h-3 text-gold" />
                    <span>Ampliar Print</span>
                  </button>
                </div>
              ) : null}

              {/* Text Quote */}
              {t.quote || t.text ? (
                <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-3">
                  "{t.quote || t.text}"
                </p>
              ) : null}
            </div>

            {/* Author details & controls */}
            <div className="pt-3 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm block">{t.name}</span>
                  <span className="text-xs text-slate-400 block">{t.role} • {t.event}</span>
                </div>
                <button
                  onClick={() => handleDelete(t.id, t.name)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toggle Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => toggleApproval(t.id)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    t.approved
                      ? 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {t.approved ? 'Ocultar do Site' : 'Aprovar no Site'}
                </button>

                <button
                  onClick={() => toggleFeatured(t.id)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    t.featured
                      ? 'bg-gold/20 text-gold border-gold/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                  }`}
                >
                  {t.featured ? '★ Em Destaque' : 'Destacar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-3xl bg-slate-900/40">
          <MessageSquareQuote className="w-10 h-10 text-slate-500 mb-2" />
          <h3 className="text-sm font-bold text-white">Nenhum depoimento cadastrado ainda</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Clique em "Inserir Novo Print / Depoimento" para adicionar prints de WhatsApp ou avaliações de clientes satisfeitos.
          </p>
        </div>
      )}

      {/* Modal Add */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-gold/30 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-white mb-1">Novo Depoimento / Prova Social</h2>
            <p className="text-xs text-slate-400 mb-5">Adicione um print real de WhatsApp ou um texto para o site</p>

            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 mb-5">
              <button
                type="button"
                onClick={() => setNewTestimonial({ ...newTestimonial, type: 'whatsapp_print' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  newTestimonial.type === 'whatsapp_print'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-green-400" />
                <span>Print do WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setNewTestimonial({ ...newTestimonial, type: 'text' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  newTestimonial.type === 'text'
                    ? 'bg-gold/20 text-gold-300 border border-gold/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-gold" />
                <span>Depoimento em Texto</span>
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              {/* File Picker for WhatsApp Print */}
              {newTestimonial.type === 'whatsapp_print' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Selecionar Imagem do Print (JPG / PNG) *
                  </label>

                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 rounded-2xl bg-black/40 cursor-pointer transition-all group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImagePick}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform mb-2" />
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                        Clique aqui para escolher a foto do print no seu computador
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">
                        Suporta capturas de tela do WhatsApp (PNG, JPG, JPEG)
                      </span>
                    </label>

                    {/* Preview */}
                    {(imagePreview || newTestimonial.image) && (
                      <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-emerald-500/40 p-2">
                        <img
                          src={imagePreview || newTestimonial.image}
                          alt="Prévia do print"
                          className="w-full max-h-56 object-contain rounded-xl"
                        />
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-dark-950">
                          ✓ Imagem Selecionada
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    value={newTestimonial.name}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                    placeholder="Ex: Raiane"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Serviço / Ocasião</label>
                  <input
                    type="text"
                    value={newTestimonial.event}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, event: e.target.value })}
                    placeholder="Ex: Casamento, Newborn, Retratos..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Frase de Destaque da Conversa <span className="text-slate-500 font-normal">(trecho marcante que aparece no site)</span>
                </label>
                <textarea
                  rows={2}
                  value={newTestimonial.quote}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                  placeholder="Ex: 'As fotos ficaram lindas demais, obrigada sério mesmo... irei te contratar outras vezes!'"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none"
                />
              </div>

              {newTestimonial.type === 'text' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Texto Completo do Depoimento *</label>
                  <textarea
                    rows={3}
                    value={newTestimonial.text}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                    placeholder="Relato completo do cliente sobre a experiência fotográfica..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              )}

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
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <span>Salvar e Publicar no Site</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-fade-in"
        >
          <div className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomImage}
              alt="Print ampliado"
              className="max-h-[85vh] w-auto rounded-3xl shadow-2xl border border-white/20 object-contain"
            />
            <span className="text-xs text-slate-400 mt-2">Clique em qualquer lugar para fechar</span>
          </div>
        </div>
      )}
    </div>
  );
}
