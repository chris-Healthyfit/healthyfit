"use client";

import { useEffect, useState } from "react";

type Contact = {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  horaires: string;
  facebook: string;
  googleMaps: string;
  introduction: string;
};

export default function AdminContact() {
  const [contact, setContact] = useState<Contact | null>(null);

  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [horaires, setHoraires] = useState("");
  const [facebook, setFacebook] = useState("");
  const [googleMaps, setGoogleMaps] = useState("");
  const [introduction, setIntroduction] = useState("");

  async function charger() {
    const res = await fetch("/api/contact");
    const data = await res.json();

    if (data) {
      setContact(data);
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
      headers: {
        "Content-Type": "application/json",
      },
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

    alert("Informations enregistrées ✅");

    charger();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#d4af37",
            fontSize: "clamp(34px,8vw,42px)",
            marginBottom: "30px",
          }}
        >
          Contact
        </h1>
         <input
          style={input}
          placeholder="Nom du club"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />

        <input
          style={input}
          placeholder="Adresse"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
        />

        <input
          style={input}
          placeholder="Téléphone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />

        <input
          style={input}
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          style={textarea}
          placeholder="Horaires"
          value={horaires}
          onChange={(e) => setHoraires(e.target.value)}
        />

        <input
          style={input}
          placeholder="Lien Facebook"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
        />

        <textarea
          style={textarea}
          placeholder="Lien Google Maps (iframe ou URL)"
          value={googleMaps}
          onChange={(e) => setGoogleMaps(e.target.value)}
        />

        <textarea
          style={textarea}
          placeholder="Texte d'introduction"
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
        />

        <button
          onClick={enregistrer}
          style={{
            ...button,
            width: "100%",
          }}
        >
          Enregistrer
        </button>
      </div>
    </main>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: 15,
  marginBottom: 20,
  background: "#171717",
  border: "1px solid #333",
  borderRadius: 10,
  color: "white",
  fontSize: 16,
  boxSizing: "border-box",
};

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: 120,
  padding: 15,
  marginBottom: 20,
  background: "#171717",
  border: "1px solid #333",
  borderRadius: 10,
  color: "white",
  fontSize: 16,
  resize: "vertical",
  boxSizing: "border-box",
};

const button: React.CSSProperties = {
  background: "#d4af37",
  color: "#000",
  border: "none",
  padding: "15px 35px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 16,
};       