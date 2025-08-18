-- Crear tabla de tiendas
CREATE TABLE public.tiendas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  rut text NOT NULL UNIQUE,
  direccion text,
  telefono text,
  email text,
  activa boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS en tiendas
ALTER TABLE public.tiendas ENABLE ROW LEVEL SECURITY;

-- Crear políticas para tiendas
CREATE POLICY "Admins pueden gestionar tiendas" 
ON public.tiendas 
FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Crear tabla de relación cliente-tienda (muchos a muchos)
CREATE TABLE public.cliente_tiendas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tienda_id uuid NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(cliente_id, tienda_id)
);

-- Habilitar RLS en cliente_tiendas
ALTER TABLE public.cliente_tiendas ENABLE ROW LEVEL SECURITY;

-- Crear políticas para cliente_tiendas
CREATE POLICY "Admins pueden gestionar relaciones cliente-tienda" 
ON public.cliente_tiendas 
FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Insertar algunas tiendas de ejemplo
INSERT INTO public.tiendas (nombre, rut, direccion, telefono, email) VALUES
('Tienda Central', '12.345.678-9', 'Av. Providencia 123, Santiago', '+56 2 2345 6789', 'central@tiendas.cl'),
('Tienda Las Condes', '98.765.432-1', 'Av. Apoquindo 456, Las Condes', '+56 2 9876 5432', 'lascondes@tiendas.cl'),
('Tienda Ñuñoa', '11.222.333-4', 'Av. Grecia 789, Ñuñoa', '+56 2 1122 3344', 'nunoa@tiendas.cl'),
('Tienda Valparaíso', '55.666.777-8', 'Av. Brasil 321, Valparaíso', '+56 32 5566 7788', 'valparaiso@tiendas.cl');

-- Crear trigger para actualizar updated_at en tiendas
CREATE TRIGGER update_tiendas_updated_at
  BEFORE UPDATE ON public.tiendas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para actualizar updated_at (si no existe)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;