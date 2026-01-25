// Auth workflow for login, signup, and session teardown.

import { httpRequest, readErrorBody, parseJson } from "../../infrastructure/httpClient";
import { encodeBasicAuth, setAuthValue, setStoredUser, clearSession } from "../../services/auth";
import { API_BASE_URL } from "../../config/api";

const LOGIN_URL = `${API_BASE_URL}/auth/login`;
const SIGNUP_URL = `${API_BASE_URL}/users`;

export async function loginUser(email, password) {
  const res = await httpRequest(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const msg = await readErrorBody(res);
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const user = await parseJson(res);
  setStoredUser(user);
  setAuthValue(encodeBasicAuth(email, password));
  return user;
}

export async function signupUser(payload) {
  const res = await httpRequest(SIGNUP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await readErrorBody(res);
    throw new Error(msg || `HTTP ${res.status}`);
  }

  await parseJson(res).catch(() => null);
  return loginUser(payload.email, payload.password);
}

export function logoutUser() {
  clearSession();
}
