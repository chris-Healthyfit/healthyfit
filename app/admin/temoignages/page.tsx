"use client";

import { useEffect, useState } from "react";

type Temoignage = {
  id: number;
  prenom: string;
  texte: string;
  image: string;
  ordre: number;
  actif: boolean;
};

export default function AdminTemoignages() {
  const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
  const [prenom, setPrenom] = useState("");
  const [texte, setTexte] = useState("");
  const [image, setImage] = useState("");
  const [ordre, setOrdre] = useState(0);
  const [actif, setActif] = useState(true);
  const [edition, setEdition] = useState<number | null>(null);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    const res = await fetch("/api/temoignages");
    const data = await res.json();
    setTemoignages(Array.isArray(data) ? data : []);
  }

  async function upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setImage(data.url);
  }

  async function enregistrer() {
    const body = { prenom, texte, image, ordre, actif };

    if (edition === null) {
      await fetch("/api/temoignages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`/api/temoignages/${edition}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    reset();
    charger();
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    await fetch(`/api/temoignages/${id}`, { method: "DELETE" });
    charger();
  }

  function modifier(t: Temoignage) {
    setEdition(t.id);
    setPrenom(t.prenom);
    setTexte(t.texte);
    setImage(t.image);
    setOrdre(t.ordre);
    setActif(t.actif);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEdition(null);
    setPrenom("");
    setTexte("");
    setImage("");
    setOrdre(0);
    setActif(true);
  }

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>💬 Témoignages</h1>
          <p>Gérez les avis de vos membres affichés sur le site.</p>
        </div>
      </div>

      <div className="hf-admin-split">
        <div className="hf-admin-card">
          <h2 className="hf-admin-form-title">
            {edition === null ? "Ajouter un témoignage" : "Modifier le témoignage"}
          </h2>

          <div className="hf-admin-field">
            <label className="hf-admin-label">Prénom</label>
            <input className="hf-admin-input" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Témoignage</label>
            <textarea className="hf-admin-textarea" style={{ minHeight: 150 }} value={texte} onChange={(e) => setTexte(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Image Avant / Après</label>
            <input type="file" accept="image/*" className="hf-admin-file" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            {image && <img src={image} alt="" className="hf-admin-preview" style={{ maxHeight: 280 }} />}
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Ordre d&apos;affichage</label>
            <input className="hf-admin-input" type="number" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} />
          </div>
          <label className="hf-admin-check hf-admin-field">
            <input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} />
            Afficher ce témoignage sur le site
          </label>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="hf-admin-btn" onClick={enregistrer}>
              {edition === null ? "Ajouter" : "Enregistrer"}
            </button>
            {edition !== null && (
              <button type="button" className="hf-admin-btn hf-admin-btn-ghost" onClick={reset}>
                Annuler
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 className="hf-admin-list-title">Témoignages ({temoignages.length})</h2>
          <div className="hf-admin-grid-cards" style={{ gridTemplateColumns: "1fr" }}>
            {temoignages.map((t) => (
              <article key={t.id} className="hf-admin-entity-card">
                {t.image && <img src={t.image} alt={t.prenom} className="hf-admin-entity-img" style={{ height: 260 }} />}
                <div className="hf-admin-entity-body">
                  <h3 className="hf-admin-entity-title">{t.prenom}</h3>
                  <p className="hf-admin-entity-meta" style={{ whiteSpace: "pre-wrap", minHeight: "auto" }}>{t.texte}</p>
                  <div className="hf-admin-tags">
                    <span className="hf-admin-tag">Ordre {t.ordre}</span>
                    <span className="hf-admin-tag">{t.actif ? "✅ Visible" : "⏸ Masqué"}</span>
                  </div>
                  <div className="hf-admin-entity-actions">
                    <button type="button" className="hf-admin-btn hf-admin-btn-sm" onClick={() => modifier(t)}>Modifier</button>
                    <button type="button" className="hf-admin-btn hf-admin-btn-danger hf-admin-btn-sm" onClick={() => supprimer(t.id)}>Supprimer</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
