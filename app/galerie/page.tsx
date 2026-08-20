"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";

type Photo = {
  id: number;
  titre: string;
  categorie: string;
  image: string;
  ordre: number;
  actif: boolean;
};

export default function Galerie() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categorie, setCategorie] = useState("Toutes");
  const [selection, setSelection] = useState<Photo | null>(null);

  useEffect(() => {
    fetch("/api/galerie")
      .then((res) => res.json())
      .then((data) => setPhotos(data.filter((p: Photo) => p.actif)));
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
    <main className="hf-page">
      <Navbar />

      <div className="hf-wrap-lg">
        <header className="hf-hero">
          <h1 className="hf-title">Galerie</h1>
          <div className="hf-divider" />
          <p className="hf-subtitle">
            Découvrez quelques moments de la vie chez HealthyFit.
          </p>
        </header>

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
              type="button"
              onClick={() => setCategorie(cat)}
              className={`hf-btn-filter ${
                categorie === cat ? "hf-btn-filter-active" : ""
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="hf-grid-gallery hf-stagger">
          {photosAffichees.map((photo) => (
            <article
              key={photo.id}
              onClick={() => setSelection(photo)}
              className="hf-gallery-item"
            >
              <img
                src={photo.image}
                alt={photo.titre}
                className="hf-img-cover hf-img-gallery"
              />
              <div className="hf-card-body" style={{ padding: 20 }}>
                <h3 className="hf-card-title" style={{ fontSize: 20, marginBottom: 8 }}>
                  {photo.titre}
                </h3>
                <p style={{ color: "#bdbdbd" }}>{photo.categorie}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selection && (
        <div
          className="hf-lightbox"
          onClick={() => setSelection(null)}
          onKeyDown={() => {}}
          role="button"
          tabIndex={0}
        >
          <img src={selection.image} alt={selection.titre} />
        </div>
      )}
    </main>
  );
}
