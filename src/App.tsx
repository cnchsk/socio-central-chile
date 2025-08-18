import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IniciarSesion from "./pages/IniciarSesion";
import RedefinirSenha from "./pages/RedefinirSenha";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import CadastroLojas from "./pages/admin/CadastroLojas";
import CadastroClientes from "./pages/admin/CadastroClientes";
import ConfiguracaoLojas from "./pages/admin/ConfiguracaoLojas";
import GerenciarTiendas from "./pages/admin/GerenciarTiendas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/iniciar-sesion" element={<IniciarSesion />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/cadastro-lojas" element={<CadastroLojas />} />
          <Route path="/admin/cadastro-clientes" element={<CadastroClientes />} />
          <Route path="/admin/configuracao-lojas" element={<ConfiguracaoLojas />} />
          <Route path="/admin/gerenciar-tiendas" element={<GerenciarTiendas />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
