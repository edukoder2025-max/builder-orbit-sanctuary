/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Payments / Orders
export interface CreateOrderRequest {
  name: string;
  email: string;
}

export interface OrderRecord {
  id: string;
  name: string;
  email: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  created_at: string;
}

export interface CreateOrderResponse {
  ok: boolean;
  order?: OrderRecord;
  error?: string;
}

export interface GetOrderResponse {
  ok: boolean;
  order?: OrderRecord;
  error?: string;
}
