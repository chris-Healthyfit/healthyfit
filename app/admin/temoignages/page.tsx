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

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setImage(data.url);
  }

  async function enregistrer() {
    const body = {
      prenom,
      texte,
      image,
      ordre,
      actif,
    };

    if (edition === null) {
      await fetch("/api/temoignages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`/api/temoignages/${edition}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    }

    reset();
    charger();
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer ce témoignage ?")) return;

    await fetch(`/api/temoignages/${id}`, {
      method: "DELETE",
    });

    charger();
  }

  function modifier(t: Temoignage) {
    setEdition(t.id);
    setPrenom(t.prenom);
    setTexte(t.texte);
    setImage(t.image);
    setOrdre(t.ordre);
    setActif(t.actif);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function reset() {
    setEdition(null);
    setPrenom("");
    setTexte("");
    setImage("");
    setOrdre(0);
    setActif(true);
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
  minHeight: "150px",
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
        minHeight: "100vh",
        color: "white",
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
            fontSize: "clamp(34px,8vw,48px)",
            marginBottom: "10px",
          }}
        >
          Témoignages
        </h1>

        <p
          style={{
            color: "#cfcfcf",
            marginBottom: "30px",
            lineHeight: 1.7,
          }}
        >
          Gérez les témoignages de vos membres.
        </p>
             <div style={{ marginBottom: "25px" }}>
          <div style={labelStyle}>Prénom</div>

          <input
            style={inputStyle}
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <div style={labelStyle}>Témoignage</div>

          <textarea
            style={textareaStyle}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <div style={labelStyle}>Image Avant / Après</div>

          <input
            type="file"
            accept="image/*"
            style={{ width: "100%" }}
            onChange={async (e) => {
              if (!e.target.files?.length) return;

              await upload(e.target.files[0]);
            }}
          />

          {image && (
            <img
              src={image}
              alt=""
              style={{
                width: "100%",
                maxHeight: "350px",
                objectFit: "cover",
                borderRadius: "15px",
                marginTop: "20px",
              }}
            />
          )}
        </div>

        <div style={{ marginBottom: "25px" }}>
          <div style={labelStyle}>Ordre d'affichage</div>

          <input
            type="number"
            style={inputStyle}
            value={ordre}
            onChange={(e) => setOrdre(Number(e.target.value))}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "35px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="checkbox"
            checked={actif}
            onChange={(e) => setActif(e.target.checked)}
          />

          <span>Afficher ce témoignage</span>
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
            marginBottom: "45px",
          }}
        >
          {edition === null
            ? "Ajouter le témoignage"
            : "Modifier le témoignage"}
        </button>

        <h2
          style={{
            color: "#d4af37",
            marginBottom: "25px",
            fontSize: "clamp(28px,7vw,34px)",
          }}
        >
          Témoignages enregistrés
        </h2>

        <div
          style={{
            display: "grid",
            gap: "25px",
          }}
        >
                   {temoignages.map((t) => (
            <div
              key={t.id}
              style={{
                background: "#151515",
                border: "1px solid #2c2c2c",
                borderRadius: "18px",
                overflow: "hidden",
              }}
            >
              {t.image && (
                <img
                  src={t.image}
                  alt={t.prenom}
                  style={{
                    width: "100%",
                    height: "clamp(220px,45vw,280px)",
                    objectFit: "cover",
                  }}
                />
              )}

              <div
                style={{
                  padding: "20px",
                }}
              >
                <h3
                  style={{
                    color: "#d4af37",
                    fontSize: "clamp(24px,6vw,28px)",
                    marginBottom: "15px",
                  }}
                >
                  {t.prenom}
                </h3>

                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    color: "#ddd",
                    lineHeight: 1.7,
                    marginBottom: "20px",
                  }}
                >
                  {t.texte}
                </p>

                <p
                  style={{
                    color: "#999",
                    marginBottom: "20px",
                  }}
                >
                  Ordre : {t.ordre} • {t.actif ? "Visible" : "Masqué"}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => modifier(t)}
                    style={{
                      flex: 1,
                      minWidth: "140px",
                      padding: "14px",
                      background: "#d4af37",
                      color: "#000",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => supprimer(t.id)}
                    style={{
                      flex: 1,
                      minWidth: "140px",
                      padding: "14px",
                      background: "#a11",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}   