import React from 'react';
import { Link } from 'react-router-dom';

const PerfumeCard = ({ perfume }) => {
  return (
    <div style={styles.card}>
      <h3 style={styles.name}>{perfume.name}</h3>
      <p style={styles.brand}>{perfume.brand}</p>
      <p style={styles.price}>{perfume.price}€</p>
      <p style={styles.stock}>
        {perfume.available ? `Stock: ${perfume.stock}` : 'Rupture de stock'}
      </p>
      <Link to={`/product/${perfume.id}`} style={styles.link}>
        Voir détails →
      </Link>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  name: { fontSize: '20px', fontWeight: 'bold', margin: '10px 0' },
  brand: { color: '#666', fontSize: '14px' },
  price: { fontSize: '24px', color: '#333', fontWeight: 'bold', margin: '10px 0' },
  stock: { fontSize: '14px', color: '#999' },
  link: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '6px',
  },
};

export default PerfumeCard;
