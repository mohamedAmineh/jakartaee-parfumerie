// Filter controls for the product catalog list.

import React from 'react';

const FilterBar = ({
  brands = [],
  selectedBrand,
  onBrandChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}) => {
  return (
    <div style={styles.container}>
      
      <div style={styles.group}>
        <label style={styles.label}>Marque</label>
        <select
          value={selectedBrand}
          onChange={(e) => onBrandChange(e.target.value)}
          style={styles.select}
        >
          <option value="">Toutes</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      
      <div style={styles.group}>
        <label style={styles.label}>Prix min</label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          style={styles.input}
          placeholder="0"
        />
      </div>

      
      <div style={styles.group}>
        <label style={styles.label}>Prix max</label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          style={styles.input}
          placeholder="300"
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    margin: '10px 0 20px',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '120px',
  },
  label: {
    fontSize: '13px',
    color: '#555',
    marginBottom: '4px',
  },
  select: {
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  input: {
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
};

export default FilterBar;
