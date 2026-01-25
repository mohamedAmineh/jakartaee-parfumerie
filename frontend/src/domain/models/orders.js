// Builds order payloads from cart items.

export function createOrderPayload({ userId, items, status = "CREATED", testZeroTotal = false }) {
  return {
    userId,
    status,
    testZeroTotal,
    items: items.map((it) => ({
      perfumeId: it.id,
      quantity: Number(it.quantity || 1),
      unitPrice: Number(it.price || 0),
    })),
  };
}
