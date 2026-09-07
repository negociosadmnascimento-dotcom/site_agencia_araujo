import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle, ExternalLink, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured, SUPABASE_PROJECT_ID } from '../../lib/supabase';

export default function LoginView({ onBackToSite }) {
  const { loginWithSupabase, loginAs } = useAuth();
  const [activeTab, setActiveTab] = useState('super_admin'); // 'admin' or 'super_admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        await loginWithSupabase(email, password);
      } else {
        // If Supabase not yet configured with anon key, log in with chosen profile
        loginAs(activeTab);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    loginAs(role);
  };

  return (
    <div className="min-h-screen bg-[#06080C] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-gold-500 selection:text-black">
      {/* Background ambient gold lights */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-radial from-gold/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-radial from-gold/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full px-6 sm:px-12 py-6 flex items-center justify-between z-10">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-gold transition-colors py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Site Oficial</span>
        </button>

        {/* Supabase Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-md">
          <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          <span>Supabase: {SUPABASE_PROJECT_ID}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
            {isSupabaseConfigured ? 'Conectado' : 'Aguardando Chave'}
          </span>
        </div>
      </header>

      {/* Center Container */}
      <div className="w-full max-w-md mx-auto px-4 py-8 z-10">
        
        {/* Card */}
        <div className="rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-gold-500/30 p-8 sm:p-10 shadow-2xl shadow-gold/5 relative">
          
          {/* Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <img
              src="/images/logo-butterfly-white.png"
              alt="Agências Araújo"
              className="h-16 w-auto object-contain mb-3 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            />
            <span className="text-[11px] font-mono uppercase tracking-widest text-gold-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Painel de Gestão Oficial
            </span>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('super_admin');
                setEmail('negociosadm.nascimento@gmail.com');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'super_admin'
                  ? 'bg-gold-gradient text-dark-950 shadow-md shadow-gold/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setEmail('admin@agenciasaraujo.com.br');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-gold-gradient text-dark-950 shadow-md shadow-gold/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Role badge explanation */}
          <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <p>
              {activeTab === 'super_admin'
                ? 'Perfil Super Admin: Acesso irrestrito a todos os 13 módulos, incluindo financeiro, pagamentos, contratos e governança do site.'
                : 'Perfil Admin: Acesso operacional aos módulos de atendimento (leads, clientes, agenda, propostas, portfólio e WhatsApp).'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                E-mail de Acesso
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'super_admin' ? 'negociosadm.nascimento@gmail.com' : 'admin@agenciasaraujo.com.br'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-slate-700/80 focus:border-gold focus:outline-none text-white text-sm placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-slate-700/80 focus:border-gold focus:outline-none text-white text-sm placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gold-gradient text-dark-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-gold/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                  Autenticando...
                </span>
              ) : (
                <>
                  <span>Entrar no Ambiente {activeTab === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-slate-900 text-[11px] uppercase tracking-wider font-mono text-slate-400">
              Ou Acesso Imediato de Demonstração
            </span>
          </div>

          {/* 1-Click Demo Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('super_admin')}
              className="w-full py-2.5 px-4 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/40 text-gold-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold" />
                <span>Entrar como <strong>Super Admin</strong> (Acesso Total)</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-gold/20 text-gold px-2 py-0.5 rounded">1-Click</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-400" />
                <span>Entrar como <strong>Admin</strong> (Operacional)</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-white/10 text-slate-300 px-2 py-0.5 rounded">1-Click</span>
            </button>
          </div>

        </div>

      </div>

      {/* Footer Info */}
      <footer className="w-full py-6 text-center text-xs text-slate-500 z-10 border-t border-white/5">
        <p>Agências Araújo • Sistema Integrado de Gestão Fotográfica & Audiovisual RJ</p>
      </footer>
    </div>
  );
}
