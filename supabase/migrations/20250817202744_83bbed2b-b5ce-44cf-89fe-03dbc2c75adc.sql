-- Ensure required extension for random password generation
create extension if not exists pgcrypto;

-- Recreate triggers to guarantee they exist
-- Trigger to auto-create profile on new auth user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to prevent RFID changes by non-admin users
drop trigger if exists trg_prevent_rfid_change_if_not_admin on public.profiles;
create trigger trg_prevent_rfid_change_if_not_admin
  before update on public.profiles
  for each row execute function public.prevent_rfid_change_if_not_admin();

-- Create (if missing) or fetch the admin user and upsert their profile
do $$
declare
  v_user_id uuid;
begin
  -- Try to find existing user by email
  select id into v_user_id from auth.users where email = 'heskymartinsa@gmail.com';

  -- If not found, create the user with a strong random password and confirmed email
  if v_user_id is null then
    select id into v_user_id
    from auth.admin.create_user(
      'heskymartinsa@gmail.com',            -- email
      encode(gen_random_bytes(24), 'hex'),  -- random password (48 hex chars)
      true                                   -- email_confirm
    );
  end if;

  -- Upsert profile with admin role and provided details
  insert into public.profiles (id, nombre, email, rut, role)
  values (v_user_id, 'Martins Hesky', 'heskymartinsa@gmail.com', '12.787.018-7', 'admin')
  on conflict (id) do update set
    nombre = excluded.nombre,
    email  = excluded.email,
    rut    = excluded.rut,
    role   = 'admin';
end
$$;