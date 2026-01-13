import { httpRequest, readErrorBody, parseJson } from "../../infrastructure/httpClient";

const NOTIFICATIONS_API = "http://localhost:8080/starter/api/notifications/orders";

export async function fetchOrderNotifications() {
  const res = await httpRequest(NOTIFICATIONS_API, { method: "GET" });

  if (!res.ok) {
    const text = await readErrorBody(res);
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = await parseJson(res);
  return Array.isArray(data) ? data : [];
}
