"use client";

import { useEffect, useState } from "react";

type Charge = {
  id: number;
  nom: string;
  categorie: string;
  montantCentimes: number;
  frequence: string;
  prochaineEcheance: string;
  actif: boolean;
};

const FREQS = [
  "HEBDOMADAIRE",
  "MENSUELLE",
  "TRIMESTRIELLE",
  "SEMESTRIELLE",
  "ANNUELLE",
] as const;

export default function ChargesPage() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [nom, setNom] = useState("");
  const [montant, setMontant] = useState("");
  const [frequence, setFrequence] = useState<string>("MENSUELLE");
  const [categorie, setCategorie] = useState("Général");

  async function charger() {
    const res = await fetch("/api/club/finance/charges");
    if (res.ok) setCharges(await res.json());
  }

  useEffect(() => {
    charger();
  }, []);

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/club/finance/charges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom,
        categorie,
        frequence,
        montantCentimes: Math.round(parseFloat(montant.replace(",", ".")) * 100),
      }),
    });
    setNom("");
    setMontant("");
    charger();
  }

  async function payer(id: number) {
    await fetch(`/api/club/finance/charges/${id}`, { method: "POST" });
    charger();
  }

  function fmt(c: number) {
    return `${(c / 100).toFixed(0)} €`;
  }

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>🏢 Charges</h1>
          <p>Loyer, UCM, comptable, assurances… avec échéances automatiques.</p>
        </div>
      </div>

      <form onSubmit={ajouter} className="hf-admin-card" style={{ marginBottom: 28 }}>
        <h2 className="hf-admin-form-title">Ajouter une charge</h2>
        <div className="hf-admin-split">
          <input
            className="hf-admin-input"
            placeholder="Nom (Loyer, UCM…)"
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
          <input
            className="hf-admin-input"
            placeholder="Montant €"
            required
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
          />
          <select
            className="hf-admin-input hf-admin-select"
            value={frequence}
            onChange={(e) => setFrequence(e.target.value)}
          >
            {FREQS.map((f) => (
              <option key={f} value={f}>
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <input
            className="hf-admin-input"
            placeholder="Catégorie"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
          />
        </div>
        <button type="submit" className="hf-admin-btn" style={{ marginTop: 16 }}>
          Ajouter
        </button>
      </form>

      <div className="hf-admin-grid-cards">
        {charges.map((c) => (
          <article key={c.id} className="hf-admin-entity-card">
            <div className="hf-admin-entity-body">
              <h3 className="hf-admin-entity-title">{c.nom}</h3>
              <p className="hf-admin-entity-meta">
                {fmt(c.montantCentimes)} — {c.frequence.toLowerCase()}
              </p>
              <p className="hf-admin-entity-meta">
                Prochaine échéance :{" "}
                {new Date(c.prochaineEcheance).toLocaleDateString("fr-BE")}
              </p>
              <button
                type="button"
                className="hf-admin-btn hf-admin-btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => payer(c.id)}
              >
                Marquer payé
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
