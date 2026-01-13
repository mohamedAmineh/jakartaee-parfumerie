// src/domain/services/cartService.js
import { createCartItem, cartItemTotal } from "../models/cartItem";

const CART_KEY = "cart";

export function loadCart() {
  const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  return Array.isArray(raw)
    ? raw.map((it) => createCartItem(it))
    : [];
}

export function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function computeCartTotal(items) {
  return items.reduce((sum, it) => sum + cartItemTotal(it), 0);
}

export function updateItemQuantity(items, id, delta) {
  const next = items.map((it) =>
    it.id === id
      ? {
          ...it,
          quantity: Math.max(1, Number(it.quantity || 1) + delta),
        }
      : it
  );
  saveCart(next);
  return next;
}

export function removeItemFromCart(items, id) {
  const next = items.filter((it) => it.id !== id);
  saveCart(next);
  return next;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
