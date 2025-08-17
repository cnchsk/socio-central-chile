import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <nav className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-lg font-semibold">Sitio Institucional</h1>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-16">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-6">Bienvenido a nuestro sitio institucional</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Accede a tu perfil personal y gestiona tu información de manera segura.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/iniciar-sesion">Iniciar sesión</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/registro">Crear cuenta</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
