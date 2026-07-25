import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function Club() {
  const club = await prisma.club.findFirst();

  if (!club) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0b0b0b",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
      >
        Le Club n'est pas encore configuré.
      </main>
    );
  }

  return (
    <main
      style={{
        background: "#0b0b0b",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <Navbar />

      {/* HERO */}

      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          paddingTop: "90px",
          backgroundImage: `url(${club.image1})`,
          backgroundSize: "contain",
backgroundRepeat: "no-repeat",
backgroundColor: "#0b0b0b",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom,rgba(0,0,0,.45),rgba(0,0,0,.82))",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            maxWidth: "900px",
            width: "100%",
            padding: "20px",
          }}
        >
          <h1
            style={{
              color: "#d4af37",
              fontSize: "clamp(42px,11vw,95px)",
              fontWeight: 900,
              marginBottom: "20px",
              lineHeight: 1.05,
            }}
          >
            {club.titre}
          </h1>

          <p
            style={{
              fontSize: "clamp(18px,5vw,30px)",
              lineHeight: 1.7,
            }}
          >
            {club.sousTitre}
          </p>
        </div>
      </section>
        {/* PHILOSOPHIE */}

      <section
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "70px 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: "40px",
          alignItems: "center",
        }}
      >
        <div>
          <img
            src={club.image2}
            alt={club.titre}
            style={{
              width: "100%",
              borderRadius: "22px",
              objectFit: "cover",
              border: "2px solid rgba(212,175,55,.25)",
              boxShadow: "0 20px 50px rgba(0,0,0,.45)",
            }}
          />
        </div>

        <div>
          <h2
            style={{
              color: "#d4af37",
              fontSize: "clamp(34px,8vw,48px)",
              fontWeight: 900,
              marginBottom: "25px",
              textAlign: "center",
            }}
          >
            Notre philosophie
          </h2>

          <p
            style={{
              color: "#e6e6e6",
              fontSize: "clamp(17px,4.5vw,20px)",
              lineHeight: 1.9,
              whiteSpace: "pre-line",
              textAlign: "justify",
            }}
          >
            {club.philosophie}
          </p>
        </div>
      </section>

      {/* NOTRE SALLE */}

      <section
        style={{
          background: "#111111",
          padding: "70px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#d4af37",
              fontSize: "clamp(34px,8vw,48px)",
              fontWeight: 900,
              marginBottom: "30px",
            }}
          >
            Notre salle
          </h2>

          <p
            style={{
              color: "#ececec",
              fontSize: "clamp(17px,4.5vw,20px)",
              lineHeight: 1.9,
              whiteSpace: "pre-line",
            }}
          >
            {club.salle}
          </p>
        </div>
      </section>
       {/* POURQUOI HEALTHYFIT */}

      <section
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "70px 20px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#d4af37",
            fontSize: "clamp(34px,8vw,48px)",
            fontWeight: 900,
            marginBottom: "40px",
          }}
        >
          Pourquoi choisir HealthyFit ?
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "25px",
          }}
        >
          {[
            {
              titre: "Coaching personnalisé",
              texte:
                "Un accompagnement adapté à vos objectifs et à votre niveau.",
            },
            {
              titre: "Nutrition",
              texte:
                "Des conseils simples et efficaces pour compléter votre entraînement.",
            },
            {
              titre: "Ambiance familiale",
              texte:
                "Une salle conviviale où chacun trouve sa place et progresse à son rythme.",
            },
            {
              titre: "Résultats durables",
              texte:
                "Notre objectif est de vous aider à changer vos habitudes sur le long terme.",
            },
          ].map((item) => (
            <div
              key={item.titre}
              style={{
                background: "#161616",
                borderRadius: "20px",
                padding: "30px",
                border: "1px solid rgba(212,175,55,.25)",
                boxShadow: "0 10px 30px rgba(0,0,0,.35)",
              }}
            >
              <h3
                style={{
                  color: "#d4af37",
                  fontSize: "26px",
                  marginBottom: "18px",
                  textAlign: "center",
                }}
              >
                {item.titre}
              </h3>

              <p
                style={{
                  color: "#ddd",
                  lineHeight: 1.8,
                  textAlign: "center",
                }}
              >
                {item.texte}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* APPEL À L'ACTION */}

      <section
        style={{
          padding: "80px 20px",
          background: "linear-gradient(180deg,#151515 0%,#0b0b0b 100%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              color: "#d4af37",
              fontSize: "clamp(36px,8vw,52px)",
              fontWeight: 900,
              marginBottom: "25px",
            }}
          >
            Prêt à commencer l'aventure ?
          </h2>

          <p
            style={{
              color: "#e5e5e5",
              fontSize: "clamp(18px,4.5vw,21px)",
              lineHeight: 1.8,
              marginBottom: "40px",
            }}
          >
            Venez découvrir HealthyFit et profitez d'un accompagnement
            personnalisé pour atteindre vos objectifs dans une ambiance
            conviviale, motivante et familiale.
          </p>

          <a
            href="/contact"
            style={{
              display: "inline-block",
              background: "#d4af37",
              color: "#000",
              padding: "18px 45px",
              borderRadius: "14px",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: "20px",
              boxShadow: "0 10px 25px rgba(212,175,55,.35)",
            }}
          >
            {club.bouton}
          </a>
        </div>
      </section>
    </main>
  );
}         