import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminHomePage() {
  const navigate = useNavigate();
  const [stockStatus, setStockStatus] = useState({
    loading: false,
    error: null,
    summary: null,
  });
  const [orderNotifs, setOrderNotifs] = useState({
    loading: false,
    error: null,
    items: [],
  });

  async function handleCheckStock() {
    setStockStatus({ loading: true, error: null, summary: null });
    try {
      const res = await fetch("http://localhost:8080/starter/api/perfumes");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const perfumes = await res.json();
      const total = perfumes.length;
      const lowStock = perfumes.filter((p) => Number(p.stock || 0) <= 5);
      const lowest = perfumes.reduce(
        (min, p) => (Number(p.stock || 0) < min ? Number(p.stock || 0) : min),
        Infinity
      );
      const summary =
        total === 0
          ? "Aucun parfum en catalogue pour le moment."
          : lowStock.length === 0
            ? "Tous les stocks sont au-dessus de 5."
            : `${lowStock.length} reference(s) a surveiller (stock <= 5). Stock le plus bas: ${
                lowest === Infinity ? 0 : lowest
              }.`;
      setStockStatus({ loading: false, error: null, summary });
    } catch (err) {
      setStockStatus({ loading: false, error: err.message, summary: null });
    }
  }

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
  }

  async function handleFetchNotifications() {
    setOrderNotifs((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch("http://localhost:8080/starter/api/notifications/orders");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setOrderNotifs({ loading: false, error: null, items: data || [] });
    } catch (err) {
      setOrderNotifs({ loading: false, error: err.message, items: [] });
    }
  }

  return (
    <div className="admin-home">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600&display=swap');

        .admin-home {
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
            radial-gradient(circle at 12% 15%, rgba(255, 177, 136, 0.35), transparent 48%),
            radial-gradient(circle at 88% 18%, rgba(255, 107, 107, 0.18), transparent 52%),
            radial-gradient(circle at 50% 80%, rgba(255, 215, 194, 0.6), transparent 55%),
            #fffaf6;
          position: relative;
          overflow: hidden;
          font-family: "Manrope", "Segoe UI", sans-serif;
          color: var(--ink);
        }

        .admin-home::before,
        .admin-home::after {
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

        .admin-home::before {
          background: rgba(255, 176, 136, 0.6);
          top: -90px;
          right: 12%;
        }

        .admin-home::after {
          background: rgba(255, 215, 194, 0.8);
          bottom: -120px;
          left: 6%;
          animation-delay: 2s;
        }

        .admin-home__wrap {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
        }

        .admin-home__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .admin-home__eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .admin-home__title {
          font-family: "Fraunces", "Times New Roman", serif;
          font-size: clamp(32px, 4vw, 44px);
          margin: 0 0 8px;
        }

        .admin-home__subtitle {
          color: var(--muted);
          font-size: 16px;
          max-width: 520px;
          margin: 0;
        }

        .admin-home__chip {
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255, 107, 107, 0.12);
          color: #b33a2b;
          font-weight: 600;
          font-size: 13px;
        }
        .admin-home__pill-button {
          padding: 10px 16px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(120deg, #ff6b6b, #ffb088);
          color: #1c1916;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 12px 24px rgba(255, 107, 107, 0.25);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .admin-home__pill-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(255, 107, 107, 0.3);
        }
        .admin-home__pill-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }
        .admin-home__pill-button--ghost {
          background: rgba(255, 255, 255, 0.88);
          color: #b33a2b;
          border: 1px solid rgba(255, 107, 107, 0.4);
          box-shadow: none;
        }
        .admin-home__pill-button--ghost:hover {
          box-shadow: 0 10px 18px rgba(255, 107, 107, 0.18);
        }

        .admin-home__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .admin-home__card {
          background: var(--glass);
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(25, 15, 10, 0.12);
          border: 1px solid rgba(255, 176, 136, 0.2);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 180px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: fadeUp 0.6s ease;
        }

        .admin-home__card:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 60px rgba(25, 15, 10, 0.18);
        }

        .admin-home__card-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }

        .admin-home__card-text {
          color: var(--muted);
          margin: 0;
          line-height: 1.5;
        }

        .admin-home__cta {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #b33a2b;
        }

        .admin-home__card--primary {
          background: linear-gradient(120deg, rgba(255, 107, 107, 0.15), rgba(255, 176, 136, 0.2));
          border: 1px solid rgba(255, 107, 107, 0.2);
        }

        .admin-home__highlight {
          font-family: "Fraunces", "Times New Roman", serif;
          font-size: 28px;
          margin: 0;
        }

        .admin-home__stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(14px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="admin-home__wrap">
        <header className="admin-home__header">
          <div>
            <p className="admin-home__eyebrow">Espace admin</p>
            <h1 className="admin-home__title">Tableau de bord</h1>
            <p className="admin-home__subtitle">
              Gere le catalogue et prepare les prochaines references en quelques clics.
            </p>
          </div>
        </header>

        <section className="admin-home__grid">

          <Link
            to="/admin/perfumes/manage"
            className="admin-home__card"
            style={{ textDecoration: "none" }}
          >
            <div className="admin-home__stack">
              <h2 className="admin-home__card-title">Etat du catalogue</h2>
              <p className="admin-home__highlight">Consulter les stocks</p>
              <p className="admin-home__card-text">
                Consulter le stock, activer/desactiver la dispo, dupliquer ou supprimer une reference.
              </p>
              <span className="admin-home__cta">Ouvrir la gestion -&gt;</span>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="admin-home__card"
            style={{ textDecoration: "none" }}
          >
            <div className="admin-home__stack">
              <h2 className="admin-home__card-title">Etat des commandes</h2>
              <p className="admin-home__highlight">Consulter les commandes.</p>
              <p className="admin-home__card-text">
                Consulter/ Modifier/ Supprimer les commandes.
              </p>
              <span className="admin-home__cta">Ouvrir la gestion -&gt;</span>
            </div>
          </Link>

        </section>
      </div>
    </div>
  );
}
