import { getAuthHeaders } from "../../services/auth";
import { httpRequest, readErrorBody, parseBody } from "../../infrastructure/httpClient";
import { API_BASE_URL } from "../../config/api";

const ORDERS_API = `${API_BASE_URL}/orders`;
const HIGH_VALUE_API = `${API_BASE_URL}/orders/high-value`;

async function request(url, options = {}) {
  const res = await httpRequest(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    const body = await readErrorBody(res);
    throw new Error(body || `HTTP ${res.status} ${res.statusText || ""}`.trim());
  }

  // 204 No Content
  if (res.status === 204) return null;

  // si backend renvoie vide parfois
  return parseBody(res);
}

export async function fetchAllOrders() {
  const data = await request(ORDERS_API, { method: "GET" });
  return Array.isArray(data) ? data : [];
}

/**
 * Retourne un Set d'IDs de commandes "high value"
 * Supporte: [{orderId:3}], [{id:3}], [3,4]
 */
export async function fetchHighValueOrderIds() {
  const payload = await request(HIGH_VALUE_API, { method: "GET" });

  const ids = Array.isArray(payload)
    ? payload
        .map((e) => {
          if (typeof e === "number") return e;
          return e?.orderId ?? e?.id ?? null;
        })
        .filter((id) => id !== null && id !== undefined)
    : [];

  return new Set(ids);
}

export async function updateOrderStatus(orderId, status) {
  if (orderId == null) throw new Error("orderId manquant");
  if (!status) throw new Error("status manquant");

  return request(`${ORDERS_API}/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}
