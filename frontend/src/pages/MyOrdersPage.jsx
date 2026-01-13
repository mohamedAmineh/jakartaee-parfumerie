import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUserOrders } from "../application/useCases/orders";

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

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const allOrders = await fetchUserOrders();
      setOrders(Array.isArray(allOrders) ? allOrders : []);
    } catch (err) {
      setError(err?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      <div style={styles.page}>
        <div style={styles.wrap}>
          <div style={styles.card}>
            <h1 style={styles.h1}>Mes commandes</h1>
            <p style={styles.muted}>Connecte-toi pour voir tes commandes.</p>
            <Link to="/auth" style={styles.primaryLink}>Se connecter</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600;700&display=swap');
      `}</style>

      <div style={styles.wrap}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.h1}>Mes commandes</h1>
            <p style={styles.muted}>Consulte le statut, les articles et les détails de livraison.</p>
          </div>
          <button type="button" onClick={refresh} disabled={loading} style={styles.ghostBtn}>
            {loading ? "Chargement..." : "Rafraîchir"}
          </button>
        </header>

        {error && <div style={styles.error}>Erreur: {error}</div>}

        <div style={styles.layout}>
          <section style={styles.panel}>
            {loading && <div style={styles.empty}>Chargement...</div>}
            {!loading && filtered.length === 0 && (
              <div style={styles.empty}>Aucune commande pour le moment.</div>
            )}

            <div style={styles.list}>
              {filtered.map((o) => {
                const isActive = selected?.id === o.id;
                const total = o.totalPrice ?? o.total;
                const date = o.orderDate ?? o.createdAt ?? "N/A";
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelected(o)}
                    style={{ ...styles.row, ...(isActive ? styles.rowActive : {}) }}
                  >
                    <div>
                      <div style={styles.rowTitle}>Commande {o.id}</div>
                      <div style={styles.rowMeta}>
                        {o.status ?? "PENDING"} • {date}
                      </div>
                    </div>
                    <div style={styles.badge}>{formatEur(total)}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section style={styles.panel}>
            {!selected ? (
              <div style={styles.empty}>Sélectionne une commande.</div>
            ) : (
              <div>
                <div style={styles.detailHead}>
                  <h2 style={styles.h2}>Commande {selected.id}</h2>
                  <div style={styles.badge}>{formatEur(selected.totalPrice ?? selected.total)}</div>
                </div>

                <div style={styles.kvGrid}>
                  <div style={styles.kv}>
                    <div style={styles.k}>Statut</div>
                    <div style={styles.v}>{selected.status ?? "PENDING"}</div>
                  </div>
                  <div style={styles.kv}>
                    <div style={styles.k}>Date</div>
                    <div style={styles.v}>{selected.orderDate ?? selected.createdAt ?? "N/A"}</div>
                  </div>
                  <div style={styles.kv}>
                    <div style={styles.k}>Adresse</div>
                    <div style={styles.v}>{selected.shippingAddress ?? "N/A"}</div>
                  </div>
                  <div style={styles.kv}>
                    <div style={styles.k}>Articles</div>
                    <div style={styles.v}>
                      {Array.isArray(selected.items) ? selected.items.length : 0}
                    </div>
                  </div>
                </div>

                <h3 style={styles.h3}>Articles</h3>
                {Array.isArray(selected.items) && selected.items.length > 0 ? (
                  <div style={styles.items}>
                    {selected.items.map((it, idx) => {
                      const qty = Number(it.quantity ?? 1);
                      const unit = Number(it.unitPrice ?? it.price ?? 0);
                      const name = it.perfume?.name ?? it.name ?? "Parfum";
                      const brand = it.perfume?.brand ?? it.brand ?? "";
                      return (
                        <div key={it.id ?? idx} style={styles.item}>
                          <div>
                            <div style={styles.itemName}>{name}</div>
                            {brand && <div style={styles.rowMeta}>{brand}</div>}
                          </div>
                          <div style={styles.itemMeta}>
                            <div>x{qty}</div>
                            <div>{formatEur(unit * qty)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={styles.empty}>Aucun article.</div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "56px 20px 80px",
    background:
      "radial-gradient(circle at 12% 15%, rgba(255, 177, 136, 0.35), transparent 48%)," +
      "radial-gradient(circle at 88% 18%, rgba(255, 107, 107, 0.18), transparent 52%)," +
      "radial-gradient(circle at 50% 80%, rgba(255, 215, 194, 0.6), transparent 55%)," +
      "#fffaf6",
    fontFamily: "Manrope, Segoe UI, sans-serif",
    color: "#1c1916",
  },
  wrap: { maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 },
  card: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 20,
    border: "1px solid rgba(255, 176, 136, 0.2)",
    boxShadow: "0 14px 32px rgba(25,15,10,0.10)",
    maxWidth: 520,
    margin: "40px auto",
    textAlign: "center",
  },
  h1: { margin: 0, fontFamily: "Fraunces, Times New Roman, serif", fontSize: 34, fontWeight: 800 },
  h2: { margin: 0, fontSize: 20, fontWeight: 900 },
  h3: { margin: "16px 0 10px", fontSize: 16, fontWeight: 900 },
  muted: { margin: "6px 0 0", color: "#6f655c", fontWeight: 700 },
  primaryLink: {
    display: "inline-block",
    marginTop: 12,
    padding: "10px 16px",
    borderRadius: 999,
    background: "linear-gradient(120deg, #ff6b6b, #ffb088)",
    color: "#1c1916",
    fontWeight: 900,
    textDecoration: "none",
  },
  ghostBtn: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid rgba(255, 107, 107, 0.4)",
    background: "#fff",
    color: "#b33a2b",
    fontWeight: 800,
    cursor: "pointer",
    height: "fit-content",
  },
  error: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,107,107,0.12)",
    border: "1px solid rgba(255,107,107,0.25)",
    color: "#b33a2b",
    fontWeight: 800,
  },
  layout: { display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 18 },
  panel: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 16,
    border: "1px solid rgba(255, 176, 136, 0.2)",
    boxShadow: "0 14px 32px rgba(25,15,10,0.10)",
  },
  list: { display: "grid", gap: 10, marginTop: 12 },
  row: {
    width: "100%",
    textAlign: "left",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(28, 25, 22, 0.1)",
    background: "#fff",
    cursor: "pointer",
  },
  rowActive: {
    border: "2px solid rgba(255, 107, 107, 0.35)",
    boxShadow: "0 12px 24px rgba(255, 107, 107, 0.16)",
  },
  rowTitle: { fontWeight: 800 },
  rowMeta: { marginTop: 4, color: "#6f655c", fontSize: 12, fontWeight: 700 },
  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255, 107, 107, 0.12)",
    color: "#b33a2b",
    fontWeight: 900,
    fontSize: 12,
    height: "fit-content",
    whiteSpace: "nowrap",
  },
  detailHead: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" },
  kvGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 14 },
  kv: { border: "1px solid rgba(28, 25, 22, 0.08)", background: "rgba(255,255,255,0.75)", borderRadius: 14, padding: 12 },
  k: { color: "#6f655c", fontWeight: 800, fontSize: 12 },
  v: { marginTop: 4, fontWeight: 900 },
  items: { display: "grid", gap: 10 },
  item: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(28, 25, 22, 0.08)",
    background: "rgba(255,255,255,0.85)",
  },
  itemName: { fontWeight: 900 },
  itemMeta: { display: "grid", gap: 6, textAlign: "right", fontWeight: 900 },
  empty: { color: "#6f655c", fontWeight: 800, padding: 12 },
};
