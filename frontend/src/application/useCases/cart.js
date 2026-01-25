// Cart use cases wired to the storage adapter.

import { cartStorage } from "../../infrastructure/cartStorage";
import {
  loadCart as loadCartDomain,
  saveCart as saveCartDomain,
  computeCartTotal,
  updateItemQuantity as updateItemQuantityDomain,
  removeItemFromCart as removeItemFromCartDomain,
  clearCart as clearCartDomain,
} from "../../domain/services/cartService";

export function loadCart() {
  return loadCartDomain(cartStorage);
}

export function saveCart(items) {
  return saveCartDomain(items, cartStorage);
}

export { computeCartTotal };

export function updateItemQuantity(items, id, delta) {
  return updateItemQuantityDomain(items, id, delta, cartStorage);
}

export function removeItemFromCart(items, id) {
  return removeItemFromCartDomain(items, id, cartStorage);
}

export function clearCart() {
  return clearCartDomain(cartStorage);
}
