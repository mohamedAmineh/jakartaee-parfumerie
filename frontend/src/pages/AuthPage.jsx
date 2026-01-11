import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LOGIN_URL = "http://localhost:8080/starter/api/auth/login";
const SIGNUP_URL = "http://localhost:8080/starter/api/users";
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
  const [mode, setMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user") || "null");
  });

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

  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [mode]);

  function handleLogout() {
    localStorage.removeItem("user");
    setCurrentUser(null);
    setSuccess(null);
    setMode("login");
  }

  async function loginUser(loginEmail, loginPassword) {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || `HTTP ${res.status}`);
    }

    const user = await res.json();
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);

    if (isAdminUser(user)) navigate("/admin", { replace: true });
    else setSuccess(`Connecte en tant que ${user.email}.`);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await loginUser(email, password);
        return;
      }

      if (password !== confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas.");
      }

      const res = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          address,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }

      await loginUser(email, password);
      if (!isLogin) setMode("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      {currentUser && !isAdminUser(currentUser) && (
        <div style={styles.info}>
          <p style={styles.infoText}>
            Vous etes deja connecte en tant que {currentUser.email}.
          </p>
          <div style={styles.infoActions}>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={styles.infoButton}
            >
              Aller a l'accueil
            </button>
            <button
              type="button"
              onClick={handleLogout}
              style={styles.infoButtonOutline}
            >
              Se deconnecter
            </button>
          </div>
        </div>
      )}

      <div style={styles.tabRow}>
        <button
          type="button"
          onClick={() => setMode("login")}
          style={isLogin ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          disabled={loading}
        >
          Se connecter
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          style={!isLogin ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          disabled={loading}
        >
          Creer un compte
        </button>
      </div>

      <h2 style={styles.title}>{isLogin ? "Login" : "Creer un compte client"}</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        {!isLogin && (
          <>
            <label style={styles.field}>
              Prenom
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
              />
            </label>

            <label style={styles.field}>
              Nom
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
              />
            </label>
          </>
        )}

        <label style={styles.field}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        {!isLogin && (
          <>
            <label style={styles.field}>
              Telephone
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="^0[0-9]{9}$"
                title="Le numero doit contenir 10 chiffres et commencer par 0"
              />
            </label>

            <label style={styles.field}>
              Adresse
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
              />
            </label>
          </>
        )}

        <label style={styles.field}>
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </label>

        {!isLogin && (
          <label style={styles.field}>
            Confirmer le mot de passe
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>
        )}

        <button type="submit" disabled={loading} style={styles.submit}>
          {loading
            ? isLogin
              ? "Connexion..."
              : "Creation..."
            : isLogin
              ? "Se connecter"
              : "Creer mon compte"}
        </button>
      </form>

      {!isLogin && (
        <p style={styles.note}>Les comptes crees ici sont des comptes client.</p>
      )}

      {success && <p style={styles.success}>{success}</p>}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: { maxWidth: 520, margin: "40px auto", padding: "20px" },
  info: {
    border: "1px solid #ffd5d5",
    background: "#fff4f4",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
  },
  infoText: { marginBottom: "8px", color: "#333" },
  infoActions: { display: "flex", gap: "10px", flexWrap: "wrap" },
  infoButton: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    background: "#ff6b6b",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  infoButtonOutline: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ff6b6b",
    background: "#fff",
    color: "#ff6b6b",
    fontWeight: "bold",
    cursor: "pointer",
  },
  tabRow: { display: "flex", gap: "10px", marginBottom: "16px" },
  tab: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "#fafafa",
    cursor: "pointer",
  },
  tabActive: {
    background: "#ff6b6b",
    borderColor: "#ff6b6b",
    color: "#fff",
    fontWeight: "bold",
  },
  title: { marginBottom: "12px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  submit: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#ff6b6b",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  note: { marginTop: "8px", color: "#666", fontSize: "13px" },
  success: { color: "#1b7f3a", marginTop: "8px" },
  error: { color: "crimson", marginTop: "8px" },
};
