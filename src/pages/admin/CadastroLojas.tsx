import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const CadastroLojas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    document.title = "Registro de Tiendas VIP | Panel Administrativo";
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/iniciar-sesion");
        return;
      }

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
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Registro de Tiendas VIP</h1>
              <p className="text-sm text-muted-foreground">Gestionar clientes VIP</p>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Nueva Tienda VIP</CardTitle>
            <CardDescription>
              Registra una nueva tienda como cliente VIP del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nombre de la Tienda</Label>
                <Input id="nome" placeholder="Ingresa el nombre de la tienda" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">RUT</Label>
                <Input id="cnpj" placeholder="12.345.678-9" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endereco">Dirección</Label>
              <Input id="endereco" placeholder="Ingresa la dirección completa" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Teléfono</Label>
                <Input id="telefone" placeholder="+56 9 0000 0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="tienda@ejemplo.com" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observaciones</Label>
              <Textarea 
                id="observacoes" 
                placeholder="Información adicional sobre la tienda"
                rows={4}
              />
            </div>
            
            <div className="flex gap-4">
              <Button>Registrar Tienda</Button>
              <Button variant="outline" onClick={() => navigate("/admin")}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CadastroLojas;