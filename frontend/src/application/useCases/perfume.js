import { getAuthHeaders, hasAuth } from "../../services/auth";
import { createPerfumeEntity, isValidPerfume } from "../../domain/models/perfume";
import { httpRequest, readErrorBody, parseJson } from "../../infrastructure/httpClient";
import { API_BASE_URL } from "../../config/api";

const PERFUMES_API = `${API_BASE_URL}/perfumes`;

export async function createPerfume(form) {
  if (!isValidPerfume(form)) {
    throw new Error("Le nom du parfum est obligatoire.");
  }

  if (!hasAuth()) {
    throw new Error("Session admin expirée. Reconnecte-toi.");
  }

  const payload = createPerfumeEntity(form);

  const res = await httpRequest(PERFUMES_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await readErrorBody(res);
    throw new Error(text ? `HTTP ${res.status} - ${text}` : `HTTP ${res.status}`);
  }

  return await parseJson(res);
}

export async function fetchPerfumesList() {
  const res = await httpRequest(PERFUMES_API);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await parseJson(res);
}

export async function fetchPerfumeById(id) {
  if (!hasAuth()) {
    throw new Error("Session admin expirée. Reconnecte-toi.");
  }

  const res = await httpRequest(`${PERFUMES_API}/${id}`, {
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) {
    const text = await readErrorBody(res);
    throw new Error(text || `HTTP ${res.status}`);
  }

  return await parseJson(res);
}

export async function updatePerfume(id, form) {
  if (!isValidPerfume(form)) {
    throw new Error("Le nom du parfum est obligatoire.");
  }

  if (!hasAuth()) {
    throw new Error("Session admin expirée. Reconnecte-toi.");
  }

  const payload = createPerfumeEntity(form);

  const res = await httpRequest(`${PERFUMES_API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await readErrorBody(res);
    throw new Error(text ? `HTTP ${res.status} - ${text}` : `HTTP ${res.status}`);
  }

  return await parseJson(res);
}

export async function togglePerfumeAvailability(id, currentAvailable) {
  if (!hasAuth()) {
    throw new Error("Session admin expirée. Reconnecte-toi.");
  }

  const payload = { available: !currentAvailable };
  const res = await httpRequest(`${PERFUMES_API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await readErrorBody(res);
    throw new Error(txt || `HTTP ${res.status}`);
  }
}

export async function deletePerfume(id) {
  if (!hasAuth()) {
    throw new Error("Session admin expirée. Reconnecte-toi.");
  }

  const res = await httpRequest(`${PERFUMES_API}/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) {
    const txt = await readErrorBody(res);
    throw new Error(txt || `HTTP ${res.status}`);
  }
}

export async function fetchPublicPerfumeById(id) {
  const res = await httpRequest(`${PERFUMES_API}/${id}`);
  if (!res.ok) {
    const text = await readErrorBody(res);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return parseJson(res);
}
