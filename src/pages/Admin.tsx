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
    document.title = "Painel Administrativo | Sitio institucional";
    
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
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta área"
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
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo, {user?.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Cerrar sesión
          </Button>
        </nav>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6">
          <section className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Dashboard Administrativo</h2>
            <p className="text-muted-foreground mb-4">
              Você está logado como administrador. Aqui você pode gerenciar o sistema.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-medium">Usuários</h3>
                <p className="text-sm text-muted-foreground">Gerenciar usuários do sistema</p>
              </div>
              
              <div className="p-4 bg-secondary/10 rounded-lg">
                <h3 className="font-medium">Configurações</h3>
                <p className="text-sm text-muted-foreground">Configurar sistema</p>
              </div>
              
              <div className="p-4 bg-accent/10 rounded-lg">
                <h3 className="font-medium">Relatórios</h3>
                <p className="text-sm text-muted-foreground">Visualizar relatórios</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Admin;