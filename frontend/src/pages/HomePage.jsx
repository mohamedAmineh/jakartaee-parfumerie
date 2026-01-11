import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bienvenue sur Parfumerie 🌸</h1>
      <p style={styles.subtitle}>
        Découvrez notre collection de parfums d'exception
      </p>
      <Link to="/products" style={styles.button}>
        Explorer le catalogue
      </Link>
      <Link to="/auth">Sign in / Sign up</Link>
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
};

export default HomePage;
