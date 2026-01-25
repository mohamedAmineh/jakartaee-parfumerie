import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { fetchPerfumesList } from "../application/useCases/perfume";

const fallbackPerfumes = [
  { id: "lueur-ambre", name: "Lueur d'Ambre", brand: "Maison Lumiere", price: 129 },
  { id: "brume-figue", name: "Brume de Figue", brand: "Terra Verde", price: 105 },
  { id: "velours-fume", name: "Velours Fume", brand: "Noir Atelier", price: 155 },
  { id: "ciel-musc", name: "Ciel de Musc", brand: "Atelier Nord", price: 95 },
];

const signatureCollections = [
  {
    title: "Floraux lumineux",
    text: "Notes solaires, pétales éclatants, une douceur qui tient toute la journée.",
    accent: "Bergamote, jasmin, fleur d'oranger",
  },
  {
    title: "Boisés veloutés",
    text: "Bois clairs, épices suaves, un sillage enveloppant et chic.",
    accent: "Santal, fève tonka, poivre rose",
  },
  {
    title: "Ambres profonds",
    text: "Résines et vanille, chaleur sophistiquée pour les soirées lentes.",
    accent: "Ambre, vanille, benjoin",
  },
];

export default function HomePage() {
  const { data: perfumes, loading, error } = useFetch(fetchPerfumesList);
  const safePerfumes = useMemo(() => {
    return Array.isArray(perfumes) ? perfumes : [];
  }, [perfumes]);

  const featuredPerfumes = useMemo(() => {
    return safePerfumes.filter((perfume) => perfume?.available).slice(0, 4);
  }, [safePerfumes]);

  const showSkeletons = loading && featuredPerfumes.length === 0;
  const showcasePerfumes = featuredPerfumes.length > 0 ? featuredPerfumes : fallbackPerfumes;
  const year = new Date().getFullYear();

  return (
    <div className="home">
      <style>{`
        .home {
          --ink: #1c1916;
          --muted: #6f655c;
          --accent: #ff6b6b;
          --accent-soft: #ffb088;
          --paper: #fff7f0;
          --shadow: 0 22px 50px rgba(25, 15, 10, 0.16);
          position: relative;
          overflow: hidden;
          padding: 36px 20px 0;
          background:
            radial-gradient(circle at 8% 20%, rgba(255, 176, 136, 0.35), transparent 52%),
            radial-gradient(circle at 92% 12%, rgba(255, 107, 107, 0.18), transparent 50%),
            linear-gradient(180deg, rgba(255, 252, 248, 0.96), rgba(255, 246, 238, 0.9));
        }

        .home-glow {
          position: absolute;
          z-index: 0;
          border-radius: 999px;
          filter: blur(2px);
          opacity: 0.8;
          pointer-events: none;
        }

        .glow-one {
          width: 420px;
          height: 420px;
          top: -140px;
          right: -140px;
          background: radial-gradient(circle, rgba(255, 176, 136, 0.4), transparent 70%);
          animation: floatGlow 10s ease-in-out infinite;
        }

        .glow-two {
          width: 360px;
          height: 360px;
          bottom: 140px;
          left: -120px;
          background: radial-gradient(circle, rgba(255, 107, 107, 0.28), transparent 70%);
          animation: floatGlow 12s ease-in-out infinite reverse;
        }

        .wrap {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .hero {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
          align-items: center;
          padding: 24px 0 40px;
        }

        .hero-kicker {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 800;
          color: rgba(122, 61, 44, 0.7);
        }

        .hero-title {
          font-family: "Fraunces", "Times New Roman", serif;
          font-size: clamp(32px, 5vw, 54px);
          line-height: 1.05;
          margin: 12px 0 16px;
          color: var(--ink);
        }

        .hero-lead {
          font-size: 16px;
          line-height: 1.6;
          color: var(--muted);
          max-width: 520px;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin: 22px 0 18px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 18px;
          border-radius: 999px;
          font-weight: 800;
          text-decoration: none;
          border: 1px solid transparent;
          font-size: 14px;
        }

        .btn-primary {
          background: linear-gradient(120deg, var(--accent), var(--accent-soft));
          color: var(--ink);
          box-shadow: 0 18px 30px rgba(255, 107, 107, 0.24);
        }

        .btn-ghost {
          background: rgba(255, 255, 255, 0.9);
          color: var(--ink);
          border-color: rgba(28, 25, 22, 0.12);
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 14px;
          margin-top: 12px;
        }

        .stat {
          padding: 12px 14px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 176, 136, 0.2);
          box-shadow: 0 12px 26px rgba(25, 15, 10, 0.08);
        }

        .stat span {
          display: block;
          font-weight: 800;
          font-size: 18px;
        }

        .stat small {
          color: var(--muted);
        }

        .hero-visual {
          position: relative;
          min-height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-card {
          width: min(360px, 100%);
          background: rgba(255, 255, 255, 0.92);
          border-radius: 24px;
          padding: 24px;
          border: 1px solid rgba(255, 176, 136, 0.35);
          box-shadow: var(--shadow);
          backdrop-filter: blur(6px);
          position: relative;
          overflow: hidden;
          animation: cardLift 6s ease-in-out infinite;
        }

        .hero-card::after {
          content: "";
          position: absolute;
          inset: -40% 50% auto -40%;
          height: 120%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.7), transparent);
          transform: rotate(12deg);
          animation: sheen 5s ease-in-out infinite;
        }

        .hero-card h3 {
          margin: 10px 0 6px;
          font-size: 22px;
        }

        .hero-card p {
          color: var(--muted);
          font-size: 14px;
          margin-bottom: 14px;
        }

        .hero-chip {
          position: absolute;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 176, 136, 0.3);
          box-shadow: 0 10px 20px rgba(25, 15, 10, 0.12);
          animation: floatChip 6s ease-in-out infinite;
        }

        .chip-top {
          top: 18px;
          left: -10px;
        }

        .chip-bottom {
          bottom: 22px;
          right: 0;
          animation-delay: 1.5s;
        }

        .hero-orb {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 107, 107, 0.35), transparent 70%);
          right: 12px;
          top: -18px;
          animation: floatGlow 8s ease-in-out infinite;
        }

        .note-line {
          display: grid;
          grid-template-columns: 64px 1fr;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .note-tag {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(122, 61, 44, 0.7);
        }

        .note-pill {
          padding: 6px 10px;
          border-radius: 999px;
          background: linear-gradient(120deg, rgba(255, 107, 107, 0.12), rgba(255, 176, 136, 0.2));
          border: 1px solid rgba(255, 176, 136, 0.35);
        }

        .ticker {
          margin: 20px 0 40px;
          overflow: hidden;
          border-radius: 999px;
          border: 1px solid rgba(255, 176, 136, 0.3);
          background: rgba(255, 255, 255, 0.7);
        }

        .ticker-track {
          display: flex;
          gap: 18px;
          padding: 10px 14px;
          width: max-content;
          animation: ticker 16s linear infinite;
          font-size: 13px;
          font-weight: 700;
          color: var(--muted);
        }

        .section-head {
          margin: 10px 0 20px;
        }

        .section-head h2 {
          font-size: clamp(24px, 4vw, 36px);
        }

        .section-head p {
          color: var(--muted);
          max-width: 520px;
        }

        .signature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 46px;
        }

        .signature-card {
          padding: 18px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(255, 176, 136, 0.25);
          box-shadow: 0 14px 32px rgba(25, 15, 10, 0.12);
        }

        .signature-card span {
          display: block;
          font-size: 12px;
          margin-top: 10px;
          font-weight: 700;
          color: rgba(122, 61, 44, 0.7);
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .featured-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 18px;
          padding: 18px;
          border: 1px solid rgba(255, 176, 136, 0.25);
          box-shadow: 0 12px 28px rgba(25, 15, 10, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .featured-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(25, 15, 10, 0.16);
        }

        .featured-card h3 {
          margin-bottom: 6px;
          font-size: 18px;
        }

        .featured-card p {
          color: var(--muted);
          font-size: 13px;
        }

        .featured-price {
          font-weight: 800;
          margin-top: 8px;
          font-size: 18px;
        }

        .featured-link {
          display: inline-flex;
          margin-top: 10px;
          font-weight: 700;
          color: #b33a2b;
          text-decoration: none;
        }

        .skeleton {
          height: 160px;
          border-radius: 18px;
          background: linear-gradient(120deg, rgba(255, 255, 255, 0.6), rgba(255, 240, 232, 0.8), rgba(255, 255, 255, 0.6));
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }

        .atelier {
          margin: 50px 0;
          padding: 26px;
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 176, 136, 0.2);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .atelier-step {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 176, 136, 0.25);
        }

        .atelier-step span {
          font-weight: 800;
          font-size: 14px;
          color: #b33a2b;
        }

        .newsletter {
          margin: 50px 0 60px;
          padding: 28px;
          border-radius: 24px;
          background: linear-gradient(120deg, rgba(255, 107, 107, 0.18), rgba(255, 176, 136, 0.22));
          border: 1px solid rgba(255, 176, 136, 0.35);
          display: grid;
          gap: 18px;
        }

        .newsletter-form {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .newsletter input {
          flex: 1;
          min-width: 220px;
          padding: 12px 14px;
          border-radius: 999px;
          border: 1px solid rgba(28, 25, 22, 0.16);
          background: rgba(255, 255, 255, 0.9);
          font-family: inherit;
        }

        .newsletter button {
          padding: 12px 18px;
          border-radius: 999px;
          border: none;
          font-weight: 800;
          background: rgba(28, 25, 22, 0.9);
          color: #fff;
          cursor: pointer;
        }

        .footer {
          margin-top: 60px;
          padding: 30px 0 40px;
          border-top: 1px solid rgba(255, 176, 136, 0.25);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .footer a {
          color: var(--muted);
          text-decoration: none;
          display: block;
          margin-top: 6px;
          font-size: 14px;
        }

        .footer-bottom {
          margin-top: 20px;
          font-size: 13px;
          color: var(--muted);
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes floatGlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(12px); }
        }

        @keyframes floatChip {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes cardLift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes sheen {
          0% { transform: translateX(-20%) rotate(12deg); opacity: 0; }
          30% { opacity: 1; }
          60% { transform: translateX(60%) rotate(12deg); opacity: 0; }
          100% { transform: translateX(60%) rotate(12deg); opacity: 0; }
        }

        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @media (max-width: 900px) {
          .hero {
            padding-top: 0;
          }
        }

        @media (max-width: 640px) {
          .hero-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-visual {
            min-height: 320px;
          }
        }
      `}</style>

      <div className="home-glow glow-one" />
      <div className="home-glow glow-two" />

      <div className="wrap">
        <section className="hero">
          <div>
            <p className="hero-kicker">Maison Parfumerie</p>
            <h1 className="hero-title">Un parfum qui vous ressemble.</h1>
            <p className="hero-lead">
              Parfums composés en petites séries, pour ceux qui ne veulent pas sentir comme tout le monde.

            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary">
                Explorer le catalogue
              </Link>
              <Link to="/auth" className="btn btn-ghost">
                Créer un compte
              </Link>
            </div>
            <div className="hero-stats stagger">
              <div className="stat">
                <span>48h</span>
                <small>Livraison soignée</small>
              </div>
              <div className="stat">
                <span>120+</span>
                <small>Références exclusives</small>
              </div>
              <div className="stat">
                <span>4.9/5</span>
                <small>Retours clients</small>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orb" />
            <div className="hero-chip chip-top">Sillage aérien</div>
            <div className="hero-chip chip-bottom">Naturel 94%</div>
            <div className="hero-card">
              <span className="note-tag">Collection signature</span>
              <h3>Étoile d'Ambre</h3>
              <p>Ambre chaud, vanille satinée, bois de santal.</p>
              <div className="note-line">
                <span className="note-tag">Tête</span>
                <div className="note-pill">Bergamote, poire</div>
              </div>
              <div className="note-line">
                <span className="note-tag">Cœur</span>
                <div className="note-pill">Jasmin, iris</div>
              </div>
              <div className="note-line">
                <span className="note-tag">Fond</span>
                <div className="note-pill">Ambre, musc blanc</div>
              </div>
            </div>
          </div>
        </section>

        <div className="ticker">
          <div className="ticker-track">
            <span>Fleurs blanches</span>
            <span>Bois ambrés</span>
            <span>Épices douces</span>
            <span>Accords marins</span>
            <span>Musc velouté</span>
            <span>Notes gourmandes</span>
            <span>Fleurs blanches</span>
            <span>Bois ambrés</span>
            <span>Épices douces</span>
            <span>Accords marins</span>
            <span>Musc velouté</span>
            <span>Notes gourmandes</span>
          </div>
        </div>

        <section>
          <div className="section-head">
            <h2>Collections pensées pour vous</h2>
            <p>
              Trois familles olfactives pour habiller chaque moment, du matin lumineux aux soirées
              enveloppantes.
            </p>
          </div>
          <div className="signature-grid stagger">
            {signatureCollections.map((collection) => (
              <div key={collection.title} className="signature-card">
                <h3>{collection.title}</h3>
                <p>{collection.text}</p>
                <span>{collection.accent}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="section-head">
            <h2>Nos bestsellers</h2>
            <p>
              Une sélection de parfums adorés par la communauté. Parfaits pour un cadeau ou pour
              s'offrir un instant signature.
            </p>
          </div>
          <div className="featured-grid">
            {showSkeletons &&
              Array.from({ length: 4 }).map((_, index) => (
                <div className="skeleton" key={`skeleton-${index}`} />
              ))}
            {!showSkeletons &&
              showcasePerfumes.map((perfume) => (
                <div className="featured-card" key={perfume.id ?? perfume.name}>
                  <h3>{perfume.name}</h3>
                  <p>{perfume.brand}</p>
                  <div className="featured-price">{perfume.price}€</div>
                  {perfume.id && (
                    <Link to={`/product/${perfume.id}`} className="featured-link">
                      Voir la fiche →
                    </Link>
                  )}
                </div>
              ))}
            {!showSkeletons && showcasePerfumes.length === 0 && (
              <p>{error ? "Impossible de charger les bestsellers." : "Aucun parfum disponible."}</p>
            )}
          </div>
        </section>

        <section className="atelier">
          <div>
            <h2>Notre atelier</h2>
            <p className="hero-lead">
              Chaque formule est testée, affinée et assemblée à la main. Nous jouons avec les
              textures pour créer un sillage inoubliable.
            </p>
          </div>
          <div className="atelier-step">
            <span>01 · Sélection</span>
            <p>Ingrédients sourcés auprès de maisons éthiques et durables.</p>
          </div>
          <div className="atelier-step">
            <span>02 · Accord</span>
            <p>Assemblage précis pour révéler un équilibre entre puissance et finesse.</p>
          </div>
          <div className="atelier-step">
            <span>03 · Finition</span>
            <p>Macération lente pour une tenue longue et un sillage soyeux.</p>
          </div>
        </section>

        <section className="newsletter">
          <div>
            <h2>Recevez nos rituels parfumés</h2>
            <p className="hero-lead">
              Conseils, nouveautés et éditions limitées directement dans votre boîte mail.
            </p>
          </div>
          <div className="newsletter-form">
            <label className="sr-only" htmlFor="newsletter-email">
              Email
            </label>
            <input id="newsletter-email" type="email" placeholder="Votre email" />
            <button type="button">Recevoir</button>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-grid">
            <div>
              <h3>Parfumerie</h3>
              <p className="hero-lead">
                Maison créative dédiée aux parfums d'auteur, entre tradition et modernité.
              </p>
            </div>
            <div>
              <h4>Maison</h4>
              <Link to="/products">Catalogue</Link>
              <Link to="/orders">Mes commandes</Link>
              <Link to="/profile">Mon profil</Link>
            </div>
            <div>
              <h4>Services</h4>
              <a href="mailto:bonjour@parfumerie.com">Contact</a>
              <a href="tel:+33123456789">+33 1 23 45 67 89</a>
              <a href="#">Livraison & retours</a>
            </div>
            <div>
              <h4>Atelier</h4>
              <a href="#">Journal olfactif</a>
              <a href="#">Éditions limitées</a>
              <a href="#">Offrir un parfum</a>
            </div>
          </div>
          <div className="footer-bottom">© {year} Parfumerie. Tous droits réservés.</div>
        </footer>
      </div>
    </div>
  );
}
