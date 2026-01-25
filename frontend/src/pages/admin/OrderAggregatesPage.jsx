// Admin view of order aggregates by customer.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrderAggregates } from "../../application/useCases/aggregates";

const formatEur = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString("fr-FR")} EUR`;
};

export default function OrderAggregatesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchOrderAggregates();
      setData(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-aggregates">
      <style>{css}</style>

      <div className="admin-aggregates__wrap">
        <header className="admin-aggregates__header">
          <div>
            <p className="admin-aggregates__eyebrow">Espace admin</p>
            <h1 className="admin-aggregates__title">Aggregates commandes</h1>
            <p className="admin-aggregates__subtitle">
              Regroupements d'events par client (batch de 3 commandes).
            </p>
          </div>
          <div className="admin-aggregates__actions">
            <Link to="/admin" className="admin-aggregates__ghost">
              Retour
            </Link>
            <button
              type="button"
              className="admin-aggregates__btn"
              onClick={refresh}
              disabled={loading}
            >
              {loading ? "Chargement..." : "Rafraichir"}
            </button>
          </div>
        </header>

        {error && <div className="admin-aggregates__alert">Erreur: {error}</div>}

        <div className="admin-aggregates__card">
          {loading && <div className="admin-aggregates__empty">Chargement...</div>}
          {!loading && data.length === 0 && (
            <div className="admin-aggregates__empty">Aucun aggregate pour le moment.</div>
          )}

          <div className="admin-aggregates__list">
            {!loading &&
              data.map((agg, idx) => {
                const email = agg.customerEmail ?? "unknown";
                return (
                  <div className="admin-aggregates__row" key={`${email}-${idx}`}>
                    <div>
                      <div className="admin-aggregates__row-title">
                        {agg.customerEmail ?? "Client inconnu"}
                      </div>
                      <div className="admin-aggregates__row-meta">
                        Dernier event: {agg.lastCreatedAt ?? "—"}
                      </div>
                    </div>
                    <div className="admin-aggregates__row-right">
                      <div className="admin-aggregates__pill">x{agg.count ?? 0}</div>
                      <div className="admin-aggregates__total">{formatEur(agg.total)}</div>
                      <Link
                        to={`/admin/orders?q=${encodeURIComponent(email)}`}
                        className="admin-aggregates__link"
                      >
                        Voir commandes
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
@import url('https:

.admin-aggregates{
  --cream:#fff6ef;
  --peach:#ffd7c2;
  --apricot:#ffb088;
  --coral:#ff6b6b;
  --ink:#1c1916;
  --muted:#6f655c;
  --glass: rgba(255,255,255,0.88);

  min-height:100vh;
  padding:56px 20px 80px;
  background:
    radial-gradient(circle at 12% 12%, rgba(255,177,136,0.35), transparent 45%),
    radial-gradient(circle at 88% 18%, rgba(255,107,107,0.20), transparent 50%),
    radial-gradient(circle at 50% 80%, rgba(255,215,194,0.60), transparent 55%),
    #fffaf6;
  position:relative;
  overflow:hidden;
  font-family:"Manrope","Segoe UI",sans-serif;
  color:var(--ink);
}

.admin-aggregates::before,
.admin-aggregates::after{
  content:"";
  position:absolute;
  width:260px;
  height:260px;
  border-radius:999px;
  filter: blur(10px);
  opacity:0.45;
  animation: float 10s ease-in-out infinite;
  z-index:0;
}

.admin-aggregates::before{
  background: rgba(255,176,136,0.6);
  top:-90px;
  right:10%;
}

.admin-aggregates::after{
  background: rgba(255,215,194,0.8);
  bottom:-120px;
  left:6%;
  animation-delay:2s;
}

.admin-aggregates__wrap{
  position:relative;
  z-index:1;
  max-width:1100px;
  margin:0 auto;
}

.admin-aggregates__header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  flex-wrap:wrap;
  margin-bottom:18px;
}

.admin-aggregates__eyebrow{
  text-transform:uppercase;
  letter-spacing:0.18em;
  font-size:12px;
  font-weight:700;
  color:var(--muted);
  margin:0 0 6px;
}

.admin-aggregates__title{
  font-family:"Fraunces","Times New Roman",serif;
  font-size: clamp(30px, 4vw, 42px);
  margin:0 0 8px;
}

.admin-aggregates__subtitle{
  margin:0;
  color:var(--muted);
  font-weight:600;
}

.admin-aggregates__actions{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
}

.admin-aggregates__btn{
  padding:10px 16px;
  border-radius:999px;
  border:none;
  background: linear-gradient(120deg, #ff6b6b, #ffb088);
  color:#1c1916;
  font-weight:800;
  font-size:14px;
  box-shadow:0 12px 24px rgba(255,107,107,0.25);
  cursor:pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.admin-aggregates__btn:hover{
  transform: translateY(-1px);
  box-shadow:0 14px 28px rgba(255,107,107,0.30);
}

.admin-aggregates__btn:disabled{
  opacity:0.6;
  cursor:not-allowed;
  box-shadow:none;
}

.admin-aggregates__ghost{
  padding:10px 16px;
  border-radius:999px;
  border:1px solid rgba(255,107,107,0.40);
  background: rgba(255,255,255,0.9);
  color:#b33a2b;
  text-decoration:none;
  font-weight:800;
}

.admin-aggregates__alert{
  margin:12px 0 14px;
  padding:12px 14px;
  border-radius:14px;
  background: rgba(255,107,107,0.12);
  border: 1px solid rgba(255,107,107,0.25);
  color:#b33a2b;
  font-weight:800;
}

.admin-aggregates__card{
  background: var(--glass);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255,176,136,0.22);
  box-shadow: 0 16px 36px rgba(25,15,10,0.10);
}

.admin-aggregates__list{
  display:grid;
  gap:12px;
}

.admin-aggregates__row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  padding:14px;
  border-radius:16px;
  border:1px solid rgba(28,25,22,0.08);
  background: rgba(255,255,255,0.75);
}

.admin-aggregates__row-title{
  font-weight:900;
  color:var(--ink);
}

.admin-aggregates__row-meta{
  color:var(--muted);
  font-weight:700;
  font-size:13px;
  margin-top:6px;
}

.admin-aggregates__row-right{
  text-align:right;
  display:flex;
  align-items:center;
  gap:10px;
}

.admin-aggregates__link{
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 107, 107, 0.35);
  background: rgba(255, 255, 255, 0.9);
  color: #b33a2b;
  text-decoration: none;
  font-weight: 700;
  font-size: 12px;
  white-space: nowrap;
}

.admin-aggregates__pill{
  padding:6px 10px;
  border-radius:999px;
  border:1px solid rgba(255,107,107,0.30);
  background: rgba(255,107,107,0.10);
  color:#b33a2b;
  font-weight:900;
  font-size:12px;
}

.admin-aggregates__total{
  font-weight:900;
  font-size:16px;
  color:var(--ink);
  min-width:96px;
}

.admin-aggregates__empty{
  padding:10px 6px;
  color:var(--muted);
  font-weight:800;
}

@keyframes float{
  0%,100%{ transform: translateY(0px); }
  50%{ transform: translateY(14px); }
}
`;
