"use client";

import { useEffect, useState } from "react";

type Photo = {
  id: number;
  titre: string;
  categorie: string;
  image: string;
  ordre: number;
  actif: boolean;
};

export default function AdminGalerie() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [titre, setTitre] = useState("");
  const [categorie, setCategorie] = useState("Salle");
  const [image, setImage] = useState("");
  const [ordre, setOrdre] = useState(0);
  const [actif, setActif] = useState(true);

  const [edition, setEdition] = useState<number | null>(null);

  async function charger() {
    const res = await fetch("/api/galerie");
    const data = await res.json();
    setPhotos(data);
  }

  useEffect(() => {
    charger();
  }, []);

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
      titre,
      categorie,
      image,
      ordre,
      actif,
    };

    if (edition === null) {
      await fetch("/api/galerie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`/api/galerie/${edition}`, {
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

  function modifier(photo: Photo) {
    setEdition(photo.id);
    setTitre(photo.titre);
    setCategorie(photo.categorie);
    setImage(photo.image);
    setOrdre(photo.ordre);
    setActif(photo.actif);
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer cette photo ?")) return;

    await fetch(`/api/galerie/${id}`, {
      method: "DELETE",
    });

    charger();
  }

  function reset() {
    setEdition(null);
    setTitre("");
    setCategorie("Salle");
    setImage("");
    setOrdre(0);
    setActif(true);
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
          maxWidth: "1300px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#d4af37",
            fontSize: "clamp(34px,8vw,42px)",
            marginBottom: "25px",
          }}
        >
          Galerie
        </h1>

        <div
          style={{
            background: "#141414",
            padding: "20px",
            borderRadius: 20,
            border: "1px solid rgba(212,175,55,.2)",
            marginBottom: "30px",
          }}
        >
            <input
            placeholder="Titre"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            style={input}
          />

          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            style={input}
          >
            <option>Salle</option>
            <option>Cours</option>
            <option>Nutrition</option>
            <option>Coachs</option>
            <option>Événements</option>
            <option>Avant / Après</option>
            <option>Autres</option>
          </select>

          <input
            type="number"
            placeholder="Ordre"
            value={ordre}
            onChange={(e) => setOrdre(Number(e.target.value))}
            style={input}
          />

          <label
            style={{
              display: "block",
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            Image
          </label>

          <input
            type="file"
            accept="image/*"
            style={{ width: "100%" }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                upload(e.target.files[0]);
              }
            }}
          />

          {image && (
            <img
              src={image}
              alt=""
              style={{
                width: "100%",
                maxHeight: 250,
                objectFit: "cover",
                marginTop: 20,
                borderRadius: 12,
              }}
            />
          )}

          <div
            style={{
              marginTop: 20,
            }}
          >
            <label>
              <input
                type="checkbox"
                checked={actif}
                onChange={(e) => setActif(e.target.checked)}
              />{" "}
              Actif
            </label>
          </div>

          <button
            onClick={enregistrer}
            style={{
              ...button,
              width: "100%",
            }}
          >
            {edition === null ? "Ajouter" : "Modifier"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 20,
          }}
        >
                        {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                background: "#141414",
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid rgba(212,175,55,.2)",
              }}
            >
              {photo.image && (
                <img
                  src={photo.image}
                  alt={photo.titre}
                  style={{
                    width: "100%",
                    height: "clamp(220px,45vw,260px)",
                    objectFit: "cover",
                  }}
                />
              )}

              <div
                style={{
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    fontSize: "clamp(22px,6vw,26px)",
                    color: "#d4af37",
                    marginBottom: 10,
                  }}
                >
                  {photo.titre}
                </h3>

                <p>{photo.categorie}</p>

                <p>Ordre : {photo.ordre}</p>

                <p>{photo.actif ? "✅ Actif" : "❌ Inactif"}</p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginTop: 20,
                  }}
                >
                  <button
                    onClick={() => modifier(photo)}
                    style={{
                      ...button,
                      flex: "1 1 180px",
                      marginTop: 0,
                    }}
                  >
                    Modifier
                  </button>

                  <button
                    onClick={() => supprimer(photo.id)}
                    style={{
                      ...button,
                      flex: "1 1 180px",
                      marginTop: 0,
                      background: "#8b0000",
                      color: "#fff",
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

const input: React.CSSProperties = {
  width: "100%",
  padding: 14,
  marginBottom: 15,
  borderRadius: 10,
  border: "1px solid #444",
  background: "#1b1b1b",
  color: "white",
  boxSizing: "border-box",
};

const button: React.CSSProperties = {
  marginTop: 20,
  padding: "12px 20px",
  border: "none",
  borderRadius: 10,
  background: "#d4af37",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
};    