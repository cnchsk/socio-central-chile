-- Add trigger to limit maximum 4 stores
CREATE OR REPLACE FUNCTION public.check_max_stores()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.tiendas) >= 4 THEN
    RAISE EXCEPTION 'Máximo de 4 tiendas permitidas';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check before insert
CREATE TRIGGER check_max_stores_trigger
  BEFORE INSERT ON public.tiendas
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_stores();