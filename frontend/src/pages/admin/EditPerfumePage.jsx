import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAuthHeaders } from "../../services/auth";

const API = "http://localhost:8080/starter/api/perfumes";

const emptyForm = {
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
};

export default function EditPerfumePage() {
  const { id } = useParams();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ loading: false, error: null, ok: null });

  useEffect(() => {
    loadPerfume();
  }, [id]);

  async function loadPerfume() {
    setLoading(true);
    setStatus({ loading: false, error: null, ok: null });
    if (!localStorage.getItem("auth")) {
      setStatus({ loading: false, error: "Session admin expiree. Reconnecte-toi.", ok: null });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API}/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setForm({
        ...emptyForm,
        name: data.name ?? "",
        brand: data.brand ?? "",
        price: data.price ?? "",
        stock: data.stock ?? 0,
        available: data.available ?? true,
        format: data.format ?? "100ml",
        description: data.description ?? "",
        gender: data.gender ?? "UNISEX",
        type: data.type ?? "EDP",
        comment: data.comment ?? "",
      });
    } catch (err) {
      setStatus({ loading: false, error: err.message, ok: null });
    } finally {
      setLoading(false);
    }
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: null, ok: null });
    if (!localStorage.getItem("auth")) {
      setStatus({ loading: false, error: "Session admin expiree. Reconnecte-toi.", ok: null });
      return;
    }

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
      price: form.price === "" ? null : Number(form.price),
    };

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} - ${text}`);
      }

      await res.json();
      setStatus({ loading: false, error: null, ok: "Mise à jour enregistrée." });
    } catch (err) {
      setStatus({ loading: false, error: err.message, ok: null });
    }
  }

  return (
    <div className="admin-edit">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600&display=swap');

        .admin-edit {
          --cream: #fff6ef;
          --peach: #ffd7c2;
          --apricot: #ffb088;
          --coral: #ff6b6b;
          --ink: #1c1916;
          --muted: #6f655c;
          --glass: rgba(255, 255, 255, 0.85);
          min-height: 100vh;
          padding: 56px 20px 80px;
          background:
            radial-gradient(circle at 10% 10%, rgba(255, 177, 136, 0.35), transparent 45%),
            radial-gradient(circle at 90% 20%, rgba(255, 107, 107, 0.2), transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(255, 215, 194, 0.6), transparent 55%),
            #fffaf6;
          position: relative;
          overflow: hidden;
          font-family: "Manrope", "Segoe UI", sans-serif;
          color: var(--ink);
        }

        .admin-edit::before,
        .admin-edit::after {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          filter: blur(10px);
          opacity: 0.45;
          animation: float 10s ease-in-out infinite;
          z-index: 0;
        }

        .admin-edit::before {
          background: rgba(255, 176, 136, 0.6);
          top: -80px;
          right: 10%;
        }

        .admin-edit::after {
          background: rgba(255, 215, 194, 0.8);
          bottom: -120px;
          left: 5%;
          animation-delay: 2s;
        }

        .admin-edit__wrap {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
        }

        .admin-edit__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .admin-edit__eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .admin-edit__title {
          font-family: "Fraunces", "Times New Roman", serif;
          font-size: clamp(32px, 4vw, 44px);
          margin: 0 0 8px;
        }

        .admin-edit__subtitle {
          color: var(--muted);
          font-size: 16px;
          max-width: 520px;
          margin: 0;
        }

        .admin-edit__status {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .admin-edit__chip {
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255, 107, 107, 0.12);
          color: #b33a2b;
          font-weight: 600;
          font-size: 13px;
        }

        .admin-edit__link {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 107, 107, 0.4);
          color: #b33a2b;
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          background: rgba(255, 255, 255, 0.9);
        }

        .admin-edit__layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.8fr);
          gap: 24px;
        }

        .admin-edit__card {
          background: var(--glass);
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(25, 15, 10, 0.12);
          border: 1px solid rgba(255, 176, 136, 0.2);
          backdrop-filter: blur(14px);
          animation: fadeUp 0.6s ease;
        }

        .admin-edit__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 16px;
        }

        .admin-edit__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
        }

        .admin-edit__field input,
        .admin-edit__field select,
        .admin-edit__field textarea {
          border-radius: 12px;
          border: 1px solid rgba(28, 25, 22, 0.12);
          padding: 10px 12px;
          font-size: 14px;
          background: #fff;
          font-family: "Manrope", "Segoe UI", sans-serif;
          transition: border 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-edit__field textarea {
          min-height: 90px;
          resize: vertical;
        }

        .admin-edit__field input:focus,
        .admin-edit__field select:focus,
        .admin-edit__field textarea:focus {
          outline: none;
          border-color: rgba(255, 107, 107, 0.7);
          box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.16);
        }

        .admin-edit__field--full {
          grid-column: 1 / -1;
        }

        .admin-edit__actions {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .admin-edit__toggle {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
        }

        .admin-edit__toggle input {
          appearance: none;
          width: 48px;
          height: 28px;
          border-radius: 999px;
          background: rgba(28, 25, 22, 0.12);
          position: relative;
          transition: background 0.2s ease;
          cursor: not-allowed;
        }

        .admin-edit__toggle input::after {
          content: "";
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          top: 3px;
          left: 3px;
          transition: transform 0.2s ease;
          box-shadow: 0 6px 10px rgba(0, 0, 0, 0.12);
        }

        .admin-edit__toggle input:checked {
          background: linear-gradient(120deg, #79d2b1, #44c8a1);
        }

        .admin-edit__toggle input:checked::after {
          transform: translateX(20px);
        }

        .admin-edit__button {
          border: none;
          padding: 12px 24px;
          border-radius: 999px;
          color: #fff;
          font-weight: 600;
          font-size: 15px;
          background: linear-gradient(120deg, #ff6b6b, #ff8f6b);
          box-shadow: 0 16px 24px rgba(255, 107, 107, 0.25);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-edit__button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .admin-edit__button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 32px rgba(255, 107, 107, 0.3);
        }

        .admin-edit__message {
          margin-top: 14px;
          font-size: 14px;
          font-weight: 600;
        }

        .admin-edit__message--ok {
          color: #1a7f4f;
        }

        .admin-edit__message--error {
          color: #b33a2b;
        }

        .admin-edit__aside {
          display: flex;
          flex-direction: column;
          gap: 18px;
          animation: fadeUp 0.7s ease;
        }

        .admin-edit__panel {
          background: rgba(255, 255, 255, 0.88);
          border-radius: 18px;
          padding: 20px;
          border: 1px solid rgba(255, 176, 136, 0.25);
          box-shadow: 0 16px 30px rgba(25, 15, 10, 0.1);
        }

        .admin-edit__panel h3 {
          font-family: "Fraunces", "Times New Roman", serif;
          margin: 0 0 12px;
          font-size: 20px;
        }

        .admin-edit__preview-name {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 4px;
        }

        .admin-edit__preview-brand {
          color: var(--muted);
          margin: 0 0 12px;
        }

        .admin-edit__badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .admin-edit__badge {
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 176, 136, 0.25);
          font-size: 12px;
          font-weight: 600;
          color: #7a3d2c;
        }

        .admin-edit__hint {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        }

        .admin-edit__statusline {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(255, 107, 107, 0.12);
          color: #b33a2b;
          font-weight: 600;
          font-size: 13px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(14px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .admin-edit__layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="admin-edit__wrap">
        <header className="admin-edit__header">
          <div>
            <p className="admin-edit__eyebrow">Espace admin</p>
            <h1 className="admin-edit__title">Modifier un parfum</h1>
            <p className="admin-edit__subtitle">
              Mets a jour les informations du catalogue et ajuste le stock en temps reel.
            </p>
          </div>
          <div className="admin-edit__status">
            <span className="admin-edit__chip">
              {loading ? "Chargement..." : `Edition #${id}`}
            </span>
            <Link to="/admin/perfumes/manage" className="admin-edit__link">
              Retour a la gestion
            </Link>
          </div>
        </header>

        <div className="admin-edit__layout">
          <form onSubmit={onSubmit} className="admin-edit__card">
            <div className="admin-edit__grid">
              <label className="admin-edit__field">
                Nom*
                <input name="name" value={form.name} onChange={onChange} required />
              </label>

              <label className="admin-edit__field">
                Marque
                <input name="brand" value={form.brand} onChange={onChange} />
              </label>

              <label className="admin-edit__field">
                Prix
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={onChange}
                  placeholder="0.00"
                />
              </label>

              <label className="admin-edit__field">
                Stock
                <input name="stock" type="number" min="0" value={form.stock} onChange={onChange} />
              </label>

              <label className="admin-edit__field">
                Format
                <input name="format" value={form.format} onChange={onChange} placeholder="50ml / 100ml" />
              </label>

              <label className="admin-edit__field">
                Genre
                <select name="gender" value={form.gender} onChange={onChange}>
                  <option value="FEMME">FEMME</option>
                  <option value="HOMME">HOMME</option>
                  <option value="UNISEX">UNISEX</option>
                </select>
              </label>

              <label className="admin-edit__field">
                Type
                <select name="type" value={form.type} onChange={onChange}>
                  <option value="EDT">EDT</option>
                  <option value="EDP">EDP</option>
                  <option value="PARFUM">PARFUM</option>
                </select>
              </label>

              <label className="admin-edit__field admin-edit__field--full">
                Description
                <textarea name="description" value={form.description} onChange={onChange} />
              </label>

              <label className="admin-edit__field admin-edit__field--full">
                Commentaire
                <textarea name="comment" value={form.comment} onChange={onChange} />
              </label>
            </div>

            <div className="admin-edit__actions">
              <label className="admin-edit__toggle">
                <input
                  name="available"
                  type="checkbox"
                  checked={form.available}
                  onChange={onChange}
                  disabled
                />
                Disponible (auto via stock)
              </label>

              <button
                type="submit"
                disabled={status.loading || loading}
                className="admin-edit__button"
              >
                {status.loading ? "Mise a jour..." : "Enregistrer les modifications"}
              </button>
            </div>

            {status.ok && (
              <p className="admin-edit__message admin-edit__message--ok">{status.ok}</p>
            )}
            {status.error && (
              <p className="admin-edit__message admin-edit__message--error">{status.error}</p>
            )}
          </form>

          <aside className="admin-edit__aside">
            <div className="admin-edit__panel">
              <h3>Apercu fiche</h3>
              <p className="admin-edit__preview-name">{form.name || "Nom du parfum"}</p>
              <p className="admin-edit__preview-brand">{form.brand || "Maison"}</p>
              <div className="admin-edit__badges">
                <span className="admin-edit__badge">{form.gender || "UNISEX"}</span>
                <span className="admin-edit__badge">{form.type || "EDP"}</span>
                <span className="admin-edit__badge">{form.format || "100ml"}</span>
                <span className="admin-edit__badge">
                  {form.available ? "Disponible" : "Indisponible"}
                </span>
              </div>
              <p className="admin-edit__hint">
                {form.description || "Complete les notes pour donner envie aux clients."}
              </p>
              {form.price !== "" && (
                <p className="admin-edit__statusline">Prix: {form.price} EUR</p>
              )}
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
