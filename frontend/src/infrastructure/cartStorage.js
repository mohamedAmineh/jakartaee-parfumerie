// Cart persistence using browser storage.

import { browserStorage, getJson, setJson } from "./storage";

const CART_KEY = "cart";

export const cartStorage = {
  load() {
    const raw = getJson(CART_KEY, [], browserStorage);
    return Array.isArray(raw) ? raw : [];
  },
  save(items) {
    setJson(CART_KEY, Array.isArray(items) ? items : [], browserStorage);
  },
  clear() {
    browserStorage.removeItem(CART_KEY);
  },
};
