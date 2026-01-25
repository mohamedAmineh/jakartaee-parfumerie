// Local storage helpers with JSON serialization and safe fallbacks.

export const browserStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
      return undefined;
    }
    return undefined;
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (_) {
      return undefined;
    }
    return undefined;
  },
};

export function getJson(key, fallback = null, storage = browserStorage) {
  const raw = storage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

export function setJson(key, value, storage = browserStorage) {
  if (value == null) {
    storage.removeItem(key);
    return;
  }
  storage.setItem(key, JSON.stringify(value));
}
