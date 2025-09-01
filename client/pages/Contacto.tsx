import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contacto() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Contacto</h1>
      <p className="text-muted-foreground mt-1">
        Enlaces y formulario de contacto.
      </p>
      <form className="mt-6 max-w-xl space-y-3">
        <Input placeholder="Tu nombre" />
        <Input type="email" placeholder="Tu email" />
        <Textarea placeholder="Mensaje" rows={5} />
        <Button type="submit">Enviar</Button>
      </form>
      <div className="mt-6 text-sm text-muted-foreground">
        Sígueme en GitHub, Twitter, LinkedIn y únete al Discord.
      </div>
    </div>
  );
}
