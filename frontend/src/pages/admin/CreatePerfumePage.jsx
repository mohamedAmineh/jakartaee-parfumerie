import { useState } from "react";

const API = "http://localhost:8080/starter/api/perfumes";

export default function CreatePerfumePage() {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    stock: 0,
    available: true,
    format: "100ml",
    description: "",
    gender: "UNISEX",
    type: "EDP",
    comment: "",
  });

  const [status, setStatus] = useState({ loading: false, error: null, ok: null });

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: null, ok: null });

    const payload = {
      name: form.name,
      brand: form.brand || null,
      description: form.description || null,
      format: form.format || null,
      gender: form.gender || null,
      type: form.type || null,
      comment: form.comment || null,
      available: Boolean(form.available),
      stock: Number(form.stock || 0),
      price: form.price === "" ? null : Number(form.price), // BigDecimal côté Java
    };

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} - ${text}`);
      }

      const created = await res.json();
      setStatus({ loading: false, error: null, ok: `Créé: id=${created.id}` });

      // reset minimal
      setForm((f) => ({ ...f, name: "", brand: "", price: "", description: "", comment: "" }));
    } catch (err) {
      setStatus({ loading: false, error: err.message, ok: null });
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2>Créer un parfum</h2>

      <form onSubmit={onSubmit}>
        <label>
          Nom*
          <input name="name" value={form.name} onChange={onChange} required />
        </label>

        <label>
          Marque
          <input name="brand" value={form.brand} onChange={onChange} />
        </label>

        <label>
          Prix
          <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} />
        </label>

        <label>
          Stock
          <input name="stock" type="number" value={form.stock} onChange={onChange} />
        </label>

        <label>
          Disponible
          <input name="available" type="checkbox" checked={form.available} onChange={onChange} />
        </label>

        <label>
          Format
          <input name="format" value={form.format} onChange={onChange} placeholder="50ml / 100ml" />
        </label>

        <label>
          Genre
          <select name="gender" value={form.gender} onChange={onChange}>
            <option value="FEMME">FEMME</option>
            <option value="HOMME">HOMME</option>
            <option value="UNISEX">UNISEX</option>
          </select>
        </label>

        <label>
          Type
          <select name="type" value={form.type} onChange={onChange}>
            <option value="EDT">EDT</option>
            <option value="EDP">EDP</option>
            <option value="PARFUM">PARFUM</option>
          </select>
        </label>

        <label>
          Description
          <textarea name="description" value={form.description} onChange={onChange} />
        </label>

        <label>
          Commentaire
          <textarea name="comment" value={form.comment} onChange={onChange} />
        </label>

        <button type="submit" disabled={status.loading}>
          {status.loading ? "Création..." : "Créer"}
        </button>
      </form>

      {status.ok && <p style={{ color: "green" }}>{status.ok}</p>}
      {status.error && <p style={{ color: "crimson" }}>{status.error}</p>}
    </div>
  );
}