"use client";

import { useEffect, useState } from "react";

type StockItem = { id: number; nom: string; prixAchatCentimes: number | null };
type Achat = {
  id: number;
  date: string;
  totalCentimes: number;
  notes: string | null;
  lines: { quantite: number; stockItem: { nom: string } | null }[];
};

function lineLabel(l: Achat["lines"][number]) {
  return `${l.quantite}× ${l.stockItem?.nom ?? "Article supprimé"}`;
}

export default function AchatsPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [achats, setAchats] = useState<Achat[]>([]);
  const [lines, setLines] = useState([{ stockItemId: "", quantite: 1, prix: "" }]);
  const [notes, setNotes] = useState("");

  async function charger() {
    const [pRes, aRes] = await Promise.all([
      fetch("/api/club/finance/parametres"),
      fetch("/api/club/finance/achats"),
    ]);
    if (pRes.ok) {
      const d = await pRes.json();
      setStock(d.stock ?? []);
    }
    if (aRes.ok) setAchats(await aRes.json());
  }

  useEffect(() => {
    charger();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = lines
      .filter((l) => l.stockItemId && l.prix)
      .map((l) => ({
        stockItemId: Number(l.stockItemId),
        quantite: Number(l.quantite),
        prixUnitaireCentimes: Math.round(parseFloat(l.prix.replace(",", ".")) * 100),
      }));
    if (!parsed.length) return;

    await fetch("/api/club/finance/achats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines: parsed, notes }),
    });
    setLines([{ stockItemId: "", quantite: 1, prix: "" }]);
    setNotes("");
    charger();
  }

  function fmt(c: number) {
    return `${(c / 100).toFixed(2).replace(".", ",")} €`;
  }

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>🛒 Achats stock</h1>
          <p>Ajoute le stock, la dépense et l&apos;historique en un clic.</p>
        </div>
      </div>

      <form onSubmit={submit} className="hf-admin-card" style={{ marginBottom: 28 }}>
        <h2 className="hf-admin-form-title">➕ Nouvel achat</h2>
        {lines.map((l, i) => (
          <div key={i} className="hf-admin-split" style={{ marginBottom: 12 }}>
            <select
              className="hf-admin-input hf-admin-select"
              value={l.stockItemId}
              onChange={(e) => {
                const n = [...lines];
                n[i].stockItemId = e.target.value;
                setLines(n);
              }}
            >
              <option value="">Produit…</option>
              {stock.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </select>
            <input
              className="hf-admin-input"
              type="number"
              min={1}
              placeholder="Qté"
              value={l.quantite}
              onChange={(e) => {
                const n = [...lines];
                n[i].quantite = Number(e.target.value);
                setLines(n);
              }}
            />
            <input
              className="hf-admin-input"
              placeholder="Prix unitaire €"
              value={l.prix}
              onChange={(e) => {
                const n = [...lines];
                n[i].prix = e.target.value;
                setLines(n);
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="hf-admin-btn hf-admin-btn-ghost hf-admin-btn-sm"
          onClick={() => setLines([...lines, { stockItemId: "", quantite: 1, prix: "" }])}
        >
          + Ligne
        </button>
        <input
          className="hf-admin-input"
          placeholder="Notes (ex: 3 Rebuild, 2 CR7)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ marginTop: 12 }}
        />
        <button type="submit" className="hf-admin-btn" style={{ marginTop: 16 }}>
          Enregistrer l&apos;achat
        </button>
      </form>

      <p className="hf-admin-section-title">Historique achats</p>
      <div className="hf-admin-list-compact">
        {achats.map((a) => (
          <div key={a.id} className="hf-historique-row">
            <div className="hf-historique-date">
              {new Date(a.date).toLocaleDateString("fr-BE")}
            </div>
            <div className="hf-historique-body">
              <strong>{a.notes ?? `Achat #${a.id}`}</strong>
              <span className="bad" style={{ marginLeft: 12 }}>
                -{fmt(a.totalCentimes)}
              </span>
              <p className="hf-admin-entity-meta">
                {a.lines.map(lineLabel).join(", ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
