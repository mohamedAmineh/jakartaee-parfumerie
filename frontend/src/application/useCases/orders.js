// src/application/useCases/orders.js ✅ FICHIER MANQUANT
import { getAuthHeaders } from "../../services/auth";

const ORDERS_API = "http://localhost:8080/starter/api/orders";

export async function fetchUserOrders() {
  if (!localStorage.getItem("auth")) {
    throw new Error("Connecte-toi pour voir tes commandes.");
  }

  const res = await fetch(ORDERS_API, {
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }

  return await res.json();
}
