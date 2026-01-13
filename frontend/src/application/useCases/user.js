// src/application/useCases/user.js
import { encodeBasicAuth, getAuthHeaders } from "../../services/auth";

const USERS_API = "http://localhost:8080/starter/api/users";
const LOGIN_URL = "http://localhost:8080/starter/api/auth/login";

export async function updateMyProfile(userId, payload) {
  const authHeaders = getAuthHeaders();
  if (!authHeaders.Authorization) throw new Error("Reconnecte-toi pour modifier ton profil.");

  const res = await fetch(`${USERS_API}/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    if (res.status === 401) throw new Error("Session expiree. Reconnecte-toi.");
    throw new Error(msg || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function changeMyPassword({ userId, email, oldPassword, newPassword }) {
  const authHeaders = getAuthHeaders();
  if (!authHeaders.Authorization) throw new Error("Reconnecte-toi pour modifier ton mot de passe.");

  // check ancien mdp
  const check = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: oldPassword }),
  });

  if (!check.ok) throw new Error("Ancien mot de passe incorrect.");

  // update password
  const res = await fetch(`${USERS_API}/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ password: newPassword }),
  });

  if (!res.ok) {
    const msg = await res.text();
    if (res.status === 401) throw new Error("Session expiree. Reconnecte-toi.");
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const updated = await res.json();

  // refresh local auth basic
  const authValue = encodeBasicAuth(updated.email || email, newPassword);
  localStorage.setItem("auth", authValue);

  return updated;
}
