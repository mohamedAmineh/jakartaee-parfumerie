import { useEffect, useMemo, useState } from "react";
import { getAuthHeaders } from "../../services/auth";

const API = "http://localhost:8080/starter/api/orders";
const HIGH_VALUE_THRESHOLD = 500;
const HIGH_VALUE_API = "http://localhost:8080/starter/api/orders/high-value";

export default function ManageOredrsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  // commandes routées en "high value" (par le router backend)
  const [highValueIds, setHighValueIds] = useState(new Set());

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const ordersRes = await fetch(API);
      if (!ordersRes.ok) {
        const txt = await ordersRes.text();
        throw new Error(txt || `HTTP ${ordersRes.status}`);
      }

      const orders = await ordersRes.json();
      setData(Array.isArray(orders) ? orders : []);

      const highValueRes = await fetch(HIGH_VALUE_API);
      if (highValueRes && highValueRes.ok) {
        const events = await highValueRes.json();
        const ids = new Set(
          Array.isArray(events)
            ? events
                .map((e) => e.orderId ?? e.id)
                .filter((id) => id !== null && id !== undefined)
            : []
        );
        setHighValueIds(ids);
      } else {
        setHighValueIds(new Set());
      }
    } catch (err) {
      setError(err?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const updated = await res.json();
      setData((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setSelected(updated);
    } catch (err) {
      setError(err?.message || "Erreur lors de la mise a jour.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return data.filter((o) => {
      const id = String(o.id ?? "").toLowerCase();
      const email = String(o.user?.email ?? o.userEmail ?? "").toLowerCase();
      const status = String(o.status ?? "").toLowerCase();
      return id.includes(q) || email.includes(q) || status.includes(q);
    });
  }, [data, filter]);

  useEffect(() => {
    if (!selected) return;
    const stillThere = data.find((o) => o.id === selected.id);
    setSelected(stillThere || null);
  }, [data]);

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.h1}>Gestion des commandes</h1>
          <p style={styles.p}>
            Liste + détails (comme la page catalogue). Badge rouge si routé en high
            value.
          </p>
        </div>

        <button onClick={refresh} style={styles.btn} disabled={loading}>
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      {error && <div style={styles.alert}>Erreur: {error}</div>}

      <div style={styles.grid}>
        {/* LISTE */}
        <div style={styles.card}>
          <input
            style={styles.input}
            placeholder="Rechercher (id, email, statut)..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />

          <div style={styles.list}>
            {filtered.map((o) => {
              const isActive = selected?.id === o.id;
              const total =
                o.totalPrice != null
                  ? `${o.totalPrice} €`
                  : o.total != null
                    ? `${o.total} €`
                    : "—";
              const numericTotal =
                o.totalPrice ?? o.total ?? (Array.isArray(o.items)
                  ? o.items.reduce(
                      (acc, it) =>
                        acc +
                        Number(it.quantity ?? 0) *
                          Number(it.unitPrice ?? it.price ?? 0),
                      0
                    )
                  : null);

              const isHighValue =
                highValueIds.has(o.id) ||
                (numericTotal != null && Number(numericTotal) >= HIGH_VALUE_THRESHOLD);

              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelected(o)}
                  style={{ ...styles.row, ...(isActive ? styles.rowActive : {}) }}
                >
                  <div style={styles.rowLine1}>
                    <span style={styles.rowTitle}>Commande #{o.id}</span>
                    <span style={styles.rowMeta}>{o.status ?? "—"}</span>
                    {isHighValue && <span style={styles.badgeDanger}>HIGH VALUE</span>}
                  </div>

                  <div style={styles.rowLine2}>
                    <span style={styles.rowMeta}>
                      {o.user?.email ?? o.userEmail ?? "Client inconnu"}
                    </span>
                    <span style={styles.rowMeta}>{total}</span>
                  </div>
                </button>
              );
            })}

            {loading && <div style={styles.empty}>Chargement...</div>}

            {!loading && filtered.length === 0 && (
              <div style={styles.empty}>Aucune commande trouvée.</div>
            )}
          </div>
        </div>

        {/* DETAILS */}
        <div style={styles.card}>
          {!selected ? (
            <div style={styles.empty}>Sélectionne une commande dans la liste.</div>
          ) : (
            <div>
              <div style={styles.detailsHeader}>
                <div>
                  <h2 style={styles.detailsTitle}>Commande #{selected.id}</h2>
                  <div style={styles.detailsSub}>
                    <span style={styles.badge}>{selected.status ?? "—"}</span>
                    <span style={styles.muted}>
                      {selected.orderDate ?? selected.createdAt ?? "Date: —"}
                    </span>
                    {(highValueIds.has(selected.id) ||
                      Number(selected.totalPrice ?? selected.total ?? 0) >=
                        HIGH_VALUE_THRESHOLD) && (
                      <span style={styles.badgeDanger}>HIGH VALUE</span>
                    )}
                  </div>
                </div>

                <div style={styles.totalBox}>
                  <div style={styles.totalLabel}>Total</div>
                  <div style={styles.totalValue}>
                    {(selected.totalPrice ?? selected.total) != null
                      ? `${selected.totalPrice ?? selected.total} €`
                      : "—"}
                  </div>
                </div>
              </div>

              <div style={styles.kvGrid}>
                <div style={styles.kvItem}>
                  <div style={styles.kvLabel}>Client</div>
                  <div style={styles.kvValue}>
                    {selected.user?.email ?? selected.userEmail ?? "—"}
                  </div>
                </div>

                <div style={styles.kvItem}>
                  <div style={styles.kvLabel}>ID</div>
                  <div style={styles.kvValue}>{selected.id}</div>
                </div>

                <div style={styles.kvItem}>
                  <div style={styles.kvLabel}>Articles</div>
                  <div style={styles.kvValue}>
                    {Array.isArray(selected.items) ? selected.items.length : 0}
                  </div>
                </div>

                <div style={styles.kvItem}>
                  <div style={styles.kvLabel}>Adresse</div>
                  <div style={styles.kvValue}>
                    {selected.shippingAddress ?? "—"}
                  </div>
                </div>
                <div style={styles.kvItem}>
                  <div style={styles.kvLabel}>Statut</div>
                  <div style={styles.kvValue}>
                    <div style={styles.statusRow}>
                      <select
                        value={selected.status ?? "PENDING"}
                        onChange={(e) => {
                          const next = { ...selected, status: e.target.value };
                          setSelected(next);
                        }}
                        style={styles.select}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        style={styles.btn}
                        onClick={() => updateStatus(selected.id, selected.status ?? "PENDING")}
                        disabled={loading}
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <h3 style={styles.sectionTitle}>Articles</h3>

              {Array.isArray(selected.items) && selected.items.length > 0 ? (
                <div style={styles.itemsGrid}>
                  {selected.items.map((it, idx) => {
                    const qty = Number(it.quantity ?? 1);
                    const unit =
                      it.unitPrice != null
                        ? Number(it.unitPrice)
                        : it.price != null
                          ? Number(it.price)
                          : null;

                    return (
                      <div key={it.id ?? idx} style={styles.itemCard}>
                        <div style={styles.itemCardTop}>
                          <div style={styles.itemName}>
                            {it.perfume?.name ?? it.name ?? "Parfum"}
                          </div>
                          <div style={styles.itemChip}>x{qty}</div>
                        </div>

                        <div style={styles.itemMetaRow}>
                          <span style={styles.muted}>Prix unitaire</span>
                          <span style={styles.itemPrice}>
                            {unit != null ? `${unit} €` : "—"}
                          </span>
                        </div>

                        <div style={styles.itemMetaRow}>
                          <span style={styles.muted}>Sous-total</span>
                          <span style={styles.itemPrice}>
                            {unit != null ? `${unit * qty} €` : "—"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={styles.empty}>Aucun article pour cette commande.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 24, maxWidth: 1200, margin: "0 auto" },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  h1: { margin: 0, fontSize: 30, color: "#1c1916" },
  p: { margin: "6px 0 0", color: "#6f655c", fontWeight: 600 },

  btn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,107,107,0.35)",
    background: "#fff",
    color: "#b33a2b",
    fontWeight: 800,
    cursor: "pointer",
  },

  alert: {
    marginTop: 10,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    background: "rgba(255,107,107,0.12)",
    border: "1px solid rgba(255,107,107,0.25)",
    color: "#b33a2b",
    fontWeight: 700,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: 16,
    marginTop: 12,
  },

  card: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(28,25,22,0.08)",
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 12px 26px rgba(25, 15, 10, 0.06)",
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(28,25,22,0.12)",
    marginBottom: 12,
    outline: "none",
  },

  list: { display: "grid", gap: 10 },

  row: {
    textAlign: "left",
    width: "100%",
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(28,25,22,0.08)",
    background: "rgba(255,255,255,0.75)",
    cursor: "pointer",
  },
  rowActive: {
    border: "1px solid rgba(255,107,107,0.35)",
    background: "rgba(255, 107, 107, 0.10)",
  },
  rowLine1: { display: "flex", justifyContent: "space-between", gap: 10 },
  rowLine2: { display: "flex", justifyContent: "space-between", gap: 10, marginTop: 6 },
  rowTitle: { fontWeight: 900, color: "#1c1916" },
  rowMeta: { color: "#6f655c", fontWeight: 600, fontSize: 13 },

  empty: { color: "#6f655c", fontWeight: 700, padding: 8 },

  muted: { color: "#6f655c", fontWeight: 700, fontSize: 13 },

  detailsHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  detailsTitle: { margin: 0, fontSize: 22, fontWeight: 900, color: "#1c1916" },
  detailsSub: { display: "flex", gap: 10, alignItems: "center", marginTop: 6 },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,107,107,0.30)",
    background: "rgba(255,107,107,0.10)",
    color: "#b33a2b",
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  badgeDanger: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,0,0,0.25)",
    background: "rgba(255,0,0,0.10)",
    color: "#d12b23",
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.2,
  },

  totalBox: {
    minWidth: 140,
    textAlign: "right",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(28,25,22,0.08)",
    background: "rgba(255,255,255,0.75)",
  },
  totalLabel: { color: "#6f655c", fontWeight: 800, fontSize: 12 },
  totalValue: { color: "#1c1916", fontWeight: 900, fontSize: 20, marginTop: 2 },

  kvGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    marginBottom: 10,
  },
  kvItem: {
    border: "1px solid rgba(28,25,22,0.08)",
    background: "rgba(255,255,255,0.75)",
    borderRadius: 14,
    padding: 12,
  },
  kvLabel: { color: "#6f655c", fontWeight: 800, fontSize: 12 },
  kvValue: { color: "#1c1916", fontWeight: 900, marginTop: 4 },

  sectionTitle: { margin: "14px 0 10px", fontSize: 16, fontWeight: 900, color: "#1c1916" },

  itemsGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },

  itemCard: {
    border: "1px solid rgba(28,25,22,0.08)",
    background: "rgba(255,255,255,0.80)",
    borderRadius: 16,
    padding: 12,
  },
  itemCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  itemName: { fontWeight: 900, color: "#1c1916" },
  itemChip: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(28,25,22,0.10)",
    background: "rgba(255,255,255,0.9)",
    fontWeight: 900,
    color: "#1c1916",
    fontSize: 12,
  },
  itemMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  itemPrice: { fontWeight: 900, color: "#1c1916" },
};
