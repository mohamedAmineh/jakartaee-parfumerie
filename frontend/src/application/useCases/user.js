// Profile update and password change workflows.

import { encodeBasicAuth, getAuthHeaders, setAuthValue } from "../../services/auth";
import { httpRequest, readErrorBody, parseJson } from "../../infrastructure/httpClient";
import { API_BASE_URL } from "../../config/api";

const USERS_API = `${API_BASE_URL}/users`;
const LOGIN_URL = `${API_BASE_URL}/auth/login`;

export async function updateMyProfile(userId, payload) {
  const authHeaders = getAuthHeaders();
  if (!authHeaders.Authorization) throw new Error("Reconnecte-toi pour modifier ton profil.");

  const res = await httpRequest(`${USERS_API}/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await readErrorBody(res);
    if (res.status === 401) throw new Error("Session expiree. Reconnecte-toi.");
    throw new Error(msg || `HTTP ${res.status}`);
  }

  return parseJson(res);
}

export async function changeMyPassword({ userId, email, oldPassword, newPassword }) {
  const authHeaders = getAuthHeaders();
  if (!authHeaders.Authorization) throw new Error("Reconnecte-toi pour modifier ton mot de passe.");

  
  const check = await httpRequest(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: oldPassword }),
  });

  if (!check.ok) throw new Error("Ancien mot de passe incorrect.");

  
  const res = await httpRequest(`${USERS_API}/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ password: newPassword }),
  });

  if (!res.ok) {
    const msg = await readErrorBody(res);
    if (res.status === 401) throw new Error("Session expiree. Reconnecte-toi.");
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const updated = await parseJson(res);

  
  const authValue = encodeBasicAuth(updated.email || email, newPassword);
  setAuthValue(authValue);

  return updated;
}
