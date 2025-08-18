import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    document.title = "Redefinir senha | Sitio institucional";
    const metaDesc = document.querySelector('meta[name="description"]');
    const desired = "Configure sua nova senha de acesso de forma segura.";
    if (metaDesc) metaDesc.setAttribute("content", desired);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desired;
      document.head.appendChild(m);
    }

    // Verificar se há hash com tokens ou parâmetros na URL
    const hash = window.location.hash;
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    // Verificar se há tokens no hash (formato comum do Supabase)
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const hashAccessToken = hashParams.get('access_token');
      const hashRefreshToken = hashParams.get('refresh_token');
      const hashType = hashParams.get('type');
      
      if (hashAccessToken && hashRefreshToken && hashType === 'recovery') {
        setIsValidToken(true);
        // Definir a sessão com os tokens recebidos
        supabase.auth.setSession({
          access_token: hashAccessToken,
          refresh_token: hashRefreshToken
        });
        return;
      }
    }

    // Verificar parâmetros de query string
    if (accessToken && refreshToken && type === 'recovery') {
      setIsValidToken(true);
      // Definir a sessão com os tokens recebidos
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    } else {
      toast({
        title: "Link inválido",
        description: "Este link de recuperação é inválido ou expirou. Solicite um novo link de recuperação.",
      });
      navigate("/iniciar-sesion");
    }
  }, [searchParams, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, certifique-se de que as senhas são idênticas.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({
          title: "Erro ao atualizar senha",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Senha atualizada com sucesso",
        description: "Sua senha foi alterada. Você pode fazer login agora.",
      });
      
      // Redirecionar para a página de login após sucesso
      navigate("/iniciar-sesion");
    } catch (err: any) {
      toast({
        title: "Erro inesperado",
        description: err?.message ?? "Intenta nuevamente",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Verificando...</h1>
          <p className="text-muted-foreground">Por favor, aguarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="mx-auto max-w-xl px-4 py-4">
          <a href="/iniciar-sesion" className="text-sm">Voltar ao login</a>
        </nav>
      </header>
      <main className="mx-auto max-w-xl px-4 py-10">
        <article className="mx-auto w-full max-w-md">
          <h1 className="mb-6 text-2xl font-bold">Redefinir senha</h1>
          <p className="mb-8 text-muted-foreground">
            Digite sua nova senha duas vezes para confirmar a alteração.
          </p>

          <form onSubmit={onSubmit} className="space-y-6" aria-label="Formulário de redefinição de senha">
            <section className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </section>
            
            <section className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">As senhas não coincidem</p>
              )}
            </section>

            <Button type="submit" disabled={loading || password !== confirmPassword || !password} className="w-full">
              {loading ? "Atualizando senha…" : "Atualizar senha"}
            </Button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default RedefinirSenha;