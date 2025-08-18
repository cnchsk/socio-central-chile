import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const CadastroClientes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    document.title = "Registro de Clientes | Panel Administrativo";
    
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
              <h1 className="text-lg font-semibold">Registro de Clientes</h1>
              <p className="text-sm text-muted-foreground">Gestionar clientes de las tiendas</p>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Cliente</CardTitle>
            <CardDescription>
              Registra un nuevo cliente vinculado a una tienda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nombre Completo</Label>
                <Input id="nome" placeholder="Ingresa el nombre completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">RUT</Label>
                <Input id="cpf" placeholder="12.345.678-9" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="loja">Tienda Vinculada</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tienda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loja1">Tienda Ejemplo 1</SelectItem>
                  <SelectItem value="loja2">Tienda Ejemplo 2</SelectItem>
                  <SelectItem value="loja3">Tienda Ejemplo 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Teléfono</Label>
                <Input id="telefone" placeholder="+56 9 0000 0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="cliente@ejemplo.com" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endereco">Dirección</Label>
              <Input id="endereco" placeholder="Ingresa la dirección completa" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nivel">Nivel de Acceso</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="intermediario">Intermedio</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-4">
              <Button>Registrar Cliente</Button>
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

export default CadastroClientes;