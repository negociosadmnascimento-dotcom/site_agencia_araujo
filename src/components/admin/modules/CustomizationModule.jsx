import React, { useState } from 'react';
import { Palette, Image, Sparkles, Check, Upload, RefreshCw, Eye } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function CustomizationModule() {
  const { user, logActivity } = useAuth();
  const [saved, setSaved] = useState(false);

  const [branding, setBranding] = useState(() => {
    try {
      const stored = localStorage.getItem(`agency_branding_${user?.id || 'admin'}`);
      return stored ? JSON.parse(stored) : {
        agencyName: 'Agências Araújo Fotografia RJ',
        tagline: 'A Excelência Visual que sua História Merece',
        primaryColor: '#D4AF37', // Gold
        themePalette: 'gold_luxury',
        logoUrl: '/images/logo-butterfly-white.png',
      };
    } catch {
      return {
        agencyName: 'Agências Araújo Fotografia RJ',
        tagline: 'A Excelência Visual que sua História Merece',
        primaryColor: '#D4AF37',
        themePalette: 'gold_luxury',
        logoUrl: '/images/logo-butterfly-white.png',
      };
    }
  });

  const palettes = [
    {
      id: 'gold_luxury',
      name: 'Dourado Imperial & Black (Padrão Oficial)',
      primary: '#D4AF37',
      bgPreview: 'from-[#06080C] to-[#141D30]',
      badge: 'Boutique Luxo',
    },
    {
      id: 'rose_gold',
      name: 'Rose Gold & Champagne',
      primary: '#B76E79',
      bgPreview: 'from-[#0E0709] to-[#2A151C]',
      badge: 'Casamentos & Noivas',
    },
    {
      id: 'titanium_silver',
      name: 'Prata Titânio & Grafite',
      primary: '#E2E8F0',
      bgPreview: 'from-[#0A0D12] to-[#1E293B]',
      badge: 'Corporativo & Executive',
    },
    {
      id: 'emerald_prestige',
      name: 'Verde Esmeralda & Ouro',
      primary: '#10B981',
      bgPreview: 'from-[#04120D] to-[#0D281E]',
      badge: 'Editorial & Marcas',
    },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(`agency_branding_${user?.id || 'admin'}`, JSON.stringify(branding));
    } catch (err) {
      console.warn(err);
    }
    logActivity?.('PERSONALIZACAO_MARCA', 'configuracoes', `Atualizou identidade visual da agência: ${branding.agencyName}`);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>Módulo de Personalização • Identidade da sua Agência</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Personalização Visual & Marca</h1>
          <p className="text-slate-400 text-xs">
            Configure o nome da sua empresa, logotipo e paleta de cores que representam o seu estúdio fotográfico
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Identidade visual da sua agência salva com sucesso!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: Informações Básicas da Agência */}
        <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Identidade do Estúdio / Agência</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nome Comercial da Agência
              </label>
              <input
                type="text"
                required
                value={branding.agencyName}
                onChange={(e) => setBranding({ ...branding, agencyName: e.target.value })}
                placeholder="Ex: Agências Araújo Fotografia"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Slogan / Tagline do Estúdio
              </label>
              <input
                type="text"
                value={branding.tagline}
                onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                placeholder="Ex: A Excelência Visual que sua História Merece"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Logotipo */}
        <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300 flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span>Logotipo Oficial da Agência</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-black/30 border border-white/5">
            <div className="w-24 h-24 rounded-2xl bg-black/60 border border-gold/30 flex items-center justify-center p-3 shrink-0">
              <img
                src={branding.logoUrl}
                alt="Logo Preview"
                className="max-h-full max-w-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                onError={(e) => { e.currentTarget.src = '/images/logo-butterfly-white.png'; }}
              />
            </div>

            <div className="flex-1 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                URL da Imagem do Logo (PNG com fundo transparente)
              </label>
              <input
                type="text"
                value={branding.logoUrl}
                onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                placeholder="/images/logo-butterfly-white.png ou link da imagem"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Dica: Utilize preferencialmente imagem em formato PNG ou SVG transparente com proporção horizontal ou quadrada.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Paletas de Cores */}
        <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span>Paleta de Cores & Estilo Visual</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {palettes.map((p) => {
              const isSelected = branding.themePalette === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setBranding({ ...branding, themePalette: p.id, primaryColor: p.primary })}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800/80 border-gold shadow-lg shadow-gold/10 ring-1 ring-gold'
                      : 'bg-black/30 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center shrink-0 shadow-inner"
                      style={{ backgroundColor: p.primary }}
                    >
                      {isSelected && <Check className="w-5 h-5 text-black stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 block">{p.badge}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isSelected ? 'bg-gold/20 text-gold font-bold' : 'text-slate-500'
                  }`}>
                    {isSelected ? 'Ativo' : 'Selecionar'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="py-3 px-8 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Identidade Visual</span>
          </button>
        </div>

      </form>
    </div>
  );
}
