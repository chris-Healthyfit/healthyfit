import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

type Seance = {
  id: number;
  horaire: string;
  titre: string;
  description: string;
  duree: string;
  niveau: string;
  prix: string | null;
  image: string;
};

export default async function Seances() {
  const seances: Seance[] = await prisma.seance.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <main className="hf-page">
      <Navbar />

      <section className="hf-wrap-sm" style={{ textAlign: "center" }}>
        <header className="hf-hero">
          <h1 className="hf-title">Nos Séances</h1>
          <div className="hf-divider" />
          <p className="hf-subtitle">
            Découvrez une variété de séances pensées pour répondre à chaque
            objectif. Que vous souhaitiez vous remettre en forme, perdre du poids,
            vous renforcer ou simplement bouger dans une ambiance conviviale,
            HealthyFit vous accompagne avec des cours adaptés à tous les niveaux.
          </p>
        </header>

        <div className="hf-grid-cards hf-stagger">
          {seances.map((seance) => (
            <article key={seance.id} className="hf-card-media">
              {seance.image && (
                <img
                  src={seance.image}
                  alt={seance.titre}
                  className="hf-img-cover hf-img-seance"
                />
              )}

              <div className="hf-card-body">
                <div className="hf-horaire">🕒 {seance.horaire}</div>
                <h2 className="hf-card-title">{seance.titre}</h2>

                <p className="hf-text" style={{ fontSize: 17, textAlign: "left" }}>
                  {seance.description}
                </p>

                <div className="hf-tags">
                  <span className="hf-tag">⏱ {seance.duree}</span>
                  <span className="hf-tag">💪 {seance.niveau}</span>
                  {seance.prix && (
                    <span className="hf-tag">💶 {seance.prix} €</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {seances.length === 0 && (
          <div className="hf-empty">
            Aucune séance n&apos;est disponible pour le moment.
          </div>
        )}
      </section>
    </main>
  );
}
