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

  async function upload(
    file: File,
    setter: (value: string) => void
  ) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setter(data.url);
  }

  async function enregistrer() {
    await fetch("/api/nutrition", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },

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

    alert("Nutrition enregistrée !");
  }

 const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #444",
  background: "#1b1b1b",
  color: "white",
  fontSize: "16px",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "180px",
  resize: "vertical",
};

const labelStyle: React.CSSProperties = {
  color: "#d4af37",
  marginBottom: "8px",
  fontWeight: "bold",
};

  return (
    <main
      style={{
        background: "#0b0b0b",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#d4af37",
            fontSize: "clamp(36px,8vw,52px)",
            marginBottom: "10px",
          }}
        >
          Nutrition
        </h1>

        <p
          style={{
            color: "#cfcfcf",
            marginBottom: "30px",
            lineHeight: 1.7,
          }}
        >
          Modifiez le contenu de la page Nutrition.
        </p>
               {/* TITRE */}
        <div style={{ marginBottom: "25px" }}>
          <div style={labelStyle}>Titre</div>

          <input
            style={inputStyle}
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
        </div>

        {/* SOUS TITRE */}
        <div style={{ marginBottom: "25px" }}>
          <div style={labelStyle}>Sous-titre</div>

          <textarea
            style={textareaStyle}
            value={sousTitre}
            onChange={(e) => setSousTitre(e.target.value)}
          />
        </div>

        {/* IMPORTANCE */}
        <div style={{ marginBottom: "25px" }}>
          <div style={labelStyle}>
            Pourquoi la nutrition est importante ?
          </div>

          <textarea
            style={textareaStyle}
            value={importance}
            onChange={(e) => setImportance(e.target.value)}
          />
        </div>

        {/* ACCOMPAGNEMENT */}
        <div style={{ marginBottom: "35px" }}>
          <div style={labelStyle}>
            Comment HealthyFit accompagne ses membres ?
          </div>

          <textarea
            style={textareaStyle}
            value={accompagnement}
            onChange={(e) => setAccompagnement(e.target.value)}
          />
        </div>

        {/* IMAGE HERO */}
        <div style={{ marginBottom: "35px" }}>
          <div style={labelStyle}>Image Hero</div>

          <input
            type="file"
            accept="image/*"
            style={{ width: "100%" }}
            onChange={async (e) => {
              if (!e.target.files?.length) return;
              await upload(e.target.files[0], setImageHero);
            }}
          />

          {imageHero && (
            <img
              src={imageHero}
              alt=""
              style={{
                width: "100%",
                maxHeight: "250px",
                objectFit: "cover",
                borderRadius: "15px",
                marginTop: "15px",
              }}
            />
          )}
        </div>

        {/* IMAGE IMPORTANCE */}
        <div style={{ marginBottom: "35px" }}>
          <div style={labelStyle}>
            Image "Pourquoi la nutrition est importante"
          </div>

          <input
            type="file"
            accept="image/*"
            style={{ width: "100%" }}
            onChange={async (e) => {
              if (!e.target.files?.length) return;
              await upload(e.target.files[0], setImageImportance);
            }}
          />

          {imageImportance && (
            <img
              src={imageImportance}
              alt=""
              style={{
                width: "100%",
                maxHeight: "250px",
                objectFit: "cover",
                borderRadius: "15px",
                marginTop: "15px",
              }}
            />
          )}
        </div>

        {/* IMAGE ACCOMPAGNEMENT */}
        <div style={{ marginBottom: "35px" }}>
          <div style={labelStyle}>
            Image "Notre accompagnement"
          </div>

          <input
            type="file"
            accept="image/*"
            style={{ width: "100%" }}
            onChange={async (e) => {
              if (!e.target.files?.length) return;
              await upload(e.target.files[0], setImageCoach);
            }}
          />

          {imageCoach && (
            <img
              src={imageCoach}
              alt=""
              style={{
                width: "100%",
                maxHeight: "250px",
                objectFit: "cover",
                borderRadius: "15px",
                marginTop: "15px",
              }}
            />
          )}
        </div>

        {/* BOUTON */}
        <div style={{ marginBottom: "35px" }}>
          <div style={labelStyle}>Texte du bouton</div>

          <input
            style={inputStyle}
            value={bouton}
            onChange={(e) => setBouton(e.target.value)}
          />
        </div>

        <button
          onClick={enregistrer}
          style={{
            width: "100%",
            padding: "18px",
            background: "#d4af37",
            color: "#000",
            border: "none",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: 700,
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Enregistrer les modifications
        </button>
      </div>
    </main>
  );
} 