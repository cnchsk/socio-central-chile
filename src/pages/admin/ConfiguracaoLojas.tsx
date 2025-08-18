import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Settings } from "lucide-react";

const ConfiguracaoLojas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    document.title = "Configuración de Tiendas | Panel Administrativo";
    
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
              <h1 className="text-lg font-semibold">Configuración de Tiendas</h1>
              <p className="text-sm text-muted-foreground">Configurar permisos y configuraciones de las tiendas</p>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Seleccionar Tienda
            </CardTitle>
            <CardDescription>
              Elige la tienda para configurar sus permisos y configuraciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="loja-select">Tienda</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tienda para configurar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loja1">Tienda Ejemplo 1</SelectItem>
                  <SelectItem value="loja2">Tienda Ejemplo 2</SelectItem>
                  <SelectItem value="loja3">Tienda Ejemplo 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuraciones Generales</CardTitle>
            <CardDescription>
              Define las configuraciones básicas de la tienda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tienda Activa</Label>
                <p className="text-sm text-muted-foreground">
                  Activar o desactivar la tienda en el sistema
                </p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por E-mail</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar notificaciones automáticas a la tienda
                </p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Acceso Premium</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar funciones premium para la tienda
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Límites y Cuotas</CardTitle>
            <CardDescription>
              Configura los límites de uso de la tienda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-clientes">Máximo de Clientes</Label>
                <Input id="max-clientes" type="number" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-produtos">Máximo de Productos</Label>
                <Input id="max-produtos" type="number" placeholder="1000" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storage-limite">Límite de Almacenamiento (GB)</Label>
              <Input id="storage-limite" type="number" placeholder="10" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button>Guardar Configuraciones</Button>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Cancelar
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ConfiguracaoLojas;