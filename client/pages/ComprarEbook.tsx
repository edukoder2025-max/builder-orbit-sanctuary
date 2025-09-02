import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { CreateOrderResponse } from "@shared/api";

export default function ComprarEbook() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOrderId(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data: CreateOrderResponse = await res.json();
      if (!res.ok || !data.ok || !data.order) {
        throw new Error(data.error || "Error al crear la orden");
      }
      setOrderId(data.order.id);
      toast.success("Orden creada. Revisa tu correo");
    } catch (err: any) {
      toast.error(err?.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto grid gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ebook de Programación</h1>
          <p className="text-muted-foreground mt-2">
            Aprende programación con ejemplos prácticos. Precio: <span className="font-semibold">USD 29</span>.
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Comprar</h2>
          <p className="text-sm text-muted-foreground mb-4">Ingresa tus datos para generar la orden.</p>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Procesando..." : "Generar orden (USD 29)"}
            </Button>
          </form>
          {orderId && (
            <div className="mt-4 text-sm">
              <div className="font-medium">Orden creada</div>
              <div>Id: <span className="font-mono">{orderId}</span></div>
              <div className="text-muted-foreground mt-1">
                Nota: El pago está marcado como pendiente. Integraremos pasarela (Stripe) para pago automático.
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Este sitio guarda tu orden en una base de datos Neon. Para activarlo en producción, configura la variable de entorno DATABASE_URL con tu conexión Neon.
        </div>
      </div>
    </div>
  );
}
