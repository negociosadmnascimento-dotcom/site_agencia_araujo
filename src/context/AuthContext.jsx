import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

const MOCK_USERS = {
  admin: {
    id: 'usr_admin_001',
    name: 'Operador Admin (Produção)',
    email: 'admin@agenciasaraujo.com.br',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    title: 'Administrador de Atendimento & Produção',
  },
  super_admin: {
    id: 'usr_super_001',
    name: 'Direção Geral (Super Admin)',
    email: 'negociosadm.nascimento@gmail.com',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    title: 'Super Administrador • Auditoria & Controle Total',
  },
};

// Initial audit trail of admin actions
const INITIAL_LOGS = [
  {
    id: 'log_01',
    admin_name: 'Operador Admin (Produção)',
    admin_email: 'admin@agenciasaraujo.com.br',
    action_type: 'ATENDIMENTO_LEAD',
    target_module: 'leads',
    description: 'Moveu o lead "Camila Mendonça" para etapa "Em Atendimento"',
    timestamp: 'Há 18 minutos',
    ip_address: '187.19.122.45 (Rio de Janeiro, BR)',
  },
  {
    id: 'log_02',
    admin_name: 'Operador Admin (Produção)',
    admin_email: 'admin@agenciasaraujo.com.br',
    action_type: 'AGENDA_CONFIRMADA',
    target_module: 'agenda',
    description: 'Enviou confirmação de ensaio Maracanã para cliente',
    timestamp: 'Há 45 minutos',
    ip_address: '187.19.122.45 (Rio de Janeiro, BR)',
  },
  {
    id: 'log_03',
    admin_name: 'Direção Geral (Super Admin)',
    admin_email: 'negociosadm.nascimento@gmail.com',
    action_type: 'AUDITORIA_SISTEMA',
    target_module: 'seguranca',
    description: 'Inspecionou políticas de RLS e isolamento multi-tenant de clientes',
    timestamp: 'Há 1 hora',
    ip_address: '189.28.44.110 (Rio de Janeiro, BR)',
  },
  {
    id: 'log_04',
    admin_name: 'Operador Admin (Produção)',
    admin_email: 'admin@agenciasaraujo.com.br',
    action_type: 'PROPOSTA_GERADA',
    target_module: 'propostas',
    description: 'Gerou orçamento #PROP-2026-042 (R$ 3.800,00)',
    timestamp: 'Há 3 horas',
    ip_address: '187.19.122.45 (Rio de Janeiro, BR)',
  },
  {
    id: 'log_05',
    admin_name: 'Direção Geral (Super Admin)',
    admin_email: 'negociosadm.nascimento@gmail.com',
    action_type: 'CONTRATO_EMISSAO',
    target_module: 'contratos',
    description: 'Validou minuta jurídica de cessão de imagem',
    timestamp: 'Há 5 horas',
    ip_address: '189.28.44.110 (Rio de Janeiro, BR)',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('agencias_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  // Save audit logs locally
  useEffect(() => {
    try {
      localStorage.setItem('agencias_audit_logs', JSON.stringify(auditLogs));
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
      admin_email: user?.email || 'admin@agenciasaraujo.com.br',
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
        // 1. Check local mock session
        const saved = localStorage.getItem('agencias_auth_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.role) {
            setUser(parsed);
            setLoading(false);
            return;
          }
        }

        // 2. If Supabase is configured, check cloud session
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const role = profile?.role || session.user.user_metadata?.role || 'admin';
            setUser({
              id: session.user.id,
              name: profile?.full_name || session.user.user_metadata?.full_name || 'Usuário Agências Araújo',
              email: session.user.email,
              role: role,
              avatar: profile?.avatar_url || null,
              title: role === 'super_admin' ? 'Super Administrador • Acesso Total' : 'Administrador de Produção',
            });
          }
        }
      } catch (err) {
        console.warn('Erro ao inicializar sessão:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    // Listen to Supabase auth state changes if configured
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const role = profile?.role || session.user.user_metadata?.role || 'admin';
          const authUser = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata?.full_name || 'Usuário Agências Araújo',
            email: session.user.email,
            role: role,
            avatar: profile?.avatar_url || null,
            title: role === 'super_admin' ? 'Super Administrador • Acesso Total' : 'Administrador de Produção',
          };
          setUser(authUser);
          localStorage.setItem('agencias_auth_session', JSON.stringify(authUser));
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  // Login as Demo / Local Operator
  const loginAs = (role = 'admin') => {
    const selected = MOCK_USERS[role] || MOCK_USERS.admin;
    setUser(selected);
    try {
      localStorage.setItem('agencias_auth_session', JSON.stringify(selected));
    } catch (e) {
      console.warn(e);
    }
    logActivity('LOGIN', 'auth', `Login realizado como ${role === 'super_admin' ? 'Super Admin' : 'Admin'}`);
    return selected;
  };

  // Login with Supabase credentials
  const loginWithSupabase = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase ainda não configurado com a chave anon. Use o Acesso Rápido ou adicione a chave no arquivo .env.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role || data.user.user_metadata?.role || 'admin';
    const authUser = {
      id: data.user.id,
      name: profile?.full_name || data.user.user_metadata?.full_name || 'Usuário Agências Araújo',
      email: data.user.email,
      role: role,
      avatar: profile?.avatar_url || null,
      title: role === 'super_admin' ? 'Super Administrador • Acesso Total' : 'Administrador de Produção',
    };

    setUser(authUser);
    localStorage.setItem('agencias_auth_session', JSON.stringify(authUser));
    logActivity('LOGIN_SUPABASE', 'auth', `Login Supabase autenticado para ${authUser.email}`);
    return authUser;
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
      localStorage.removeItem('agencias_auth_session');
    } catch (e) {
      console.warn(e);
    }
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isSuperAdmin: user?.role === 'super_admin',
    loading,
    auditLogs,
    logActivity,
    loginAs,
    loginWithSupabase,
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
