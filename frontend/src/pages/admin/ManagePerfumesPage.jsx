// Admin catalog management and stock overview.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchPerfumesList,
  togglePerfumeAvailability,
  deletePerfume,
} from "../../application/useCases/perfume";

export default function ManagePerfumesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [selected, setSelected] = useState(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const perfumes = await fetchPerfumesList();
      setData(Array.isArray(perfumes) ? perfumes : []);
    } catch (err) {
      setError(err?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggleAvailability(id, available) {
    setBusyId(id);
    setError(null);
    try {
      await togglePerfumeAvailability(id, available);
      await refresh(); 
    } catch (err) {
      setError(err?.message || "Erreur lors de la mise à jour.");
    } finally {
      setBusyId(null);
    }
  }

  async function deletePerfumeLocal(id) {
    if (!window.confirm("Supprimer ce parfum ?")) return;
    setBusyId(id);
    setError(null);
    try {
      await deletePerfume(id);
      setData((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      setError(err?.message || "Erreur lors de la suppression.");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    return data.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(filter.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  const lowStockInfo = useMemo(() => {
    const low = data.filter((p) => {
      const stockValue = Number(p.stock ?? 0);
      return stockValue > 0 && stockValue < 4;
    });

    const lowest = low.reduce((min, p) => {
      const stockValue = Number(p.stock ?? 0);
      return stockValue < min ? stockValue : min;
    }, Infinity);

    return {
      count: low.length,
      lowest: lowest === Infinity ? null : lowest,
      names: low.map((p) => p.name).filter(Boolean),
    };
  }, [data]);

  useEffect(() => {
    
    if (selected) {
      const stillThere = data.find((p) => p.id === selected.id);
      if (!stillThere) setSelected(null);
      else setSelected(stillThere);
    }
  }, [data, selected]);

  return (
    <div className="admin-manage">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600&display=swap');
        .admin-manage {
          --peach: #ffd7c2;
          --apricot: #ffb088;
          --coral: #ff6b6b;
          --ink: #1c1916;
          --muted: #6f655c;
          min-height: 100vh;
          padding: 56px 20px 80px;
          background:
            radial-gradient(circle at 15% 10%, rgba(255, 176, 136, 0.35), transparent 48%),
            radial-gradient(circle at 85% 16%, rgba(255, 107, 107, 0.2), transparent 55%),
            #fffaf6;
          font-family: "Manrope", "Segoe UI", sans-serif;
          color: var(--ink);
        }
        .admin-manage__wrap { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }
        .admin-manage__header { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
        .admin-manage__title { font-family: "Fraunces", "Times New Roman", serif; font-size: clamp(28px, 4vw, 38px); margin: 0; }
        .admin-manage__subtitle { color: var(--muted); margin: 0; }
        .admin-manage__pill-button {
          padding: 10px 16px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(120deg, #ff6b6b, #ffb088);
          color: #1c1916;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 12px 24px rgba(255, 107, 107, 0.25);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .admin-manage__pill-button:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(255, 107, 107, 0.3); }
        .admin-manage__pill-button:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
        .admin-manage__card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 14px 32px rgba(25, 15, 10, 0.12);
          border: 1px solid rgba(255, 176, 136, 0.2);
        }
        .admin-manage__layout { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        @media (max-width: 1024px) { .admin-manage__layout { grid-template-columns: 1fr; } }
        .admin-manage__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
        .admin-manage__card h3 { margin: 0 0 6px; font-size: 18px; }
        .admin-manage__muted { color: var(--muted); margin: 0; }
        .admin-manage__badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 12px;
          border: 1px solid rgba(255, 107, 107, 0.2);
          background: rgba(255, 107, 107, 0.08);
          color: #b33a2b;
          margin-right: 6px;
        }
        .admin-manage__alert {
          padding: 8px 12px;
          border-radius: 12px;
          background: rgba(255, 107, 107, 0.12);
          border: 1px solid rgba(255, 107, 107, 0.25);
          color: #b33a2b;
          font-weight: 700;
          font-size: 13px;
          margin-top: 12px;
        }
        .admin-manage__low-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 11px;
          border: 1px solid rgba(255, 107, 107, 0.35);
          background: rgba(255, 107, 107, 0.12);
          color: #b33a2b;
          margin-left: 6px;
        }
        .admin-manage__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .admin-manage__ghost {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255, 107, 107, 0.4);
          background: #fff;
          color: #b33a2b;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .admin-manage__danger { background: #fff2f2; color: #b33a2b; border-color: #f5b5b5; }
        .admin-manage__row {
          border: 1px solid rgba(255, 176, 136, 0.2);
          border-radius: 12px;
          padding: 12px;
          background: #fff;
          display: grid;
          gap: 6px;
          cursor: pointer;
          transition: border 0.2s ease, box-shadow 0.2s ease;
        }
        .admin-manage__row:hover { box-shadow: 0 12px 22px rgba(25,15,10,0.08); }
        .admin-manage__row--active { border: 2px solid rgba(255, 107, 107, 0.4); box-shadow: 0 14px 24px rgba(255,107,107,0.16); }
        .admin-manage__row-header { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
        .admin-manage__name { font-weight: 700; }
        .admin-manage__brand { color: var(--muted); font-size: 13px; }
        .admin-manage__status { color: #1c1916; font-weight: 700; text-align: right; }
        .admin-manage__error { color: #b33a2b; margin-top: 10px; font-weight: 700; }
        .admin-manage__side { position: sticky; top: 20px; align-self: start; }
        .admin-manage__side h3 { margin: 0 0 8px; }
        .admin-manage__side p { margin: 0 0 8px; color: var(--muted); }
        .admin-manage__side strong { color: var(--ink); }
      `}</style>

      <div className="admin-manage__wrap">
        <div className="admin-manage__header">
          <div>
            <h1 className="admin-manage__title">Gestion des parfums</h1>
            <p className="admin-manage__subtitle">
              Visualise le stock, active/désactive la disponibilité, édite ou supprime rapidement.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link to="/admin/perfumes/new" className="admin-manage__pill-button">
              Ajouter un parfum
            </Link>
            <button
              className="admin-manage__pill-button"
              onClick={refresh}
              disabled={loading}
              type="button"
            >
              {loading ? "Rafraîchissement..." : "Rafraîchir"}
            </button>
          </div>
        </div>

        <div className="admin-manage__card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrer par nom ou marque"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(28,25,22,0.12)",
                minWidth: 240,
                fontWeight: 700,
                outline: "none",
              }}
            />
            <span className="admin-manage__badge">{filtered.length} références</span>
          </div>

          {error && <p className="admin-manage__error">Erreur: {error}</p>}

          {lowStockInfo.count > 0 && (
            <p className="admin-manage__alert">
              Alerte stock faible: {lowStockInfo.count} reference(s)
              {lowStockInfo.lowest !== null ? ` (min: ${lowStockInfo.lowest})` : ""}.
              {lowStockInfo.names.length > 0 ? ` Parfums: ${lowStockInfo.names.join(", ")}.` : ""}
            </p>
          )}
        </div>

        {loading && <p className="admin-manage__muted">Chargement...</p>}

        <div className="admin-manage__layout">
          <div className="admin-manage__grid">
            {filtered.map((p) => {
              const stockValue = Number(p.stock ?? 0);
              const lowStock = stockValue > 0 && stockValue < 4;

              return (
                <div
                  className={`admin-manage__row ${selected?.id === p.id ? "admin-manage__row--active" : ""}`}
                  key={p.id}
                  onClick={() => setSelected(p)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="admin-manage__row-header">
                    <div>
                      <div className="admin-manage__name">{p.name}</div>
                      <div className="admin-manage__brand">{p.brand || "Marque inconnue"}</div>
                    </div>

                    <div className="admin-manage__status">
                      {p.available ? "Disponible" : "Indisponible"} • Stock: {p.stock ?? 0}
                      {lowStock && <span className="admin-manage__low-badge">Stock faible</span>}
                    </div>
                  </div>

                  <div className="admin-manage__muted">
                    Prix: {p.price ?? "-"} {p.price != null ? "€" : ""}
                  </div>

                  <div className="admin-manage__actions">
                    <Link
                      to={`/admin/perfumes/${p.id}/edit`}
                      className="admin-manage__ghost"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Modifier
                    </Link>

                    <button
                      className="admin-manage__ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAvailability(p.id, p.available);
                      }}
                      disabled={busyId === p.id}
                      type="button"
                    >
                      {p.available ? "Désactiver" : "Activer"}
                    </button>

                    <button
                      className="admin-manage__ghost admin-manage__danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePerfumeLocal(p.id);
                      }}
                      disabled={busyId === p.id}
                      type="button"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="admin-manage__card admin-manage__side">
            <h3>Aperçu produit</h3>

            {selected ? (
              <>
                <p>
                  <strong>Nom:</strong> {selected.name}
                </p>
                <p>
                  <strong>Marque:</strong> {selected.brand || "N/A"}
                </p>
                <p>
                  <strong>Prix:</strong> {selected.price ?? "-"}{" "}
                  {selected.price != null ? "€" : ""}
                </p>
                <p>
                  <strong>Stock:</strong> {selected.stock ?? 0}
                  {Number(selected.stock ?? 0) > 0 && Number(selected.stock ?? 0) < 4 && (
                    <span className="admin-manage__low-badge">Stock faible</span>
                  )}
                </p>
                <p>
                  <strong>Disponible:</strong> {selected.available ? "Oui" : "Non"}
                </p>
                <p>
                  <strong>Format:</strong> {selected.format || "N/A"}
                </p>

                {selected.description && (
                  <p>
                    <strong>Description:</strong> {selected.description}
                  </p>
                )}
                {selected.comment && (
                  <p>
                    <strong>Commentaire:</strong> {selected.comment}
                  </p>
                )}

                <div className="admin-manage__actions" style={{ marginTop: 12 }}>
                  <Link
                    to={`/admin/perfumes/${selected.id}/edit`}
                    className="admin-manage__ghost"
                    style={{ textDecoration: "none" }}
                  >
                    Modifier
                  </Link>

                  <button
                    className="admin-manage__ghost"
                    onClick={() => toggleAvailability(selected.id, selected.available)}
                    disabled={busyId === selected.id}
                    type="button"
                  >
                    {selected.available ? "Désactiver" : "Activer"}
                  </button>

                  <Link
                    to={`/admin/perfumes/new?duplicate=${selected.id}`}
                    className="admin-manage__ghost"
                    style={{ textDecoration: "none" }}
                  >
                    Dupliquer
                  </Link>
                </div>
              </>
            ) : (
              <p className="admin-manage__muted">Sélectionne un parfum dans la liste.</p>
            )}
          </div>
        </div>

        {filtered.length === 0 && !loading && !error && (
          <p className="admin-manage__muted">Aucun parfum trouvé.</p>
        )}
      </div>
    </div>
  );
}
