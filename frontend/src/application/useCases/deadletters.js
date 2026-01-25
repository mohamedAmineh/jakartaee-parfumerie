// Inspect and clear dead letters for diagnostics.

import { httpRequest, readErrorBody, parseJson } from "../../infrastructure/httpClient";
import { API_BASE_URL } from "../../config/api";

const DEADLETTERS_API = `${API_BASE_URL}/deadletters`;

export async function fetchDeadLetters() {
  const res = await httpRequest(DEADLETTERS_API, { method: "GET" });

  if (!res.ok) {
    const text = await readErrorBody(res);
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = await parseJson(res);
  return Array.isArray(data) ? data : [];
}

export async function clearDeadLetters() {
  const res = await httpRequest(`${DEADLETTERS_API}/clear`, { method: "POST" });

  if (!res.ok) {
    const text = await readErrorBody(res);
    throw new Error(text || `HTTP ${res.status}`);
  }

  return true;
}
