-- Add vip column to tiendas table
ALTER TABLE public.tiendas ADD COLUMN vip boolean DEFAULT false;

-- Create table for VIP store registrations (pending confirmations)
CREATE TABLE public.vip_store_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  rut TEXT NOT NULL,
  email TEXT NOT NULL,
  direccion TEXT,
  telefono TEXT,
  observaciones TEXT,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for vip_store_registrations
ALTER TABLE public.vip_store_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view registrations
CREATE POLICY "Admins pueden ver registros VIP pendientes" 
ON public.vip_store_registrations 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Add index for token lookups
CREATE INDEX idx_vip_store_registrations_token ON public.vip_store_registrations(token);
CREATE INDEX idx_vip_store_registrations_expires_at ON public.vip_store_registrations(expires_at);