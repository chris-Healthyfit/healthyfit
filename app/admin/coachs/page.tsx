"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Coach = {
  id: number;
  prenom: string;
  nom: string;
  telephone: string;
  facebook: string;
  description: string;
  image: string;
};

export default function AdminCoachs() {
  const router = useRouter();
  const [coachs, setCoachs] = useState<Coach[]>([]);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [facebook, setFacebook] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  async function chargerCoachs() {
    const res = await fetch("/api/coachs");
    const data = await res.json();
    setCoachs(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    chargerCoachs();
  }, []);

  function modifier(coach: Coach) {
    setEditId(coach.id);
    setPrenom(coach.prenom);
    setNom(coach.nom);
    setTelephone(coach.telephone);
    setFacebook(coach.facebook);
    setDescription(coach.description);
    setImage(coach.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function supprimer(id: number) {
    router.push(`/admin/coachs/${id}/supprimer`);
  }

  async function ajouterCoach() {
    const url = editId === null ? "/api/coachs" : `/api/coachs/${editId}`;
    const method = editId === null ? "POST" : "PUT";
    let imageUrl = image;

    if (fichier) {
      const formData = new FormData();
      formData.append("file", fichier);
      const upload = await fetch("/api/upload", { method: "POST", body: formData });
      if (!upload.ok) {
        alert("Erreur lors de l'upload de l'image.");
        return;
      }
      const resultat = await upload.json();
      imageUrl = resultat.url;
    }

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom,
        nom,
        telephone,
        facebook,
        description,
        image: imageUrl,
      }),
    });

    setPrenom("");
    setNom("");
    setTelephone("");
    setFacebook("");
    setDescription("");
    setImage("");
    setFichier(null);
    setEditId(null);
    chargerCoachs();
  }

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>👥 Coachs</h1>
          <p>Ajoutez, modifiez ou supprimez les coachs du club.</p>
        </div>
      </div>

      <div className="hf-admin-split">
        <div className="hf-admin-card">
          <h2 className="hf-admin-form-title">
            {editId === null ? "Ajouter un coach" : "Modifier un coach"}
          </h2>

          <div className="hf-admin-field">
            <label className="hf-admin-label">Prénom</label>
            <input className="hf-admin-input" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Nom</label>
            <input className="hf-admin-input" value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Téléphone</label>
            <input className="hf-admin-input" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Facebook</label>
            <input className="hf-admin-input" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Description</label>
            <textarea className="hf-admin-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Photo</label>
            <input type="file" accept="image/*" className="hf-admin-file" onChange={(e) => e.target.files?.[0] && setFichier(e.target.files[0])} />
            {image && <img src={image} alt="" className="hf-admin-preview" />}
          </div>

          <button type="button" className="hf-admin-btn hf-admin-btn-block" onClick={ajouterCoach}>
            {editId === null ? "Ajouter le coach" : "Enregistrer les modifications"}
          </button>
        </div>

        <div>
          <h2 className="hf-admin-list-title">Coachs enregistrés ({coachs.length})</h2>
          <div className="hf-admin-grid-cards">
            {coachs.map((coach) => (
              <article key={coach.id} className="hf-admin-entity-card">
                {coach.image && <img src={coach.image} alt={`${coach.prenom} ${coach.nom}`} className="hf-admin-entity-img" />}
                <div className="hf-admin-entity-body">
                  <h3 className="hf-admin-entity-title">{coach.prenom} {coach.nom}</h3>
                  <p className="hf-admin-entity-meta">{coach.description}</p>
                  <div className="hf-admin-tags">
                    <span className="hf-admin-tag">📞 {coach.telephone}</span>
                    {coach.facebook && (
                      <a href={coach.facebook} target="_blank" rel="noreferrer" className="hf-admin-tag hf-admin-link">
                        Facebook
                      </a>
                    )}
                  </div>
                  <div className="hf-admin-entity-actions">
                    <button type="button" className="hf-admin-btn hf-admin-btn-sm" onClick={() => modifier(coach)}>✏ Modifier</button>
                    <button type="button" className="hf-admin-btn hf-admin-btn-danger hf-admin-btn-sm" onClick={() => supprimer(coach.id)}>🗑 Supprimer</button>
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
