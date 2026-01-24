import { httpRequest, readErrorBody, parseJson } from "../../infrastructure/httpClient";
import { API_BASE_URL } from "../../config/api";

const AGGREGATES_API = `${API_BASE_URL}/orders/aggregates`;

export async function fetchOrderAggregates() {
  const res = await httpRequest(AGGREGATES_API, { method: "GET" });

  if (!res.ok) {
    const text = await readErrorBody(res);
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = await parseJson(res);
  return Array.isArray(data) ? data : [];
}
