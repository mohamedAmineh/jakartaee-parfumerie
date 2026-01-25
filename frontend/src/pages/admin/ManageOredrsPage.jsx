// Admin order management list and detail view.

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchAllOrders, fetchHighValueOrderIds, updateOrderStatus } from "../../application/useCases/ordersAdmin";

const HIGH_VALUE_THRESHOLD = 500;

const STATUS_OPTIONS = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const formatEur = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString("fr-FR")} €`;
};

function computeOrderTotal(order) {
  const total = order?.totalPrice ?? order?.total;
  if (total != null && total !== "") return Number(total);

  const items = Array.isArray(order?.items) ? order.items : [];
  const sum = items.reduce((acc, it) => {
    const qty = Number(it?.quantity ?? 0);
    const unit = Number(it?.unitPrice ?? it?.price ?? 0);
    return acc + qty * unit;
  }, 0);

  return Number.isFinite(sum) ? sum : null;
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function matchesQuery(value, query) {
  if (!query) return true;
  const raw = String(value ?? "").toLowerCase();
  const qRaw = String(query ?? "").toLowerCase().trim();
  if (raw.includes(qRaw)) return true;
  return normalizeText(value).includes(normalizeText(query));
}

function isHighValueOrder(order, highValueIds) {
  if (!order) return false;
  const total = computeOrderTotal(order);
  return highValueIds.has(order.id) || (total != null && Number(total) >= HIGH_VALUE_THRESHOLD);
}

export default function ManageOredrsPage() {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState("");
  const [showHighOnly, setShowHighOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const [highValueIds, setHighValueIds] = useState(new Set());

  useEffect(() => {
    refresh();
    
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q != null) {
      setFilter(q);
    }
  }, [location.search]);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      const [orders, hvIds] = await Promise.all([fetchAllOrders(), fetchHighValueOrderIds()]);
      setData(orders);
      setHighValueIds(hvIds);
    } catch (err) {
      setError(err?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveStatus() {
    if (!selected) return;
    setLoading(true);
    setError(null);

    try {
      const updated = await updateOrderStatus(selected.id, selected.status ?? "PENDING");
      setData((prev) => prev.map((o) => (o.id === selected.id ? updated : o)));
      setSelected(updated);
    } catch (err) {
      setError(err?.message || "Erreur lors de la mise a jour.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return data.filter((o) => {
      if (showHighOnly && !isHighValueOrder(o, highValueIds)) return false;
      if (!filter) return true;

      const email = o.user?.email ?? o.userEmail ?? o.customerEmail ?? o.email;
      const firstName = o.user?.firstName;
      const lastName = o.user?.lastName;
      const total = computeOrderTotal(o);

      return (
        matchesQuery(o.id, filter) ||
        matchesQuery(email, filter) ||
        matchesQuery(o.status, filter) ||
        matchesQuery(total, filter) ||
        matchesQuery(firstName, filter) ||
        matchesQuery(lastName, filter)
      );
    });
  }, [data, filter, showHighOnly, highValueIds]);

  const highValueCount = useMemo(
    () => data.filter((o) => isHighValueOrder(o, highValueIds)).length,
    [data, highValueIds]
  );

  useEffect(() => {
    if (!selected) return;
    const stillThere = data.find((o) => o.id === selected.id);
    setSelected(stillThere || null);
  }, [data]); 

  const selectedTotal = useMemo(() => computeOrderTotal(selected), [selected]);

  const selectedIsHighValue = useMemo(() => {
    if (!selected) return false;
    const byEndpoint = highValueIds.has(selected.id);
    const byThreshold = selectedTotal != null && Number(selectedTotal) >= HIGH_VALUE_THRESHOLD;
    return byEndpoint || byThreshold;
  }, [selected, highValueIds, selectedTotal]);

  return (
    <div className="admin-orders">
      <style>{css}</style>

      <div className="admin-orders__wrap">
        <header className="admin-orders__header">
          <div>
            <p className="admin-orders__eyebrow">Espace admin</p>
            <h1 className="admin-orders__title">Gestion des commandes</h1>
            <p className="admin-orders__subtitle">
              Liste + détails (comme la page catalogue). Badge rouge si “high value”.
            </p>
          </div>

          <div className="admin-orders__header-actions">
            <Link to="/admin" className="admin-orders__ghost">
              Retour
            </Link>
            <button type="button" className="admin-orders__btn" onClick={refresh} disabled={loading}>
              {loading ? "Chargement..." : "Rafraîchir"}
            </button>
            <button
              type="button"
              className={`admin-orders__btn admin-orders__btn--ghost admin-orders__btn--toggle ${
                showHighOnly ? "admin-orders__btn--active" : ""
              }`}
              onClick={() => setShowHighOnly((v) => !v)}
            >
              Voir high-value ({highValueCount})
            </button>
          </div>
        </header>

        {error && <div className="admin-orders__alert">Erreur: {error}</div>}

        <div className="admin-orders__grid">
          
          <div className="admin-orders__card">
            <input
              className="admin-orders__input"
              placeholder="Rechercher (id, email, statut)..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />

            {loading && <div className="admin-orders__empty">Chargement...</div>}
            {!loading && filtered.length === 0 && (
              <div className="admin-orders__empty">Aucune commande trouvée.</div>
            )}

            <div className="admin-orders__list">
              {!loading &&
                filtered.map((o) => {
                  const isActive = selected?.id === o.id;
                  const total = computeOrderTotal(o);
                  const isHigh =
                    highValueIds.has(o.id) || (total != null && Number(total) >= HIGH_VALUE_THRESHOLD);

                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setSelected(o)}
                      className={`admin-orders__row ${isActive ? "admin-orders__row--active" : ""}`}
                    >
                      <div className="admin-orders__row-top">
                        <span className="admin-orders__row-title">Commande #{o.id}</span>
                        <span className="admin-orders__row-meta">{o.status ?? "—"}</span>
                      </div>

                      <div className="admin-orders__row-bottom">
                        <span className="admin-orders__row-meta">
                          {o.user?.email ?? o.userEmail ?? "Client inconnu"}
                        </span>
                        <span className="admin-orders__row-meta">{formatEur(total)}</span>
                      </div>

                      {isHigh && <span className="admin-orders__badge-danger">HIGH VALUE</span>}
                    </button>
                  );
                })}
            </div>
          </div>

          
          <div className="admin-orders__card">
            {!selected ? (
              <div className="admin-orders__empty">Sélectionne une commande dans la liste.</div>
            ) : (
              <>
                <div className="admin-orders__details-head">
                  <div>
                    <h2 className="admin-orders__details-title">Commande #{selected.id}</h2>
                    <div className="admin-orders__details-sub">
                      <span className="admin-orders__badge">{selected.status ?? "PENDING"}</span>
                      <span className="admin-orders__muted">
                        Date: {selected.orderDate ?? selected.createdAt ?? "—"}
                      </span>
                      {selectedIsHighValue && (
                        <span className="admin-orders__badge-danger">HIGH VALUE</span>
                      )}
                    </div>
                  </div>

                  <div className="admin-orders__total">
                    <div className="admin-orders__total-label">Total</div>
                    <div className="admin-orders__total-value">{formatEur(selectedTotal)}</div>
                  </div>
                </div>

                <div className="admin-orders__kv-grid">
                  <div className="admin-orders__kv">
                    <div className="admin-orders__kv-label">Client</div>
                    <div className="admin-orders__kv-value">
                      {selected.user?.email ?? selected.userEmail ?? "—"}
                    </div>
                  </div>

                  <div className="admin-orders__kv">
                    <div className="admin-orders__kv-label">ID</div>
                    <div className="admin-orders__kv-value">{selected.id}</div>
                  </div>

                  <div className="admin-orders__kv">
                    <div className="admin-orders__kv-label">Articles</div>
                    <div className="admin-orders__kv-value">
                      {Array.isArray(selected.items) ? selected.items.length : 0}
                    </div>
                  </div>

                  <div className="admin-orders__kv">
                    <div className="admin-orders__kv-label">Adresse</div>
                    <div className="admin-orders__kv-value">{selected.shippingAddress ?? "—"}</div>
                  </div>

                  <div className="admin-orders__kv admin-orders__kv--full">
                    <div className="admin-orders__kv-label">Statut</div>
                    <div className="admin-orders__status-row">
                      <select
                        className="admin-orders__select"
                        value={selected.status ?? "PENDING"}
                        onChange={(e) =>
                          setSelected((s) => (s ? { ...s, status: e.target.value } : s))
                        }
                        disabled={loading}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="admin-orders__btn admin-orders__btn--ghost"
                        onClick={onSaveStatus}
                        disabled={loading}
                      >
                        {loading ? "..." : "Enregistrer"}
                      </button>
                    </div>
                  </div>
                </div>

                <h3 className="admin-orders__section-title">Articles</h3>

                {Array.isArray(selected.items) && selected.items.length > 0 ? (
                  <div className="admin-orders__items">
                    {selected.items.map((it, idx) => {
                      const qty = Number(it.quantity ?? 1);
                      const unit =
                        it.unitPrice != null ? Number(it.unitPrice) : it.price != null ? Number(it.price) : null;

                      const name = it.perfume?.name ?? it.name ?? "Parfum";

                      const sub = unit != null ? unit * qty : null;

                      return (
                        <div className="admin-orders__item" key={it.id ?? idx}>
                          <div className="admin-orders__item-top">
                            <div className="admin-orders__item-name">{name}</div>
                            <div className="admin-orders__item-chip">x{qty}</div>
                          </div>

                          <div className="admin-orders__item-row">
                            <span className="admin-orders__muted">Prix unitaire</span>
                            <span className="admin-orders__item-price">{formatEur(unit)}</span>
                          </div>

                          <div className="admin-orders__item-row">
                            <span className="admin-orders__muted">Sous-total</span>
                            <span className="admin-orders__item-price">{formatEur(sub)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="admin-orders__empty">Aucun article pour cette commande.</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600;700&display=swap');

.admin-orders{
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

.admin-orders::before,
.admin-orders::after{
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

.admin-orders::before{
  background: rgba(255,176,136,0.6);
  top:-90px;
  right:10%;
}

.admin-orders::after{
  background: rgba(255,215,194,0.8);
  bottom:-120px;
  left:6%;
  animation-delay:2s;
}

.admin-orders__wrap{
  position:relative;
  z-index:1;
  max-width:1200px;
  margin:0 auto;
}

.admin-orders__header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  flex-wrap:wrap;
  margin-bottom:18px;
}

.admin-orders__eyebrow{
  text-transform:uppercase;
  letter-spacing:0.18em;
  font-size:12px;
  font-weight:700;
  color:var(--muted);
  margin:0 0 6px;
}

.admin-orders__title{
  font-family:"Fraunces","Times New Roman",serif;
  font-size: clamp(30px, 4vw, 42px);
  margin:0 0 8px;
}

.admin-orders__subtitle{
  margin:0;
  color:var(--muted);
  font-weight:600;
}

.admin-orders__header-actions{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
}

.admin-orders__btn{
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

.admin-orders__btn:hover{
  transform: translateY(-1px);
  box-shadow:0 14px 28px rgba(255,107,107,0.30);
}

.admin-orders__btn:disabled{
  opacity:0.6;
  cursor:not-allowed;
  box-shadow:none;
}

.admin-orders__btn--ghost{
  border:1px solid rgba(255,107,107,0.35);
  background: rgba(255,255,255,0.9);
  color:#b33a2b;
  box-shadow:none;
}

.admin-orders__btn--toggle{
  font-weight:800;
}

.admin-orders__btn--active{
  border-color: rgba(255,107,107,0.7);
  background: rgba(255,107,107,0.15);
  color:#8f2d21;
}

.admin-orders__ghost{
  padding:10px 16px;
  border-radius:999px;
  border:1px solid rgba(255,107,107,0.40);
  background: rgba(255,255,255,0.9);
  color:#b33a2b;
  text-decoration:none;
  font-weight:800;
}

.admin-orders__alert{
  margin:12px 0 14px;
  padding:12px 14px;
  border-radius:14px;
  background: rgba(255,107,107,0.12);
  border: 1px solid rgba(255,107,107,0.25);
  color:#b33a2b;
  font-weight:800;
}

.admin-orders__grid{
  display:grid;
  grid-template-columns: 340px 1fr;
  gap:16px;
}

@media (max-width: 980px){
  .admin-orders__grid{ grid-template-columns: 1fr; }
}

.admin-orders__card{
  background: var(--glass);
  border-radius: 18px;
  padding: 14px;
  border: 1px solid rgba(255,176,136,0.22);
  box-shadow: 0 16px 36px rgba(25,15,10,0.10);
}

.admin-orders__input{
  width:100%;
  padding:10px 12px;
  border-radius:12px;
  border:1px solid rgba(28,25,22,0.12);
  background:#fff;
  outline:none;
  font-weight:700;
}

.admin-orders__input:focus{
  border-color: rgba(255,107,107,0.7);
  box-shadow: 0 0 0 4px rgba(255,107,107,0.16);
}

.admin-orders__list{
  margin-top:12px;
  display:grid;
  gap:10px;
}

.admin-orders__row{
  text-align:left;
  width:100%;
  padding:12px;
  border-radius:14px;
  border:1px solid rgba(28,25,22,0.08);
  background: rgba(255,255,255,0.75);
  cursor:pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border 0.15s ease;
  position:relative;
}

.admin-orders__row:hover{
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(25,15,10,0.08);
}

.admin-orders__row--active{
  border:2px solid rgba(255,107,107,0.35);
  background: rgba(255,107,107,0.10);
}

.admin-orders__row-top,
.admin-orders__row-bottom{
  display:flex;
  justify-content:space-between;
  gap:10px;
}

.admin-orders__row-bottom{ margin-top:6px; }

.admin-orders__row-title{
  font-weight:900;
  color:var(--ink);
}

.admin-orders__row-meta{
  color:var(--muted);
  font-weight:700;
  font-size:13px;
}

.admin-orders__badge{
  display:inline-flex;
  align-items:center;
  padding:6px 10px;
  border-radius:999px;
  border:1px solid rgba(255,107,107,0.30);
  background: rgba(255,107,107,0.10);
  color:#b33a2b;
  font-weight:900;
  font-size:12px;
}

.admin-orders__badge-danger{
  display:inline-flex;
  align-items:center;
  padding:6px 10px;
  border-radius:999px;
  border:1px solid rgba(255,0,0,0.25);
  background: rgba(255,0,0,0.10);
  color:#d12b23;
  font-weight:900;
  font-size:12px;
  margin-top:10px;
}

.admin-orders__empty{
  padding:10px 6px;
  color:var(--muted);
  font-weight:800;
}

.admin-orders__details-head{
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
  margin-bottom:12px;
}

.admin-orders__details-title{
  margin:0;
  font-size:22px;
  font-weight:900;
  font-family:"Fraunces","Times New Roman",serif;
}

.admin-orders__details-sub{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  align-items:center;
  margin-top:6px;
}

.admin-orders__muted{
  color:var(--muted);
  font-weight:700;
  font-size:13px;
}

.admin-orders__total{
  min-width:140px;
  text-align:right;
  padding:10px 12px;
  border-radius:14px;
  border:1px solid rgba(28,25,22,0.08);
  background: rgba(255,255,255,0.75);
}

.admin-orders__total-label{
  color:var(--muted);
  font-weight:800;
  font-size:12px;
}

.admin-orders__total-value{
  color:var(--ink);
  font-weight:900;
  font-size:20px;
  margin-top:2px;
}

.admin-orders__kv-grid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap:10px;
  margin-bottom:10px;
}

@media (max-width: 980px){
  .admin-orders__kv-grid{ grid-template-columns: 1fr; }
}

.admin-orders__kv{
  border:1px solid rgba(28,25,22,0.08);
  background: rgba(255,255,255,0.75);
  border-radius:14px;
  padding:12px;
}

.admin-orders__kv--full{
  grid-column: 1 / -1;
}

.admin-orders__kv-label{
  color:var(--muted);
  font-weight:800;
  font-size:12px;
}

.admin-orders__kv-value{
  color:var(--ink);
  font-weight:900;
  margin-top:4px;
}

.admin-orders__status-row{
  display:flex;
  gap:10px;
  align-items:center;
  margin-top:8px;
  flex-wrap:wrap;
}

.admin-orders__select{
  padding:10px 12px;
  border-radius:12px;
  border:1px solid rgba(28,25,22,0.12);
  background:#fff;
  font-weight:900;
}

.admin-orders__section-title{
  margin:14px 0 10px;
  font-size:16px;
  font-weight:900;
  color:var(--ink);
  font-family:"Fraunces","Times New Roman",serif;
}

.admin-orders__items{
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap:12px;
}

@media (max-width: 980px){
  .admin-orders__items{ grid-template-columns: 1fr; }
}

.admin-orders__item{
  border:1px solid rgba(28,25,22,0.08);
  background: rgba(255,255,255,0.80);
  border-radius:16px;
  padding:12px;
}

.admin-orders__item-top{
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:flex-start;
  margin-bottom:6px;
}

.admin-orders__item-name{
  font-weight:900;
  color:var(--ink);
}

.admin-orders__item-chip{
  padding:6px 10px;
  border-radius:999px;
  border:1px solid rgba(28,25,22,0.10);
  background: rgba(255,255,255,0.9);
  font-weight:900;
  color:var(--ink);
  font-size:12px;
}

.admin-orders__item-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-top:8px;
}

.admin-orders__item-price{
  font-weight:900;
  color:var(--ink);
}

@keyframes float{
  0%,100%{ transform: translateY(0px); }
  50%{ transform: translateY(14px); }
}
`;
