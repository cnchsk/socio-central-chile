-- 1) Crear tabla profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('admin','vip','public')) default 'public',
  nombre text not null,
  email text unique not null,
  rut text unique not null,
  rfid text unique,
  creado_en timestamptz default timezone('utc', now())
);

-- 2) Habilitar RLS
alter table public.profiles enable row level security;

-- 3) Función auxiliar para verificar si el usuario es admin (evita recursión)
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

-- 4) Crear políticas RLS
-- Limpiar políticas existentes primero
drop policy if exists "Usuarios pueden ver su propio perfil" on public.profiles;
drop policy if exists "Admins pueden ver todos los perfiles" on public.profiles;
drop policy if exists "Usuarios pueden editar su propio perfil" on public.profiles;
drop policy if exists "Solo admin puede editar cualquier perfil" on public.profiles;
drop policy if exists "Autoregistro de nuevos usuarios" on public.profiles;

-- Usuario puede ver su propio perfil
create policy "Usuarios pueden ver su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- Admin puede ver todos los perfiles
create policy "Admins pueden ver todos los perfiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- Usuario puede editar su propio perfil (validación de RFID vía trigger)
create policy "Usuarios pueden editar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin puede editar cualquier perfil
create policy "Solo admin puede editar cualquier perfil"
  on public.profiles for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Permitir inserción durante autoregistro
create policy "Autoregistro de nuevos usuarios"
  on public.profiles for insert
  with check (auth.uid() = id and role = 'public');

-- 5) Trigger para crear perfil automáticamente al registrarse
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

-- 6) Trigger para impedir que no-admin modifique RFID
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