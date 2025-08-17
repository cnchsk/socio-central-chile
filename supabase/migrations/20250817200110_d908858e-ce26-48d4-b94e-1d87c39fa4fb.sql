-- 1) Tabela profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('admin','vip','public')) default 'public',
  nombre text not null,
  email text unique not null,
  rut text unique not null,
  rfid text unique,
  creado_en timestamptz default timezone('utc', now())
);

-- 2) RLS
alter table public.profiles enable row level security;

-- Função auxiliar para checar admin (evita recursão em RLS)
create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p where p.id = _user_id and p.role = 'admin'
  );
$$;

-- Policies
-- Usuário vê o próprio perfil
create policy if not exists "Usuarios pueden ver su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- Admin pode ver todos
create policy if not exists "Admins pueden ver todos los perfiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- Usuário pode atualizar o próprio (validação de RFID será via trigger)
create policy if not exists "Usuarios pueden editar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin pode atualizar qualquer
create policy if not exists "Solo admin puede editar cualquier perfil"
  on public.profiles for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Inserção no autoregistro (caso necessário)
create policy if not exists "Autoregistro de nuevos usuarios"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'public');

-- 3) Trigger para criação automática de perfil após signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email, rut)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'rut', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4) Trigger para impedir mudança de RFID por não-admin
create or replace function public.prevent_rfid_change_if_not_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.rfid is distinct from OLD.rfid then
    if not public.is_admin(auth.uid()) then
      raise exception 'Solo admin puede modificar RFID';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_prevent_rfid on public.profiles;
create trigger trg_prevent_rfid
  before update on public.profiles
  for each row execute procedure public.prevent_rfid_change_if_not_admin();