"use client";

import { useEffect, useState } from "react";

type Photo = {
  id: number;
  titre: string;
  categorie: string;
  image: string;
  ordre: number;
  actif: boolean;
};

export default function AdminGalerie() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState("Salle");
  const [image, setImage] = useState("");
  const [ordre, setOrdre] = useState(0);
  const [actif, setActif] = useState(true);
  const [edition, setEdition] = useState<number | null>(null);

  async function charger() {
    const res = await fetch("/api/galerie");
    const data = await res.json();
    setPhotos(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    charger();
  }, []);

  async function upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setImage(data.url);
  }

  async function enregistrer() {
    const body = { titre, categorie, image, ordre, actif };

    if (edition === null) {
      await fetch("/api/galerie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`/api/galerie/${edition}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    reset();
    charger();
  }

  function modifier(photo: Photo) {
    setEdition(photo.id);
    setTitre(photo.titre);
    setCategorie(photo.categorie);
    setImage(photo.image);
    setOrdre(photo.ordre);
    setActif(photo.actif);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer cette photo ?")) return;
    await fetch(`/api/galerie/${id}`, { method: "DELETE" });
    charger();
  }

  function reset() {
    setEdition(null);
    setTitre("");
    setCategorie("Salle");
    setImage("");
    setOrdre(0);
    setActif(true);
  }

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>🖼 Galerie</h1>
          <p>Ajoutez et gérez les photos du site.</p>
        </div>
      </div>

      <div className="hf-admin-card" style={{ marginBottom: 28 }}>
        <h2 className="hf-admin-form-title">
          {edition === null ? "Ajouter une photo" : "Modifier une photo"}
        </h2>

        <div className="hf-admin-split" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div>
            <div className="hf-admin-field">
              <label className="hf-admin-label">Titre</label>
              <input className="hf-admin-input" value={titre} onChange={(e) => setTitre(e.target.value)} />
            </div>
            <div className="hf-admin-field">
              <label className="hf-admin-label">Catégorie</label>
              <select className="hf-admin-input hf-admin-select" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                <option>Salle</option>
                <option>Cours</option>
                <option>Nutrition</option>
                <option>Coachs</option>
                <option>Événements</option>
                <option>Avant / Après</option>
                <option>Autres</option>
              </select>
            </div>
            <div className="hf-admin-field">
              <label className="hf-admin-label">Ordre</label>
              <input className="hf-admin-input" type="number" value={ordre} onChange={(e) => setOrdre(Number(e.target.value))} />
            </div>
            <label className="hf-admin-check">
              <input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} />
              Photo active sur le site
            </label>
          </div>
          <div>
            <div className="hf-admin-field">
              <label className="hf-admin-label">Image</label>
              <input type="file" accept="image/*" className="hf-admin-file" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              {image && <img src={image} alt="" className="hf-admin-preview" />}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
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

      <h2 className="hf-admin-list-title">Photos ({photos.length})</h2>
      <div className="hf-admin-grid-cards">
        {photos.map((photo) => (
          <article key={photo.id} className="hf-admin-entity-card">
            {photo.image && <img src={photo.image} alt={photo.titre} className="hf-admin-entity-img" />}
            <div className="hf-admin-entity-body">
              <h3 className="hf-admin-entity-title">{photo.titre}</h3>
              <div className="hf-admin-tags">
                <span className="hf-admin-tag">{photo.categorie}</span>
                <span className="hf-admin-tag">Ordre {photo.ordre}</span>
                <span className="hf-admin-tag">{photo.actif ? "✅ Actif" : "⏸ Inactif"}</span>
              </div>
              <div className="hf-admin-entity-actions">
                <button type="button" className="hf-admin-btn hf-admin-btn-sm" onClick={() => modifier(photo)}>Modifier</button>
                <button type="button" className="hf-admin-btn hf-admin-btn-danger hf-admin-btn-sm" onClick={() => supprimer(photo.id)}>Supprimer</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
