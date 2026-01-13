import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { fetchPerfumesList } from "../application/useCases/perfume";
import PerfumeCard from "../components/PerfumeCard";
import SearchBar from "../components/SearchBar";
import { isAuthenticated } from "../application/useCases/session";

const ProductsPage = () => {
  const { data: perfumes, loading, error } = useFetch(fetchPerfumesList);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const safePerfumes = Array.isArray(perfumes) ? perfumes : [];

  const filteredPerfumes = useMemo(() => {
    return safePerfumes
      .filter((p) => String(p?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((p) => (selectedBrand ? p?.brand === selectedBrand : true));
  }, [safePerfumes, searchTerm, selectedBrand]);

  const isLoggedIn = isAuthenticated();

  const brands = useMemo(() => {
    return safePerfumes.reduce((acc, perfume) => {
      const b = perfume?.brand;
      if (b && !acc.includes(b)) acc.push(b);
      return acc;
    }, []);
  }, [safePerfumes]);

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (error) return <div style={styles.error}>Erreur: {String(error)}</div>;

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600&display=swap');
        .catalog-wrap {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .catalog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .catalog-title {
          font-family: "Fraunces", "Times New Roman", serif;
          font-size: clamp(28px, 4vw, 38px);
          margin: 0;
          color: #1c1916;
        }
        .catalog-subtitle {
          color: #6f655c;
          margin: 0;
        }
        .catalog-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 14px 32px rgba(25, 15, 10, 0.12);
          border: 1px solid rgba(255, 176, 136, 0.2);
        }
        .catalog-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }
        .catalog-select {
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(28,25,22,0.12);
          min-width: 220px;
          background: #fff;
        }
        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
      `}</style>

      <div className="catalog-wrap">
        <div className="catalog-header">
          <div>
            <h1 className="catalog-title">Catalogue de Parfums</h1>
            <p className="catalog-subtitle">
              Explore des references fines avec un style harmonisé à l’espace admin.
            </p>
          </div>

          {/* optionnel: boutons à droite (tu avais import Link + styles.badge/cartBtn, je les remets propre) */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {!isLoggedIn ? (
              <Link to="/auth" style={styles.cartBtn}>
                Se connecter
              </Link>
            ) : (
              <span style={styles.badge}>Connecté</span>
            )}

            <Link to="/cart" style={styles.cartBtn}>
              Panier
            </Link>
          </div>
        </div>

        <div className="catalog-card" style={{ marginBottom: 18 }}>
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          <div className="catalog-filter">
            <label>Marque :</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="catalog-select"
            >
              <option value="">Toutes les marques</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="catalog-grid">
          {filteredPerfumes.map((perfume) => (
            <PerfumeCard key={perfume.id} perfume={perfume} variant="soft" />
          ))}
        </div>

        {filteredPerfumes.length === 0 && <p style={styles.noResults}>Aucun parfum trouvé</p>}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 20px 80px",
    background:
      "radial-gradient(circle at 12% 15%, rgba(255, 177, 136, 0.35), transparent 48%)," +
      "radial-gradient(circle at 88% 18%, rgba(255, 107, 107, 0.18), transparent 52%)," +
      "radial-gradient(circle at 50% 80%, rgba(255, 215, 194, 0.6), transparent 55%)," +
      "#fffaf6",
  },
  loading: { textAlign: "center", fontSize: "20px", padding: "100px" },
  error: { textAlign: "center", color: "red", fontSize: "18px" },
  badge: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255, 107, 107, 0.12)",
    color: "#b33a2b",
    fontWeight: 700,
    fontSize: "13px",
  },
  cartBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,107,107,0.35)",
    background: "#fff",
    color: "#b33a2b",
    fontWeight: 700,
    textDecoration: "none",
  },
  noResults: { textAlign: "center", fontSize: "18px", color: "#999", marginTop: "20px" },
};

export default ProductsPage;
