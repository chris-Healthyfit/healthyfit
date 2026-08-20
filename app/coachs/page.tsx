import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

type Coach = {
  id: number;
  prenom: string;
  nom: string;
  telephone: string;
  facebook: string;
  description: string;
  image: string;
};

export default async function Coachs() {
  const coachs: Coach[] = await prisma.coach.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <main className="hf-page">
      <Navbar />

      <section className="hf-wrap" style={{ textAlign: "center" }}>
        <header className="hf-hero">
          <h1 className="hf-title">NOTRE ÉQUIPE</h1>
          <div className="hf-divider" />
          <p className="hf-subtitle">
            Chez HealthyFit, nos coachs bénéficient d&apos;une formation continue au
            sein de notre structure. Cette exigence nous permet de vous garantir
            un accompagnement personnalisé, professionnel et une expérience
            optimale en sport comme en nutrition.
          </p>
        </header>

        <div className="hf-grid-cards hf-stagger">
          {coachs.map((coach) => (
            <article key={coach.id} className="hf-card-media">
              <img
                src={coach.image}
                alt={`${coach.prenom} ${coach.nom}`}
                className="hf-img-cover hf-img-coach"
              />

              <div className="hf-card-body">
                <h2 className="hf-card-title">
                  {coach.prenom} {coach.nom}
                </h2>
                <div className="hf-gold-line" />

                <p className="hf-text" style={{ textAlign: "justify", fontSize: 17 }}>
                  {coach.description}
                </p>

                <a
                  href={`tel:${coach.telephone}`}
                  style={{
                    display: "block",
                    marginTop: 22,
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  📞 {coach.telephone}
                </a>

                <a
                  href={coach.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="hf-btn-facebook"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8.049C16 3.603 12.418 0 8 0S0 3.603 0 8.049c0 4.017 2.926 7.347 6.75 7.951v-5.625H4.719V8.049H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.875 0 1.79.157 1.79.157v1.98h-1.008c-.994 0-1.304.621-1.304 1.258v1.51h2.219l-.354 2.326H9.25V16C13.074 15.396 16 12.066 16 8.049z" />
                  </svg>
                  Facebook
                </a>
              </div>
            </article>
          ))}
        </div>

        {coachs.length === 0 && (
          <div className="hf-empty">
            Aucun coach n&apos;est disponible pour le moment.
          </div>
        )}
      </section>
    </main>
  );
}
