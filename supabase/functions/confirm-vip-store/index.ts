import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        `<html><body><h1>Error</h1><p>Token no proporcionado</p></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Find registration by token
    const { data: registration, error: fetchError } = await supabase
      .from('vip_store_registrations')
      .select('*')
      .eq('token', token)
      .single();

    if (fetchError || !registration) {
      console.error("Registration not found:", fetchError);
      return new Response(
        `<html><body><h1>Error</h1><p>Registro no encontrado o token inválido</p></body></html>`,
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }

    // Check if already confirmed
    if (registration.confirmed_at) {
      return new Response(
        `<html><body><h1>Ya confirmado</h1><p>Este registro ya ha sido confirmado anteriormente</p></body></html>`,
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(registration.expires_at);
    if (now > expiresAt) {
      return new Response(
        `<html><body><h1>Enlace expirado</h1><p>Este enlace de confirmación ha expirado. Por favor, solicita un nuevo registro</p></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Create the VIP store in tiendas table
    const { error: insertError } = await supabase
      .from('tiendas')
      .insert({
        nombre: registration.nombre,
        rut: registration.rut,
        email: registration.email,
        direccion: registration.direccion,
        telefono: registration.telefono,
        vip: true,
        activa: true,
      });

    if (insertError) {
      console.error("Error creating store:", insertError);
      return new Response(
        `<html><body><h1>Error</h1><p>Error al crear la tienda: ${insertError.message}</p></body></html>`,
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }

    // Mark registration as confirmed
    const { error: updateError } = await supabase
      .from('vip_store_registrations')
      .update({ confirmed_at: now.toISOString() })
      .eq('token', token);

    if (updateError) {
      console.error("Error updating registration:", updateError);
    }

    console.log(`VIP store registered successfully: ${registration.nombre}`);

    // Return success page
    return new Response(
      `<html>
        <head>
          <title>Registro Confirmado</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .success { color: #28a745; }
            .card { border: 1px solid #ddd; border-radius: 8px; padding: 30px; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 class="success">✅ ¡Registro Confirmado!</h1>
            <p>La tienda <strong>${registration.nombre}</strong> ha sido registrada exitosamente como cliente VIP.</p>
            <p>RUT: ${registration.rut}</p>
            <p>Email: ${registration.email}</p>
            <hr>
            <p style="color: #666; font-size: 14px;">
              Puedes cerrar esta ventana. Tu tienda ya está activa en nuestro sistema VIP.
            </p>
          </div>
        </body>
      </html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (error: any) {
    console.error("Error in confirm-vip-store function:", error);
    return new Response(
      `<html><body><h1>Error</h1><p>Error interno del servidor: ${error.message}</p></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
};

serve(handler);