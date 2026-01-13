import { getAuthHeaders, hasAuth } from "../../services/auth";
import { httpRequest, readErrorBody, parseJson } from "../../infrastructure/httpClient";

const ORDERS_API = "http://localhost:8080/starter/api/orders";

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
