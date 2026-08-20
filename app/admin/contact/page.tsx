"use client";

import { useEffect, useState } from "react";

export default function AdminContact() {
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [horaires, setHoraires] = useState("");
  const [facebook, setFacebook] = useState("");
  const [googleMaps, setGoogleMaps] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [saved, setSaved] = useState(false);

  async function charger() {
    const res = await fetch("/api/contact");
    const data = await res.json();
    if (data) {
      setNom(data.nom);
      setAdresse(data.adresse);
      setTelephone(data.telephone);
      setEmail(data.email);
      setHoraires(data.horaires);
      setFacebook(data.facebook);
      setGoogleMaps(data.googleMaps);
      setIntroduction(data.introduction);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  async function enregistrer() {
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom,
        adresse,
        telephone,
        email,
        horaires,
        facebook,
        googleMaps,
        introduction,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    charger();
  }

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>📞 Contact</h1>
          <p>Coordonnées, horaires et introduction de la page Contact.</p>
        </div>
      </div>

      <div className="hf-admin-card hf-admin-form-narrow">
        <div className="hf-admin-field">
          <label className="hf-admin-label">Nom du club</label>
          <input className="hf-admin-input" value={nom} onChange={(e) => setNom(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Adresse</label>
          <input className="hf-admin-input" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Téléphone</label>
          <input className="hf-admin-input" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">E-mail</label>
          <input className="hf-admin-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Horaires</label>
          <textarea className="hf-admin-textarea" style={{ minHeight: 100 }} value={horaires} onChange={(e) => setHoraires(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Lien Facebook</label>
          <input className="hf-admin-input" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Google Maps (iframe ou URL)</label>
          <textarea className="hf-admin-textarea" style={{ minHeight: 100 }} value={googleMaps} onChange={(e) => setGoogleMaps(e.target.value)} />
        </div>
        <div className="hf-admin-field">
          <label className="hf-admin-label">Texte d&apos;introduction</label>
          <textarea className="hf-admin-textarea" style={{ minHeight: 140 }} value={introduction} onChange={(e) => setIntroduction(e.target.value)} />
        </div>

        <button type="button" className="hf-admin-btn hf-admin-btn-block" onClick={enregistrer}>
          Enregistrer
        </button>
        {saved && <p className="hf-admin-success">✅ Informations enregistrées.</p>}
      </div>
    </>
  );
}
