// src/domain/models/order.js

export function createOrderPayload({ userId, items, status = "PENDING" }) {
  return {
    userId,
    status,
    items: items.map((it) => ({
      perfumeId: it.id,
      quantity: Number(it.quantity || 1),
      unitPrice: Number(it.price || 0),
    })),
  };
}
