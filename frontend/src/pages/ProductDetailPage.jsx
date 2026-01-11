import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPerfumeById } from '../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [perfume, setPerfume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div style={styles.container}>
      <Link to="/products" style={styles.backLink}>← Retour au catalogue</Link>
      
      <div style={styles.card}>
        <h1 style={styles.name}>{perfume.name}</h1>
        <p style={styles.brand}>Marque : {perfume.brand}</p>
        <p style={styles.price}>{perfume.price}€</p>
        <p style={styles.format}>Format : {perfume.format || 'Non spécifié'}</p>
        <p style={styles.stock}>
          Stock : {perfume.stock} unité(s) - {perfume.available ? '✅ Disponible' : '❌ Rupture'}
        </p>
        
        <button style={styles.button} disabled={!perfume.available}>
          {perfume.available ? 'Ajouter au panier' : 'Indisponible'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px', maxWidth: '800px', margin: '0 auto' },
  loading: { textAlign: 'center', fontSize: '20px', padding: '100px' },
  error: { textAlign: 'center', color: 'red', fontSize: '18px' },
  backLink: { display: 'inline-block', marginBottom: '20px', color: '#007bff' },
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '40px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  },
  name: { fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' },
  brand: { fontSize: '18px', color: '#666', marginBottom: '20px' },
  price: { fontSize: '36px', fontWeight: 'bold', color: '#ff6b6b', marginBottom: '20px' },
  format: { fontSize: '16px', marginBottom: '10px' },
  stock: { fontSize: '16px', marginBottom: '30px' },
  button: {
    padding: '15px 40px',
    fontSize: '18px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default ProductDetailPage;
