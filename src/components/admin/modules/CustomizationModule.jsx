import React, { useState } from 'react';
import { Palette, Image, Sparkles, Check, RefreshCw, Upload, Eye, Sliders, Globe, Phone, Instagram } from 'lucide-react';
import { useAuth, DEFAULT_TENANT_SETTINGS } from '../../../context/AuthContext';

export default function CustomizationModule() {
  const { logActivity } = useAuth();
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('tenant_custom_settings');
      return stored ? JSON.parse(stored) : {
        agencyName: DEFAULT_TENANT_SETTINGS.name,
        tagline: DEFAULT_TENANT_SETTINGS.tagline,
        primaryColor: '#D4AF37', // Gold
        accentColor: '#F3E5AB', // Vanilla / Light gold
        backgroundColor: '#06080C', // Dark Obsidian
        logoUrl: DEFAULT_TENANT_SETTINGS.logo,
        phone: DEFAULT_TENANT_SETTINGS.phone,
        whatsapp: DEFAULT_TENANT_SETTINGS.whatsapp,
        instagram: DEFAULT_TENANT_SETTINGS.instagram,
        fontFamily: 'Playfair Display + Inter',
      };
    } catch {
      return {
        agencyName: DEFAULT_TENANT_SETTINGS.name,
        tagline: DEFAULT_TENANT_SETTINGS.tagline,
        primaryColor: '#D4AF37',
        accentColor: '#F3E5AB',
        backgroundColor: '#06080C',
        logoUrl: DEFAULT_TENANT_SETTINGS.logo,
        phone: DEFAULT_TENANT_SETTINGS.phone,
        whatsapp: DEFAULT_TENANT_SETTINGS.whatsapp,
        instagram: DEFAULT_TENANT_SETTINGS.instagram,
        fontFamily: 'Playfair Display + Inter',
      };
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('tenant_custom_settings', JSON.stringify(settings));
    setSaved(true);
    logActivity('PERSONALIZACAO_TENANT', 'customization', 'Identidade visual da Agência Araújo atualizada');
    setTimeout(() => setSaved(false), 3000);
  };

  const colorPresets = [
    { name: 'Ouro Real & Obsidian (Padrão)', primary: '#D4AF37', accent: '#F3E5AB', bg: '#06080C' },
    { name: 'Champagne & Grafite', primary: '#E5C158', accent: '#FFF4D0', bg: '#0F1218' },
    { name: 'Bronze Nobre & Preto Puro', primary: '#CD7F32', accent: '#F5DEB3', bg: '#050505' },
    { name: 'Platina & Dark Minimal', primary: '#E0E7FF', accent: '#A5B4FC', bg: '#0A0E1A' },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#121622] to-slate-900 border border-gold/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-3">
              <Palette className="w-3.5 h-3.5 text-gold" />
              <span>Personalização Exclusiva do Tenant • Agência Araújo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Identidade Visual & Marca da Agência
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Altere seu logotipo, paleta de cores (dourado/preto), tipografia e dados de contato que aparecem no seu site e nas propostas dos clientes.
            </p>
          </div>

          {saved && (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4" />
              <span>Alterações Salvas com Sucesso!</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form Options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Logo & Basic Info */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Image className="w-4 h-4 text-gold" />
              <span>Logotipo da Agência</span>
            </h2>

            <div className="flex items-center gap-6 p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="p-4 rounded-xl bg-black/60 border border-gold/30 flex items-center justify-center shrink-0">
                <img
                  src={settings.logoUrl}
                  alt="Pré-visualização do Logo"
                  className="h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-xs font-semibold text-white block">Logo Principal (Borboleta Dourada)</span>
                <p className="text-[11px] text-slate-400">Recomendado formato PNG transparente em alta definição.</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, logoUrl: '/images/logo-butterfly-white.png' })}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10"
                  >
                    Borboleta Branca
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, logoUrl: '/images/logo-butterfly-gold.png' })}
                    className="text-[10px] font-mono px-2 py-1 rounded bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30"
                  >
                    Borboleta Dourada
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Nome da Agência
                </label>
                <input
                  type="text"
                  value={settings.agencyName}
                  onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Colors & Presets */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gold" />
              <span>Paleta de Cores do Painel & Site</span>
            </h2>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {colorPresets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSettings({
                    ...settings,
                    primaryColor: preset.primary,
                    accentColor: preset.accent,
                    backgroundColor: preset.bg,
                  })}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    settings.primaryColor === preset.primary 
                      ? 'border-gold bg-gold/10' 
                      : 'border-white/10 hover:border-white/20 bg-black/30'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-200">{preset.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: preset.primary }} />
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: preset.accent }} />
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: preset.bg }} />
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Cor Primária (Destaque)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Cor de Realce (Accent)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Fundo Escuro (Base)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                    className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-slate-700 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold" />
              <span>Canais Oficiais de Atendimento</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">WhatsApp Atendimento</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Perfil do Instagram</label>
                <input
                  type="text"
                  value={settings.instagram}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-slate-700 text-white text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center justify-center gap-2 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Personalização da Agência Araújo</span>
          </button>
        </div>

        {/* Right 1 Col: Live Preview */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/80 border border-gold/30 p-6 space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase">
                <Eye className="w-3.5 h-3.5 text-gold" />
                <span>Pré-Visualização do Cartão</span>
              </span>
              <span className="text-[10px] font-mono text-gold-300 bg-gold/10 px-2 py-0.5 rounded">Live</span>
            </div>

            {/* Mock Card with user settings */}
            <div 
              className="rounded-2xl p-6 text-center border space-y-4 shadow-xl"
              style={{ 
                backgroundColor: settings.backgroundColor,
                borderColor: `${settings.primaryColor}55`,
              }}
            >
              <img
                src={settings.logoUrl}
                alt={settings.agencyName}
                className="h-12 w-auto mx-auto object-contain"
              />
              <div>
                <h3 className="text-lg font-serif font-bold text-white">{settings.agencyName}</h3>
                <p className="text-xs mt-1" style={{ color: settings.primaryColor }}>{settings.tagline}</p>
              </div>

              <div className="pt-2 flex flex-col gap-2 text-xs font-mono">
                <div className="py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center justify-between">
                  <span>WhatsApp</span>
                  <span className="font-bold text-emerald-400">{settings.phone}</span>
                </div>
                <div className="py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center justify-between">
                  <span>Instagram</span>
                  <span className="font-bold text-gold-300">{settings.instagram}</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-dark-950 transition-all shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`
                }}
              >
                Solicitar Orçamento VIP
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              As alterações feitas aqui afetam apenas o ambiente do seu tenant (Agência Araújo #001).
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
