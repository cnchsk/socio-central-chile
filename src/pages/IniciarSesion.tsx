import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const IniciarSesion = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  useEffect(() => {
    document.title = "Iniciar sesión | Sitio institucional";
    const metaDesc = document.querySelector('meta[name="description"]');
    const desired = "Accede a tu cuenta para gestionar tu perfil y beneficios.";
    if (metaDesc) metaDesc.setAttribute("content", desired);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desired;
      document.head.appendChild(m);
    }
    const linkRel = document.querySelector('link[rel="canonical"]');
    const url = window.location.origin + "/iniciar-sesion";
    if (linkRel) linkRel.setAttribute("href", url);
    else {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      l.setAttribute("href", url);
      document.head.appendChild(l);
    }

    // Redirecionar automaticamente se já estiver autenticado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({
          title: "Error al iniciar sesión",
          description: "Correo o contraseña inválidos",
        });
        return;
      }
      toast({ title: "Ingreso exitoso" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error inesperado", description: err?.message ?? "Intenta nuevamente" });
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa tu correo electrónico",
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha?type=recovery`,
      });
      
      if (error) {
        toast({
          title: "Error al enviar correo",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
      });
      setShowResetForm(false);
    } catch (err: any) {
      toast({ 
        title: "Error inesperado", 
        description: err?.message ?? "Intenta nuevamente" 
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="mx-auto max-w-xl px-4 py-4">
          <a href="/" className="text-sm">Volver al inicio</a>
        </nav>
      </header>
      <main className="mx-auto max-w-xl px-4 py-10">
        <article className="mx-auto w-full max-w-md">
          <h1 className="mb-6 text-2xl font-bold">
            {showResetForm ? "Recuperar contraseña" : "Iniciar sesión"}
          </h1>
          <p className="mb-8 text-muted-foreground">
            {showResetForm 
              ? "Ingresa tu correo para recibir instrucciones de restablecimiento"
              : "Ingresa con tu correo y contraseña para acceder a tu cuenta."
            }
          </p>

          {showResetForm ? (
            <form onSubmit={onResetPassword} className="space-y-6" aria-label="Formulario de recuperación de contraseña">
              <section className="space-y-2">
                <Label htmlFor="reset-email">Correo electrónico</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.cl"
                />
              </section>
              <div className="space-y-3">
                <Button type="submit" disabled={resetLoading} className="w-full">
                  {resetLoading ? "Enviando…" : "Enviar correo de recuperación"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShowResetForm(false)}
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6" aria-label="Formulario de inicio de sesión">
              <section className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.cl"
                />
              </section>
              <section className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </section>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowResetForm(true)}
                  className="text-sm text-primary hover:underline focus:outline-none focus:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Ingresando…" : "Iniciar sesión"}
              </Button>
            </form>
          )}
        </article>
      </main>
    </div>
  );
};

export default IniciarSesion;
