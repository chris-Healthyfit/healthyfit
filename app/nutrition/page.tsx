import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function Nutrition() {
  const nutrition = await prisma.nutrition.findFirst();

  if (!nutrition) {
    return (
      <main className="hf-page-plain" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 24 }}>La page Nutrition n&apos;est pas encore configurée.</p>
      </main>
    );
  }

  const methode = [
    {
      numero: "01",
      titre: "Votre bilan",
      texte: "Nous prenons le temps de comprendre votre situation, vos habitudes et vos objectifs.",
    },
    {
      numero: "02",
      titre: "Vos objectifs",
      texte: "Nous définissons ensemble des objectifs réalistes et adaptés à votre mode de vie.",
    },
    {
      numero: "03",
      titre: "Votre accompagnement",
      texte: "Vous recevez des conseils simples et personnalisés pour progresser à votre rythme.",
    },
    {
      numero: "04",
      titre: "Votre suivi",
      texte: "Nous restons présents pour vous accompagner, ajuster et répondre à vos questions.",
    },
  ];

  return (
    <main className="hf-page-plain">
      <Navbar />

      <section
        className="hf-hero-full hf-hero-full-cover"
        style={{ backgroundImage: `url(${nutrition.imageHero})` }}
      >
        <div className="hf-hero-overlay" />
        <div className="hf-hero-content">
          <h1 className="hf-title-plain">{nutrition.titre}</h1>
          <p className="hf-subtitle" style={{ color: "#fff", marginBottom: 35 }}>
            {nutrition.sousTitre}
          </p>
          <a href="/contact" className="hf-btn-gold">
            {nutrition.bouton}
          </a>
        </div>
      </section>

      <section className="hf-section">
        <div className="hf-grid-2" style={{ maxWidth: 1300, margin: "0 auto" }}>
          {nutrition.imageImportance && (
            <img
              src={nutrition.imageImportance}
              alt="Pourquoi la nutrition est importante"
              className="hf-img"
            />
          )}
          <div>
            <h2 className="hf-title-md">
              Pourquoi la nutrition est-elle si importante ?
            </h2>
            <p className="hf-text hf-text-justify">{nutrition.importance}</p>
          </div>
        </div>
      </section>

      <section className="hf-section-dark">
        <div className="hf-grid-2" style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div>
            <h2 className="hf-title-md">Comment HealthyFit vous accompagne</h2>
            <p className="hf-text hf-text-justify">{nutrition.accompagnement}</p>
          </div>
          {nutrition.imageCoach && (
            <img src={nutrition.imageCoach} alt="Accompagnement" className="hf-img" />
          )}
        </div>
      </section>

      <section className="hf-section" style={{ textAlign: "center" }}>
        <h2 className="hf-cta-title">Notre méthode</h2>
        <p className="hf-cta-text" style={{ marginBottom: 50 }}>
          Un accompagnement simple, personnalisé et progressif pour vous aider
          à atteindre vos objectifs durablement.
        </p>
        <div className="hf-grid-3 hf-stagger" style={{ maxWidth: 1200, margin: "0 auto" }}>
          {methode.map((item) => (
            <article key={item.numero} className="hf-card">
              <div className="hf-badge-num">{item.numero}</div>
              <h3 className="hf-card-title-sm">{item.titre}</h3>
              <p className="hf-text" style={{ fontSize: 17, color: "#ddd" }}>
                {item.texte}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="hf-section-gradient">
        <div className="hf-cta">
          <h2 className="hf-cta-title">
            Prêt à reprendre votre alimentation en main ?
          </h2>
          <p className="hf-cta-text">
            Chaque changement commence par une première discussion.
            <br />
            Venez réaliser votre bilan nutritionnel et découvrons ensemble
            comment atteindre vos objectifs grâce à un accompagnement
            personnalisé.
          </p>
          <a href="/contact" className="hf-btn-gold">
            {nutrition.bouton}
          </a>
        </div>
      </section>
    </main>
  );
}
