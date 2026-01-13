import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "../services/auth";

const API = "http://localhost:8080/starter/api/orders";

const formatEur = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString("fr-FR")} EUR`;
};

export default function MyOrdersPage() {
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), []);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    refresh();
  }, [user]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API, { headers: { ...getAuthHeaders() } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!user) return [];
    const userId = user.id;
    const email = String(user.email || "").toLowerCase();
    return orders
      .filter((o) => {
        const orderEmail = String(o.user?.email ?? o.userEmail ?? "").toLowerCase();
        const orderUserId = o.user?.id ?? o.userId;
        return (userId && orderUserId === userId) || (email && orderEmail === email);
      })
      .sort((a, b) => {
        const da = new Date(a.orderDate || a.createdAt || 0).getTime();
        const db = new Date(b.orderDate || b.createdAt || 0).getTime();
        return db - da;
      });
  }, [orders, user]);

  useEffect(() => {
    if (!filtered.length) {
      setSelected(null);
      return;
    }
    if (!selected) {
      setSelected(filtered[0]);
      return;
    }
    const stillThere = filtered.find((o) => o.id === selected.id);
    setSelected(stillThere || filtered[0]);
  }, [filtered, selected]);

  if (!user) {
    return (
      <div className="my-orders">
        <style>{styles}</style>
        <div className="my-orders__wrap">
          <div className="my-orders__card">
            <h1>Mes commandes</h1>
            <p>Connecte-toi pour voir tes commandes.</p>
            <Link to="/auth" className="my-orders__button">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <style>{styles}</style>
      <div className="my-orders__wrap">
        <header className="my-orders__header">
          <div>
            <h1>Mes commandes</h1>
            <p>Consulte le statut, les articles et les details de livraison.</p>
          </div>
          <button type="button" onClick={refresh} className="my-orders__ghost" disabled={loading}>
            {loading ? "Chargement..." : "Rafraichir"}
          </button>
        </header>

        {error && <div className="my-orders__error">Erreur: {error}</div>}

        <div className="my-orders__layout">
          <div className="my-orders__panel">
            <div className="my-orders__list">
              {filtered.map((o) => {
                const total = formatEur(o.totalPrice ?? o.total);
                const isActive = selected?.id === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    className={`my-orders__row ${isActive ? "my-orders__row--active" : ""}`}
                    onClick={() => setSelected(o)}
                  >
                    <div>
                      <div className="my-orders__row-title">Commande #{o.id}</div>
                      <div className="my-orders__row-meta">
                        {o.status ?? "PENDING"} • {o.orderDate ?? o.createdAt ?? "Date N/A"}
                      </div>
                    </div>
                    <span className="my-orders__badge">{total}</span>
                  </button>
                );
              })}

              {loading && <div className="my-orders__empty">Chargement...</div>}
              {!loading && filtered.length === 0 && (
                <div className="my-orders__empty">Aucune commande pour le moment.</div>
              )}
            </div>
          </div>

          <div className="my-orders__panel">
            {!selected ? (
              <div className="my-orders__empty">Selectionne une commande.</div>
            ) : (
              <>
                <div className="my-orders__detail-head">
                  <div>
                    <h2>Commande #{selected.id}</h2>
                    <p className="my-orders__muted">
                      Statut: <strong>{selected.status ?? "PENDING"}</strong>
                    </p>
                  </div>
                  <div className="my-orders__total">
                    <span>Total</span>
                    <strong>{formatEur(selected.totalPrice ?? selected.total)}</strong>
                  </div>
                </div>

                <div className="my-orders__info">
                  <div>
                    <span>Date</span>
                    <strong>{selected.orderDate ?? selected.createdAt ?? "N/A"}</strong>
                  </div>
                  <div>
                    <span>Adresse</span>
                    <strong>{selected.shippingAddress ?? "N/A"}</strong>
                  </div>
                </div>

                <h3>Articles</h3>
                {Array.isArray(selected.items) && selected.items.length > 0 ? (
                  <div className="my-orders__items">
                    {selected.items.map((it, idx) => {
                      const qty = Number(it.quantity ?? 1);
                      const unit = Number(it.unitPrice ?? it.price ?? 0);
                      const name = it.perfume?.name ?? it.name ?? "Parfum";
                      const brand = it.perfume?.brand ?? it.brand ?? "";
                      return (
                        <div key={it.id ?? idx} className="my-orders__item">
                          <div>
                            <div className="my-orders__item-name">{name}</div>
                            {brand && <div className="my-orders__item-brand">{brand}</div>}
                          </div>
                          <div className="my-orders__item-meta">
                            <span>x{qty}</span>
                            <span>{formatEur(unit * qty)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="my-orders__empty">Aucun article.</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600&display=swap');

.my-orders {
  --ink: #1c1916;
  --muted: #6f655c;
  min-height: 100vh;
  padding: 56px 20px 80px;
  background:
    radial-gradient(circle at 12% 15%, rgba(255, 177, 136, 0.35), transparent 48%),
    radial-gradient(circle at 88% 18%, rgba(255, 107, 107, 0.18), transparent 52%),
    radial-gradient(circle at 50% 80%, rgba(255, 215, 194, 0.6), transparent 55%),
    #fffaf6;
  font-family: "Manrope", "Segoe UI", sans-serif;
  color: var(--ink);
}

.my-orders__wrap {
  max-width: 1100px;
  margin: 0 auto;
}

.my-orders__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.my-orders__header h1 {
  font-family: "Fraunces", "Times New Roman", serif;
  margin: 0 0 6px;
}

.my-orders__header p {
  margin: 0;
  color: var(--muted);
}

.my-orders__ghost {
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 107, 107, 0.4);
  background: #fff;
  color: #b33a2b;
  font-weight: 700;
  cursor: pointer;
}

.my-orders__layout {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 18px;
}

.my-orders__panel {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 176, 136, 0.2);
  box-shadow: 0 14px 32px rgba(25, 15, 10, 0.1);
}

.my-orders__list {
  display: grid;
  gap: 10px;
}

.my-orders__row {
  border: 1px solid rgba(28, 25, 22, 0.1);
  border-radius: 14px;
  padding: 12px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  transition: border 0.2s ease, box-shadow 0.2s ease;
  text-align: left;
}

.my-orders__row:hover {
  box-shadow: 0 12px 22px rgba(25, 15, 10, 0.08);
}

.my-orders__row--active {
  border: 2px solid rgba(255, 107, 107, 0.35);
  box-shadow: 0 12px 24px rgba(255, 107, 107, 0.16);
}

.my-orders__row-title {
  font-weight: 700;
}

.my-orders__row-meta {
  color: var(--muted);
  font-size: 12px;
  margin-top: 4px;
}

.my-orders__badge {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 107, 107, 0.12);
  font-weight: 700;
  color: #b33a2b;
  font-size: 12px;
  height: fit-content;
}

.my-orders__detail-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.my-orders__detail-head h2 {
  margin: 0 0 6px;
}

.my-orders__muted {
  margin: 0;
  color: var(--muted);
}

.my-orders__total {
  text-align: right;
  background: rgba(255, 107, 107, 0.12);
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 700;
}

.my-orders__total span {
  display: block;
  font-size: 12px;
  color: #b33a2b;
}

.my-orders__info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 16px 0;
}

.my-orders__info span {
  display: block;
  color: var(--muted);
  font-size: 12px;
}

.my-orders__info strong {
  display: block;
  font-weight: 700;
  margin-top: 4px;
}

.my-orders__items {
  display: grid;
  gap: 10px;
}

.my-orders__item {
  border: 1px solid rgba(28, 25, 22, 0.08);
  border-radius: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.my-orders__item-name {
  font-weight: 700;
}

.my-orders__item-brand {
  color: var(--muted);
  font-size: 12px;
}

.my-orders__item-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  font-weight: 700;
}

.my-orders__empty {
  color: var(--muted);
  font-weight: 600;
  padding: 12px;
}

.my-orders__error {
  margin-bottom: 12px;
  background: rgba(255, 107, 107, 0.12);
  border: 1px solid rgba(255, 107, 107, 0.25);
  color: #b33a2b;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
}

.my-orders__card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid rgba(255, 176, 136, 0.2);
  box-shadow: 0 14px 32px rgba(25, 15, 10, 0.1);
  max-width: 520px;
  margin: 40px auto;
  text-align: center;
}

.my-orders__button {
  display: inline-block;
  margin-top: 12px;
  padding: 10px 16px;
  border-radius: 999px;
  background: linear-gradient(120deg, #ff6b6b, #ffb088);
  color: #1c1916;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 900px) {
  .my-orders__layout {
    grid-template-columns: 1fr;
  }
}
`;
