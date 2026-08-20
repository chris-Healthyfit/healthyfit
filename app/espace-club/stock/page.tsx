"use client";

import { useEffect, useState } from "react";
import { parseApiResponse } from "@/lib/parse-api-response";

type StockItem = {
  id: number;
  nom: string;
  categorie: string;
  quantite: number;
  seuilAlerte: number;
  unite: string;
};

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState("Général");
  const [quantite, setQuantite] = useState(0);
  const [seuilAlerte, setSeuilAlerte] = useState(5);
  const [unite, setUnite] = useState("unité");

  async function charger() {
    const res = await fetch("/api/club/stock");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCanEdit(d.canEditStock === true));
    charger();
  }, []);

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/club/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, categorie, quantite, seuilAlerte, unite }),
    });
    setNom("");
    setQuantite(0);
    charger();
  }

  async function majQuantite(id: number, delta: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    await fetch(`/api/club/stock/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantite: Math.max(0, item.quantite + delta) }),
    });
    charger();
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer cet article ?")) return;
    const res = await fetch(`/api/club/stock/${id}`, { method: "DELETE" });
    const parsed = await parseApiResponse(res);
    if (!parsed.ok) {
      alert(parsed.error || "Impossible de supprimer");
      return;
    }
    charger();
  }

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>📦 Stock</h1>
          <p>
            {canEdit
              ? "Gérez les produits et quantités du club."
              : "Consultation du stock — modification réservée à la direction."}
          </p>
        </div>
      </div>

      {canEdit && (
        <form onSubmit={ajouter} className="hf-admin-card" style={{ marginBottom: 28 }}>
          <h2 className="hf-admin-form-title">Ajouter un article</h2>
          <div className="hf-admin-split" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <div className="hf-admin-field">
              <label className="hf-admin-label">Nom *</label>
              <input className="hf-admin-input" required value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div className="hf-admin-field">
              <label className="hf-admin-label">Catégorie</label>
              <input className="hf-admin-input" value={categorie} onChange={(e) => setCategorie(e.target.value)} />
            </div>
            <div className="hf-admin-field">
              <label className="hf-admin-label">Quantité</label>
              <input className="hf-admin-input" type="number" value={quantite} onChange={(e) => setQuantite(Number(e.target.value))} />
            </div>
            <div className="hf-admin-field">
              <label className="hf-admin-label">Seuil alerte</label>
              <input className="hf-admin-input" type="number" value={seuilAlerte} onChange={(e) => setSeuilAlerte(Number(e.target.value))} />
            </div>
            <div className="hf-admin-field">
              <label className="hf-admin-label">Unité</label>
              <input className="hf-admin-input" value={unite} onChange={(e) => setUnite(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="hf-admin-btn">Ajouter au stock</button>
        </form>
      )}

      <div className="hf-admin-table-wrap">
        <table className="hf-admin-table">
          <thead>
            <tr>
              {["Article", "Catégorie", "Quantité", "Seuil", "Actions"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="hf-admin-empty">Stock vide.</td></tr>
            ) : (
              items.map((item) => {
                const alerte = item.quantite <= item.seuilAlerte;
                return (
                  <tr key={item.id} style={{ cursor: "default", background: alerte ? "#1a1510" : undefined }}>
                    <td style={{ fontWeight: 600 }}>{item.nom} {alerte && "⚠️"}</td>
                    <td>{item.categorie}</td>
                    <td>{item.quantite} {item.unite}</td>
                    <td>{item.seuilAlerte}</td>
                    <td>
                      {canEdit ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="button" className="hf-admin-btn hf-admin-btn-sm hf-admin-btn-ghost" onClick={() => majQuantite(item.id, 1)}>+1</button>
                          <button type="button" className="hf-admin-btn hf-admin-btn-sm hf-admin-btn-ghost" onClick={() => majQuantite(item.id, -1)}>−1</button>
                          <button type="button" className="hf-admin-btn hf-admin-btn-sm hf-admin-btn-danger" onClick={() => supprimer(item.id)}>Suppr.</button>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
