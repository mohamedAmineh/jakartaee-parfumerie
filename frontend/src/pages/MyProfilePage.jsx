import { useState } from "react";
import { Link } from "react-router-dom";
import { encodeBasicAuth, getAuthHeaders } from "../services/auth";

const API = "http://localhost:8080/starter/api/users";
const LOGIN_URL = "http://localhost:8080/starter/api/auth/login";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function MyProfilePage() {
  const [user, setUser] = useState(getStoredUser);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const updateLocalUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setFirstName(nextUser?.firstName || "");
    setLastName(nextUser?.lastName || "");
    setPhone(nextUser?.phone || "");
    setAddress(nextUser?.address || "");
  };

  const buildProfilePayload = () => ({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: phone.trim(),
    address: address.trim(),
  });

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!user?.id) {
      setProfileError("Utilisateur introuvable.");
      return;
    }

    const authHeaders = getAuthHeaders();
    if (!authHeaders.Authorization) {
      setProfileError("Reconnecte-toi pour modifier ton profil.");
      return;
    }

    const payload = buildProfilePayload();
    if (!payload.firstName || !payload.lastName || !payload.phone) {
      setProfileError("Prenom, nom et telephone sont obligatoires.");
      return;
    }

    setProfileLoading(true);
    try {
      const res = await fetch(`${API}/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        if (res.status === 401) {
          throw new Error("Session expiree. Reconnecte-toi.");
        }
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const updated = await res.json();
      updateLocalUser(updated);
      setProfileSuccess("Profil mis a jour.");
    } catch (err) {
      setProfileError(err?.message || "Erreur lors de la mise a jour.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!user?.id || !user?.email) {
      setPasswordError("Utilisateur introuvable.");
      return;
    }
    if (!oldPassword || !newPassword) {
      setPasswordError("Ancien et nouveau mot de passe requis.");
      return;
    }

    const authHeaders = getAuthHeaders();
    if (!authHeaders.Authorization) {
      setPasswordError("Reconnecte-toi pour modifier ton mot de passe.");
      return;
    }

    setPasswordLoading(true);
    try {
      const check = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: oldPassword }),
      });
      if (!check.ok) {
        throw new Error("Ancien mot de passe incorrect.");
      }

      const res = await fetch(`${API}/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) {
        const msg = await res.text();
        if (res.status === 401) {
          throw new Error("Session expiree. Reconnecte-toi.");
        }
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const updated = await res.json();
      updateLocalUser(updated);
      const authValue = encodeBasicAuth(updated.email || user.email, newPassword);
      localStorage.setItem("auth", authValue);
      setOldPassword("");
      setNewPassword("");
      setPasswordSuccess("Mot de passe mis a jour.");
    } catch (err) {
      setPasswordError(err?.message || "Erreur lors de la mise a jour du mot de passe.");
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="my-profile">
        <style>{styles}</style>
        <div className="my-profile__wrap">
          <div className="my-profile__card">
            <h1>Mon profil</h1>
            <p>Connecte-toi pour modifier tes informations.</p>
            <Link to="/auth" className="my-profile__button">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-profile">
      <style>{styles}</style>
      <div className="my-profile__wrap">
        <header className="my-profile__header">
          <div>
            <h1>Mon profil</h1>
            <p>Gere tes informations personnelles et ton mot de passe.</p>
          </div>
          <div className="my-profile__identity">
            <span className="my-profile__pill">Client</span>
            <div className="my-profile__email">{user.email}</div>
          </div>
        </header>

        <div className="my-profile__layout">
          <section className="my-profile__panel">
            <div className="my-profile__panel-head">
              <div>
                <h2>Informations personnelles</h2>
                <p>Modifie tes coordonnees de livraison.</p>
              </div>
              <span className="my-profile__pill">ID #{user.id}</span>
            </div>

            {profileError && <div className="my-profile__error">Erreur: {profileError}</div>}
            {profileSuccess && <div className="my-profile__success">{profileSuccess}</div>}

            <form onSubmit={handleProfileSubmit} className="my-profile__form">
              <div className="my-profile__grid">
                <div>
                  <label>Prenom</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ex: Sarah"
                    required
                  />
                </div>
                <div>
                  <label>Nom</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ex: Martin"
                    required
                  />
                </div>
              </div>

              <div className="my-profile__grid">
                <div>
                  <label>Telephone</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06xxxxxxxx"
                    required
                  />
                </div>
                <div>
                  <label>Adresse</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Adresse de livraison"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="my-profile__primary"
                disabled={profileLoading}
              >
                {profileLoading ? "Enregistrement..." : "Sauvegarder"}
              </button>
            </form>
          </section>

          <section className="my-profile__panel">
            <div className="my-profile__panel-head">
              <div>
                <h2>Mot de passe</h2>
                <p>Change ton mot de passe pour securiser ton compte.</p>
              </div>
            </div>

            {passwordError && <div className="my-profile__error">Erreur: {passwordError}</div>}
            {passwordSuccess && <div className="my-profile__success">{passwordSuccess}</div>}

            <form onSubmit={handlePasswordSubmit} className="my-profile__form">
              <div>
                <label>Ancien mot de passe</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>
              <div>
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>

              <button
                type="submit"
                className="my-profile__primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Mise a jour..." : "Mettre a jour"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600&display=swap');

.my-profile {
  --ink: #1c1916;
  --muted: #6f655c;
  min-height: 100vh;
  padding: 56px 20px 80px;
  background:
    radial-gradient(circle at 12% 15%, rgba(255, 177, 136, 0.35), transparent 48%),
    radial-gradient(circle at 88% 18%, rgba(255, 107, 107, 0.18), transparent 52%),
    radial-gradient(circle at 50% 80%, rgba(255, 215, 194, 0.6), transparent 55%),
    #fffaf6;
  font-family: "Manrope", "Segoe UI", sans-serif;
  color: var(--ink);
}

.my-profile__wrap {
  max-width: 1100px;
  margin: 0 auto;
}

.my-profile__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.my-profile__header h1 {
  font-family: "Fraunces", "Times New Roman", serif;
  margin: 0 0 6px;
}

.my-profile__header p {
  margin: 0;
  color: var(--muted);
}

.my-profile__identity {
  text-align: right;
}

.my-profile__email {
  font-weight: 700;
  margin-top: 6px;
}

.my-profile__pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 107, 107, 0.3);
  background: rgba(255, 107, 107, 0.12);
  color: #b33a2b;
  font-weight: 800;
  font-size: 12px;
}

.my-profile__layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.my-profile__panel {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 176, 136, 0.2);
  box-shadow: 0 14px 32px rgba(25, 15, 10, 0.1);
}

.my-profile__panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.my-profile__panel-head h2 {
  margin: 0 0 6px;
}

.my-profile__panel-head p {
  margin: 0;
  color: var(--muted);
}

.my-profile__form {
  display: grid;
  gap: 12px;
}

.my-profile__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.my-profile__form label {
  display: block;
  font-weight: 800;
  font-size: 13px;
  margin-bottom: 6px;
}

.my-profile__form input {
  width: 100%;
  padding: 11px 12px;
  border-radius: 12px;
  border: 1px solid rgba(28, 25, 22, 0.12);
  background: rgba(255, 255, 255, 0.85);
  outline: none;
  font-weight: 700;
  color: var(--ink);
}

.my-profile__primary {
  padding: 11px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 107, 107, 0.4);
  background: linear-gradient(120deg, #ff6b6b, #ffb088);
  color: #1c1916;
  font-weight: 800;
  cursor: pointer;
}

.my-profile__primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.my-profile__error {
  margin-bottom: 12px;
  background: rgba(255, 107, 107, 0.12);
  border: 1px solid rgba(255, 107, 107, 0.25);
  color: #b33a2b;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
}

.my-profile__success {
  margin-bottom: 12px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.25);
  color: #166534;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
}

.my-profile__card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid rgba(255, 176, 136, 0.2);
  box-shadow: 0 14px 32px rgba(25, 15, 10, 0.1);
  max-width: 520px;
  margin: 40px auto;
  text-align: center;
}

.my-profile__button {
  display: inline-block;
  margin-top: 12px;
  padding: 10px 16px;
  border-radius: 999px;
  background: linear-gradient(120deg, #ff6b6b, #ffb088);
  color: #1c1916;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 900px) {
  .my-profile__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .my-profile__grid {
    grid-template-columns: 1fr;
  }
  .my-profile__identity {
    text-align: left;
  }
}
`;
