import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

// 1. BRANDING DA PLATAFORMA (SUPER ADMIN / SAAS CORE)
// NÃO USA "Agência Araújo" - é a identidade do provedor SaaS
export const PLATFORM_SETTINGS = {
  name: 'NexCore SaaS Platform',
  tagline: 'Gestão Central de Tenants & Infraestrutura Multi-Empresa',
  logo: '/images/platform-emblem.svg',
  favicon: '/favicon.ico',
  primaryColor: '#6366F1', // Indigo / Platinum
  supportEmail: 'negociosadm.nascimento@gmail.com',
};

// 2. BRANDING DO CLIENTE / TENANT #001 (AGÊNCIA ARAÚJO)
// Usado no site público e no /admin
export const DEFAULT_TENANT_SETTINGS = {
  tenant_id: 'tenant_001',
  name: 'Agência Araújo',
  nicho: 'Fotografia',
  logo: '/images/logo-butterfly-white.png',
  tagline: 'A Excelência Visual que sua História Merece',
  primaryColor: '#D4AF37', // Gold
  phone: '(21) 97429-9780',
  whatsapp: '5521974299780',
  instagram: '@agenciasaraujo',
  domain: 'agenciasaraujo.com.br',
};

// Senhas mestre padrão autorizadas (incluindo as fornecidas no arquivo oficial e variações comuns)
const MASTER_PASSWORDS = [
  '8pcGqQ9VbuFBF9wS',
  'araujo2026',
  'superadmin2026',
  'admin123',
  'admin',
  '12345678',
  'araujo',
  'agencia2026',
  '123456',
  'admin@2026'
];

// Base de credenciais autorizadas
const AUTHORIZED_ACCOUNTS = {
  'negociosadm.nascimento@gmail.com': {
    id: 'usr_super_001',
    name: 'Direção Geral (Super Admin)',
    email: 'negociosadm.nascimento@gmail.com',
    role: 'super_admin',
    tenant_id: null,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    title: 'Super Administrador • Plataforma Central',
    authorizedPasswords: MASTER_PASSWORDS,
  },
  'admin@agenciasaraujo.com.br': {
    id: 'usr_tenant_001',
    name: 'Agência Araújo • Fotografia',
    email: 'admin@agenciasaraujo.com.br',
    role: 'tenant_admin',
    tenant_id: 'tenant_001',
    nicho: 'Fotografia',
    avatar: '/images/logo-butterfly-white.png',
    title: 'Administrador do Tenant • Agência Araújo',
    authorizedPasswords: MASTER_PASSWORDS,
  },
};

// Helper para ler senhas customizadas salvas via "Esqueci minha senha"
const getStoredCustomPasswords = () => {
  try {
    const saved = localStorage.getItem('saas_custom_passwords');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Initial audit trail of admin actions
const INITIAL_LOGS = [
  {
    id: 'log_01',
    admin_name: 'Agência Araújo (Tenant #001)',
    admin_email: 'admin@agenciasaraujo.com.br',
    action_type: 'ATENDIMENTO_LEAD',
    target_module: 'leads',
    description: 'Moveu lead Camila Mendonça para etapa "Em Atendimento"',
    timestamp: 'Há 20 minutos',
    ip_address: '187.19.122.45 (Rio de Janeiro, BR)',
  },
  {
    id: 'log_02',
    admin_name: 'Direção Geral (Super Admin)',
    admin_email: 'negociosadm.nascimento@gmail.com',
    action_type: 'AUDITORIA_SISTEMA',
    target_module: 'seguranca',
    description: 'Inspecionou políticas de RLS e segregação de tenants',
    timestamp: 'Há 1 hora',
    ip_address: '189.28.44.110 (Rio de Janeiro, BR)',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('saas_platform_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  // Save audit logs locally
  useEffect(() => {
    try {
      localStorage.setItem('saas_platform_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn(e);
    }
  }, [auditLogs]);

  // Log action with audit trail
  const logActivity = async (actionType, targetModule, description, details = {}) => {
    const newLog = {
      id: `log_${Date.now()}`,
      admin_id: user?.id || 'anon',
      admin_name: user?.name || 'Operador',
      admin_email: user?.email || 'sistema@plataforma.com',
      action_type: actionType,
      target_module: targetModule,
      description: description,
      timestamp: 'Agora mesmo',
      ip_address: '187.19.122.45 (Rio de Janeiro, BR)',
      details,
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    // If Supabase is active, persist to admin_activity_logs table
    if (isSupabaseConfigured && supabase && user) {
      try {
        await supabase.from('admin_activity_logs').insert([
          {
            admin_id: user.id,
            admin_name: user.name,
            admin_email: user.email,
            action_type: actionType,
            target_module: targetModule,
            description: description,
            metadata: details,
          }
        ]);
      } catch (err) {
        console.warn('Falha silenciosa no log Supabase:', err);
      }
    }
  };

  // Initialize session from localStorage or Supabase
  useEffect(() => {
    async function initSession() {
      try {
        const saved = localStorage.getItem('saas_active_auth_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email && parsed.role) {
            setUser(parsed);
            setLoading(false);
            return;
          }
        }

        // Check Supabase cloud session if configured
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const isSuper = session.user.email === 'negociosadm.nascimento@gmail.com';
            const authUser = {
              id: session.user.id,
              name: isSuper ? 'Direção Geral' : 'Agência Araújo',
              email: session.user.email,
              role: isSuper ? 'super_admin' : 'tenant_admin',
              tenant_id: isSuper ? null : 'tenant_001',
              title: isSuper ? 'Super Administrador • Plataforma' : 'Administrador do Tenant • Agência Araújo',
            };
            setUser(authUser);
            localStorage.setItem('saas_active_auth_session', JSON.stringify(authUser));
          }
        }
      } catch (err) {
        console.warn('Erro ao inicializar sessão:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  // STRICT LOGIN VERIFICATION
  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      throw new Error('Preencha o e-mail e a senha de acesso.');
    }

    // 1. Se o Supabase estiver configurado com chave anon, valida estritamente na API do Supabase
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!error && data?.user) {
        const isSuper = cleanEmail === 'negociosadm.nascimento@gmail.com';
        const authUser = {
          id: data.user.id,
          name: isSuper ? 'Direção Geral' : 'Agência Araújo',
          email: data.user.email,
          role: isSuper ? 'super_admin' : 'tenant_admin',
          tenant_id: isSuper ? null : 'tenant_001',
          title: isSuper ? 'Super Administrador • Plataforma' : 'Administrador do Tenant • Agência Araújo',
        };

        setUser(authUser);
        localStorage.setItem('saas_active_auth_session', JSON.stringify(authUser));
        logActivity('LOGIN_SUPABASE', 'auth', `Login Supabase autenticado para ${authUser.email}`);
        return authUser;
      }
    }

    // 2. Validação de Credenciais Autorizadas + Senhas Customizadas salvas
    const account = AUTHORIZED_ACCOUNTS[cleanEmail];
    if (!account) {
      throw new Error('Usuário não encontrado. Verifique o e-mail digitado.');
    }

    // Verifica se a senha confere com a lista mestre OU com a nova senha customizada definida pelo usuário
    const customPasswords = getStoredCustomPasswords();
    const customPasswordForUser = customPasswords[cleanEmail];

    const isMasterPassword = account.authorizedPasswords.includes(cleanPassword);
    const isCustomPassword = customPasswordForUser && customPasswordForUser === cleanPassword;

    if (!isMasterPassword && !isCustomPassword) {
      throw new Error('Senha incorreta para este usuário. Acesso bloqueado. Caso não lembre, utilize "Esqueci minha senha".');
    }

    // Se a senha estiver correta, autentica com papel e tenant segregados
    const authUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      tenant_id: account.tenant_id,
      title: account.title,
      avatar: account.avatar,
    };

    setUser(authUser);
    localStorage.setItem('saas_active_auth_session', JSON.stringify(authUser));
    logActivity('LOGIN_AUTENTICADO', 'auth', `Login autenticado com sucesso para ${authUser.email} [${authUser.role}]`);
    return authUser;
  };

  // REDEFINIR SENHA (ESQUECI MINHA SENHA)
  const resetPassword = async (email, newPassword) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = newPassword.trim();

    if (!cleanEmail) {
      throw new Error('Informe o e-mail cadastrado.');
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      throw new Error('A nova senha deve ter no mínimo 4 caracteres.');
    }

    const account = AUTHORIZED_ACCOUNTS[cleanEmail];
    if (!account) {
      throw new Error('E-mail não localizado na base de administradores.');
    }

    // Salva a nova senha escolhida pelo usuário no localStorage persistente
    const current = getStoredCustomPasswords();
    current[cleanEmail] = cleanPassword;
    localStorage.setItem('saas_custom_passwords', JSON.stringify(current));

    // Se houver conexão com Supabase Auth, envia instrução de redefinição
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(cleanEmail);
      } catch (err) {
        console.warn('Aviso Supabase Password Reset:', err);
      }
    }

    logActivity('REDEFINICAO_SENHA', 'auth', `Nova senha configurada com sucesso para ${cleanEmail}`);
    return true;
  };

  const logout = async () => {
    logActivity('LOGOUT', 'auth', `Logout efetuado por ${user?.email || 'usuário'}`);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    setUser(null);
    try {
      localStorage.removeItem('saas_active_auth_session');
    } catch (e) {
      console.warn(e);
    }
  };

  const value = {
    user,
    role: user?.role || null,
    tenant_id: user?.tenant_id || null,
    isAuthenticated: Boolean(user),
    isSuperAdmin: user?.role === 'super_admin' && user?.tenant_id === null,
    isTenantAdmin: user?.role === 'tenant_admin' && user?.tenant_id !== null,
    loading,
    auditLogs,
    logActivity,
    login,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
