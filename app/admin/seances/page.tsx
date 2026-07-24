"use client";

import { useEffect, useState } from "react";

type Seance = {
  id: number;
  horaire: string;
  titre: string;
  description: string;
  duree: string;
  niveau: string;
  calories: string;
  image: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #2e2e2e",
  background: "#1a1a1a",
  color: "white",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  marginBottom: "6px",
  color: "#d4af37",
  fontWeight: 600,
};

export default function AdminPage() {
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
    setSeances(data);
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
    setPrix(seance.calories);
    setImage(seance.image);
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer cette séance ?")) return;

    await fetch(`/api/seances/${id}`, {
      method: "DELETE",
    });

    chargerSeances();
  }

  async function ajouterSeance() {
    const url =
      editId === null
        ? "/api/seances"
        : `/api/seances/${editId}`;

    const method =
      editId === null
        ? "POST"
        : "PUT";

    let imageUrl = image;

    if (fichier) {
      const formData = new FormData();
      formData.append("file", fichier);

      const upload = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const resultat = await upload.json();
      imageUrl = resultat.image;
    }

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        horaire,
        titre,
        description,
        duree,
        niveau,
        calories: prix,
        image: imageUrl,
      }),
    });

    setHoraire("");
    setTitre("");
    setDescription("");
    setDuree("");
    setNiveau("");
    setPrix("");
    setImage("");
    setEditId(null);

    chargerSeances();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        padding: "20px",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#d4af37",
            fontSize: "clamp(34px,8vw,48px)",
            marginBottom: "10px",
            fontWeight: 900,
          }}
        >
          HealthyFit Admin
        </h1>

        <p
          style={{
            color: "#bdbdbd",
            marginBottom: "30px",
            fontSize: "clamp(16px,4vw,18px)",
            lineHeight: 1.7,
          }}
        >
          Gérez facilement toutes les séances de votre club.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: "30px",
            alignItems: "start",
          }}
        >
                 <div
            style={{
              background: "#141414",
              padding: "20px",
              borderRadius: "18px",
              border: "1px solid #2b2b2b",
            }}
          >
            <h2
              style={{
                color: "#d4af37",
                marginBottom: "25px",
                fontSize: "clamp(26px,6vw,32px)",
              }}
            >
              {editId === null ? "Ajouter une séance" : "Modifier une séance"}
            </h2>

            <div style={{ marginBottom: 18 }}>
              <div style={labelStyle}>Horaire</div>

              <input
                style={inputStyle}
                placeholder="18h30"
                value={horaire}
                onChange={(e) => setHoraire(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={labelStyle}>Titre</div>

              <input
                style={inputStyle}
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={labelStyle}>Description</div>

              <textarea
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "120px",
                }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={labelStyle}>Durée</div>

              <input
                style={inputStyle}
                value={duree}
                onChange={(e) => setDuree(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={labelStyle}>Niveau</div>

              <select
                style={inputStyle}
                value={niveau}
                onChange={(e) => setNiveau(e.target.value)}
              >
                <option value="">Choisir...</option>
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
                <option>Tous niveaux</option>
                <option>Enfants/parents</option>
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={labelStyle}>Prix</div>

              <input
                style={inputStyle}
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 25 }}>
              <div style={labelStyle}>Image</div>

              <input
                type="file"
                accept="image/*"
                style={{ width: "100%" }}
                onChange={(e) => {
                  if (e.target.files?.length) {
                    setFichier(e.target.files[0]);
                  }
                }}
              />

              {image && (
                <img
                  src={image}
                  alt=""
                  style={{
                    marginTop: 15,
                    width: "100%",
                    borderRadius: 12,
                    maxHeight: 180,
                    objectFit: "cover",
                  }}
                />
              )}
            </div>

            <button
              onClick={ajouterSeance}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                background: "#d4af37",
                color: "#000",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: "17px",
              }}
            >
              {editId === null
                ? "Ajouter la séance"
                : "Enregistrer les modifications"}
            </button>
          </div>

          <div>
            <h2
              style={{
                color: "#d4af37",
                marginBottom: "25px",
                fontSize: "clamp(28px,7vw,34px)",
              }}
            >
              Séances enregistrées
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                gap: "20px",
              }}
            >
                           {seances.map((seance) => (
                <div
                  key={seance.id}
                  style={{
                    background: "#141414",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid #2b2b2b",
                  }}
                >
                  {seance.image && (
                    <img
                      src={seance.image}
                      alt={seance.titre}
                      style={{
                        width: "100%",
                        height: "clamp(200px,45vw,220px)",
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
                        marginBottom: "12px",
                        fontSize: "clamp(22px,6vw,24px)",
                      }}
                    >
                      <div
                        style={{
                          color: "#d4af37",
                          fontSize: "15px",
                          fontWeight: 700,
                          marginBottom: "8px",
                        }}
                      >
                        🕒 {seance.horaire}
                      </div>

                      {seance.titre}
                    </h3>

                    <p
                      style={{
                        color: "#d8d8d8",
                        lineHeight: 1.6,
                        minHeight: "70px",
                      }}
                    >
                      {seance.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginTop: "18px",
                      }}
                    >
                      <span
                        style={{
                          background: "#222",
                          padding: "8px 14px",
                          borderRadius: "999px",
                        }}
                      >
                        ⏱ {seance.duree}
                      </span>

                      <span
                        style={{
                          background: "#222",
                          padding: "8px 14px",
                          borderRadius: "999px",
                        }}
                      >
                        💶 {seance.calories} €
                      </span>

                      <span
                        style={{
                          background: "#222",
                          padding: "8px 14px",
                          borderRadius: "999px",
                        }}
                      >
                        💪 {seance.niveau}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginTop: "25px",
                      }}
                    >
                      <button
                        onClick={() => modifier(seance)}
                        style={{
                          flex: 1,
                          minWidth: "140px",
                          background: "#d4af37",
                          color: "#000",
                          border: "none",
                          borderRadius: "10px",
                          padding: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ✏ Modifier
                      </button>

                      <button
                        onClick={() => supprimer(seance.id)}
                        style={{
                          flex: 1,
                          minWidth: "140px",
                          background: "#a82020",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          padding: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        🗑 Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 