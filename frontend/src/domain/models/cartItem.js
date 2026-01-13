// src/domain/models/cartItem.js

export function createCartItem({ id, name, price, quantity = 1 }) {
  return {
    id,
    name,
    price: Number(price || 0),
    quantity: Number(quantity || 1),
  };
}

export function cartItemTotal(item) {
  return Number(item.price || 0) * Number(item.quantity || 1);
}