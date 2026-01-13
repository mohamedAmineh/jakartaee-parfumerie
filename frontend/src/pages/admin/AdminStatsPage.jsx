import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllOrders } from "../../application/useCases/ordersAdmin";

const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const formatEur = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0 €";
  return `${n.toLocaleString("fr-FR")} €`;
};

const toDayKey = (date) => date.toISOString().slice(0, 10);

function computeOrderTotal(order) {
  const direct = order?.totalPrice ?? order?.total;
  if (direct != null && direct !== "") return Number(direct);

  const items = Array.isArray(order?.items) ? order.items : [];
  const sum = items.reduce((acc, item) => {
    const qty = Number(item?.quantity ?? 0);
    const unit = Number(item?.unitPrice ?? item?.price ?? 0);
    return acc + qty * unit;
  }, 0);

  return Number.isFinite(sum) ? sum : 0;
}

function extractOrderDate(order) {
  const raw = order?.orderDate ?? order?.createdAt ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export default function AdminStatsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];

    let totalRevenue = 0;
    const perfumeMap = new Map();

    list.forEach((order) => {
      const items = Array.isArray(order?.items) ? order.items : [];
      const orderTotal = computeOrderTotal(order);
      totalRevenue += Number(orderTotal || 0);

      items.forEach((item) => {
        const perfume = item?.perfume || {};
        const id = perfume.id ?? item?.perfumeId ?? item?.id;
        if (!id) return;

        const qty = Number(item?.quantity ?? 0);
        const unit = Number(item?.unitPrice ?? item?.price ?? 0);
        const revenue = qty * unit;

        const current = perfumeMap.get(id) || {
          id,
          name: perfume.name || item?.name || "Parfum",
          brand: perfume.brand || item?.brand || "Marque",
          qty: 0,
          revenue: 0,
        };

        current.qty += qty;
        current.revenue += revenue;
        perfumeMap.set(id, current);
      });
    });

    const topPerfumes = Array.from(perfumeMap.values()).sort((a, b) => b.qty - a.qty);

    const totalOrders = list.length;
    const average = totalOrders ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, average, topPerfumes };
  }, [orders]);

  useEffect(() => {
    if (!selected && stats.topPerfumes.length) setSelected(stats.topPerfumes[0]);
    if (selected && stats.topPerfumes.length) {
      const stillThere = stats.topPerfumes.find((p) => p.id === selected.id);
      setSelected(stillThere || stats.topPerfumes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.topPerfumes]);

  const daily = useMemo(() => {
    const now = new Date();
    const days = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      days.push({ key: toDayKey(date), label: dayLabels[date.getDay()], revenue: 0 });
    }

    const byKey = new Map(days.map((d) => [d.key, d]));

    orders.forEach((order) => {
      const d = extractOrderDate(order);
      if (!d) return;

      const key = toDayKey(d);
      const day = byKey.get(key);
      if (!day) return;

      day.revenue += Number(computeOrderTotal(order) || 0);
    });

    return days;
  }, [orders]);

  const maxRevenue = useMemo(() => Math.max(0, ...daily.map((o) => o.revenue)), [daily]);

  const kpis = useMemo(
    () => [
      { label: "Chiffre d'affaires", value: formatEur(stats.totalRevenue), delta: "7 jours", tone: "up" },
      { label: "Commandes", value: String(stats.totalOrders), delta: "7 jours", tone: "up" },
      { label: "Panier moyen", value: formatEur(stats.average), delta: "7 jours", tone: "up" },
      { label: "Top parfums", value: String(stats.topPerfumes.length), delta: "Produits vendus", tone: "up" },
    ],
    [stats]
  );

  return (
    <div className="admin-stats">
      <style>{css}</style>

      <div className="admin-stats__wrap">
        <header className="admin-stats__header">
          <div>
            <p className="admin-stats__eyebrow">Espace admin</p>
            <h1 className="admin-stats__title">Statistiques et ventes</h1>
            <p className="admin-stats__subtitle">
              KPIs + revenus des 7 derniers jours + top parfums (basé sur les orders).
            </p>
          </div>

          <div className="admin-stats__actions">
            <Link to="/admin" className="admin-stats__link">
              Retour au dashboard
            </Link>
            <button type="button" className="admin-stats__btn" onClick={refresh} disabled={loading}>
              {loading ? "Chargement..." : "Rafraîchir"}
            </button>
          </div>
        </header>

        {error && <div className="admin-stats__alert">Erreur: {error}</div>}

        <section className="admin-stats__kpis">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="admin-stats__kpi">
              <p className="admin-stats__kpi-label">{kpi.label}</p>
              <p className="admin-stats__kpi-value">{kpi.value}</p>
              <span className={`admin-stats__kpi-delta admin-stats__kpi-delta--${kpi.tone}`}>
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
                <div key={item.key} className="admin-stats__bar">
                  <strong>{item.label}</strong>
                  <div className="admin-stats__bar-track">
                    <div
                      className="admin-stats__bar-fill"
                      style={{ width: `${maxRevenue ? (item.revenue / maxRevenue) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="admin-stats__badge">{formatEur(item.revenue)}</span>
                </div>
              ))}
            </div>

            {loading && <p className="admin-stats__muted">Chargement des stats...</p>}
          </div>

          <div className="admin-stats__panel">
            <h3>Parfums les plus vendus</h3>

            {stats.topPerfumes.length === 0 ? (
              <p className="admin-stats__muted">Aucune vente pour le moment.</p>
            ) : (
              <div className="admin-stats__table">
                {stats.topPerfumes.slice(0, 12).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`admin-stats__row ${selected?.id === p.id ? "admin-stats__row--active" : ""}`}
                    onClick={() => setSelected(p)}
                  >
                    <span>
                      <strong>{p.name}</strong>
                      <div className="admin-stats__muted" style={{ fontSize: 12 }}>
                        {p.brand}
                      </div>
                    </span>
                    <span className="admin-stats__badge">{p.qty} u.</span>
                    <span className="admin-stats__badge">{formatEur(p.revenue)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="admin-stats__panel">
          <div className="admin-stats__spotlight">
            <h3>Focus produit</h3>

            {selected ? (
              <>
                <h4>{selected.name}</h4>
                <p className="admin-stats__muted" style={{ margin: 0 }}>
                  {selected.brand}
                </p>

                <div className="admin-stats__metrics">
                  <span>Ventes: {selected.qty} unités</span>
                  <span>CA: {formatEur(selected.revenue)}</span>
                </div>

                <p className="admin-stats__muted" style={{ margin: 0 }}>
                  Sélectionne un parfum pour changer le focus.
                </p>
              </>
            ) : (
              <p className="admin-stats__muted">Sélectionne un parfum pour afficher le détail.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600;700&display=swap');

.admin-stats{
  --cream:#fff6ef;
  --peach:#ffd7c2;
  --apricot:#ffb088;
  --coral:#ff6b6b;
  --ink:#1c1916;
  --muted:#6f655c;
  --glass: rgba(255, 255, 255, 0.88);

  min-height: 100vh;
  padding: 54px 20px 80px;
  background:
    radial-gradient(circle at 12% 12%, rgba(255,177,136,0.35), transparent 45%),
    radial-gradient(circle at 88% 18%, rgba(255,107,107,0.20), transparent 50%),
    radial-gradient(circle at 50% 80%, rgba(255,215,194,0.60), transparent 55%),
    #fffaf6;
  position: relative;
  overflow: hidden;
  font-family: "Manrope", "Segoe UI", sans-serif;
  color: var(--ink);
}

.admin-stats::before,
.admin-stats::after{
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
.admin-stats::before{ background: rgba(255,176,136,0.6); top:-90px; right:8%; }
.admin-stats::after{ background: rgba(255,215,194,0.8); bottom:-120px; left:6%; animation-delay:2s; }

.admin-stats__wrap{
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  gap: 22px;
}

.admin-stats__header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  flex-wrap:wrap;
}

.admin-stats__eyebrow{
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  margin: 0 0 6px;
}

.admin-stats__title{
  font-family: "Fraunces", "Times New Roman", serif;
  font-size: clamp(30px, 4vw, 42px);
  margin: 0 0 8px;
}

.admin-stats__subtitle{
  margin: 0;
  color: var(--muted);
  font-weight: 600;
  max-width: 560px;
}

.admin-stats__actions{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
}

.admin-stats__link{
  padding:10px 16px;
  border-radius:999px;
  border: 1px solid rgba(255,107,107,0.40);
  color: #b33a2b;
  text-decoration:none;
  font-weight: 800;
  background: rgba(255,255,255,0.9);
}

.admin-stats__btn{
  padding:10px 16px;
  border-radius:999px;
  border:none;
  background: linear-gradient(120deg, #ff6b6b, #ffb088);
  color:#1c1916;
  font-weight: 800;
  font-size: 14px;
  box-shadow: 0 12px 24px rgba(255,107,107,0.25);
  cursor:pointer;
  transition: transform .2s ease, box-shadow .2s ease;
}

.admin-stats__btn:hover{
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(255,107,107,0.30);
}

.admin-stats__btn:disabled{
  opacity:.6;
  cursor:not-allowed;
  box-shadow:none;
}

.admin-stats__alert{
  padding:12px 14px;
  border-radius:14px;
  background: rgba(255,107,107,0.12);
  border: 1px solid rgba(255,107,107,0.25);
  color:#b33a2b;
  font-weight: 800;
}

.admin-stats__kpis{
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.admin-stats__kpi{
  background: var(--glass);
  border-radius: 18px;
  padding: 18px;
  border: 1px solid rgba(255,176,136,0.22);
  box-shadow: 0 16px 36px rgba(25,15,10,0.10);
  animation: fadeUp .6s ease;
}

.admin-stats__kpi-label{
  color: var(--muted);
  font-weight: 700;
  margin: 0 0 8px;
  font-size: 13px;
}

.admin-stats__kpi-value{
  font-size: 24px;
  font-weight: 900;
  margin: 0 0 10px;
}

.admin-stats__kpi-delta{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
}

.admin-stats__kpi-delta--up{
  background: rgba(68, 200, 161, 0.18);
  color: #0d6b43;
}

.admin-stats__kpi-delta--down{
  background: rgba(255, 107, 107, 0.16);
  color: #b33a2b;
}

.admin-stats__layout{
  display:grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.9fr);
  gap: 18px;
}

@media (max-width: 900px){
  .admin-stats__layout{ grid-template-columns: 1fr; }
}

.admin-stats__panel{
  background: rgba(255,255,255,0.92);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(255,176,136,0.22);
  box-shadow: 0 18px 40px rgba(25,15,10,0.10);
  animation: fadeUp .7s ease;
}

.admin-stats__panel h3{
  margin: 0 0 14px;
  font-size: 20px;
  font-family: "Fraunces", "Times New Roman", serif;
}

.admin-stats__bars{
  display:grid;
  gap: 12px;
}

.admin-stats__bar{
  display:grid;
  grid-template-columns: 40px 1fr auto;
  align-items:center;
  gap: 12px;
}

.admin-stats__bar-track{
  height: 10px;
  border-radius: 999px;
  background: rgba(28,25,22,0.08);
  overflow:hidden;
}

.admin-stats__bar-fill{
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(120deg, #ff6b6b, #ffb088);
  animation: grow .8s ease;
}

.admin-stats__badge{
  display:inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 176, 136, 0.20);
  font-weight: 900;
  font-size: 12px;
  color: #7a3d2c;
  white-space: nowrap;
}

.admin-stats__table{
  display:grid;
  gap: 10px;
}

.admin-stats__row{
  width:100%;
  text-align:left;
  display:grid;
  grid-template-columns: 1.2fr 0.5fr 0.6fr;
  gap: 10px;
  align-items:center;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,176,136,0.22);
  background: rgba(255,255,255,0.70);
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease, border .15s ease;
}

.admin-stats__row:hover{
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(25,15,10,0.08);
}

.admin-stats__row--active{
  border: 2px solid rgba(255,107,107,0.35);
  box-shadow: 0 12px 24px rgba(255,107,107,0.14);
}

.admin-stats__muted{
  color: var(--muted);
  font-weight: 700;
}

.admin-stats__spotlight{
  display:grid;
  gap: 10px;
}

.admin-stats__spotlight h4{
  margin: 0;
  font-size: 20px;
}

.admin-stats__metrics{
  display:flex;
  gap: 10px;
  flex-wrap:wrap;
}

.admin-stats__metrics span{
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,107,107,0.10);
  font-weight: 900;
  font-size: 12px;
  color: #b33a2b;
}

@keyframes float{
  0%,100%{ transform: translateY(0px); }
  50%{ transform: translateY(14px); }
}
@keyframes fadeUp{
  from{ opacity:0; transform: translateY(18px); }
  to{ opacity:1; transform: translateY(0); }
}
@keyframes grow{
  from{ width:0; }
  to{ width:100%; }
}
`;
