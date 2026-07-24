"use client";

import { useEffect, useState } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #2e2e2e",
  background: "#1a1a1a",
  color: "white",
  fontSize: "15px",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  marginBottom: "6px",
  color: "#d4af37",
  fontWeight: 600,
};

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

  async function enregistrer() {
    let imageHero = image1;
    let imageSalle = image2;

    if (fichier1) {
      const formData = new FormData();
      formData.append("file", fichier1);

      const upload = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await upload.json();
      imageHero = result.image;
    }

    if (fichier2) {
      const formData = new FormData();
      formData.append("file", fichier2);

      const upload = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await upload.json();
      imageSalle = result.image;
    }

    await fetch("/api/club", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titre,
        sousTitre,
        philosophie,
        salle,
        bouton,
        image1: imageHero,
        image2: imageSalle,
      }),
    });

    alert("Le Club a été mis à jour.");
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
            fontSize: "clamp(34px,8vw,48px)",
            fontWeight: 900,
            marginBottom: "10px",
          }}
        >
          Le Club
        </h1>

        <p
          style={{
            color: "#bdbdbd",
            marginBottom: "30px",
            lineHeight: 1.7,
          }}
        >
          Modifiez les informations affichées sur la page du Club.
        </p>

        <div
          style={{
            background: "#141414",
            padding: "20px",
            borderRadius: "18px",
            border: "1px solid #2b2b2b",
          }}
        >
                    <div style={{ marginBottom: 20 }}>
            <div style={labelStyle}>Titre</div>

            <input
              style={inputStyle}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={labelStyle}>Sous-titre</div>

            <textarea
              style={{
                ...inputStyle,
                minHeight: "90px",
                resize: "vertical",
              }}
              value={sousTitre}
              onChange={(e) => setSousTitre(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={labelStyle}>Notre philosophie</div>

            <textarea
              style={{
                ...inputStyle,
                minHeight: "180px",
                resize: "vertical",
              }}
              value={philosophie}
              onChange={(e) => setPhilosophie(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={labelStyle}>Présentation de la salle</div>

            <textarea
              style={{
                ...inputStyle,
                minHeight: "180px",
                resize: "vertical",
              }}
              value={salle}
              onChange={(e) => setSalle(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={labelStyle}>Texte du bouton</div>

            <input
              style={inputStyle}
              value={bouton}
              onChange={(e) => setBouton(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 25 }}>
            <div style={labelStyle}>Image Hero</div>

            <input
              type="file"
              accept="image/*"
              style={{ width: "100%" }}
              onChange={(e) => {
                if (e.target.files?.length) {
                  setFichier1(e.target.files[0]);
                }
              }}
            />

            {image1 && (
              <img
                src={image1}
                alt=""
                style={{
                  marginTop: "15px",
                  width: "100%",
                  borderRadius: "12px",
                  maxHeight: "220px",
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          <div style={{ marginBottom: 30 }}>
            <div style={labelStyle}>Image Salle</div>

            <input
              type="file"
              accept="image/*"
              style={{ width: "100%" }}
              onChange={(e) => {
                if (e.target.files?.length) {
                  setFichier2(e.target.files[0]);
                }
              }}
            />

            {image2 && (
              <img
                src={image2}
                alt=""
                style={{
                  marginTop: "15px",
                  width: "100%",
                  borderRadius: "12px",
                  maxHeight: "220px",
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          <button
            onClick={enregistrer}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              background: "#d4af37",
              color: "#000",
              fontWeight: 800,
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </main>
  );
}