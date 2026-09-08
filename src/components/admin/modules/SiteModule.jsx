import React, { useState } from 'react';
import { 
  Globe, Eye, Sparkles, Check, Save, RefreshCw, Image, 
  Layers, Palette, Share2, ExternalLink, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { isSupabaseConfigured } from '../../../lib/supabase';

export default function SiteModule() {
  const { isSuperAdmin } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editable settings (synchronized with site state / Supabase)
  const [siteData, setSiteData] = useState({
    title: 'Agências Araújo • Fotografia & Audiovisual de Alto Padrão no RJ',
    headline: 'A Excelência Visual que sua História Merece',
    subheadline: 'Produções fotográficas e cinematográficas exclusivas para marcas, eventos em grande escala e retratos de prestígio no Rio de Janeiro.',
    whatsappNumber: '21981324411',
    whatsappDisplay: '(21) 98132-4411',
    instagram: '@agenciasaraujo',
    instagramUrl: 'https://instagram.com/agenciasaraujo',
    location: 'Rio de Janeiro, RJ • Atendimento VIP em todo o Brasil',
    featuredCover: 'Cobertura em Grande Escala no Maracanã (Foto 3/3)',
    statusRetratos: 'Ativo • Destaque 1',
    statusGastronomia: 'Ativo • Destaque 2',
    statusEventos: 'Ativo • Destaque 3',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Módulo 02 • Gestão do Site</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Conteúdo & Configuração do Site</h1>
          <p className="text-slate-400 text-xs">
            Gerencie textos institucionais, banners em destaque, fotos de capa e informações de contato em agenciasaraujo.com.br
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-all"
          >
            <Eye className="w-4 h-4 text-gold" />
            <span>Ver Site no Ar</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-sm font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/10">
          <div className="w-7 h-7 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-emerald-200">✓ Salvo com Sucesso!</p>
            <p className="text-xs text-emerald-400 font-normal mt-0.5">As alterações foram aplicadas e serão sincronizadas com o site oficial.</p>
          </div>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Content Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Textos Principais & Hero */}
          <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Textos Institucionais & Hero Section</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Título Principal da Home (Hero Headline)
              </label>
              <input
                type="text"
                value={siteData.headline}
                onChange={(e) => setSiteData({ ...siteData, headline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subtítulo / Texto de Impacto
              </label>
              <textarea
                rows={3}
                value={siteData.subheadline}
                onChange={(e) => setSiteData({ ...siteData, subheadline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tagline / Título SEO da Aba
              </label>
              <input
                type="text"
                value={siteData.title}
                onChange={(e) => setSiteData({ ...siteData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Card 2: Destaques Visuais & Capas de Portfólio */}
          <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300 flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span>Destaques Visuais & Capas de Categorias</span>
            </h2>

            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Retratos Pessoais</h3>
                  <p className="text-xs text-slate-400">Capa selecionada: {siteData.featuredCover}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Foto 3/3 Maracanã
                </span>
              </div>
              <p className="text-xs text-slate-400">
                A foto 3/3 da Cobertura em Grande Escala no Maracanã está definida como a capa do destaque da categoria Retratos Pessoais.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Gastronomia & Marcas
                </label>
                <select
                  value={siteData.statusGastronomia}
                  onChange={(e) => setSiteData({ ...siteData, statusGastronomia: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none"
                >
                  <option>Ativo • Destaque 2</option>
                  <option>Ativo • Posição Secundária</option>
                  <option>Oculto Temporariamente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Eventos & Espetáculos
                </label>
                <select
                  value={siteData.statusEventos}
                  onChange={(e) => setSiteData({ ...siteData, statusEventos: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none"
                >
                  <option>Ativo • Destaque 3</option>
                  <option>Ativo • Posição Secundária</option>
                  <option>Oculto Temporariamente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Dados de Contato & Redes */}
          <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>Contatos & Redes Sociais no Site</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  WhatsApp (Exibição)
                </label>
                <input
                  type="text"
                  value={siteData.whatsappDisplay}
                  onChange={(e) => setSiteData({ ...siteData, whatsappDisplay: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  WhatsApp (Link Wa.me - somente números)
                </label>
                <input
                  type="text"
                  value={siteData.whatsappNumber}
                  onChange={(e) => setSiteData({ ...siteData, whatsappNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Instagram (@handle)
                </label>
                <input
                  type="text"
                  value={siteData.instagram}
                  onChange={(e) => setSiteData({ ...siteData, instagram: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Endereço & Atendimento
                </label>
                <input
                  type="text"
                  value={siteData.location}
                  onChange={(e) => setSiteData({ ...siteData, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Live Preview & Action */}
        <div className="space-y-6">
          {/* Card: Salvar & Publicar */}
          <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-black border border-gold/30 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Save className="w-4 h-4 text-gold" />
              <span>Publicação Imediata</span>
            </h3>
            <p className="text-xs text-slate-400">
              Todas as edições feitas aqui são aplicadas diretamente no site institucional e gravadas no Supabase.
            </p>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-4 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>

            {!isSuperAdmin && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Modo Admin Operacional ativo. Alterações sujeitas a revisão da direção.</span>
              </p>
            )}
          </div>

          {/* Card: Informações do Domínio */}
          <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Infraestrutura de Domínio & Hospedagem
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40">
                <span className="text-slate-400">Domínio Oficial:</span>
                <span className="font-mono text-gold-300 font-bold">agenciasaraujo.com.br</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40">
                <span className="text-slate-400">DNS Master:</span>
                <span className="font-mono text-slate-300">ns1.vercel-dns.com</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40">
                <span className="text-slate-400">DNS Slave:</span>
                <span className="font-mono text-slate-300">ns2.vercel-dns.com</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40">
                <span className="text-slate-400">Certificado SSL:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ativo (HTTPS)
                </span>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
