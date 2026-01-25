// Fetches orders for the current authenticated user.

import { getAuthHeaders, hasAuth } from "../../services/auth";
import { httpRequest, readErrorBody, parseJson } from "../../infrastructure/httpClient";
import { API_BASE_URL } from "../../config/api";

const ORDERS_API = `${API_BASE_URL}/orders`;

export async function fetchUserOrders() {
  if (!hasAuth()) {
    throw new Error("Connecte-toi pour voir tes commandes.");
  }

  const res = await httpRequest(ORDERS_API, {
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) {
    const txt = await readErrorBody(res);
    throw new Error(txt || `HTTP ${res.status}`);
  }

  return await parseJson(res);
}
