import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    document.title = "Dashboard | Sitio institucional";
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/iniciar-sesion");
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
            <h1 className="text-lg font-semibold">Dashboard</h1>
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
            <h2 className="text-xl font-semibold mb-4">Seu Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              Bem-vindo ao seu painel pessoal. Aqui você pode gerenciar suas informações.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-medium">Perfil</h3>
                <p className="text-sm text-muted-foreground">Gerenciar informações pessoais</p>
              </div>
              
              <div className="p-4 bg-secondary/10 rounded-lg">
                <h3 className="font-medium">Configurações</h3>
                <p className="text-sm text-muted-foreground">Ajustar preferências</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;