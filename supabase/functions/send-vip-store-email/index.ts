import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VipStoreRequest {
  nombre: string;
  rut: string;
  email: string;
  direccion?: string;
  telefone?: string;
  observacoes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    
    const { nombre, rut, email, direccion, telefone, observacoes }: VipStoreRequest = await req.json();

    // Validate required fields
    if (!nombre || !rut || !email) {
      return new Response(
        JSON.stringify({ error: "Los campos nombre, RUT y email son obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours expiration

    // Store registration in database
    const { error: insertError } = await supabase
      .from('vip_store_registrations')
      .insert({
        nombre,
        rut,
        email,
        direccion,
        telefono: telefone,
        observaciones: observacoes,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error inserting registration:", insertError);
      return new Response(
        JSON.stringify({ error: "Error al guardar el registro" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send confirmation email
    const confirmUrl = `${supabaseUrl}/functions/v1/confirm-vip-store?token=${token}`;
    
    const emailResponse = await resend.emails.send({
      from: "Sistema VIP <onboarding@resend.dev>",
      to: [email],
      subject: "Confirma tu registro como Tienda VIP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">¡Bienvenido al programa VIP!</h2>
          <p>Hola,</p>
          <p>Hemos recibido tu solicitud para registrar <strong>${nombre}</strong> como tienda VIP.</p>
          <p>Para completar el registro, por favor haz clic en el siguiente enlace:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Confirmar Registro VIP
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Este enlace expirará en 48 horas. Si no completaste esta solicitud, puedes ignorar este email.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Sistema de Gestión VIP
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email de confirmación enviado exitosamente",
        email: email 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-vip-store-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);