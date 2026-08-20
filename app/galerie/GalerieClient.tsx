"use client";

import { useState } from "react";

type Photo = {
  id: number;
  titre: string;
  categorie: string;
  image: string;
};

export default function GalerieClient({
  photos,
  categories,
}: {
  photos: Photo[];
  categories: string[];
}) {
  const [categorie, setCategorie] = useState("Toutes");
  const [selection, setSelection] = useState<Photo | null>(null);

  const photosAffichees =
    categorie === "Toutes"
      ? photos
      : photos.filter((p) => p.categorie === categorie);

  return (
    <>
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

      {photosAffichees.length === 0 ? (
        <div className="hf-empty">Aucune photo pour le moment.</div>
      ) : (
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
                <h3
                  className="hf-card-title"
                  style={{ fontSize: 20, marginBottom: 8 }}
                >
                  {photo.titre}
                </h3>
                <p style={{ color: "#bdbdbd" }}>{photo.categorie}</p>
              </div>
            </article>
          ))}
        </div>
      )}

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
    </>
  );
}
