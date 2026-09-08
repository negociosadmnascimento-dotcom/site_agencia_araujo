import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, KeyRound, Building2 } from 'lucide-react';
import { useAuth, PLATFORM_SETTINGS, DEFAULT_TENANT_SETTINGS } from '../../context/AuthContext';
import { isSupabaseConfigured, SUPABASE_PROJECT_ID } from '../../lib/supabase';

export default function LoginView({ onBackToSite, portalMode = 'admin' }) {
  const { login } = useAuth();
  const isSuper = portalMode === 'super_admin';

  const [email, setEmail] = useState(
    isSuper ? 'negociosadm.nascimento@gmail.com' : 'admin@agenciasaraujo.com.br'
  );
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setEmail(isSuper ? 'negociosadm.nascimento@gmail.com' : 'admin@agenciasaraujo.com.br');
    setPassword('');
    setErrorMsg('');
  }, [portalMode, isSuper]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha de acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div 
        className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none ${
          isSuper 
            ? 'bg-radial from-indigo-600/25 via-transparent to-transparent' 
            : 'bg-radial from-amber-500/20 via-transparent to-transparent'
        }`} 
      />
      <div 
        className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none ${
          isSuper 
            ? 'bg-radial from-cyan-600/20 via-transparent to-transparent' 
            : 'bg-radial from-amber-500/15 via-transparent to-transparent'
        }`} 
      />

      {/* Top Header */}
      <header className="w-full px-6 sm:px-12 py-6 flex items-center justify-between z-10">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Site Público</span>
        </button>

        {/* System Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-md">
          <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
          <span>Supabase: {SUPABASE_PROJECT_ID}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
            isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
          }`}>
            {isSupabaseConfigured ? 'Cloud RLS Ativo' : 'Autenticação Segura'}
          </span>
        </div>
      </header>

      {/* Center Container */}
      <div className="w-full max-w-md mx-auto px-4 py-8 z-10">
        
        {/* Card */}
        <div className={`rounded-3xl bg-slate-900/85 backdrop-blur-2xl border p-8 sm:p-10 shadow-2xl relative ${
          isSuper ? 'border-indigo-500/40 shadow-indigo-950/40' : 'border-amber-500/30 shadow-amber-950/20'
        }`}>
          
          {/* Logo & Portal Identity */}
          <div className="flex flex-col items-center text-center mb-8">
            {isSuper ? (
              <>
                <img
                  src={PLATFORM_SETTINGS.logo}
                  alt={PLATFORM_SETTINGS.name}
                  className="h-16 w-16 object-contain mb-3 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                />
                <h1 className="text-xl font-bold text-white tracking-wide">
                  {PLATFORM_SETTINGS.name}
                </h1>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 text-[11px] font-mono uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Central de Governança SaaS • Super Admin</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Acesso restrito à gestão de tenants, infraestrutura e governança global.
                </p>
              </>
            ) : (
              <>
                <img
                  src={DEFAULT_TENANT_SETTINGS.logo}
                  alt={DEFAULT_TENANT_SETTINGS.name}
                  className="h-16 w-auto object-contain mb-3 drop-shadow-[0_0_20px_rgba(212,175,55,0.35)]"
                />
                <h1 className="text-xl font-serif font-bold text-white tracking-wide">
                  {DEFAULT_TENANT_SETTINGS.name}
                </h1>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono uppercase tracking-wider">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Painel Operacional • Tenant #001</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Gestão do site, portfólio, ensaios e atendimento da Agência Araújo.
                </p>
              </>
            )}
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
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
                  placeholder={isSuper ? 'negociosadm.nascimento@gmail.com' : 'admin@agenciasaraujo.com.br'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-slate-700 focus:border-indigo-400 focus:outline-none text-white text-sm placeholder-slate-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Senha Cadastrada
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border border-slate-700 focus:border-indigo-400 focus:outline-none text-white text-sm placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${
                isSuper 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25' 
                  : 'bg-gold-gradient text-dark-950 hover:brightness-110 shadow-gold/20'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Autenticando com Segurança...
                </span>
              ) : (
                <>
                  <span>Entrar no {isSuper ? 'Super Admin' : 'Painel da Agência'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Autenticação criptografada com isolamento estrito de dados por Tenant ID.</span>
            </p>
          </div>

        </div>

      </div>

      {/* Footer Info */}
      <footer className="w-full py-6 text-center text-xs text-slate-500 z-10 border-t border-white/5">
        <p>
          {isSuper 
            ? `${PLATFORM_SETTINGS.name} • ${PLATFORM_SETTINGS.tagline}` 
            : `${DEFAULT_TENANT_SETTINGS.name} • ${DEFAULT_TENANT_SETTINGS.tagline}`
          }
        </p>
      </footer>
    </div>
  );
}
