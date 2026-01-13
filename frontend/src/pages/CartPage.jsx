import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  loadCart, 
  updateItemQuantity, 
  removeItemFromCart, 
  computeCartTotal 
} from "../domain/services/cartService";
import { createOrderFromCart } from "../application/useCases/CreateOrder";

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  const total = useMemo(() => computeCartTotal(items), [items]);

  function updateQuantity(id, delta) {
    const nextItems = updateItemQuantity(items, id, delta);
    setItems(nextItems);
  }

  function removeItem(id) {
    const nextItems = removeItemFromCart(items, id);
    setItems(nextItems);
  }

  async function confirmOrder() {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      await createOrderFromCart({ user, items });
      
      setSuccess("Commande enregistrée ! Un admin recevra la notification.");
      setTimeout(() => navigate("/products"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600&display=swap');
      `}</style>
      <div style={styles.wrap}>
        <Link to="/" style={styles.back}>← Retour au catalogue</Link>
        <h1 style={styles.title}>Mon panier</h1>
        <p style={styles.subtitle}>Confirme ta commande; l'admin verra la notification.</p>

        <div style={styles.card}>
          {items.length === 0 && <p style={styles.muted}>Panier vide.</p>}

          {items.map((it) => (
            <div key={it.id} style={styles.row}>
              <div>
                <div style={styles.rowName}>{it.name}</div>
                <div style={styles.muted}>{it.brand || "Marque inconnue"}</div>
                <div style={styles.rowPrice}>{it.price} €</div>
              </div>
              <div style={styles.rowActions}>
                <div style={styles.qty}>
                  <button 
                    onClick={() => updateQuantity(it.id, -1)} 
                    style={styles.qtyBtn}
                  >
                    -
                  </button>
                  <span>{it.quantity || 1}</span>
                  <button 
                    onClick={() => updateQuantity(it.id, 1)} 
                    style={styles.qtyBtn}
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => removeItem(it.id)} 
                  style={styles.ghost}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}

          <div style={styles.totalRow}>
            <span>Total</span>
            <strong>{total.toFixed(2)} €</strong>
          </div>

          <button 
            style={styles.primary} 
            onClick={confirmOrder} 
            disabled={loading || items.length === 0}
          >
            {loading ? "Envoi..." : "Confirmer la commande"}
          </button>

          {error && <p style={styles.error}>Erreur: {error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 20px 80px",
    background:
      "radial-gradient(circle at 12% 15%, rgba(255, 177, 136, 0.35), transparent 48%)," +
      "radial-gradient(circle at 88% 18%, rgba(255, 107, 107, 0.18), transparent 52%)," +
      "radial-gradient(circle at 50% 80%, rgba(255, 215, 194, 0.6), transparent 55%)," +
      "#fffaf6",
    fontFamily: '"Manrope","Segoe UI",sans-serif',
  },
  wrap: { maxWidth: 900, margin: "0 auto" },
  back: { 
    display: "inline-block", 
    marginBottom: 12, 
    color: "#b33a2b", 
    fontWeight: 700,
    textDecoration: "none"
  },
  title: { 
    margin: "0 0 6px", 
    fontFamily: '"Fraunces","Times New Roman",serif',
    fontSize: 36
  },
  subtitle: { margin: "0 0 16px", color: "#6f655c" },
  card: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 14px 32px rgba(25,15,10,0.12)",
    border: "1px solid rgba(255,176,136,0.2)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    border: "1px solid rgba(255,176,136,0.2)",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
    marginBottom: 10,
    alignItems: "center",
  },
  rowName: { fontWeight: 700, color: "#1c1916" },
  rowPrice: { fontWeight: 700, color: "#1c1916", marginTop: 6 },
  muted: { color: "#6f655c", margin: 0 },
  rowActions: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  qty: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(28,25,22,0.12)",
    borderRadius: 10,
    padding: "6px 10px",
    background: "#fafafa",
  },
  qtyBtn: {
    border: "none",
    background: "transparent",
    fontWeight: 800,
    cursor: "pointer",
    color: "#b33a2b",
    width: 28,
    height: 28
  },
  ghost: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255, 107, 107, 0.4)",
    background: "#fff",
    color: "#b33a2b",
    fontWeight: 700,
    cursor: "pointer",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 12,
    fontSize: 16,
    borderTop: "1px solid rgba(28,25,22,0.08)",
    paddingTop: 10,
  },
  primary: {
    width: "100%",
    marginTop: 12,
    padding: "12px 18px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(120deg, #ff6b6b, #ffb088)",
    color: "#1c1916",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(255, 107, 107, 0.25)",
  },
  error: { color: "#b33a2b", fontWeight: 700, marginTop: 8 },
  success: { color: "#1b7f3a", fontWeight: 700, marginTop: 8 },
};
