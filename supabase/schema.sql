-- ============================================================================
-- REDE VÔLEI · Schema Supabase (Auth + Tabela de Perfis e Progresso)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================================

-- 1. Tabela de perfis vinculada ao auth.users do Supabase
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  display_name text not null default 'Atleta',
  email text,
  avatar text not null default '🏐',
  role text not null default 'student' check (role in ('student', 'athlete', 'teacher')),
  school_name text not null default 'Escola de Vôlei',
  class_code text not null default 'TURMA-2026',
  progress jsonb not null default '{
    "xp": 0,
    "level": 1,
    "completedQuests": {},
    "unlockedBadges": [],
    "selectedTheme": "arena_teal",
    "highContrast": false,
    "studentName": "Aluno(a) Atleta",
    "schoolName": "Escola de Vôlei",
    "classCode": "TURMA-2026",
    "preferredViewMode": "3d"
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

-- Índice para consultas rápidas por turma/escola
create index if not exists idx_profiles_class_code on public.profiles (class_code);
create index if not exists idx_profiles_username on public.profiles (username);

-- 2. Ativar Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Políticas de segurança estritas por usuário autenticado
drop policy if exists "Usuários podem ler o próprio perfil" on public.profiles;
create policy "Usuários podem ler o próprio perfil"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Usuários podem criar o próprio perfil" on public.profiles;
create policy "Usuários podem criar o próprio perfil"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Usuários podem atualizar o próprio perfil" on public.profiles;
create policy "Usuários podem atualizar o próprio perfil"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3. Trigger para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- 4. Trigger opcional para criar perfil automaticamente ao cadastrar no Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  v_username text;
  v_display_name text;
begin
  meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_username := coalesce(
    nullif(trim(meta->>'username'), ''),
    split_part(coalesce(new.email, 'atleta'), '@', 1) || '_' || substr(new.id::text, 1, 4)
  );
  v_display_name := coalesce(
    nullif(trim(meta->>'display_name'), ''),
    nullif(trim(meta->>'full_name'), ''),
    split_part(coalesce(new.email, 'Atleta'), '@', 1)
  );

  insert into public.profiles (
    id,
    username,
    display_name,
    email,
    avatar,
    role,
    school_name,
    class_code,
    progress
  )
  values (
    new.id,
    lower(v_username),
    v_display_name,
    new.email,
    coalesce(nullif(meta->>'avatar', ''), '🏐'),
    case
      when meta->>'role' in ('student', 'athlete', 'teacher') then meta->>'role'
      else 'student'
    end,
    coalesce(nullif(meta->>'school_name', ''), 'Escola de Vôlei'),
    coalesce(nullif(meta->>'class_code', ''), 'TURMA-2026'),
    coalesce(
      meta->'initial_progress',
      jsonb_build_object(
        'xp', 0,
        'level', 1,
        'completedQuests', '{}'::jsonb,
        'unlockedBadges', '[]'::jsonb,
        'selectedTheme', 'arena_teal',
        'highContrast', false,
        'studentName', v_display_name,
        'schoolName', coalesce(nullif(meta->>'school_name', ''), 'Escola de Vôlei'),
        'classCode', coalesce(nullif(meta->>'class_code', ''), 'TURMA-2026'),
        'preferredViewMode', '3d'
      )
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
