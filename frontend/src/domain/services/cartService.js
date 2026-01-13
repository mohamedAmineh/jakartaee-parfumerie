// src/domain/services/cartService.js
import { createCartItem, cartItemTotal } from "../models/cartItem";

const emptyCartStore = {
  load() {
    return [];
  },
  save() {},
  clear() {},
};

export function loadCart(cartStore = emptyCartStore) {
  const raw = cartStore.load();
  return Array.isArray(raw) ? raw.map((it) => createCartItem(it)) : [];
}

export function saveCart(items, cartStore = emptyCartStore) {
  cartStore.save(items);
}

export function computeCartTotal(items) {
  return items.reduce((sum, it) => sum + cartItemTotal(it), 0);
}

export function updateItemQuantity(items, id, delta, cartStore = emptyCartStore) {
  const next = items.map((it) =>
    it.id === id
      ? {
          ...it,
          quantity: Math.max(1, Number(it.quantity || 1) + delta),
        }
      : it
  );
  cartStore.save(next);
  return next;
}

export function removeItemFromCart(items, id, cartStore = emptyCartStore) {
  const next = items.filter((it) => it.id !== id);
  cartStore.save(next);
  return next;
}

export function clearCart(cartStore = emptyCartStore) {
  cartStore.clear();
}
