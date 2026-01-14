// src/application/useCases/createOrder.js

import { createOrderPayload } from "../../domain/models/orders";
import { clearCart } from "./cart";
import { httpRequest, readErrorBody, parseJson } from "../../infrastructure/httpClient";
import { API_BASE_URL } from "../../config/api";

const ORDERS_API = `${API_BASE_URL}/orders`;

export async function createOrderFromCart({ user, items }) {
  if (!items || items.length === 0) {
    throw new Error("Panier vide.");
  }
  if (!user?.id) {
    throw new Error("Connecte-toi avant de confirmer la commande.");
  }

  const payload = createOrderPayload({ userId: user.id, items });

  const res = await httpRequest(ORDERS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await readErrorBody(res);
    throw new Error(txt || `HTTP ${res.status}`);
  }

  clearCart();
  return await parseJson(res).catch(() => null);
}
