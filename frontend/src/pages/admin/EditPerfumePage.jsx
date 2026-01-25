// Admin form for editing a perfume.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPerfumeById, updatePerfume } from "../../application/useCases/perfume";

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
    try {
      const perfume = await fetchPerfumeById(id);
      setForm({
        ...emptyForm,
        name: perfume.name ?? "",
        brand: perfume.brand ?? "",
        price: perfume.price ?? "",
        stock: perfume.stock ?? 0,
        available: perfume.available ?? true,
        format: perfume.format ?? "100ml",
        description: perfume.description ?? "",
        gender: perfume.gender ?? "UNISEX",
        type: perfume.type ?? "EDP",
        comment: perfume.comment ?? "",
      });
    } catch (err) {
      setStatus({ loading: false, error: err?.message || "Erreur.", ok: null });
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
    try {
      await updatePerfume(id, form);
      setStatus({ loading: false, error: null, ok: "Mise à jour enregistrée." });
    } catch (err) {
      setStatus({ loading: false, error: err?.message || "Erreur.", ok: null });
    }
  }

  return (
    <div className="admin-create">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600&display=swap');

        .admin-create {
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

        .admin-create::before,
        .admin-create::after {
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

        .admin-create::before {
          background: rgba(255, 176, 136, 0.6);
          top: -80px;
          right: 10%;
        }

        .admin-create::after {
          background: rgba(255, 215, 194, 0.8);
          bottom: -120px;
          left: 5%;
          animation-delay: 2s;
        }

        .admin-create__wrap {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
        }

        .admin-create__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .admin-create__eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .admin-create__title {
          font-family: "Fraunces", "Times New Roman", serif;
          font-size: clamp(32px, 4vw, 44px);
          margin: 0 0 8px;
        }

        .admin-create__subtitle {
          color: var(--muted);
          font-size: 16px;
          max-width: 560px;
          margin: 0;
        }

        .admin-create__status {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .admin-create__chip {
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255, 107, 107, 0.12);
          color: #b33a2b;
          font-weight: 600;
          font-size: 13px;
        }

        .admin-create__link {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 107, 107, 0.35);
          background: rgba(255, 255, 255, 0.9);
          color: #b33a2b;
          font-weight: 700;
          text-decoration: none;
        }

        .admin-create__layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.8fr);
          gap: 24px;
        }

        .admin-create__card {
          background: var(--glass);
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 20px 60px rgba(25, 15, 10, 0.12);
          border: 1px solid rgba(255, 176, 136, 0.2);
          backdrop-filter: blur(14px);
          animation: fadeUp 0.6s ease;
        }

        .admin-create__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 16px;
        }

        .admin-create__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
        }

        .admin-create__field input,
        .admin-create__field select,
        .admin-create__field textarea {
          border-radius: 12px;
          border: 1px solid rgba(28, 25, 22, 0.12);
          padding: 10px 12px;
          font-size: 14px;
          background: #fff;
          font-family: "Manrope", "Segoe UI", sans-serif;
          transition: border 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-create__field textarea {
          min-height: 90px;
          resize: vertical;
        }

        .admin-create__field input:focus,
        .admin-create__field select:focus,
        .admin-create__field textarea:focus {
          outline: none;
          border-color: rgba(255, 107, 107, 0.7);
          box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.16);
        }

        .admin-create__field--full { grid-column: 1 / -1; }

        .admin-create__actions {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .admin-create__toggle {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
        }

        .admin-create__toggle input {
          appearance: none;
          width: 48px;
          height: 28px;
          border-radius: 999px;
          background: rgba(28, 25, 22, 0.12);
          position: relative;
          transition: background 0.2s ease;
          cursor: pointer;
        }

        .admin-create__toggle input::after {
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

        .admin-create__toggle input:checked {
          background: linear-gradient(120deg, #79d2b1, #44c8a1);
        }

        .admin-create__toggle input:checked::after {
          transform: translateX(20px);
        }

        .admin-create__button {
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

        .admin-create__button:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }

        .admin-create__button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 32px rgba(255, 107, 107, 0.3);
        }

        .admin-create__message {
          margin-top: 14px;
          font-size: 14px;
          font-weight: 600;
        }
        .admin-create__message--ok { color: #1a7f4f; }
        .admin-create__message--error { color: #b33a2b; }

        .admin-create__aside {
          display: flex;
          flex-direction: column;
          gap: 18px;
          animation: fadeUp 0.7s ease;
        }

        .admin-create__panel {
          background: rgba(255, 255, 255, 0.88);
          border-radius: 18px;
          padding: 20px;
          border: 1px solid rgba(255, 176, 136, 0.25);
          box-shadow: 0 16px 30px rgba(25, 15, 10, 0.1);
        }

        .admin-create__panel h3 {
          font-family: "Fraunces", "Times New Roman", serif;
          margin: 0 0 12px;
          font-size: 20px;
        }

        .admin-create__preview-name { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
        .admin-create__preview-brand { color: var(--muted); margin: 0 0 12px; }

        .admin-create__badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .admin-create__badge {
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 176, 136, 0.25);
          font-size: 12px;
          font-weight: 600;
          color: #7a3d2c;
        }

        .admin-create__hint { color: var(--muted); font-size: 13px; line-height: 1.6; margin: 0; }

        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(14px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        @media (max-width: 900px) { .admin-create__layout { grid-template-columns: 1fr; } }
      `}</style>

      <div className="admin-create__wrap">
        <header className="admin-create__header">
          <div>
            <p className="admin-create__eyebrow">Espace admin</p>
            <h1 className="admin-create__title">Modifier le parfum</h1>
            <p className="admin-create__subtitle">
              ID: {id} — charge le produit, modifie les champs puis enregistre.
            </p>
          </div>

          <div className="admin-create__status">
            <Link to="/admin/perfumes/manage" className="admin-create__link">
              Retour
            </Link>
            <span className="admin-create__chip">
              {loading ? "Chargement..." : status.loading ? "Enregistrement..." : "Édition"}
            </span>
          </div>
        </header>

        <div className="admin-create__layout">
          <form onSubmit={onSubmit} className="admin-create__card">
            <div className="admin-create__grid">
              <label className="admin-create__field">
                Nom*
                <input name="name" value={form.name} onChange={onChange} required />
              </label>

              <label className="admin-create__field">
                Marque
                <input name="brand" value={form.brand} onChange={onChange} />
              </label>

              <label className="admin-create__field">
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

              <label className="admin-create__field">
                Stock
                <input name="stock" type="number" min="0" value={form.stock} onChange={onChange} />
              </label>

              <label className="admin-create__field">
                Format
                <input name="format" value={form.format} onChange={onChange} />
              </label>

              <label className="admin-create__field">
                Genre
                <select name="gender" value={form.gender} onChange={onChange}>
                  <option value="FEMME">FEMME</option>
                  <option value="HOMME">HOMME</option>
                  <option value="UNISEX">UNISEX</option>
                </select>
              </label>

              <label className="admin-create__field">
                Type
                <select name="type" value={form.type} onChange={onChange}>
                  <option value="EDT">EDT</option>
                  <option value="EDP">EDP</option>
                  <option value="PARFUM">PARFUM</option>
                </select>
              </label>

              <label className="admin-create__field admin-create__field--full">
                Description
                <textarea name="description" value={form.description} onChange={onChange} />
              </label>

              <label className="admin-create__field admin-create__field--full">
                Commentaire
                <textarea name="comment" value={form.comment} onChange={onChange} />
              </label>
            </div>

            <div className="admin-create__actions">
              <label className="admin-create__toggle">
                <input name="available" type="checkbox" checked={form.available} onChange={onChange} />
                Disponible
              </label>

              <button type="submit" disabled={loading || status.loading} className="admin-create__button">
                {status.loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>

            {status.ok && <p className="admin-create__message admin-create__message--ok">{status.ok}</p>}
            {status.error && (
              <p className="admin-create__message admin-create__message--error">{status.error}</p>
            )}
          </form>

          <aside className="admin-create__aside">
            <div className="admin-create__panel">
              <h3>Aperçu</h3>
              <p className="admin-create__preview-name">{form.name || "Nom du parfum"}</p>
              <p className="admin-create__preview-brand">{form.brand || "Maison"}</p>

              <div className="admin-create__badges">
                <span className="admin-create__badge">{form.gender || "UNISEX"}</span>
                <span className="admin-create__badge">{form.type || "EDP"}</span>
                <span className="admin-create__badge">{form.format || "100ml"}</span>
                <span className="admin-create__badge">{form.available ? "Disponible" : "Indisponible"}</span>
              </div>

              <p className="admin-create__hint">
                {form.description || "Ajoute une description courte pour aider les clients a se projeter."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
