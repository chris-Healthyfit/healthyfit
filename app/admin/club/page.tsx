"use client";

import { useEffect, useState } from "react";

export default function AdminClub() {
  const [titre, setTitre] = useState("");
  const [sousTitre, setSousTitre] = useState("");
  const [philosophie, setPhilosophie] = useState("");
  const [salle, setSalle] = useState("");
  const [bouton, setBouton] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [fichier1, setFichier1] = useState<File | null>(null);
  const [fichier2, setFichier2] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    const res = await fetch("/api/club");
    const data = await res.json();
    setTitre(data.titre ?? "");
    setSousTitre(data.sousTitre ?? "");
    setPhilosophie(data.philosophie ?? "");
    setSalle(data.salle ?? "");
    setBouton(data.bouton ?? "");
    setImage1(data.image1 ?? "");
    setImage2(data.image2 ?? "");
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const result = await res.json();
    return result.url as string;
  }

  async function enregistrer() {
    let imageHero = image1;
    let imageSalle = image2;

    if (fichier1) imageHero = await uploadImage(fichier1);
    if (fichier2) imageSalle = await uploadImage(fichier2);

    await fetch("/api/club", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titre, sousTitre, philosophie, salle, bouton, image1: imageHero, image2: imageSalle }),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    charger();
  }

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>🏢 Le Club</h1>
          <p>Modifiez la présentation affichée sur la page Club.</p>
        </div>
      </div>

      <div className="hf-admin-card hf-admin-form-narrow">
        <div className="hf-admin-field">
          <label className="hf-admin-label">Titre</label>
          <input className="hf-admin-input" value={titre} onChange={(e) => setTitre(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Sous-titre</label>
          <textarea className="hf-admin-textarea" style={{ minHeight: 90 }} value={sousTitre} onChange={(e) => setSousTitre(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Notre philosophie</label>
          <textarea className="hf-admin-textarea" style={{ minHeight: 160 }} value={philosophie} onChange={(e) => setPhilosophie(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Présentation de la salle</label>
          <textarea className="hf-admin-textarea" style={{ minHeight: 160 }} value={salle} onChange={(e) => setSalle(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Texte du bouton</label>
          <input className="hf-admin-input" value={bouton} onChange={(e) => setBouton(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Image Hero</label>
          <input type="file" accept="image/*" className="hf-admin-file" onChange={(e) => e.target.files?.[0] && setFichier1(e.target.files[0])} />
          {image1 && <img src={image1} alt="" className="hf-admin-preview" />}
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Image Salle</label>
          <input type="file" accept="image/*" className="hf-admin-file" onChange={(e) => e.target.files?.[0] && setFichier2(e.target.files[0])} />
          {image2 && <img src={image2} alt="" className="hf-admin-preview" />}
        </div>

        <button type="button" className="hf-admin-btn hf-admin-btn-block" onClick={enregistrer}>
          Enregistrer les modifications
        </button>
        {saved && <p className="hf-admin-success">✅ Le Club a été mis à jour.</p>}
      </div>
    </>
  );
}
