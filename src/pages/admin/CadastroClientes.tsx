import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, CreditCard } from "lucide-react";

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  rut: string;
  rfid: string | null;
}

interface Tienda {
  id: string;
  nombre: string;
  rut: string;
}

const CadastroClientes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [rfidNuevo, setRfidNuevo] = useState("");
  const [tiendasSeleccionadas, setTiendasSeleccionadas] = useState<string[]>([]);
  const [editandoCliente, setEditandoCliente] = useState(false);

  useEffect(() => {
    document.title = "Gestión de Clientes | Panel Administrativo";
    
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
      await cargarDatos();
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const cargarDatos = async () => {
    try {
      // Cargar clientes (solo los que no son admin)
      const { data: clientesData, error: clientesError } = await supabase
        .from('profiles')
        .select('id, nombre, email, rut, rfid')
        .neq('role', 'admin');

      if (clientesError) throw clientesError;

      // Cargar tiendas
      const { data: tiendasData, error: tiendasError } = await supabase
        .from('tiendas')
        .select('id, nombre, rut')
        .eq('activa', true);

      if (tiendasError) throw tiendasError;

      setClientes(clientesData || []);
      setTiendas(tiendasData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos"
      });
    }
  };

  const seleccionarCliente = async (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setRfidNuevo(cliente.rfid || "");
    setEditandoCliente(true);

    // Cargar tiendas del cliente
    try {
      const { data: relacionesData, error } = await supabase
        .from('cliente_tiendas')
        .select('tienda_id')
        .eq('cliente_id', cliente.id);

      if (error) throw error;

      const tiendaIds = relacionesData?.map(r => r.tienda_id) || [];
      setTiendasSeleccionadas(tiendaIds);
    } catch (error) {
      console.error('Error cargando tiendas del cliente:', error);
    }
  };

  const guardarCambios = async () => {
    if (!clienteSeleccionado) return;

    try {
      // Actualizar RFID del cliente
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ rfid: rfidNuevo || null })
        .eq('id', clienteSeleccionado.id);

      if (updateError) throw updateError;

      // Eliminar relaciones existentes
      const { error: deleteError } = await supabase
        .from('cliente_tiendas')
        .delete()
        .eq('cliente_id', clienteSeleccionado.id);

      if (deleteError) throw deleteError;

      // Insertar nuevas relaciones
      if (tiendasSeleccionadas.length > 0) {
        const relacionesNuevas = tiendasSeleccionadas.map(tiendaId => ({
          cliente_id: clienteSeleccionado.id,
          tienda_id: tiendaId
        }));

        const { error: insertError } = await supabase
          .from('cliente_tiendas')
          .insert(relacionesNuevas);

        if (insertError) throw insertError;
      }

      toast({
        title: "Éxito",
        description: "Cliente actualizado correctamente"
      });

      setEditandoCliente(false);
      setClienteSeleccionado(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error guardando cambios:', error);
      toast({
        title: "Error",
        description: "Error al guardar los cambios"
      });
    }
  };

  const toggleTienda = (tiendaId: string) => {
    setTiendasSeleccionadas(prev => 
      prev.includes(tiendaId)
        ? prev.filter(id => id !== tiendaId)
        : [...prev, tiendaId]
    );
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
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Gestión de Clientes</h1>
              <p className="text-sm text-muted-foreground">Editar RFID y permisos de tiendas</p>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        {!editandoCliente ? (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                Selecciona un cliente para editar su información RFID y permisos de tiendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>RUT</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>RFID</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell>{cliente.rut}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {cliente.rfid || "Sin asignar"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => seleccionarCliente(cliente)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Editar Cliente: {clienteSeleccionado?.nombre}</CardTitle>
                <CardDescription>
                  Actualizar código RFID y permisos de acceso a tiendas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input 
                      id="nombre" 
                      value={clienteSeleccionado?.nombre || ""} 
                      disabled 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rut">RUT</Label>
                    <Input 
                      id="rut" 
                      value={clienteSeleccionado?.rut || ""} 
                      disabled 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rfid">Código RFID</Label>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <Input
                      id="rfid"
                      value={rfidNuevo}
                      onChange={(e) => setRfidNuevo(e.target.value)}
                      placeholder="Ingresa el código RFID"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Tiendas con Acceso Permitido</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tiendas.map((tienda) => (
                      <div key={tienda.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={tienda.id}
                          checked={tiendasSeleccionadas.includes(tienda.id)}
                          onCheckedChange={() => toggleTienda(tienda.id)}
                        />
                        <Label
                          htmlFor={tienda.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {tienda.nombre}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={guardarCambios}>
                    Guardar Cambios
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditandoCliente(false);
                      setClienteSeleccionado(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default CadastroClientes;