// Authentication page for login and signup flows.

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser, signupUser, logoutUser } from "../application/useCases/auth";
import { getCurrentUser } from "../application/useCases/session";

const getRoleValue = (role) => {
  if (!role) return "";
  if (typeof role === "string") return role;
  if (typeof role === "object") {
    if (role.name) return role.name;
    if (role.role) return role.role;
  }
  return String(role);
};

const isAdminUser = (user) => getRoleValue(user?.role).toUpperCase() === "ADMIN";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [mode, setMode] = useState("login"); 
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isLogin = mode === "login";

  
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setError(null);
    setSuccess(null);
    setAnimKey((k) => k + 1);
  }, [mode]);

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    setSuccess(null);
    setMode("login");
  }

  async function handleLogin(loginEmail, loginPassword) {
    const user = await loginUser(loginEmail, loginPassword);
    setCurrentUser(user);
    if (isAdminUser(user)) {
      navigate("/admin", { replace: true });
      return;
    }

    setSuccess(`Connecté en tant que ${user.email}.`);
    navigate(from, { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        await handleLogin(email, password);
        return;
      }

      if (password !== confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas.");
      }

      const user = await signupUser({
        firstName,
        lastName,
        email,
        phone,
        password,
        address,
      });
      setCurrentUser(user);
      if (isAdminUser(user)) {
        navigate("/admin", { replace: true });
        return;
      }
      setSuccess(`Connecté en tant que ${user.email}.`);
      navigate(from, { replace: true });
      setMode("login");
    } catch (err) {
      setError(err?.message || "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <style>{css}</style>

      
      <div style={styles.center}>
        <div style={styles.shell}>
          <div style={styles.hero}>
            <h1 style={styles.title}>Compte</h1>
            <p style={styles.subtitle}>
              Connecte-toi pour commander, ou crée un compte client.
            </p>
          </div>

          {currentUser ? (
            <div style={styles.card} className="auth-anim">
              <div style={styles.cardHeader}>
                <h2 style={styles.h2}>Déjà connecté</h2>
                <span style={styles.badge}>
                  {String(getRoleValue(currentUser.role) || "CLIENT").toUpperCase()}
                </span>
              </div>

              <p style={styles.pText}>
                Vous êtes déjà connecté en tant que <b>{currentUser.email}</b>.
              </p>

              <div style={styles.row}>
                <button
                  type="button"
                  onClick={() =>
                    navigate(isAdminUser(currentUser) ? "/admin" : "/", {
                      replace: true,
                    })
                  }
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                >
                  Continuer
                </button>

                <button type="button" onClick={handleLogout} style={styles.btn}>
                  Déconnexion
                </button>
              </div>

              <div style={styles.note}>
                Les comptes créés ici sont des comptes client.
              </div>
            </div>
          ) : (
            <div style={styles.card}>
              <div style={styles.tabs}>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  style={{
                    ...styles.tab,
                    ...(isLogin ? styles.tabActive : {}),
                  }}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  style={{
                    ...styles.tab,
                    ...(!isLogin ? styles.tabActive : {}),
                  }}
                >
                  Inscription
                </button>
              </div>

              
              <div key={animKey} className="auth-anim">
                {success && <div style={styles.success}>{success}</div>}
                {error && <div style={styles.error}>Erreur: {error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                  {!isLogin && (
                    <>
                      <div style={styles.grid2}>
                        <div>
                          <label style={styles.label}>Prénom</label>
                          <input
                            style={styles.input}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Ex: Sarah"
                            required
                          />
                        </div>

                        <div>
                          <label style={styles.label}>Nom</label>
                          <input
                            style={styles.input}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Ex: Martin"
                            required
                          />
                        </div>
                      </div>

                      <div style={styles.grid2}>
                        <div>
                          <label style={styles.label}>Téléphone</label>
                          <input
                            style={styles.input}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="06xxxxxxxx"
                            required
                          />
                        </div>

                        <div>
                          <label style={styles.label}>Adresse</label>
                          <input
                            style={styles.input}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Adresse de livraison"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input
                      style={styles.input}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="email@exemple.com"
                      required
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Mot de passe</label>
                    <input
                      style={styles.input}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {!isLogin && (
                    <div style={styles.field}>
                      <label style={styles.label}>Confirmer le mot de passe</label>
                      <input
                        style={styles.input}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...styles.btn,
                      ...styles.btnPrimary,
                      ...(loading ? styles.btnDisabled : {}),
                    }}
                  >
                    {loading
                      ? "Veuillez patienter..."
                      : isLogin
                        ? "Se connecter"
                        : "Créer un compte"}
                  </button>

                  {!isLogin && (
                    <div style={styles.note}>
                      Les comptes créés ici sont des comptes client.
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const css = `

@keyframes authFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.auth-anim {
  animation: authFadeUp 240ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .auth-anim { animation: none; }
}
`;

const styles = {
  page: {
    minHeight: "calc(100vh - 70px)",
    padding: "28px 18px 60px",
    background:
      "radial-gradient(circle at 12% 15%, rgba(255, 177, 136, 0.20), transparent 48%), radial-gradient(circle at 88% 18%, rgba(255, 107, 107, 0.14), transparent 52%), #fffaf6",
  },

  
  center: {
    minHeight: "calc(100vh - 70px - 28px - 60px)", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  
  shell: { width: "100%", maxWidth: 520, margin: "0 auto" },

  hero: { marginBottom: 14, textAlign: "center" },
  title: {
    margin: 0,
    fontFamily: "Fraunces, Times New Roman, serif",
    fontWeight: 700,
    fontSize: 34,
    color: "#1c1916",
  },
  subtitle: { margin: "6px 0 0", color: "#6f655c", fontWeight: 700 },

  card: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(28,25,22,0.08)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 12px 26px rgba(25, 15, 10, 0.06)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  h2: { margin: 0, fontSize: 18, fontWeight: 900, color: "#1c1916" },
  pText: { margin: "10px 0 0", color: "#1c1916", fontWeight: 700 },

  tabs: {
    display: "inline-flex",
    borderRadius: 999,
    padding: 4,
    background: "rgba(28,25,22,0.06)",
    border: "1px solid rgba(28,25,22,0.08)",
    gap: 4,
    marginBottom: 12,
    justifyContent: "center",
    width: "100%",
  },
  tab: {
    flex: 1,
    border: 0,
    background: "transparent",
    cursor: "pointer",
    padding: "10px 14px",
    borderRadius: 999,
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    fontWeight: 900,
    fontSize: 13,
    color: "#6f655c",
  },
  tabActive: {
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(28,25,22,0.08)",
    color: "#1c1916",
  },

  form: { display: "grid", gap: 12, marginTop: 6 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  field: { display: "grid", gap: 6 },

  label: { fontWeight: 900, color: "#1c1916", fontSize: 13 },
  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 12,
    border: "1px solid rgba(28,25,22,0.12)",
    background: "rgba(255,255,255,0.85)",
    outline: "none",
    fontWeight: 700,
    color: "#1c1916",
  },

  row: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },

  btn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(28,25,22,0.10)",
    background: "rgba(255,255,255,0.85)",
    fontWeight: 900,
    cursor: "pointer",
    width: "100%",
  },
  btnPrimary: {
    border: "1px solid rgba(255,107,107,0.40)",
    background:
      "linear-gradient(135deg, rgba(255, 107, 107, 0.22), rgba(255, 177, 136, 0.22))",
    color: "#b33a2b",
  },
  btnDisabled: { opacity: 0.65, cursor: "not-allowed" },

  success: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(34, 197, 94, 0.25)",
    background: "rgba(34, 197, 94, 0.10)",
    color: "#166534",
    fontWeight: 800,
    marginBottom: 10,
  },
  error: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,107,107,0.25)",
    background: "rgba(255,107,107,0.12)",
    color: "#b33a2b",
    fontWeight: 800,
    marginBottom: 10,
  },

  note: {
    marginTop: 12,
    padding: 10,
    borderRadius: 14,
    border: "1px solid rgba(28,25,22,0.08)",
    background: "rgba(28,25,22,0.04)",
    color: "#6f655c",
    fontWeight: 800,
    fontSize: 13,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,107,107,0.30)",
    background: "rgba(255,107,107,0.10)",
    color: "#b33a2b",
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.2,
  },
};
