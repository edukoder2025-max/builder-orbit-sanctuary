import type { RequestHandler } from "express";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrderResponse,
  OrderRecord,
} from "@shared/api";

let pool: Pool | null = null;

function getDatabaseUrl() {
  return process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "";
}

async function getPool() {
  if (pool) return pool;
  const url = getDatabaseUrl();
  if (!url) throw new Error("DATABASE_URL/NEON_DATABASE_URL no configurado");
  pool = new Pool({
    connectionString: url,
    max: 3,
    ssl: { rejectUnauthorized: false },
  });
  // Ensure schema exists
  await bootstrapSchema(pool);
  return pool;
}

async function bootstrapSchema(p: Pool) {
  await p.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id uuid PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL,
      amount_cents integer NOT NULL,
      currency text NOT NULL,
      status text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (email);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
  `);
}

const createOrderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export const createOrder: RequestHandler = async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body as CreateOrderRequest);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    const resp: CreateOrderResponse = { ok: false, error: message };
    return res.status(400).json(resp);
  }
  const { name, email } = parsed.data;
  const amount_cents = 2900; // USD 29.00
  const currency = "USD";
  const id = randomUUID();

  try {
    const p = await getPool();
    const { rows } = await p.query<OrderRecord>(
      `INSERT INTO orders (id, name, email, amount_cents, currency, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, amount_cents, currency, status, to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at`,
      [id, name, email, amount_cents, currency, "pending"],
    );
    const resp: CreateOrderResponse = { ok: true, order: rows[0] };
    res.status(201).json(resp);
  } catch (err: any) {
    const resp: CreateOrderResponse = {
      ok: false,
      error: err?.message || "Error creando orden",
    };
    res.status(500).json(resp);
  }
};

export const getOrder: RequestHandler = async (req, res) => {
  const id = String(req.params.id || "");
  if (!id) {
    const resp: GetOrderResponse = { ok: false, error: "Falta id" };
    return res.status(400).json(resp);
  }
  try {
    const p = await getPool();
    const { rows } = await p.query<OrderRecord>(
      `SELECT id, name, email, amount_cents, currency, status, to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at FROM orders WHERE id = $1`,
      [id],
    );
    if (!rows[0]) {
      const resp: GetOrderResponse = {
        ok: false,
        error: "Orden no encontrada",
      };
      return res.status(404).json(resp);
    }
    const resp: GetOrderResponse = { ok: true, order: rows[0] };
    res.json(resp);
  } catch (err: any) {
    const resp: GetOrderResponse = {
      ok: false,
      error: err?.message || "Error obteniendo orden",
    };
    res.status(500).json(resp);
  }
};
