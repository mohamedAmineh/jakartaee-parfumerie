import React from 'react';
import { Link } from 'react-router-dom';

const PerfumeCard = ({ perfume, variant = "default" }) => {
  const isSoft = variant === "soft";
  return (
    <div style={isSoft ? stylesSoft.card : styles.card}>
      <h3 style={isSoft ? stylesSoft.name : styles.name}>{perfume.name}</h3>
      <p style={isSoft ? stylesSoft.brand : styles.brand}>{perfume.brand}</p>
      <p style={isSoft ? stylesSoft.price : styles.price}>{perfume.price}€</p>
      <p style={isSoft ? stylesSoft.stock : styles.stock}>
        {perfume.available ? `Stock: ${perfume.stock}` : 'Rupture de stock'}
      </p>
      <Link to={`/product/${perfume.id}`} style={isSoft ? stylesSoft.link : styles.link}>
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

const stylesSoft = {
  card: {
    border: '1px solid rgba(255, 176, 136, 0.2)',
    borderRadius: '16px',
    padding: '18px',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    boxShadow: '0 14px 32px rgba(25,15,10,0.12)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  name: { fontSize: '20px', fontWeight: '700', margin: '8px 0', color: '#1c1916' },
  brand: { color: '#6f655c', fontSize: '14px' },
  price: { fontSize: '22px', color: '#1c1916', fontWeight: '700', margin: '8px 0' },
  stock: { fontSize: '13px', color: '#6f655c' },
  link: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '10px 18px',
    background: 'linear-gradient(120deg, #ff6b6b, #ffb088)',
    color: '#1c1916',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    boxShadow: '0 12px 22px rgba(255,107,107,0.2)',
  },
};

export default PerfumeCard;
