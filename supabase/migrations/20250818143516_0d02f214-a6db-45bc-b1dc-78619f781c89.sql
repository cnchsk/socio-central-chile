-- Fix security warnings by setting search_path for function
CREATE OR REPLACE FUNCTION public.check_max_stores()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.tiendas) >= 4 THEN
    RAISE EXCEPTION 'Máximo de 4 tiendas permitidas';
  END IF;
  RETURN NEW;
END;
$$;