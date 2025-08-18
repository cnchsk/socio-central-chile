import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    document.title = "Panel Administrativo | Sitio institucional";
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/iniciar-sesion");
        return;
      }

      // Verificar se é admin
      const { data: isAdmin } = await supabase.rpc('is_admin', { 
        _user_id: session.user.id 
      });

      if (!isAdmin) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos para acceder a esta área"
        });
        navigate("/dashboard");
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold">Panel Administrativo</h1>
              <p className="text-sm text-muted-foreground">Bienvenido, {user?.email}</p>
            </div>
          <Button onClick={handleLogout} variant="outline">
            Cerrar sesión
          </Button>
        </nav>
      </header>
      
      {/* Menu de Navegação */}
      <nav className="border-b bg-muted/10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex space-x-8">
            <a 
              href="/admin/cadastro-lojas" 
              className="border-b-2 border-transparent hover:border-primary py-4 px-1 text-sm font-medium transition-colors hover:text-primary"
            >
              Registro de Tiendas (VIP)
            </a>
            <a 
              href="/admin/cadastro-clientes" 
              className="border-b-2 border-transparent hover:border-primary py-4 px-1 text-sm font-medium transition-colors hover:text-primary"
            >
              Registro Clientes Tiendas
            </a>
            <a 
              href="/admin/configuracao-lojas" 
              className="border-b-2 border-transparent hover:border-primary py-4 px-1 text-sm font-medium transition-colors hover:text-primary"
            >
              Configuración Tiendas
            </a>
            <a 
              href="/admin/gerenciar-tiendas" 
              className="border-b-2 border-transparent hover:border-primary py-4 px-1 text-sm font-medium transition-colors hover:text-primary"
            >
              Gerenciar Tiendas
            </a>
          </div>
        </div>
      </nav>
      
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6">
          <section className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Dashboard Administrativo</h2>
            <p className="text-muted-foreground mb-4">
              Estás conectado como administrador. Aquí puedes gestionar el sistema.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-medium">Usuarios</h3>
                <p className="text-sm text-muted-foreground">Gestionar usuarios del sistema</p>
              </div>
              
              <div className="p-4 bg-secondary/10 rounded-lg">
                <h3 className="font-medium">Configuraciones</h3>
                <p className="text-sm text-muted-foreground">Configurar sistema</p>
              </div>
              
              <div className="p-4 bg-accent/10 rounded-lg">
                <h3 className="font-medium">Reportes</h3>
                <p className="text-sm text-muted-foreground">Visualizar reportes</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Admin;