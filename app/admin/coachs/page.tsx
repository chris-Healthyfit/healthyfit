"use client";

import { useEffect, useState } from "react";

type Coach = {
  id: number;
  prenom: string;
  nom: string;
  telephone: string;
  facebook: string;
  description: string;
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

export default function AdminCoachs() {
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

    if (Array.isArray(data)) {
      setCoachs(data);
    } else {
      console.error(data);
      setCoachs([]);
    }
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
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer ce coach ?")) return;

    await fetch(`/api/coachs/${id}`, {
      method: "DELETE",
    });

    chargerCoachs();
  }

  async function ajouterCoach() {
    const url =
      editId === null
        ? "/api/coachs"
        : `/api/coachs/${editId}`;

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

if (!upload.ok) {
  alert("Erreur lors de l'upload de l'image.");
  return;
}

const resultat = await upload.json();

imageUrl = resultat.url;
    }

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
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
          Gérez facilement les coachs du club.
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
              {editId === null ? "Ajouter un coach" : "Modifier un coach"}
            </h2>

            <div style={{ marginBottom: 18 }}>
              <div style={labelStyle}>Prénom</div>

              <input
                style={inputStyle}
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={labelStyle}>Nom</div>

              <input
                style={inputStyle}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={labelStyle}>Téléphone</div>

              <input
                style={inputStyle}
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={labelStyle}>Facebook</div>

              <input
                style={inputStyle}
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
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

            <div style={{ marginBottom: 25 }}>
              <div style={labelStyle}>Photo</div>

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
                    maxHeight: 220,
                    objectFit: "cover",
                  }}
                />
              )}
            </div>

            <button
              onClick={ajouterCoach}
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
                ? "Ajouter le coach"
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
              Coachs enregistrés
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                gap: "20px",
              }}
            >
                        {coachs.map((coach) => (
                <div
                  key={coach.id}
                  style={{
                    background: "#141414",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid #2b2b2b",
                  }}
                >
                  {coach.image && (
                    <img
                      src={coach.image}
                      alt={`${coach.prenom} ${coach.nom}`}
                      style={{
                        width: "100%",
                        height: "clamp(220px,45vw,260px)",
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
                        fontSize: "clamp(22px,6vw,26px)",
                      }}
                    >
                      {coach.prenom} {coach.nom}
                    </h3>

                    <p
                      style={{
                        color: "#d8d8d8",
                        lineHeight: 1.6,
                        minHeight: "80px",
                      }}
                    >
                      {coach.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        marginTop: "18px",
                      }}
                    >
                      <span>📞 {coach.telephone}</span>

                      <a
                        href={coach.facebook}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#4da3ff",
                          textDecoration: "none",
                        }}
                      >
                        🔵 Facebook
                      </a>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginTop: "25px",
                      }}
                    >
                      <button
                        onClick={() => modifier(coach)}
                        style={{
                          flex: "1 1 180px",
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
                        onClick={() => supprimer(coach.id)}
                        style={{
                          flex: "1 1 180px",
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