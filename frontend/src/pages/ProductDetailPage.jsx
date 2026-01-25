// Product detail view with add-to-cart.

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchPublicPerfumeById } from "../application/useCases/perfume";
import { loadCart, saveCart } from "../application/useCases/cart";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loadPerfume = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchPublicPerfumeById(id);
        setPerfume(data);
      } catch (err) {
        setError(err?.message || "Erreur.");
      } finally {
        setLoading(false);
      }
    };

    loadPerfume();
  }, [id]);

  function handleAddToCart() {
    if (!perfume?.id) return;

    const cart = loadCart();
    const exists = cart.find((c) => c.id === perfume.id);

    if (exists) {
      exists.quantity = Number(exists.quantity || 1) + 1;
    } else {
      cart.push({
        id: perfume.id,
        name: perfume.name,
        brand: perfume.brand,
        price: perfume.price,
        quantity: 1,
      });
    }

    saveCart(cart);
    setAdded(true);
  }

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  if (error)
    return (
      <div style={styles.page}>
        <div className="detail-wrap">
          <Link to="/products" style={styles.backLink}>
            ← Retour au catalogue
          </Link>

          <div style={styles.errorBox}>
            <b>Erreur:</b> {error}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/auth" className="detail-ghost" style={{ textDecoration: "none" }}>
              Connexion
            </Link>
            <button type="button" className="detail-button" onClick={() => navigate(0)}>
              Réessayer
            </button>
          </div>
        </div>

        <style>{css}</style>
      </div>
    );

  if (!perfume) return <div>Parfum non trouvé.</div>;
  if (perfume.available === false) {
    return (
      <div style={styles.page}>
        <style>{css}</style>
        <div className="detail-wrap">
          <Link to="/products" style={styles.backLink}>
            Retour au catalogue
          </Link>
          <div style={styles.errorBox}>
            <b>Indisponible:</b> Ce parfum est desactive.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{css}</style>

      <div className="detail-wrap">
        <Link to="/products" style={styles.backLink}>
          ← Retour au catalogue
        </Link>

        <div className="detail-card">
          <div>
            <div className="detail-badge">{perfume.available ? "Disponible" : "Indisponible"}</div>

            <h1 className="detail-title">{perfume.name}</h1>
            <p className="detail-brand">{perfume.brand || "Marque inconnue"}</p>

            <p className="detail-price">{perfume.price}€</p>

            <p className="detail-info">
              <strong>Format:</strong> {perfume.format || "Non spécifié"}
            </p>

            <p className="detail-info">
              <strong>Stock:</strong> {perfume.stock} • {perfume.available ? "Disponible" : "Rupture"}
            </p>

            {perfume.description && (
              <p className="detail-info">
                <strong>Description:</strong> {perfume.description}
              </p>
            )}

            {perfume.comment && (
              <p className="detail-info">
                <strong>Commentaire:</strong> {perfume.comment}
              </p>
            )}

            <div className="detail-actions">
              <button className="detail-button" disabled={!perfume.available} onClick={handleAddToCart}>
                {perfume.available ? "Ajouter au panier" : "Indisponible"}
              </button>

              <Link to="/products" className="detail-ghost" style={{ textDecoration: "none" }}>
                Continuer les achats
              </Link>

              {added && (
                <Link to="/cart" className="detail-ghost" style={{ textDecoration: "none" }}>
                  Voir mon panier
                </Link>
              )}
            </div>
          </div>

          <div style={styles.panel}>
            <p style={styles.panelTitle}>Notes rapides</p>
            <p style={styles.panelText}>
              Une sélection inspirée par l’esthétique admin : couleurs corail, fonds pastels et cartes en verre.
            </p>
            <p style={styles.panelText}>
              Ajustez le format, consultez la disponibilité et découvrez la description.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600&display=swap');

.detail-wrap {
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.detail-card{
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 16px 36px rgba(25, 15, 10, 0.14);
  border: 1px solid rgba(255, 176, 136, 0.20);
}

@media (max-width: 960px){
  .detail-card { grid-template-columns: 1fr; }
}

.detail-title{
  font-family: Fraunces, 'Times New Roman', serif;
  font-size: clamp(28px, 4vw, 40px);
  margin: 0 0 10px;
  color: #1c1916;
}

.detail-brand{
  color: #6f655c;
  margin: 0 0 16px;
  font-family: Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

.detail-price{
  font-size: 32px;
  font-weight: 800;
  color: #1c1916;
  margin: 0 0 12px;
  font-family: Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

.detail-badge{
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 107, 107, 0.12);
  color: #b33a2b;
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 8px;
  font-family: Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

.detail-info{
  margin: 0 0 8px;
  color: #6f655c;
  font-family: Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

.detail-info strong { color: #1c1916; }

.detail-actions{
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.detail-button{
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(120deg, #ff6b6b, #ffb088);
  color: #1c1916;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(255, 107, 107, 0.25);
  font-family: Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

.detail-button:disabled{
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.detail-ghost{
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 107, 107, 0.40);
  background: #fff;
  color: #b33a2b;
  font-weight: 700;
  cursor: pointer;
  font-family: Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}
`;

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 20px 80px",
    background:
      "radial-gradient(circle at 12% 15%, rgba(255, 177, 136, 0.35), transparent 48%), radial-gradient(circle at 88% 18%, rgba(255, 107, 107, 0.18), transparent 52%), radial-gradient(circle at 50% 80%, rgba(255, 215, 194, 0.6), transparent 55%), #fffaf6",
  },
  loading: { textAlign: "center", fontSize: 20, padding: 100 },
  backLink: {
    display: "inline-block",
    marginBottom: 16,
    color: "#b33a2b",
    fontWeight: 700,
    textDecoration: "none",
  },
  panel: {
    borderRadius: 16,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(255,176,136,0.18)",
    padding: 16,
    boxShadow: "0 12px 24px rgba(25,15,10,0.08)",
    alignSelf: "start",
  },
  panelTitle: { margin: "0 0 6px", fontWeight: 800, color: "#1c1916" },
  panelText: { margin: "0 0 8px", color: "#6f655c", lineHeight: 1.5 },
  errorBox: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,107,107,0.25)",
    background: "rgba(255,107,107,0.12)",
    color: "#b33a2b",
    fontWeight: 800,
    marginBottom: 10,
  },
};

export default ProductDetailPage;
