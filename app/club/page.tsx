import Navbar from "@/components/Navbar";
import ClubSecretTrigger from "@/components/ClubSecretTrigger";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function Club() {
  const club = await prisma.club.findFirst();

  if (!club) {
    return (
      <main className="hf-page-plain" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 24 }}>Le Club n&apos;est pas encore configuré.</p>
      </main>
    );
  }

  const pourquoi = [
    {
      titre: "Coaching personnalisé",
      texte: "Un accompagnement adapté à vos objectifs et à votre niveau.",
    },
    {
      titre: "Nutrition",
      texte: "Des conseils simples et efficaces pour compléter votre entraînement.",
    },
    {
      titre: "Ambiance familiale",
      texte: "Une salle conviviale où chacun trouve sa place et progresse à son rythme.",
    },
    {
      titre: "Résultats durables",
      texte: "Notre objectif est de vous aider à changer vos habitudes sur le long terme.",
    },
  ];

  return (
    <main className="hf-page-plain">
      <Navbar />

      <section
        className="hf-hero-full"
        style={{ backgroundImage: `url(${club.image1})` }}
      >
        <div className="hf-hero-overlay" />
        <div className="hf-hero-content">
          <ClubSecretTrigger>
            <h1 className="hf-title-plain">{club.titre}</h1>
          </ClubSecretTrigger>
          <p className="hf-subtitle" style={{ color: "#fff" }}>
            {club.sousTitre}
          </p>
        </div>
      </section>

      <section className="hf-section">
        <div className="hf-grid-2" style={{ maxWidth: 1300, margin: "0 auto" }}>
          <img src={club.image2} alt={club.titre} className="hf-img" />
          <div>
            <h2 className="hf-title-md">Notre philosophie</h2>
            <p className="hf-text hf-text-justify">{club.philosophie}</p>
          </div>
        </div>
      </section>

      <section className="hf-section-dark">
        <div className="hf-cta">
          <h2 className="hf-title-md">Notre salle</h2>
          <p className="hf-text hf-text-justify" style={{ maxWidth: 1000, margin: "0 auto" }}>
            {club.salle}
          </p>
        </div>
      </section>

      <section className="hf-section">
        <h2 className="hf-title-md" style={{ marginBottom: 40 }}>
          Pourquoi choisir HealthyFit ?
        </h2>
        <div className="hf-grid-3 hf-stagger" style={{ maxWidth: 1300, margin: "0 auto" }}>
          {pourquoi.map((item) => (
            <article key={item.titre} className="hf-card">
              <h3 className="hf-card-title-sm">{item.titre}</h3>
              <p className="hf-text" style={{ textAlign: "center", color: "#ddd", fontSize: 16 }}>
                {item.texte}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="hf-section-gradient">
        <div className="hf-cta">
          <h2 className="hf-cta-title">Prêt à commencer l&apos;aventure ?</h2>
          <p className="hf-cta-text">
            Venez découvrir HealthyFit et profitez d&apos;un accompagnement
            personnalisé pour atteindre vos objectifs dans une ambiance
            conviviale, motivante et familiale.
          </p>
          <a href="/contact" className="hf-btn-gold">
            {club.bouton}
          </a>
        </div>
      </section>
    </main>
  );
}
