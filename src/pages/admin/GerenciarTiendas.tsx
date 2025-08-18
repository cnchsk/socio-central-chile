import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Tienda {
  id: string;
  nombre: string;
  rut: string;
  email?: string;
  direccion?: string;
  telefono?: string;
  activa: boolean;
  vip: boolean;
  created_at: string;
}

const tiendaSchema = z.object({
  nombre: z.string().min(1, "Nome é obrigatório"),
  rut: z.string().min(1, "RUT é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
});

type TiendaFormData = z.infer<typeof tiendaSchema>;

const GerenciarTiendas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [carregando, setCarregando] = useState(true);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [tiendaEditando, setTiendaEditando] = useState<Tienda | null>(null);
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TiendaFormData>({
    resolver: zodResolver(tiendaSchema),
  });

  useEffect(() => {
    document.title = "Gerenciar Tiendas - VIP Talca";
    verificarAutenticacao();
  }, []);

  const verificarAutenticacao = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/iniciar-sesion");
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin", {
        _user_id: user.id,
      });

      if (!isAdmin) {
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Apenas administradores podem acessar esta página.",
        });
        navigate("/dashboard");
        return;
      }

      await carregarTiendas();
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao verificar permissões.",
      });
    } finally {
      setCarregando(false);
    }
  };

  const carregarTiendas = async () => {
    try {
      const { data, error } = await supabase
        .from("tiendas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTiendas(data || []);
    } catch (error) {
      console.error("Erro ao carregar tiendas:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar lista de tiendas.",
      });
    }
  };

  const onSubmit = async (data: TiendaFormData) => {
    setEnviando(true);
    try {
      if (tiendaEditando) {
        // Atualizar tienda existente
        const { error } = await supabase
          .from("tiendas")
          .update({
            nombre: data.nombre,
            rut: data.rut,
            email: data.email || null,
            direccion: data.direccion || null,
            telefono: data.telefono || null,
          })
          .eq("id", tiendaEditando.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Tienda atualizada com sucesso!",
        });
      } else {
        // Criar nova tienda
        const { error } = await supabase
          .from("tiendas")
          .insert({
            nombre: data.nombre,
            rut: data.rut,
            email: data.email || null,
            direccion: data.direccion || null,
            telefono: data.telefono || null,
            activa: true,
            vip: false,
          });

        if (error) {
          if (error.message.includes("Máximo de 4 tiendas permitidas")) {
            toast({
              variant: "destructive",
              title: "Limite atingido",
              description: "Máximo de 4 tiendas permitidas no sistema.",
            });
            return;
          }
          throw error;
        }

        toast({
          title: "Sucesso",
          description: "Tienda criada com sucesso!",
        });
      }

      reset();
      setDialogAberto(false);
      setTiendaEditando(null);
      await carregarTiendas();
    } catch (error: any) {
      console.error("Erro ao salvar tienda:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao salvar tienda.",
      });
    } finally {
      setEnviando(false);
    }
  };

  const abrirDialogEditar = (tienda: Tienda) => {
    setTiendaEditando(tienda);
    reset({
      nombre: tienda.nombre,
      rut: tienda.rut,
      email: tienda.email || "",
      direccion: tienda.direccion || "",
      telefono: tienda.telefono || "",
    });
    setDialogAberto(true);
  };

  const abrirDialogNovo = () => {
    if (tiendas.length >= 4) {
      toast({
        variant: "destructive",
        title: "Limite atingido",
        description: "Máximo de 4 tiendas permitidas no sistema.",
      });
      return;
    }
    setTiendaEditando(null);
    reset();
    setDialogAberto(true);
  };

  const excluirTienda = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tiendas")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tienda excluída com sucesso!",
      });

      await carregarTiendas();
    } catch (error: any) {
      console.error("Erro ao excluir tienda:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir tienda.",
      });
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Admin
          </Button>
          <h1 className="text-2xl font-bold">Gerenciar Tiendas ({tiendas.length}/4)</h1>
        </div>

        {/* Lista de Tiendas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Card para adicionar nova tienda */}
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center h-48">
              <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    onClick={abrirDialogNovo}
                    disabled={tiendas.length >= 4}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Tienda
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {tiendaEditando ? "Editar Tienda" : "Nova Tienda"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nome</Label>
                      <Input
                        id="nombre"
                        {...register("nombre")}
                        placeholder="Nome da tienda"
                      />
                      {errors.nombre && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.nombre.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="rut">RUT</Label>
                      <Input
                        id="rut"
                        {...register("rut")}
                        placeholder="RUT da tienda"
                      />
                      {errors.rut && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.rut.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="E-mail da tienda"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="direccion">Endereço</Label>
                      <Textarea
                        id="direccion"
                        {...register("direccion")}
                        placeholder="Endereço da tienda"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="telefono">Telefone</Label>
                      <Input
                        id="telefono"
                        {...register("telefono")}
                        placeholder="Telefone da tienda"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={enviando} className="flex-1">
                        {enviando ? "Salvando..." : "Salvar"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setDialogAberto(false);
                          setTiendaEditando(null);
                          reset();
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Cards das tiendas existentes */}
          {tiendas.map((tienda) => (
            <Card key={tienda.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tienda.nombre}</CardTitle>
                  <div className="flex gap-2">
                    {tienda.vip && (
                      <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                        VIP
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        tienda.activa
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tienda.activa ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>RUT:</strong> {tienda.rut}</p>
                  {tienda.email && <p><strong>E-mail:</strong> {tienda.email}</p>}
                  {tienda.telefono && <p><strong>Telefone:</strong> {tienda.telefono}</p>}
                  {tienda.direccion && <p><strong>Endereço:</strong> {tienda.direccion}</p>}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirDialogEditar(tienda)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a tienda "{tienda.nombre}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => excluirTienda(tienda.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GerenciarTiendas;