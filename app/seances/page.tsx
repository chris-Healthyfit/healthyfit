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
    orderBy: {
      id: "asc",
    },
  });

  return (
    <main
      className="min-h-screen"
      style={{
        paddingTop: "120px",
        background:
          "linear-gradient(rgba(0,0,0,.85), rgba(0,0,0,.80)), url('/images/fond.jpg') center/cover no-repeat",
      }}
    >
      <Navbar />

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "30px 18px 80px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(42px,10vw,70px)",
            fontWeight: 900,
            textTransform: "uppercase",
            background:
              "linear-gradient(180deg,#fff8d7 0%,#f4d66a 25%,#d4af37 55%,#9f7a23 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 8px rgba(0,0,0,.35)",
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          Nos Séances
        </h1>

        <p
          style={{
            marginTop: "30px",
            fontSize: "clamp(18px,5vw,22px)",
            color: "#ffffff",
            lineHeight: 1.8,
            maxWidth: "900px",
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "50px",
          }}
        >
          Découvrez une variété de séances pensées pour répondre à chaque
          objectif. Que vous souhaitiez vous remettre en forme, perdre du poids,
          vous renforcer ou simplement bouger dans une ambiance conviviale,
          HealthyFit vous accompagne avec des cours adaptés à tous les niveaux.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "25px",
          }}
        >
          {seances.map((seance) => (
             <div
              key={seance.id}
              style={{
                background: "#141414",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #2b2b2b",
                boxShadow: "0 12px 30px rgba(0,0,0,.35)",
              }}
            >
              {seance.image && (
                <img
                  src={seance.image}
                  alt={seance.titre}
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                  }}
                />
              )}

              <div
                style={{
                  padding: "22px",
                }}
              >
                <div
                  style={{
                    color: "#d4af37",
                    fontWeight: 700,
                    marginBottom: "10px",
                    fontSize: "16px",
                  }}
                >
                  🕒 {seance.horaire}
                </div>

                <h2
                  style={{
                    color: "#d4af37",
                    fontSize: "30px",
                    marginBottom: "15px",
                    lineHeight: 1.2,
                  }}
                >
                  {seance.titre}
                </h2>

                <p
                  style={{
                    color: "#ddd",
                    lineHeight: 1.8,
                    minHeight: "auto",
                    fontSize: "17px",
                  }}
                >
                  {seance.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "22px",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      background: "#222",
                      padding: "8px 14px",
                      borderRadius: "999px",
                    }}
                  >
                    ⏱ {seance.duree}
                  </span>

                  <span
                    style={{
                      background: "#222",
                      padding: "8px 14px",
                      borderRadius: "999px",
                    }}
                  >
                    💪 {seance.niveau}
                  </span>

                  <span
                    style={{
                      background: "#222",
                      padding: "8px 14px",
                      borderRadius: "999px",
                    }}
                  >
                    💶 {seance.prix} €
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
         {seances.length === 0 && (
          <div
            style={{
              marginTop: "60px",
              color: "#bdbdbd",
              fontSize: "20px",
            }}
          >
            Aucune séance n'est disponible pour le moment.
          </div>
        )}
      </section>
    </main>
  );
}                  