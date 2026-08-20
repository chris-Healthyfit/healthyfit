"use client";

import { useEffect, useState } from "react";

type CoachRow = {
  id: number;
  prenom: string;
  nom: string;
  compte: {
    id: number;
    identifiant: string;
    actif: boolean;
  } | null;
};

export default function ComptesCoachPage() {
  const [coachs, setCoachs] = useState<CoachRow[]>([]);
  const [coachId, setCoachId] = useState("");
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");
  const [resetId, setResetId] = useState<number | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  async function charger() {
    const res = await fetch("/api/club/coach-accounts");
    if (res.ok) setCoachs(await res.json());
  }

  useEffect(() => {
    charger();
  }, []);

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setErreur("");
    const res = await fetch("/api/club/coach-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coachId: Number(coachId), identifiant, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErreur(data.error ?? "Erreur.");
      return;
    }
    setMessage(`Compte créé : ${data.identifiant} — le coach peut se connecter via « Mon espace coach ».`);
    setCoachId("");
    setIdentifiant("");
    setPassword("");
    charger();
  }

  async function reinitialiser(e: React.FormEvent) {
    e.preventDefault();
    if (!resetId) return;
    setMessage("");
    setErreur("");
    const res = await fetch(`/api/club/coach-accounts/${resetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErreur(data.error ?? "Erreur.");
      return;
    }
    setMessage(`Mot de passe réinitialisé pour ${data.identifiant}.`);
    setResetId(null);
    setResetPassword("");
    charger();
  }

  const sansCompte = coachs.filter((c) => !c.compte);

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>🔑 Comptes coachs</h1>
          <p>
            Créez les accès à l&apos;espace club. Utilisez un identifiant unique
            (ex: <strong>amandine</strong>, pas <strong>chris</strong> ou{" "}
            <strong>sarah</strong> qui sont réservés à la direction).
          </p>
        </div>
        <a href="/espace-club" className="hf-admin-btn hf-admin-btn-ghost">
          Ouvrir l&apos;espace club →
        </a>
      </div>

      <form onSubmit={creer} className="hf-admin-card" style={{ marginBottom: 28 }}>
        <h2 className="hf-admin-form-title">Nouveau compte coach</h2>
        <div className="hf-admin-split" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Coach *</label>
            <select
              className="hf-admin-input hf-admin-select"
              required
              value={coachId}
              onChange={(e) => {
                setCoachId(e.target.value);
                const c = sansCompte.find((x) => String(x.id) === e.target.value);
                if (c) {
                  setIdentifiant(
                    `${c.prenom}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                  );
                }
              }}
            >
              <option value="">Choisir…</option>
              {sansCompte.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.prenom} {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Identifiant *</label>
            <input
              className="hf-admin-input"
              required
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="ex: amandine"
            />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Mot de passe *</label>
            <input
              className="hf-admin-input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="hf-admin-btn" disabled={sansCompte.length === 0}>
          Créer le compte
        </button>
        {sansCompte.length === 0 && (
          <p className="hf-admin-entity-meta" style={{ marginTop: 12 }}>
            Tous les coachs ont déjà un compte — réinitialisez le mot de passe dans le tableau.
          </p>
        )}
      </form>

      {resetId && (
        <form onSubmit={reinitialiser} className="hf-admin-card" style={{ marginBottom: 28 }}>
          <h2 className="hf-admin-form-title">Réinitialiser le mot de passe</h2>
          <div className="hf-admin-field" style={{ maxWidth: 320 }}>
            <label className="hf-admin-label">Nouveau mot de passe *</label>
            <input
              className="hf-admin-input"
              type="password"
              required
              minLength={6}
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="hf-admin-btn">
              Enregistrer
            </button>
            <button
              type="button"
              className="hf-admin-btn hf-admin-btn-ghost"
              onClick={() => {
                setResetId(null);
                setResetPassword("");
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {message && <p className="hf-admin-success">{message}</p>}
      {erreur && (
        <p style={{ color: "#f88", marginBottom: 16, lineHeight: 1.5 }}>{erreur}</p>
      )}

      <div className="hf-admin-table-wrap">
        <table className="hf-admin-table">
          <thead>
            <tr>
              {["Coach", "Identifiant", "Statut", ""].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coachs.map((c) => (
              <tr key={c.id} style={{ cursor: "default" }}>
                <td style={{ fontWeight: 600 }}>
                  {c.prenom} {c.nom}
                </td>
                <td>{c.compte?.identifiant ?? "—"}</td>
                <td>
                  {c.compte ? (
                    <span className="hf-admin-tag">
                      {c.compte.actif ? "Actif" : "Inactif"}
                    </span>
                  ) : (
                    <span className="hf-admin-tag" style={{ opacity: 0.6 }}>
                      Sans compte
                    </span>
                  )}
                </td>
                <td>
                  {c.compte && (
                    <button
                      type="button"
                      className="hf-admin-btn hf-admin-btn-sm hf-admin-btn-ghost"
                      onClick={() => {
                        setResetId(c.compte!.id);
                        setResetPassword("");
                        setErreur("");
                        setMessage("");
                      }}
                    >
                      Nouveau mot de passe
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
