import { browserStorage, getJson, setJson } from "../infrastructure/storage";

const AUTH_KEY = "auth";
const USER_KEY = "user";

export const encodeBasicAuth = (email, password) => {
  const value = `${email}:${password}`;
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

export const getAuthHeaders = (storage = browserStorage) => {
  const auth = storage.getItem(AUTH_KEY);
  return auth ? { Authorization: `Bearer ${auth}` } : {};
};

export const getAuthValue = (storage = browserStorage) => storage.getItem(AUTH_KEY);

export const hasAuth = (storage = browserStorage) => Boolean(getAuthValue(storage));

export const setAuthValue = (value, storage = browserStorage) => {
  storage.setItem(AUTH_KEY, value);
};

export const clearAuthValue = (storage = browserStorage) => {
  storage.removeItem(AUTH_KEY);
};

export const getStoredUser = (storage = browserStorage) => getJson(USER_KEY, null, storage);

export const setStoredUser = (user, storage = browserStorage) => {
  setJson(USER_KEY, user, storage);
};

export const clearStoredUser = (storage = browserStorage) => {
  storage.removeItem(USER_KEY);
};

export const clearSession = (storage = browserStorage) => {
  clearStoredUser(storage);
  clearAuthValue(storage);
  storage.removeItem("token");
};
