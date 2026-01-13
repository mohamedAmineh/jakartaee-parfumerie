// src/application/useCases/createOrder.js

import { createOrderPayload } from "../../domain/models/orders";
import { clearCart } from "../../domain/services/cartService";

const ORDERS_API = "http://localhost:8080/starter/api/orders";

export async function createOrderFromCart({ user, items }) {
  if (!items || items.length === 0) {
    throw new Error("Panier vide.");
  }
  if (!user?.id) {
    throw new Error("Connecte-toi avant de confirmer la commande.");
  }

  const payload = createOrderPayload({ userId: user.id, items });

  const res = await fetch(ORDERS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }

  clearCart();
  return await res.json().catch(() => null);
}
