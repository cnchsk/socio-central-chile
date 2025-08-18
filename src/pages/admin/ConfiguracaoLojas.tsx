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
    document.title = "Configuração de Lojas | Painel Administrativo";
    
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
              <h1 className="text-lg font-semibold">Configuração de Lojas</h1>
              <p className="text-sm text-muted-foreground">Configurar permissões e configurações das lojas</p>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Selecionar Loja
            </CardTitle>
            <CardDescription>
              Escolha a loja para configurar suas permissões e configurações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="loja-select">Loja</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma loja para configurar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loja1">Loja Exemplo 1</SelectItem>
                  <SelectItem value="loja2">Loja Exemplo 2</SelectItem>
                  <SelectItem value="loja3">Loja Exemplo 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>
              Defina as configurações básicas da loja
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Loja Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar ou desativar a loja no sistema
                </p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por E-mail</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar notificações automáticas para a loja
                </p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Acesso Premium</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar recursos premium para a loja
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limites e Cotas</CardTitle>
            <CardDescription>
              Configure os limites de uso da loja
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-clientes">Máximo de Clientes</Label>
                <Input id="max-clientes" type="number" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-produtos">Máximo de Produtos</Label>
                <Input id="max-produtos" type="number" placeholder="1000" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storage-limite">Limite de Armazenamento (GB)</Label>
              <Input id="storage-limite" type="number" placeholder="10" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button>Salvar Configurações</Button>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Cancelar
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ConfiguracaoLojas;