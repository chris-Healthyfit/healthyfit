"use client";

import { useEffect, useState } from "react";

type Seance = {
  id: number;
  horaire: string;
  titre: string;
  description: string;
  duree: string;
  niveau: string;
  prix: string;
  image: string;
};

export default function AdminSeances() {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [horaire, setHoraire] = useState("");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [duree, setDuree] = useState("");
  const [niveau, setNiveau] = useState("");
  const [prix, setPrix] = useState("");
  const [image, setImage] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  async function chargerSeances() {
    const res = await fetch("/api/seances");
    const data = await res.json();
    setSeances(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    chargerSeances();
  }, []);

  function modifier(seance: Seance) {
    setEditId(seance.id);
    setHoraire(seance.horaire);
    setTitre(seance.titre);
    setDescription(seance.description);
    setDuree(seance.duree);
    setNiveau(seance.niveau);
    setPrix(seance.prix);
    setImage(seance.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer cette séance ?")) return;
    await fetch(`/api/seances/${id}`, { method: "DELETE" });
    chargerSeances();
  }

  async function ajouterSeance() {
    const url = editId === null ? "/api/seances" : `/api/seances/${editId}`;
    const method = editId === null ? "POST" : "PUT";
    let imageUrl = image;

    if (fichier) {
      const formData = new FormData();
      formData.append("file", fichier);
      const upload = await fetch("/api/upload", { method: "POST", body: formData });
      const resultat = await upload.json();
      imageUrl = resultat.url;
    }

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ horaire, titre, description, duree, niveau, prix, image: imageUrl }),
    });

    setHoraire("");
    setTitre("");
    setDescription("");
    setDuree("");
    setNiveau("");
    setPrix("");
    setImage("");
    setFichier(null);
    setEditId(null);
    chargerSeances();
  }

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>🏋️ Séances</h1>
          <p>Gérez les séances proposées par HealthyFit.</p>
        </div>
      </div>

      <div className="hf-admin-split">
        <div className="hf-admin-card">
          <h2 className="hf-admin-form-title">
            {editId === null ? "Ajouter une séance" : "Modifier une séance"}
          </h2>

          <div className="hf-admin-field">
            <label className="hf-admin-label">Horaire</label>
            <input className="hf-admin-input" placeholder="18h30" value={horaire} onChange={(e) => setHoraire(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Titre</label>
            <input className="hf-admin-input" value={titre} onChange={(e) => setTitre(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Description</label>
            <textarea className="hf-admin-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Durée</label>
            <input className="hf-admin-input" value={duree} onChange={(e) => setDuree(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Niveau</label>
            <select className="hf-admin-input hf-admin-select" value={niveau} onChange={(e) => setNiveau(e.target.value)}>
              <option value="">Choisir...</option>
              <option>Débutant</option>
              <option>Intermédiaire</option>
              <option>Avancé</option>
              <option>Tous niveaux</option>
              <option>Enfants/parents</option>
            </select>
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Prix</label>
            <input className="hf-admin-input" value={prix} onChange={(e) => setPrix(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Image</label>
            <input type="file" accept="image/*" className="hf-admin-file" onChange={(e) => e.target.files?.[0] && setFichier(e.target.files[0])} />
            {image && <img src={image} alt="" className="hf-admin-preview" />}
          </div>

          <button type="button" className="hf-admin-btn hf-admin-btn-block" onClick={ajouterSeance}>
            {editId === null ? "Ajouter la séance" : "Enregistrer les modifications"}
          </button>
        </div>

        <div>
          <h2 className="hf-admin-list-title">Séances enregistrées ({seances.length})</h2>
          <div className="hf-admin-grid-cards">
            {seances.map((seance) => (
              <article key={seance.id} className="hf-admin-entity-card">
                {seance.image && <img src={seance.image} alt={seance.titre} className="hf-admin-entity-img" />}
                <div className="hf-admin-entity-body">
                  <div className="hf-admin-time">🕒 {seance.horaire}</div>
                  <h3 className="hf-admin-entity-title">{seance.titre}</h3>
                  <p className="hf-admin-entity-meta">{seance.description}</p>
                  <div className="hf-admin-tags">
                    <span className="hf-admin-tag">⏱ {seance.duree}</span>
                    <span className="hf-admin-tag">💶 {seance.prix} €</span>
                    <span className="hf-admin-tag">💪 {seance.niveau}</span>
                  </div>
                  <div className="hf-admin-entity-actions">
                    <button type="button" className="hf-admin-btn hf-admin-btn-sm" onClick={() => modifier(seance)}>✏ Modifier</button>
                    <button type="button" className="hf-admin-btn hf-admin-btn-danger hf-admin-btn-sm" onClick={() => supprimer(seance.id)}>🗑 Supprimer</button>
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
