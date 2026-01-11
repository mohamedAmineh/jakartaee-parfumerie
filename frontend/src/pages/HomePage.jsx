import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bienvenue sur Parfumerie 🌸</h1>
      <p style={styles.subtitle}>
        Découvrez notre collection de parfums d'exception
      </p>
      <div style={styles.actions}>
        <Link to="/products" style={styles.button}>
          Explorer le catalogue
        </Link>
        <Link to="/auth" style={styles.secondaryButton}>
          Sign in / Sign up
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '100px 20px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '20px',
    color: '#666',
    marginBottom: '40px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  button: {
    display: 'inline-block',
    padding: '15px 40px',
    backgroundColor: '#ff6b6b',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '30px',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  secondaryButton: {
    display: 'inline-block',
    padding: '12px 28px',
    borderRadius: '30px',
    border: '2px solid #ff6b6b',
    color: '#ff6b6b',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};

export default HomePage;
