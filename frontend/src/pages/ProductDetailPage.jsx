import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPerfumeById } from '../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loadPerfume = async () => {
      try {
        const data = await fetchPerfumeById(id);
        setPerfume(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPerfume();
  }, [id]);

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (error) return <div style={styles.error}>Erreur: {error}</div>;
  if (!perfume) return <div>Parfum non trouvé</div>;

  function handleAddToCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
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
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600&display=swap');
        .detail-wrap {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .detail-card {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 16px 36px rgba(25, 15, 10, 0.14);
          border: 1px solid rgba(255, 176, 136, 0.2);
        }
        @media (max-width: 960px) {
          .detail-card { grid-template-columns: 1fr; }
        }
        .detail-title {
          font-family: "Fraunces", "Times New Roman", serif;
          font-size: clamp(28px, 4vw, 40px);
          margin: 0 0 10px;
          color: #1c1916;
        }
        .detail-brand { color: #6f655c; margin: 0 0 16px; }
        .detail-price {
          font-size: 32px;
          font-weight: 800;
          color: #1c1916;
          margin: 0 0 12px;
        }
        .detail-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255, 107, 107, 0.12);
          color: #b33a2b;
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .detail-info { margin: 0 0 8px; color: #6f655c; }
        .detail-info strong { color: #1c1916; }
        .detail-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 18px;
        }
        .detail-button {
          padding: 12px 18px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(120deg, #ff6b6b, #ffb088);
          color: #1c1916;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(255, 107, 107, 0.25);
        }
        .detail-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }
        .detail-ghost {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255, 107, 107, 0.4);
          background: #fff;
          color: #b33a2b;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>

      <div className="detail-wrap">
        <Link to="/products" style={styles.backLink}>← Retour au catalogue</Link>

        <div className="detail-card">
          <div>
            <div className="detail-badge">{perfume.available ? "Disponible" : "Indisponible"}</div>
            <h1 className="detail-title">{perfume.name}</h1>
            <p className="detail-brand">{perfume.brand || "Marque inconnue"}</p>
            <p className="detail-price">{perfume.price}€</p>
            <p className="detail-info"><strong>Format:</strong> {perfume.format || "Non spécifié"}</p>
            <p className="detail-info">
              <strong>Stock:</strong> {perfume.stock} • {perfume.available ? "Disponible" : "Rupture"}
            </p>
            {perfume.description && (
              <p className="detail-info"><strong>Description:</strong> {perfume.description}</p>
            )}
            {perfume.comment && (
              <p className="detail-info"><strong>Commentaire:</strong> {perfume.comment}</p>
            )}
            <div className="detail-actions">
              <button className="detail-button" disabled={!perfume.available} onClick={handleAddToCart}>
                {perfume.available ? 'Ajouter au panier' : 'Indisponible'}
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
              Une selection inspiree par l’esthétique admin : couleurs corail, fonds pastels et cartes en verre.
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

const styles = {
  page: {
    minHeight: '100vh',
    padding: '40px 20px 80px',
    background:
      'radial-gradient(circle at 12% 15%, rgba(255, 177, 136, 0.35), transparent 48%),' +
      'radial-gradient(circle at 88% 18%, rgba(255, 107, 107, 0.18), transparent 52%),' +
      'radial-gradient(circle at 50% 80%, rgba(255, 215, 194, 0.6), transparent 55%),' +
      '#fffaf6',
  },
  loading: { textAlign: 'center', fontSize: '20px', padding: '100px' },
  error: { textAlign: 'center', color: 'red', fontSize: '18px' },
  backLink: { display: 'inline-block', marginBottom: '16px', color: '#b33a2b', fontWeight: 700 },
  panel: {
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(255,176,136,0.18)',
    padding: '16px',
    boxShadow: '0 12px 24px rgba(25,15,10,0.08)',
    alignSelf: 'start',
  },
  panelTitle: { margin: '0 0 6px', fontWeight: 700, color: '#1c1916' },
  panelText: { margin: '0 0 8px', color: '#6f655c', lineHeight: 1.5 },
};

export default ProductDetailPage;
