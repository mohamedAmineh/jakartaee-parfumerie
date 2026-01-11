import React, { useState, useMemo } from 'react';
import { useFetch } from '../hooks/useFetch';
import { fetchPerfumes } from '../services/api';
import PerfumeCard from '../components/PerfumeCard';
import SearchBar from '../components/SearchBar';

const ProductsPage = () => {
  const { data: perfumes, loading, error } = useFetch(fetchPerfumes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // Filtrer avec useMemo pour optimiser les performances
  const filteredPerfumes = useMemo(() => {
    return perfumes
      .filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((p) =>
        selectedBrand ? p.brand === selectedBrand : true
      );
  }, [perfumes, searchTerm, selectedBrand]);

  // Extraire les marques uniques (utilisation de reduce)
  const brands = useMemo(() => {
    return perfumes.reduce((acc, perfume) => {
      if (!acc.includes(perfume.brand)) {
        acc.push(perfume.brand);
      }
      return acc;
    }, []);
  }, [perfumes]);

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (error) return <div style={styles.error}>Erreur: {error}</div>;

  return (
    <div style={styles.container}>
      <h1>Catalogue de Parfums</h1>
      
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Filtre par marque */}
      <div style={styles.filterContainer}>
        <label>Marque : </label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          style={styles.select}
        >
          <option value="">Toutes les marques</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <p style={styles.count}>
        {filteredPerfumes.length} parfum(s) trouvé(s)
      </p>

      <div style={styles.grid}>
        {filteredPerfumes.map((perfume) => (
          <PerfumeCard key={perfume.id} perfume={perfume} />
        ))}
      </div>

      {filteredPerfumes.length === 0 && (
        <p style={styles.noResults}>Aucun parfum trouvé</p>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' },
  loading: { textAlign: 'center', fontSize: '20px', padding: '100px' },
  error: { textAlign: 'center', color: 'red', fontSize: '18px' },
  filterContainer: { margin: '20px 0' },
  select: { padding: '8px', fontSize: '16px', marginLeft: '10px' },
  count: { color: '#666', marginBottom: '20px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  noResults: { textAlign: 'center', fontSize: '18px', color: '#999', marginTop: '40px' },
};

export default ProductsPage;
