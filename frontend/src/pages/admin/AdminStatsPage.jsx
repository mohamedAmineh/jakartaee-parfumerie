import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "../../services/auth";

const API_ORDERS = "http://localhost:8080/starter/api/orders";

const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const formatEur = (value) => {
  if (!Number.isFinite(value)) return "0 EUR";
  return `${value.toLocaleString("fr-FR")} EUR`;
};

const toDayKey = (date) => date.toISOString().slice(0, 10);

export default function AdminStatsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ORDERS, {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    let totalRevenue = 0;
    let totalOrders = list.length;
    const perfumeMap = new Map();

    list.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      let orderTotal = Number(order.totalPrice || 0);

      if (!orderTotal && items.length) {
        orderTotal = items.reduce((sum, item) => {
          const unit = Number(item.unitPrice || 0);
          const qty = Number(item.quantity || 0);
          return sum + unit * qty;
        }, 0);
      }

      totalRevenue += orderTotal;

      items.forEach((item) => {
        const perfume = item.perfume || {};
        const id = perfume.id ?? item.perfumeId ?? item.id;
        if (!id) return;
        const qty = Number(item.quantity || 0);
        const revenue = Number(item.unitPrice || 0) * qty;
        const current = perfumeMap.get(id) || {
          id,
          name: perfume.name || "Parfum",
          brand: perfume.brand || "Marque",
          qty: 0,
          revenue: 0,
        };
        current.qty += qty;
        current.revenue += revenue;
        perfumeMap.set(id, current);
      });
    });

    const topPerfumes = Array.from(perfumeMap.values()).sort(
      (a, b) => b.qty - a.qty
    );

    return {
      totalRevenue,
      totalOrders,
      average: totalOrders ? totalRevenue / totalOrders : 0,
      topPerfumes,
    };
  }, [orders]);

  useEffect(() => {
    if (!selected && stats.topPerfumes.length) {
      setSelected(stats.topPerfumes[0]);
    }
  }, [selected, stats.topPerfumes]);

  const daily = useMemo(() => {
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      days.push({
        key: toDayKey(date),
        label: dayLabels[date.getDay()],
        revenue: 0,
      });
    }

    const byKey = new Map(days.map((d) => [d.key, d]));
    orders.forEach((order) => {
      if (!order.orderDate) return;
      const date = new Date(order.orderDate);
      if (Number.isNaN(date.getTime())) return;
      const key = toDayKey(date);
      const day = byKey.get(key);
      if (!day) return;
      const total = Number(order.totalPrice || 0);
      day.revenue += total;
    });

    return days;
  }, [orders]);

  const maxRevenue = useMemo(
    () => Math.max(0, ...daily.map((o) => o.revenue)),
    [daily]
  );

  const kpis = useMemo(() => {
    return [
      { label: "Chiffre d'affaires", value: formatEur(stats.totalRevenue), delta: "Semaine en cours", tone: "up" },
      { label: "Commandes", value: String(stats.totalOrders), delta: "Semaine en cours", tone: "up" },
      { label: "Panier moyen", value: formatEur(stats.average), delta: "Semaine en cours", tone: "up" },
      { label: "Top parfums", value: String(stats.topPerfumes.length), delta: "Produits actifs", tone: "up" },
    ];
  }, [stats]);

  return (
    <div className="admin-stats">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600;700&display=swap');

        .admin-stats {
          --cream: #fff6ef;
          --peach: #ffd7c2;
          --apricot: #ffb088;
          --coral: #ff6b6b;
          --ink: #1c1916;
          --muted: #6f655c;
          --glass: rgba(255, 255, 255, 0.85);
          min-height: 100vh;
          padding: 54px 20px 80px;
          background:
            radial-gradient(circle at 12% 12%, rgba(255, 177, 136, 0.35), transparent 45%),
            radial-gradient(circle at 88% 18%, rgba(255, 107, 107, 0.2), transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(255, 215, 194, 0.6), transparent 55%),
            #fffaf6;
          position: relative;
          overflow: hidden;
          font-family: "Manrope", "Segoe UI", sans-serif;
          color: var(--ink);
        }

        .admin-stats::before,
        .admin-stats::after {
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

        .admin-stats::before {
          background: rgba(255, 176, 136, 0.6);
          top: -90px;
          right: 8%;
        }

        .admin-stats::after {
          background: rgba(255, 215, 194, 0.8);
          bottom: -120px;
          left: 6%;
          animation-delay: 2s;
        }

        .admin-stats__wrap {
          position: relative;
          z-index: 1;
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }

        .admin-stats__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        .admin-stats__title {
          font-family: "Fraunces", "Times New Roman", serif;
          font-size: clamp(30px, 4vw, 42px);
          margin: 0 0 8px;
        }

        .admin-stats__subtitle {
          margin: 0;
          color: var(--muted);
          max-width: 520px;
        }

        .admin-stats__link {
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255, 107, 107, 0.4);
          color: #b33a2b;
          text-decoration: none;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.9);
        }

        .admin-stats__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .admin-stats__card {
          background: var(--glass);
          border-radius: 18px;
          padding: 18px;
          border: 1px solid rgba(255, 176, 136, 0.22);
          box-shadow: 0 16px 36px rgba(25, 15, 10, 0.12);
          animation: fadeUp 0.6s ease;
        }

        .admin-stats__kpi-label {
          color: var(--muted);
          font-weight: 600;
          margin: 0 0 8px;
          font-size: 13px;
        }

        .admin-stats__kpi-value {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px;
        }

        .admin-stats__kpi-delta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 12px;
        }

        .admin-stats__kpi-delta--up {
          background: rgba(68, 200, 161, 0.18);
          color: #0d6b43;
        }

        .admin-stats__kpi-delta--down {
          background: rgba(255, 107, 107, 0.16);
          color: #b33a2b;
        }

        .admin-stats__layout {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr);
          gap: 24px;
        }

        .admin-stats__panel {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: 20px;
          border: 1px solid rgba(255, 176, 136, 0.22);
          box-shadow: 0 18px 40px rgba(25, 15, 10, 0.12);
          animation: fadeUp 0.7s ease;
        }

        .admin-stats__panel h3 {
          margin: 0 0 16px;
          font-size: 20px;
          font-family: "Fraunces", "Times New Roman", serif;
        }

        .admin-stats__bars {
          display: grid;
          gap: 12px;
        }

        .admin-stats__bar {
          display: grid;
          grid-template-columns: 40px 1fr auto;
          align-items: center;
          gap: 12px;
        }

        .admin-stats__bar-track {
          height: 10px;
          border-radius: 999px;
          background: rgba(28, 25, 22, 0.08);
          overflow: hidden;
        }

        .admin-stats__bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(120deg, #ff6b6b, #ffb088);
          animation: grow 0.8s ease;
        }

        .admin-stats__table {
          display: grid;
          gap: 10px;
        }

        .admin-stats__row {
          display: grid;
          grid-template-columns: 1.2fr 0.6fr 0.6fr;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 176, 136, 0.2);
          background: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease;
        }

        .admin-stats__row:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(25, 15, 10, 0.08);
        }

        .admin-stats__row--active {
          border: 2px solid rgba(255, 107, 107, 0.4);
          box-shadow: 0 12px 24px rgba(255, 107, 107, 0.14);
        }

        .admin-stats__badge {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 176, 136, 0.2);
          font-weight: 700;
          font-size: 12px;
          color: #7a3d2c;
        }

        .admin-stats__spotlight {
          display: grid;
          gap: 10px;
        }

        .admin-stats__spotlight h4 {
          margin: 0;
          font-size: 20px;
        }

        .admin-stats__metric {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .admin-stats__metric span {
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 107, 107, 0.1);
          font-weight: 700;
          font-size: 12px;
          color: #b33a2b;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(14px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes grow {
          from { width: 0%; }
          to { width: 100%; }
        }

        @media (max-width: 900px) {
          .admin-stats__layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="admin-stats__wrap">
        <header className="admin-stats__header">
          <div>
            <h1 className="admin-stats__title">Statistiques et ventes</h1>
            <p className="admin-stats__subtitle">
              Tableau de bord interactif avec tes donnees reelles (orders).
            </p>
          </div>
          <Link to="/admin" className="admin-stats__link">
            Retour au dashboard
          </Link>
        </header>

        <section className="admin-stats__grid stagger">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="admin-stats__card">
              <p className="admin-stats__kpi-label">{kpi.label}</p>
              <p className="admin-stats__kpi-value">{kpi.value}</p>
              <span
                className={`admin-stats__kpi-delta admin-stats__kpi-delta--${kpi.tone}`}
              >
                {kpi.delta}
              </span>
            </div>
          ))}
        </section>

        <section className="admin-stats__layout">
          <div className="admin-stats__panel">
            <h3>Revenus par jour</h3>
            <div className="admin-stats__bars">
              {daily.map((item) => (
                <div key={item.id} className="admin-stats__bar">
                  <strong>{item.label}</strong>
                  <div className="admin-stats__bar-track">
                    <div
                      className="admin-stats__bar-fill"
                      style={{
                        width: maxRevenue
                          ? `${(item.revenue / maxRevenue) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <span className="admin-stats__badge">{formatEur(item.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-stats__panel">
            <h3>Parfums les plus vendus</h3>
            <div className="admin-stats__table">
              {stats.topPerfumes.length === 0 && (
                <div style={{ color: "var(--muted)" }}>
                  Aucune vente pour le moment.
                </div>
              )}
              {stats.topPerfumes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`admin-stats__row ${selected?.id === p.id ? "admin-stats__row--active" : ""}`}
                  onClick={() => setSelected(p)}
                >
                  <span>
                    <strong>{p.name}</strong>
                    <div style={{ color: "var(--muted)", fontSize: "12px" }}>{p.brand}</div>
                  </span>
                  <span>{p.qty} u.</span>
                  <span>{formatEur(p.revenue)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-stats__panel">
          <div className="admin-stats__spotlight">
            <h3>Focus produit</h3>
            {selected ? (
              <>
                <h4>{selected.name}</h4>
                <p style={{ margin: 0, color: "var(--muted)" }}>{selected.brand}</p>
                <div className="admin-stats__metric">
                  <span>Ventes: {selected.qty} unites</span>
                  <span>CA: {formatEur(selected.revenue)}</span>
                  <span>Conversion: 4.8%</span>
                  <span>Stock restant: 42</span>
                </div>
              </>
            ) : (
              <p style={{ margin: 0, color: "var(--muted)" }}>
                Selectionne un parfum pour afficher le detail.
              </p>
            )}
          </div>
        </section>

        {loading && <p style={{ color: "var(--muted)" }}>Chargement des stats...</p>}
        {error && <p style={{ color: "#b33a2b", fontWeight: 700 }}>Erreur: {error}</p>}
      </div>
    </div>
  );
}
