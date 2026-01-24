import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchPerfumesList } from "../../application/useCases/perfume";
import { clearOrderNotifications, fetchOrderNotifications } from "../../application/useCases/notifications";
import { clearDeadLetters, fetchDeadLetters } from "../../application/useCases/deadletters";
import { fetchHighValueOrderIds } from "../../application/useCases/ordersAdmin";
import { logoutUser } from "../../application/useCases/auth";

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
  const [deadLetters, setDeadLetters] = useState({
    loading: false,
    error: null,
    items: [],
  });
  const [highValueCount, setHighValueCount] = useState({
    loading: false,
    error: null,
    count: 0,
  });

  useEffect(() => {
    let active = true;

    async function loadHighValueCount() {
      setHighValueCount((s) => ({ ...s, loading: true, error: null }));
      try {
        const ids = await fetchHighValueOrderIds();
        if (!active) return;
        setHighValueCount({ loading: false, error: null, count: ids?.size ?? 0 });
      } catch (err) {
        if (!active) return;
        setHighValueCount({ loading: false, error: err?.message || "Erreur", count: 0 });
      }
    }

    loadHighValueCount();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      setOrderNotifs((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fetchOrderNotifications();
        if (!active) return;
        setOrderNotifs({ loading: false, error: null, items: data || [] });
      } catch (err) {
        if (!active) return;
        setOrderNotifs({ loading: false, error: err?.message || "Erreur", items: [] });
      }
    }

    loadNotifications();
    const timer = setInterval(loadNotifications, 8000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDeadLetters() {
      setDeadLetters((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fetchDeadLetters();
        if (!active) return;
        setDeadLetters({ loading: false, error: null, items: data || [] });
      } catch (err) {
        if (!active) return;
        setDeadLetters({ loading: false, error: err?.message || "Erreur", items: [] });
      }
    }

    loadDeadLetters();
    const timer = setInterval(loadDeadLetters, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  async function handleCheckStock() {
    setStockStatus({ loading: true, error: null, summary: null });
    try {
      const perfumes = await fetchPerfumesList();
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
    logoutUser();
    navigate("/auth", { replace: true });
  }

  async function handleFetchNotifications() {
    setOrderNotifs((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchOrderNotifications();
      setOrderNotifs({ loading: false, error: null, items: data || [] });
    } catch (err) {
      setOrderNotifs({ loading: false, error: err.message, items: [] });
    }
  }

  async function handleFetchDeadLetters() {
    setDeadLetters((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchDeadLetters();
      setDeadLetters({ loading: false, error: null, items: data || [] });
    } catch (err) {
      setDeadLetters({ loading: false, error: err?.message || "Erreur", items: [] });
    }
  }

  async function handleClearDeadLetters() {
    setDeadLetters((s) => ({ ...s, loading: true, error: null }));
    try {
      await clearDeadLetters();
      setDeadLetters({ loading: false, error: null, items: [] });
    } catch (err) {
      setDeadLetters({ loading: false, error: err?.message || "Erreur", items: [] });
    }
  }

  async function handleClearNotifications() {
    setOrderNotifs((s) => ({ ...s, loading: true, error: null }));
    try {
      await clearOrderNotifications();
      setOrderNotifs({ loading: false, error: null, items: [] });
    } catch (err) {
      setOrderNotifs((s) => ({ ...s, loading: false, error: err?.message || "Erreur" }));
    }
  }

  async function handleRefreshHighValue() {
    setHighValueCount((s) => ({ ...s, loading: true, error: null }));
    try {
      const ids = await fetchHighValueOrderIds();
      setHighValueCount({ loading: false, error: null, count: ids?.size ?? 0 });
    } catch (err) {
      setHighValueCount({ loading: false, error: err?.message || "Erreur", count: 0 });
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

        .admin-home__live {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 18px;
          border: 1px solid rgba(255, 107, 107, 0.25);
          background: rgba(255, 255, 255, 0.8);
        }

        .admin-home__live-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff6b6b;
          box-shadow: 0 0 0 6px rgba(255, 107, 107, 0.2);
          animation: pulse 1.6s ease-in-out infinite;
        }

        .admin-home__live-label {
          font-size: 12px;
          color: var(--muted);
          font-weight: 700;
        }

        .admin-home__live-value {
          font-weight: 800;
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

        .admin-home__grid--wide {
          margin-top: 24px;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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

        .admin-home__inline {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .admin-home__panel {
          background: var(--glass);
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(25, 15, 10, 0.12);
          border: 1px solid rgba(255, 176, 136, 0.2);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .admin-home__panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .admin-home__panel-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .admin-home__panel-label {
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 11px;
          font-weight: 700;
          color: var(--muted);
          margin: 0 0 6px;
        }

        .admin-home__panel-title {
          font-family: "Fraunces", "Times New Roman", serif;
          margin: 0;
          font-size: 20px;
        }

        .admin-home__panel-badge {
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 107, 107, 0.12);
          color: #b33a2b;
          font-weight: 800;
          font-size: 12px;
        }

        .admin-home__panel-alert {
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(255, 107, 107, 0.12);
          border: 1px solid rgba(255, 107, 107, 0.25);
          color: #b33a2b;
          font-weight: 700;
        }

        .admin-home__panel-empty {
          color: var(--muted);
          font-weight: 700;
        }

        .admin-home__panel-list {
          display: grid;
          gap: 10px;
        }

        .admin-home__panel-item {
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(28, 25, 22, 0.08);
          background: rgba(255, 255, 255, 0.8);
        }

        .admin-home__panel-item-title {
          font-weight: 800;
        }

        .admin-home__panel-item-meta {
          margin-top: 4px;
          font-size: 12px;
          color: var(--muted);
          font-weight: 600;
        }

        .admin-home__panel-link {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 107, 107, 0.35);
          background: rgba(255, 255, 255, 0.9);
          color: #b33a2b;
          text-decoration: none;
          font-weight: 700;
          font-size: 12px;
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

        .admin-home__icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 176, 136, 0.3);
          color: #b33a2b;
        }

        .admin-home__icon svg {
          width: 22px;
          height: 22px;
        }

        .admin-home__icon--orders {
          color: #7a3d2c;
          border-color: rgba(255, 107, 107, 0.3);
        }

        .admin-home__icon--stats {
          color: #1a7f4f;
          border-color: rgba(68, 200, 161, 0.4);
          background: rgba(68, 200, 161, 0.12);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(14px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 6px rgba(255, 107, 107, 0.2); }
          50% { box-shadow: 0 0 0 10px rgba(255, 107, 107, 0.1); }
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
          <div className="admin-home__live">
            <span className="admin-home__live-dot" />
            <div>
              <div className="admin-home__live-label">Notifications live</div>
              <div className="admin-home__live-value">{orderNotifs.items.length} commandes</div>
            </div>
            <button
              type="button"
              className="admin-home__pill-button admin-home__pill-button--ghost"
              onClick={handleFetchNotifications}
              disabled={orderNotifs.loading}
            >
              {orderNotifs.loading ? "Sync..." : "Rafraichir"}
            </button>
            <button
              type="button"
              className="admin-home__pill-button admin-home__pill-button--ghost"
              onClick={handleClearNotifications}
              disabled={orderNotifs.loading}
            >
              Marquer lues
            </button>
          </div>
        </header>

        <section className="admin-home__grid stagger">

          <Link
            to="/admin/perfumes/manage"
            className="admin-home__card"
            style={{ textDecoration: "none" }}
          >
            <div className="admin-home__stack">
              <div className="admin-home__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 4h9l3 3v13H6z" />
                  <path d="M15 4v3h3" />
                  <path d="M8 13h8M8 17h5" />
                </svg>
              </div>
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
              <div className="admin-home__icon admin-home__icon--orders">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 7h16l-2 11H6z" />
                  <path d="M7 7l1-3h8l1 3" />
                  <path d="M9.5 11h5M9 15h6" />
                </svg>
              </div>
              <h2 className="admin-home__card-title">Etat des commandes</h2>
              <p className="admin-home__highlight">Consulter les commandes.</p>
              <p className="admin-home__card-text">
                Consulter/ Modifier/ Supprimer les commandes.
              </p>
              <div className="admin-home__inline">
                <span className="admin-home__cta">Ouvrir la gestion -&gt;</span>
                <button
                  type="button"
                  className="admin-home__pill-button admin-home__pill-button--ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRefreshHighValue();
                  }}
                >
                  High-value: {highValueCount.loading ? "..." : highValueCount.count}
                </button>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/stats"
            className="admin-home__card admin-home__card--primary"
            style={{ textDecoration: "none" }}
          >
            <div className="admin-home__stack">
              <div className="admin-home__icon admin-home__icon--stats">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 19h16" />
                  <path d="M7 16V9" />
                  <path d="M12 16V6" />
                  <path d="M17 16v-4" />
                </svg>
              </div>
              <h2 className="admin-home__card-title">Statistiques</h2>
              <p className="admin-home__highlight">Ventes & top parfums</p>
              <p className="admin-home__card-text">
                Tableau de bord interactif avec les tendances de vente.
              </p>
              <span className="admin-home__cta">Voir les stats -&gt;</span>
            </div>
          </Link>

          <Link
            to="/admin/aggregates"
            className="admin-home__card"
            style={{ textDecoration: "none" }}
          >
            <div className="admin-home__stack">
              <div className="admin-home__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 6h16" />
                  <path d="M7 12h10" />
                  <path d="M10 18h4" />
                </svg>
              </div>
              <h2 className="admin-home__card-title">Aggregates</h2>
              <p className="admin-home__highlight">Regroupements clients</p>
              <p className="admin-home__card-text">
                Voir les lots d'events (3 commandes par client).
              </p>
              <span className="admin-home__cta">Voir les aggregates -&gt;</span>
            </div>
          </Link>

        </section>

        <section className="admin-home__grid admin-home__grid--wide">
          <div className="admin-home__panel">
            <div className="admin-home__panel-head">
              <div>
                <p className="admin-home__panel-label">Dead letters</p>
                <h3 className="admin-home__panel-title">Messages filtrés/rejetés</h3>
              </div>
              <div className="admin-home__panel-actions">
                <button
                  type="button"
                  className="admin-home__pill-button admin-home__pill-button--ghost"
                  onClick={handleFetchDeadLetters}
                  disabled={deadLetters.loading}
                >
                  {deadLetters.loading ? "Chargement..." : "Rafraichir"}
                </button>
                <button
                  type="button"
                  className="admin-home__pill-button admin-home__pill-button--ghost"
                  onClick={handleClearDeadLetters}
                  disabled={deadLetters.loading}
                >
                  Supprimer
                </button>
              </div>
            </div>
            {deadLetters.error && (
              <div className="admin-home__panel-alert">Erreur: {deadLetters.error}</div>
            )}
            {deadLetters.items.length === 0 && !deadLetters.loading && (
              <div className="admin-home__panel-empty">Aucun message pour le moment.</div>
            )}
            <div className="admin-home__panel-list">
              {deadLetters.items.slice(0, 6).map((d, idx) => (
                <div key={`${d?.type ?? "Unknown"}-${idx}`} className="admin-home__panel-item">
                  <div className="admin-home__panel-item-title">{d?.type ?? "Unknown"}</div>
                  <div className="admin-home__panel-item-meta">{d?.reason ?? "—"}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-home__panel">
            <div className="admin-home__panel-head">
              <div>
                <p className="admin-home__panel-label">Flux commandes</p>
                <h3 className="admin-home__panel-title">Notifications temps réel</h3>
              </div>
              <div className="admin-home__panel-badge">
                {orderNotifs.items.length} events
              </div>
            </div>
            {orderNotifs.error && (
              <div className="admin-home__panel-alert">Erreur: {orderNotifs.error}</div>
            )}
            {orderNotifs.items.length === 0 && !orderNotifs.loading && (
              <div className="admin-home__panel-empty">Aucune notification.</div>
            )}
            <div className="admin-home__panel-list">
              {orderNotifs.items.slice(0, 6).map((n, idx) => (
                <div key={`${n?.orderId ?? "order"}-${idx}`} className="admin-home__panel-item">
                  <div className="admin-home__panel-item-title">
                    Commande #{n?.orderId ?? "—"}
                  </div>
                  <div className="admin-home__panel-item-meta">
                    {n?.customerEmail ?? "Client inconnu"} · {n?.status ?? "—"}
                  </div>
                  {n?.orderId != null && (
                    <Link
                      className="admin-home__panel-link"
                      to={`/admin/orders?q=${encodeURIComponent(n.orderId)}`}
                    >
                      Voir commande
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
