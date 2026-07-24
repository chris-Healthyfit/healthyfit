"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

type Photo = {
  id: number;
  titre: string;
  categorie: string;
  image: string;
  ordre: number;
};

export default function Galerie() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categorie, setCategorie] = useState("Toutes");
  const [selection, setSelection] = useState<Photo | null>(null);

  useEffect(() => {
    fetch("/api/galerie")
      .then((res) => res.json())
      .then((data) => setPhotos(data.filter((p: any) => p.actif)));
  }, []);

  const categories = [
    "Toutes",
    ...new Set(photos.map((p) => p.categorie)),
  ];

  const photosAffichees =
    categorie === "Toutes"
      ? photos
      : photos.filter((p) => p.categorie === categorie);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
        padding: "70px 30px",
      }}
    >
      <Navbar />
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#d4af37",
            fontSize: 54,
            textAlign: "center",
            marginBottom: 15,
          }}
        >
          Galerie
        </h1>

        <p
          style={{
            color: "#bdbdbd",
            textAlign: "center",
            marginBottom: 50,
            fontSize: 18,
          }}
        >
          Découvrez quelques moments de la vie chez HealthyFit.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 50,
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategorie(cat)}
              style={{
                padding: "10px 22px",
                borderRadius: 30,
                border:
                  categorie === cat
                    ? "1px solid #d4af37"
                    : "1px solid #333",
                background:
                  categorie === cat ? "#d4af37" : "transparent",
                color: categorie === cat ? "#000" : "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(320px,1fr))",
            gap: 25,
          }}
        >
          {photosAffichees.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelection(photo)}
              style={{
                cursor: "pointer",
                overflow: "hidden",
                borderRadius: 20,
                border: "1px solid rgba(212,175,55,.18)",
                background: "#141414",
              }}
            >
              <img
                src={photo.image}
                alt={photo.titre}
                style={{
                  width: "100%",
                  height: 260,
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div
                style={{
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    color: "#d4af37",
                    marginBottom: 8,
                  }}
                >
                  {photo.titre}
                </h3>

                <p
                  style={{
                    color: "#bdbdbd",
                  }}
                >
                  {photo.categorie}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selection && (
          <div
            onClick={() => setSelection(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.92)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
              padding: 30,
              cursor: "pointer",
            }}
          >
            <img
              src={selection.image}
              alt={selection.titre}
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
                borderRadius: 20,
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}