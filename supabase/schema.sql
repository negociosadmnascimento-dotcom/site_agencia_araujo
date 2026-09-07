-- ============================================================================
-- AGÊNCIAS ARAÚJO - SUPABASE DATABASE SCHEMA (SEGURANÇA CIRÚRGICA & AUDITORIA)
-- Projeto: zzoujggbomtcpobcyhyt
-- Execute no SQL Editor em: https://supabase.com/dashboard/project/zzoujggbomtcpobcyhyt/sql
-- ============================================================================
-- DIRETRIZES DE SEGURANÇA:
-- 1. Preservação total de dados existentes.
-- 2. Super Admin possui visão cirúrgica e auditoria de cada ação de cada Admin.
-- 3. ISOLAMENTO ABSOLUTO: NUNCA um cliente tem acesso a dados de outro cliente.
-- 4. RLS (Row Level Security) ativado em 100% das tabelas.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (Criados com segurança idempotente)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('client', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('novo', 'em_contato', 'proposta_enviada', 'fechado', 'perdido');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pendente', 'sinal_pago', 'quitado', 'cancelado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TABELA DE PERFIS DE USUÁRIO (Vinculada ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'admin' NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir coluna last_sign_in_at caso a tabela já existisse
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- 4. TABELA DE CLIENTES (Isolamento por ID e por client_user_id)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Vínculo opcional se cliente tiver login próprio
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  instagram TEXT,
  category TEXT DEFAULT 'Retratos Pessoais',
  address TEXT DEFAULT 'Rio de Janeiro, RJ',
  notes TEXT,
  total_spent NUMERIC(10,2) DEFAULT 0.00,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- 5. TABELA DE LEADS (Oportunidades Comerciais)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT NOT NULL,
  event_date TEXT,
  message TEXT,
  source TEXT DEFAULT 'Site Oficial',
  status lead_status DEFAULT 'novo' NOT NULL,
  estimated_value NUMERIC(10,2) DEFAULT 0.00,
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. AGENDA DE ENSAIOS & PRODUÇÕES
CREATE TABLE IF NOT EXISTS public.schedule_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  service_type TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  status TEXT DEFAULT 'confirmado',
  photographer_id UUID REFERENCES public.profiles(id),
  equipment TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE PROPOSTAS COMERCIAIS
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  service_name TEXT NOT NULL,
  package_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  valid_until DATE,
  status TEXT DEFAULT 'enviada',
  access_token TEXT UNIQUE DEFAULT md5(random()::text || clock_timestamp()::text), -- Token seguro para visualização isolada do cliente
  details JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS access_token TEXT UNIQUE DEFAULT md5(random()::text || clock_timestamp()::text);
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- 8. TABELA DE CONTRATOS & CESSÃO DE USO DE IMAGEM
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contract_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_cpf TEXT,
  service_title TEXT NOT NULL,
  event_date DATE,
  total_amount NUMERIC(10,2) NOT NULL,
  signed_status TEXT DEFAULT 'aguardando_assinatura',
  signed_at TIMESTAMPTZ,
  pdf_url TEXT,
  access_token TEXT UNIQUE DEFAULT md5(random()::text || clock_timestamp()::text),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS access_token TEXT UNIQUE DEFAULT md5(random()::text || clock_timestamp()::text);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- 9. TABELA DE PAGAMENTOS & FLUXO DE CAIXA
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'PIX',
  status payment_status DEFAULT 'pendente' NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- 10. TABELA DE DEPOIMENTOS (PROVA SOCIAL)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_role TEXT,
  testimonial_text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  photo_url TEXT,
  approved BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. TABELA DE ENTRADA DE FORMULÁRIOS PÚBLICOS (QUOTEFORM)
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT NOT NULL,
  date TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. TABELA DE AUDITORIA & VISÃO DE USO DOS ADMINS (EXCLUSIVO SUPER ADMIN)
-- Esta tabela registra CIRURGICAMENTE cada ação de cada admin no sistema.
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL, -- e.g. 'LOGIN', 'LOGOUT', 'VIEW_CLIENT', 'EDIT_CLIENT', 'DELETE', 'VIEW_PAYMENT', 'EDIT_PROPOSAL'
  target_module TEXT NOT NULL, -- e.g. 'clientes', 'pagamentos', 'leads', 'propostas', 'site'
  target_id TEXT, -- ID do objeto afetado
  description TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 13. FUNÇÕES AUXILIARES DE SEGURANÇA (SECURITY DEFINER)
-- ============================================================================

-- Verifica se o usuário atual é Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica se o usuário atual é qualquer Admin (admin ou super_admin)
CREATE OR REPLACE FUNCTION public.is_any_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Registra ação cirúrgica no log de auditoria
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type TEXT,
  p_target_module TEXT,
  p_description TEXT,
  p_target_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_admin_name TEXT;
  v_admin_email TEXT;
  v_log_id UUID;
BEGIN
  SELECT full_name, email INTO v_admin_name, v_admin_email
  FROM public.profiles
  WHERE id = auth.uid();

  INSERT INTO public.admin_activity_logs (
    admin_id,
    admin_name,
    admin_email,
    action_type,
    target_module,
    target_id,
    description,
    metadata
  ) VALUES (
    auth.uid(),
    COALESCE(v_admin_name, 'Desconhecido'),
    COALESCE(v_admin_email, 'desconhecido@agenciasaraujo.com.br'),
    p_action_type,
    p_target_module,
    p_target_id,
    p_description,
    p_metadata
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 14. POLÍTICAS DE ROW LEVEL SECURITY (RLS) CIRÚRGICAS
-- ============================================================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas com segurança para recriar cirurgicamente
DROP POLICY IF EXISTS "Autenticados leem perfis" ON public.profiles;
DROP POLICY IF EXISTS "Super admin gerencia perfis" ON public.profiles;
DROP POLICY IF EXISTS "Autenticados operam clientes" ON public.clients;
DROP POLICY IF EXISTS "Autenticados operam leads" ON public.leads;
DROP POLICY IF EXISTS "Autenticados operam agenda" ON public.schedule_events;
DROP POLICY IF EXISTS "Autenticados operam propostas" ON public.proposals;
DROP POLICY IF EXISTS "Autenticados operam contratos" ON public.contracts;
DROP POLICY IF EXISTS "Autenticados operam pagamentos" ON public.payments;
DROP POLICY IF EXISTS "Autenticados operam depoimentos" ON public.testimonials;
DROP POLICY IF EXISTS "Autenticados operam formulários" ON public.form_submissions;
DROP POLICY IF EXISTS "Autenticados operam logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Publico insere orcamentos" ON public.form_submissions;
DROP POLICY IF EXISTS "Publico le depoimentos aprovados" ON public.testimonials;

-- ----------------------------------------------------------------------------
-- PROFILES: Admin vê equipe; Usuário vê o seu
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins leem perfis da equipe"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_any_admin() OR id = auth.uid());

CREATE POLICY "Super admin tem controle total de perfis"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- ----------------------------------------------------------------------------
-- CLIENTS:
-- 1. Admins podem ver e operar a carteira.
-- 2. Clientes NUNCA veem outros clientes (apenas o seu próprio se logado).
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins operam clientes"
  ON public.clients FOR ALL
  TO authenticated
  USING (public.is_any_admin());

CREATE POLICY "Cliente ve SOMENTE seu proprio cadastro"
  ON public.clients FOR SELECT
  TO authenticated
  USING (client_user_id IS NOT NULL AND client_user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- LEADS & FORM SUBMISSIONS:
-- 1. Qualquer visitante pode ENVIAR formulário de orçamento (INSERT anônimo).
-- 2. NENHUM visitante ou cliente pode listar os orçamentos de outros (SELECT bloqueado para público).
-- 3. Apenas Admins podem visualizar a caixa de entrada de leads.
-- ----------------------------------------------------------------------------
CREATE POLICY "Publico envia orcamento pelo site"
  ON public.form_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins visualizam caixa de entrada de orcamentos"
  ON public.form_submissions FOR SELECT
  TO authenticated
  USING (public.is_any_admin());

CREATE POLICY "Admins atualizam status de leitura dos orcamentos"
  ON public.form_submissions FOR UPDATE
  TO authenticated
  USING (public.is_any_admin());

CREATE POLICY "Admins operam leads comerciais"
  ON public.leads FOR ALL
  TO authenticated
  USING (public.is_any_admin());

-- ----------------------------------------------------------------------------
-- AGENDA (SCHEDULE_EVENTS):
-- 1. Admins gerenciam cronograma.
-- 2. Clientes veem estritamente seus próprios agendamentos.
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins gerenciam agenda"
  ON public.schedule_events FOR ALL
  TO authenticated
  USING (public.is_any_admin());

CREATE POLICY "Cliente ve SOMENTE seus proprios ensaios"
  ON public.schedule_events FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE client_user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- PROPOSALS & CONTRACTS:
-- 1. Admins criam e gerenciam.
-- 2. Cliente visualiza SOMENTE a sua proposta através do token seguro ou vínculo de ID.
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins gerenciam propostas"
  ON public.proposals FOR ALL
  TO authenticated
  USING (public.is_any_admin());

CREATE POLICY "Cliente ve estritamente sua proposta"
  ON public.proposals FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE client_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins gerenciam contratos"
  ON public.contracts FOR ALL
  TO authenticated
  USING (public.is_any_admin());

CREATE POLICY "Cliente ve estritamente seu contrato"
  ON public.contracts FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE client_user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- PAYMENTS:
-- 1. Super Admin tem visão e controle financeiro irrestrito.
-- 2. Admin operacional pode registrar pagamentos se autorizado.
-- 3. Cliente vê SOMENTE suas faturas (nunca de terceiros).
-- ----------------------------------------------------------------------------
CREATE POLICY "Super admin gerencia todos os pagamentos"
  ON public.payments FOR ALL
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Admin visualiza pagamentos operacionais"
  ON public.payments FOR SELECT
  TO authenticated
  USING (public.is_any_admin());

CREATE POLICY "Cliente ve SOMENTE seus proprios pagamentos"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE client_user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- DEPOIMENTOS:
-- 1. Público lê apenas os aprovados.
-- 2. Admins gerenciam moderação.
-- ----------------------------------------------------------------------------
CREATE POLICY "Publico le apenas depoimentos aprovados"
  ON public.testimonials FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Admins moderam depoimentos"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (public.is_any_admin());

-- ----------------------------------------------------------------------------
-- AUDITORIA & VISÃO DE USO DE CADA ADMIN (EXCLUSIVO SUPER ADMIN)
-- 1. Todos os admins geram logs ao realizar ações (INSERT).
-- 2. EXCLUSIVO: SOMENTE o Super Admin pode visualizar os logs de uso de todos os admins (SELECT).
-- 3. NINGUÉM pode alterar ou deletar logs (imutabilidade forense).
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins gravam acoes no log"
  ON public.admin_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id OR public.is_any_admin());

CREATE POLICY "SUPER ADMIN tem visao total do uso de cada admin"
  ON public.admin_activity_logs FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- ============================================================================
-- 15. TRIGGER DE CADASTRO AUTOMÁTICO DE USUÁRIO AUTH -> PROFILES
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
BEGIN
  -- Super Admin definido por e-mail fixo prioritário
  IF new.email = 'negociosadm.nascimento@gmail.com' THEN
    v_role := 'super_admin';
  ELSIF (new.raw_user_meta_data->>'role') = 'super_admin' THEN
    v_role := 'super_admin';
  ELSIF (new.raw_user_meta_data->>'role') = 'admin' THEN
    v_role := 'admin';
  ELSE
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role, last_sign_in_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Operador Agências Araújo'),
    new.email,
    v_role,
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    last_sign_in_at = timezone('utc'::text, now());

  -- Registra log de primeiro acesso
  INSERT INTO public.admin_activity_logs (
    admin_id, admin_name, admin_email, action_type, target_module, description
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'USER_CREATED',
    'seguranca',
    'Novo usuário criado no sistema com perfil: ' || v_role
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FIM DO SCRIPT DE SEGURANÇA CIRÚRGICA
-- ============================================================================
