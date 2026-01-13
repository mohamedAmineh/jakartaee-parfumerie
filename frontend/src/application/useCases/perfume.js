// src/application/useCases/perfume.js ✅ FICHIER COMPLET CORRIGÉ
import { getAuthHeaders } from "../../services/auth";
import { createPerfumeEntity, isValidPerfume } from "../../domain/models/perfume";

const PERFUMES_API = "http://localhost:8080/starter/api/perfumes";

// ✅ TOUS LES EXPORTS
export async function createPerfume(form) {
  if (!isValidPerfume(form)) {
    throw new Error("Le nom du parfum est obligatoire.");
  }

  if (!localStorage.getItem("auth")) {
    throw new Error("Session admin expirée. Reconnecte-toi.");
  }

  const payload = createPerfumeEntity(form);

  const res = await fetch(PERFUMES_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} - ${text}`);
  }

  return await res.json();
}

export async function fetchPerfumesList() {
  const res = await fetch(PERFUMES_API);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchPerfumeById(id) {
  if (!localStorage.getItem("auth")) {
    throw new Error("Session admin expirée. Reconnecte-toi.");
  }

  const res = await fetch(`${PERFUMES_API}/${id}`, {
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return await res.json();
}

export async function updatePerfume(id, form) {
  if (!isValidPerfume(form)) {
    throw new Error("Le nom du parfum est obligatoire.");
  }

  if (!localStorage.getItem("auth")) {
    throw new Error("Session admin expirée. Reconnecte-toi.");
  }

  const payload = createPerfumeEntity(form);

  const res = await fetch(`${PERFUMES_API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} - ${text}`);
  }

  return await res.json();
}

export async function togglePerfumeAvailability(id, currentAvailable) {
  if (!localStorage.getItem("auth")) {
    throw new Error("Session admin expirée. Reconnecte-toi.");
  }

  const payload = { available: !currentAvailable };
  const res = await fetch(`${PERFUMES_API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
}

export async function deletePerfume(id) {
  if (!localStorage.getItem("auth")) {
    throw new Error("Session admin expirée. Reconnecte-toi.");
  }

  const res = await fetch(`${PERFUMES_API}/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
}

export async function fetchPublicPerfumeById(id) {
  const res = await fetch(`${PERFUMES_API}/${id}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}
