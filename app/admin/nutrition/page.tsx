"use client";

import { useEffect, useState } from "react";

export default function AdminNutrition() {
  const [titre, setTitre] = useState("");
  const [sousTitre, setSousTitre] = useState("");
  const [importance, setImportance] = useState("");
  const [accompagnement, setAccompagnement] = useState("");
  const [bouton, setBouton] = useState("");
  const [imageHero, setImageHero] = useState("");
  const [imageImportance, setImageImportance] = useState("");
  const [imageCoach, setImageCoach] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    const res = await fetch("/api/nutrition");
    const data = await res.json();
    setTitre(data.titre || "");
    setSousTitre(data.sousTitre || "");
    setImportance(data.importance || "");
    setAccompagnement(data.accompagnement || "");
    setBouton(data.bouton || "");
    setImageHero(data.imageHero || "");
    setImageImportance(data.imageImportance || "");
    setImageCoach(data.imageCoach || "");
  }

  async function upload(file: File, setter: (value: string) => void) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setter(data.url);
  }

  async function enregistrer() {
    await fetch("/api/nutrition", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titre,
        sousTitre,
        importance,
        accompagnement,
        imageHero,
        imageImportance,
        imageCoach,
        bouton,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>🥗 Nutrition</h1>
          <p>Modifiez le contenu de la page Sport & Nutrition.</p>
        </div>
      </div>

      <div className="hf-admin-card hf-admin-form-narrow">
        <div className="hf-admin-field">
          <label className="hf-admin-label">Titre</label>
          <input className="hf-admin-input" value={titre} onChange={(e) => setTitre(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Sous-titre</label>
          <textarea className="hf-admin-textarea" value={sousTitre} onChange={(e) => setSousTitre(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Pourquoi la nutrition est importante ?</label>
          <textarea className="hf-admin-textarea" style={{ minHeight: 160 }} value={importance} onChange={(e) => setImportance(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Comment HealthyFit accompagne ses membres ?</label>
          <textarea className="hf-admin-textarea" style={{ minHeight: 160 }} value={accompagnement} onChange={(e) => setAccompagnement(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Image Hero</label>
          <input type="file" accept="image/*" className="hf-admin-file" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], setImageHero)} />
          {imageHero && <img src={imageHero} alt="" className="hf-admin-preview" />}
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Image « Nutrition importante »</label>
          <input type="file" accept="image/*" className="hf-admin-file" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], setImageImportance)} />
          {imageImportance && <img src={imageImportance} alt="" className="hf-admin-preview" />}
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Image accompagnement</label>
          <input type="file" accept="image/*" className="hf-admin-file" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], setImageCoach)} />
          {imageCoach && <img src={imageCoach} alt="" className="hf-admin-preview" />}
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Texte du bouton</label>
          <input className="hf-admin-input" value={bouton} onChange={(e) => setBouton(e.target.value)} />
        </div>

        <button type="button" className="hf-admin-btn hf-admin-btn-block" onClick={enregistrer}>
          Enregistrer les modifications
        </button>
        {saved && <p className="hf-admin-success">✅ Nutrition enregistrée !</p>}
      </div>
    </>
  );
}
