"use client";

import { FormEvent, useEffect, useState } from "react";

type Admin = {
  id: number;
  prenom: string;
  nom: string;
  identifiant: string;
  role: string;
  actif: boolean;
  createdAt: string;
};

export default function AdminUtilisateursPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  async function charger() {
    const res = await fetch("/api/admins");
    if (res.ok) setAdmins(await res.json());
  }

  useEffect(() => {
    charger();
  }, []);

  async function creer(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setErreur("");

    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prenom, nom, identifiant, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErreur(data.error ?? "Erreur lors de la création.");
      return;
    }

    setMessage(`Administrateur ${data.prenom} ${data.nom} créé.`);
    setPrenom("");
    setNom("");
    setIdentifiant("");
    setPassword("");
    charger();
  }

  async function basculerActif(admin: Admin) {
    if (admin.role === "SUPER_ADMIN") return;

    await fetch(`/api/admins/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !admin.actif }),
    });

    charger();
  }

  async function supprimer(admin: Admin) {
    if (admin.role === "SUPER_ADMIN") return;
    if (!confirm(`Supprimer ${admin.prenom} ${admin.nom} ?`)) return;

    await fetch(`/api/admins/${admin.id}`, { method: "DELETE" });
    charger();
  }

  return (
    <div>
      <div className="hf-admin-page-head">
        <div>
          <h1>👤 Administrateurs</h1>
          <p>Créez des comptes pour votre équipe. Réservé au super administrateur.</p>
        </div>
      </div>

      <form onSubmit={creer} className="hf-admin-card" style={{ maxWidth: 520, marginBottom: 32 }}>
        <h2 style={{ color: "#d4af37", fontSize: 20, margin: "0 0 20px" }}>
          Nouvel administrateur
        </h2>

        <div style={{ display: "grid", gap: 14 }}>
          <input className="hf-admin-input" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
          <input className="hf-admin-input" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
          <input className="hf-admin-input" placeholder="Identifiant (ex: marie)" value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} required />
          <input className="hf-admin-input" type="password" placeholder="Mot de passe (6 car. min.)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </div>

        <button type="submit" className="hf-admin-btn" style={{ marginTop: 20 }}>
          Créer l&apos;administrateur
        </button>

        {message && <p style={{ color: "#6f6", marginTop: 16 }}>{message}</p>}
        {erreur && <p style={{ color: "#f88", marginTop: 16 }}>{erreur}</p>}
      </form>

      <div className="hf-admin-table-wrap">
        <table className="hf-admin-table">
          <thead>
            <tr>
              {["Nom", "Identifiant", "Rôle", "Statut", "Actions"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} style={{ cursor: "default" }}>
                <td>{admin.prenom} {admin.nom}</td>
                <td style={{ color: "#aaa" }}>{admin.identifiant}</td>
                <td>{admin.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}</td>
                <td>{admin.actif ? "✅ Actif" : "⏸ Désactivé"}</td>
                <td>
                  {admin.role !== "SUPER_ADMIN" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" className="hf-admin-btn hf-admin-btn-ghost hf-admin-btn-sm" onClick={() => basculerActif(admin)}>
                        {admin.actif ? "Désactiver" : "Activer"}
                      </button>
                      <button type="button" className="hf-admin-btn hf-admin-btn-danger hf-admin-btn-sm" onClick={() => supprimer(admin)}>
                        Supprimer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
