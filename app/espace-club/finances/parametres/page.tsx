"use client";

import { useEffect, useState } from "react";

type Tarif = {
  id: number;
  code: string;
  label: string;
  montantCentimes: number;
  categorie: string;
};

type FitItem = {
  id: number;
  nom: string;
  section: string;
  coutPortionCentimes: number;
  portionsParSeance: number;
};

export default function ParametresFinancePage() {
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [fitItems, setFitItems] = useState<FitItem[]>([]);
  const [fitTotal, setFitTotal] = useState(0);
  const [coutBilan, setCoutBilan] = useState("3,50");
  const [editing, setEditing] = useState<Record<number, string>>({});

  async function charger() {
    const res = await fetch("/api/club/finance/parametres");
    if (!res.ok) return;
    const d = await res.json();
    setTarifs(d.tarifs ?? []);
    setFitItems(d.fitItems ?? []);
    setFitTotal(d.fitCost?.total ?? 0);
    setCoutBilan(((d.config?.coutBilanCentimes ?? 350) / 100).toFixed(2).replace(".", ","));
  }

  useEffect(() => {
    charger();
  }, []);

  async function saveTarif(t: Tarif) {
    const raw = editing[t.id] ?? String(t.montantCentimes / 100);
    await fetch("/api/club/finance/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tarif: {
          id: t.id,
          label: t.label,
          montantCentimes: Math.round(parseFloat(raw.replace(",", ".")) * 100),
        },
      }),
    });
    charger();
  }

  async function saveFit(item: FitItem) {
    await fetch("/api/club/finance/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fitItem: item }),
    });
    charger();
  }

  async function saveBilanCost() {
    await fetch("/api/club/finance/parametres", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coutBilanCentimes: Math.round(parseFloat(coutBilan.replace(",", ".")) * 100),
      }),
    });
    charger();
  }

  const bySection = fitItems.reduce<Record<string, FitItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>⚙️ Paramètres comptables</h1>
          <p>Tarifs, coût FIT et coût bilan — aucun prix en dur.</p>
        </div>
      </div>

      <p className="hf-admin-section-title">Tarifs</p>
      <div className="hf-admin-grid-cards">
        {tarifs.map((t) => (
          <article key={t.id} className="hf-admin-entity-card">
            <div className="hf-admin-entity-body">
              <h3 className="hf-admin-entity-title">{t.label}</h3>
              <p className="hf-admin-entity-meta">{t.categorie} · {t.code}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input
                  className="hf-admin-input"
                  defaultValue={(t.montantCentimes / 100).toFixed(2).replace(".", ",")}
                  onChange={(e) =>
                    setEditing((p) => ({ ...p, [t.id]: e.target.value }))
                  }
                />
                <button
                  type="button"
                  className="hf-admin-btn hf-admin-btn-sm"
                  onClick={() => saveTarif(t)}
                >
                  OK
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="hf-admin-section-title">
        Coût FIT par séance — Total : {(fitTotal / 100).toFixed(2).replace(".", ",")} €
      </p>
      {Object.entries(bySection).map(([section, items]) => (
        <div key={section} className="hf-admin-card" style={{ marginBottom: 16 }}>
          <h3 className="hf-admin-form-title">{section}</h3>
          {items.map((item) => (
            <div key={item.id} className="hf-admin-split" style={{ marginBottom: 8 }}>
              <span style={{ alignSelf: "center" }}>{item.nom}</span>
              <input
                className="hf-admin-input"
                type="text"
                defaultValue={(item.coutPortionCentimes / 100).toFixed(2).replace(".", ",")}
                onBlur={(e) =>
                  saveFit({
                    ...item,
                    coutPortionCentimes: Math.round(
                      parseFloat(e.target.value.replace(",", ".")) * 100
                    ),
                  })
                }
              />
              <span className="hf-admin-entity-meta">€ / portion</span>
            </div>
          ))}
        </div>
      ))}

      <div className="hf-admin-card">
        <h3 className="hf-admin-form-title">Coût moyen d&apos;un bilan</h3>
        <div style={{ display: "flex", gap: 8, maxWidth: 280 }}>
          <input
            className="hf-admin-input"
            value={coutBilan}
            onChange={(e) => setCoutBilan(e.target.value)}
          />
          <button type="button" className="hf-admin-btn hf-admin-btn-sm" onClick={saveBilanCost}>
            OK
          </button>
        </div>
        <p className="hf-admin-entity-meta" style={{ marginTop: 8 }}>
          Impression, documents, carnet, temps — ajouté auto à chaque bilan.
        </p>
      </div>
    </>
  );
}
