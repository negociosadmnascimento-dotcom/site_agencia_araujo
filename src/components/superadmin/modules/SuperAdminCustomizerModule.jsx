import React, { useState } from 'react';
import { Palette, Image, Sparkles, Check, Building, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function SuperAdminCustomizerModule({ initialClient }) {
  const { logActivity } = useAuth();
  const [activeTab, setActiveTab] = useState(initialClient ? 'client_custom' : 'super_custom');
  const [saved, setSaved] = useState(false);

  // Super Admin's own branding
  const [superBranding, setSuperBranding] = useState(() => {
    try {
      const stored = localStorage.getItem('superadmin_own_branding');
      return stored ? JSON.parse(stored) : {
        platformName: 'Agências Araújo • Plataforma de Gestão SaaS',
        tagline: 'Direção Geral & Infraestrutura Central',
        logoUrl: '/images/logo-butterfly-white.png',
        primaryColor: '#D4AF37',
      };
    } catch {
      return {
        platformName: 'Agências Araújo • Plataforma de Gestão SaaS',
        tagline: 'Direção Geral & Infraestrutura Central',
        logoUrl: '/images/logo-butterfly-white.png',
        primaryColor: '#D4AF37',
      };
    }
  });

  // Client Admin customization on request
  const [selectedClientAgency, setSelectedClientAgency] = useState(
    initialClient?.agencyName || 'Agências Araújo • Fotografia & Audiovisual RJ'
  );
  const [clientBranding, setClientBranding] = useState({
    agencyName: initialClient?.agencyName || 'Agências Araújo • Fotografia & Audiovisual RJ',
    tagline: 'A Excelência Visual que sua História Merece',
    logoUrl: '/images/logo-butterfly-white.png',
    themePalette: initialClient?.themePalette || 'gold_luxury',
  });

  const palettes = [
    { id: 'gold_luxury', name: 'Dourado Imperial & Black', primary: '#D4AF37' },
    { id: 'rose_gold', name: 'Rose Gold & Champagne', primary: '#B76E79' },
    { id: 'titanium_silver', name: 'Prata Titânio & Grafite', primary: '#E2E8F0' },
    { id: 'emerald_prestige', name: 'Verde Esmeralda & Ouro', primary: '#10B981' },
  ];

  const handleSaveSuper = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('superadmin_own_branding', JSON.stringify(superBranding));
    } catch (err) {
      console.warn(err);
    }
    logActivity?.('PERSONALIZACAO_SUPER_ADMIN', 'governanca', 'Super Admin atualizou identidade visual da plataforma geral');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveClientBySuper = (e) => {
    e.preventDefault();
    logActivity?.('PERSONALIZACAO_CLIENTE_POR_SUPER', 'governanca', `Super Admin customizou marca da agência "${selectedClientAgency}" a pedido do cliente`);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-300 text-xs font-mono mb-2">
          <Palette className="w-3.5 h-3.5" />
          <span>Governança Visual & Identidade Whitelabel</span>
        </div>
        <h1 className="text-2xl font-serif font-bold text-white">Central de Personalização de Marca</h1>
        <p className="text-slate-400 text-xs">
          Personalize seu ambiente Super Admin e realize customizações na identidade visual dos seus clientes (Admins) quando solicitado
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-black/40 border border-white/10 max-w-md">
        <button
          onClick={() => setActiveTab('super_custom')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'super_custom'
              ? 'bg-gold-gradient text-dark-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Meu Painel (Super Admin)</span>
        </button>

        <button
          onClick={() => setActiveTab('client_custom')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'client_custom'
              ? 'bg-gold-gradient text-dark-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Personalizar Cliente (Admin)</span>
        </button>
      </div>

      {/* Success alert */}
      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Alterações de identidade visual salvas com sucesso!</span>
        </div>
      )}

      {/* TAB 1: Super Admin's Own Branding */}
      {activeTab === 'super_custom' && (
        <form onSubmit={handleSaveSuper} className="space-y-6">
          <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 sm:p-8 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Identidade Visual da Direção Geral (Super Admin)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Título da Plataforma
                </label>
                <input
                  type="text"
                  value={superBranding.platformName}
                  onChange={(e) => setSuperBranding({ ...superBranding, platformName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Slogan / Subtítulo
                </label>
                <input
                  type="text"
                  value={superBranding.tagline}
                  onChange={(e) => setSuperBranding({ ...superBranding, tagline: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Logotipo da Direção Geral
              </label>
              <input
                type="text"
                value={superBranding.logoUrl}
                onChange={(e) => setSuperBranding({ ...superBranding, logoUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="py-3 px-8 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Meu Painel</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Customize Client Admin on Demand */}
      {activeTab === 'client_custom' && (
        <form onSubmit={handleSaveClientBySuper} className="space-y-6">
          <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300 flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>Personalizar Cliente Sob Demanda / Suporte</span>
              </h2>
              <span className="text-xs text-slate-400">Atendimento de Personalização Solicitada</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Selecione a Agência / Cliente Admin a Customizar
              </label>
              <select
                value={selectedClientAgency}
                onChange={(e) => setSelectedClientAgency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-slate-700 text-white text-sm focus:border-gold focus:outline-none"
              >
                <option>Agências Araújo • Fotografia & Audiovisual RJ</option>
                <option>Estúdio Copacabana Fine Art</option>
                <option>Lumière Barra Fotografia</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome da Agência
                </label>
                <input
                  type="text"
                  value={clientBranding.agencyName}
                  onChange={(e) => setClientBranding({ ...clientBranding, agencyName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Paleta de Cores do Cliente
                </label>
                <select
                  value={clientBranding.themePalette}
                  onChange={(e) => setClientBranding({ ...clientBranding, themePalette: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none"
                >
                  {palettes.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                URL do Logotipo do Cliente
              </label>
              <input
                type="text"
                value={clientBranding.logoUrl}
                onChange={(e) => setClientBranding({ ...clientBranding, logoUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-slate-700 text-white text-xs focus:border-gold focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="py-3 px-8 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Personalização ao Cliente</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
