-- Crear la tabla profiles
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    role text check (role in ('admin', 'vip', 'public')) default 'public',
    nombre text not null,
    email text unique not null,
    rut text unique not null,
    rfid text unique,
    creado_en timestamptz default timezone('utc', now())
);

-- Habilitar Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Política: Cada usuario puede ver y editar solo su propio perfil
create policy "Usuarios pueden ver su propio perfil"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Usuarios pueden editar su propio perfil"
    on public.profiles for update
    using (auth.uid() = id)
    with check (
        -- Si no es admin, no puede modificar RFID
        (role = 'admin') OR (rfid is not distinct from old.rfid)
    );

-- Política: Solo admin puede asignar/editar RFID de otros
create policy "Solo admin puede editar cualquier perfil"
    on public.profiles for update
    using (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin'
        )
    );

-- Política: Permitir insertar perfil al registrarse (public)
create policy "Autoregistro de nuevos usuarios"
    on public.profiles for insert
    with check (auth.uid() = id AND role = 'public');

-- Trigger para crear perfil automáticamente al registrarse en auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, nombre, email, rut)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'nombre', ''),
        new.email,
        coalesce(new.raw_user_meta_data->>'rut', '')
    );
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();