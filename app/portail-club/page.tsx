"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PortailClub() {
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const router = useRouter();

  async function login() {
    setErreur("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifiant, password, context: "club" }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.redirect) {
      router.push(data.redirect);
      router.refresh();
    } else {
      setErreur(data.error ?? "Connexion impossible.");
    }
  }

  return (
    <main className="hf-login-page">
      <div className="hf-login-card">
        <h1 className="hf-login-title">🏋️ Espace Club HealthyFit</h1>
        <p style={{ color: "#888", textAlign: "center", marginBottom: 20, fontSize: 14 }}>
          Coachs et direction (Chris, Sarah). Les comptes admin CMS ne fonctionnent pas ici.
        </p>

        <input
          type="text"
          placeholder="Identifiant (ex: chris, sarah, coach…)"
          value={identifiant}
          onChange={(e) => setIdentifiant(e.target.value)}
          className="hf-input"
          autoComplete="username"
          style={{ marginBottom: 12 }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          className="hf-input"
          autoComplete="current-password"
        />

        <button type="button" onClick={login} className="hf-btn-gold" style={{ width: "100%", marginTop: 16 }}>
          Entrer dans l&apos;espace club
        </button>

        {erreur && (
          <p style={{ color: "#f88", marginTop: 16, fontSize: 14, textAlign: "center" }}>{erreur}</p>
        )}

        <Link href="/club" style={{ display: "block", marginTop: 20, textAlign: "center", color: "#888", fontSize: 14, textDecoration: "none" }}>
          ← Retour au site
        </Link>
      </div>
    </main>
  );
}
