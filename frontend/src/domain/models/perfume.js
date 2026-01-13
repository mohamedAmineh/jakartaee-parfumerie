// src/domain/models/perfume.js

export function createPerfumeEntity(form) {
  return {
    name: form.name || "",
    brand: form.brand || null,
    description: form.description || null,
    format: form.format || null,
    gender: form.gender || null,
    type: form.type || null,
    comment: form.comment || null,
    available: Boolean(form.available),
    stock: Number(form.stock || 0),
    price: form.price === "" ? null : Number(form.price),
  };
}

export function isValidPerfume(form) {
  return form.name && form.name.trim().length > 0;
}
