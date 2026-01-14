import { httpRequest, readErrorBody, parseJson } from "../../infrastructure/httpClient";
import { API_BASE_URL } from "../../config/api";

const NOTIFICATIONS_API = `${API_BASE_URL}/notifications/orders`;

export async function fetchOrderNotifications() {
  const res = await httpRequest(NOTIFICATIONS_API, { method: "GET" });

  if (!res.ok) {
    const text = await readErrorBody(res);
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = await parseJson(res);
  return Array.isArray(data) ? data : [];
}
