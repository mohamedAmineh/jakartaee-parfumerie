import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;

  // Visible uniquement si connecté ET role ADMIN
  const isAdmin = isLoggedIn && String(user?.role || "").toUpperCase() === "ADMIN";

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("auth");
    navigate("/", { replace: true });
  };

  return (
    <header style={styles.shell}>
      <div style={styles.inner}>
        <Link to="/" style={styles.brand}>
          Parfumerie
        </Link>

        <div style={styles.right}>
          <Link to="/products" style={styles.pill}>
            Produits
          </Link>

          <Link to="/cart" style={styles.pill}>
            Panier
          </Link>

          {isLoggedIn && !isAdmin && (
            <Link to="/orders" style={styles.pill}>
              Mes commandes
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" style={{ ...styles.pill }}>
              Dashboard
            </Link>
          )}

          {!isLoggedIn ? (
            <Link to="/auth" style={{ ...styles.pill, ...styles.pillPrimary }}>
              Connexion
            </Link>
          ) : (
            <button type="button" onClick={logout} style={styles.pill}>
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  shell: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "var(--nav-bg)",
    borderBottom: "1px solid rgba(255, 176, 136, 0.2)",
    backdropFilter: "blur(10px)",
  },

  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  brand: {
    fontFamily: "Fraunces, Times New Roman, serif",
    fontWeight: 700,
    letterSpacing: "0.2px",
    fontSize: 20,
    color: "#1c1916",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 12,
    background: "rgba(255, 255, 255, 0.75)",
    border: "1px solid rgba(28,25,22,0.06)",
    boxShadow: "0 10px 22px rgba(25, 15, 10, 0.06)",
  },

  right: {
    marginLeft: "auto",
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  pill: {
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    fontWeight: 800,
    fontSize: 13,
    color: "var(--nav-pill-text)",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid var(--nav-pill-border)",
    background: "var(--nav-pill-bg)",
    cursor: "pointer",
  },
  pillPrimary: {
    border: "1px solid rgba(255,107,107,0.4)",
    background: "var(--nav-accent-bg)",
    color: "var(--nav-accent-text)",
  },
  pillOk: {
    border: "1px solid rgba(28,25,22,0.10)",
    background: "rgba(28,25,22,0.06)",
    color: "#6f655c",
    cursor: "not-allowed",
  },
};
