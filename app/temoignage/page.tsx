import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

type Temoignage = {
  id: number;
  prenom: string;
  texte: string;
  image: string;
};

export default async function TemoignagesPage() {
  const temoignages: Temoignage[] = await prisma.temoignage.findMany({
    where: { actif: true },
    orderBy: { ordre: "asc" },
  });

  return (
    <main className="hf-page">
      <Navbar />

      <section
        className="hf-wrap-sm"
        style={{ textAlign: "center", paddingBottom: 40 }}
      >
        <header className="hf-hero">
          <h1 className="hf-title">Leurs résultats parlent d&apos;eux-mêmes</h1>
          <div className="hf-divider" />
          <p className="hf-subtitle">
            Derrière chaque résultat se cache un accompagnement, de la
            motivation et de la régularité. Découvrez quelques-uns des parcours
            de nos membres.
          </p>
        </header>
      </section>

      <section
        className="hf-wrap-sm"
        style={{ paddingTop: 0, display: "grid", gap: 24 }}
      >
        {temoignages.length === 0 ? (
          <div className="hf-empty">Aucun témoignage pour le moment.</div>
        ) : (
          temoignages.map((temoignage) => (
            <article key={temoignage.id} className="hf-card hf-testimonial">
              <img
                src={temoignage.image}
                alt={temoignage.prenom}
                className="hf-testimonial-img"
              />
              <div>
                <h2 className="hf-card-title" style={{ textAlign: "center" }}>
                  {temoignage.prenom}
                </h2>
                <div className="hf-gold-line" />
                <p className="hf-text hf-text-justify" style={{ fontSize: 18 }}>
                  {temoignage.texte}
                </p>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="hf-section" style={{ paddingTop: 20 }}>
        <div
          className="hf-card hf-cta"
          style={{ maxWidth: 1000, margin: "0 auto" }}
        >
          <h2
            className="hf-cta-title"
            style={{ fontSize: "clamp(30px, 7vw, 42px)" }}
          >
            Et si le prochain témoignage était le vôtre ?
          </h2>
          <p
            className="hf-cta-text"
            style={{ maxWidth: 700, margin: "0 auto 35px" }}
          >
            Prenez rendez-vous pour votre bilan personnalisé et commencez votre
            propre transformation avec HealthyFit.
          </p>
          <a href="/contact" className="hf-btn-gold">
            Réserver mon bilan
          </a>
        </div>
      </section>
    </main>
  );
}
