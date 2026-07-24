import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

export default async function Nutrition() {
  const nutrition = await prisma.nutrition.findFirst();

  if (!nutrition) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0b0b0b",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
        }}
      >
        La page Nutrition n'est pas encore configurée.
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
          backgroundImage: `url(${nutrition.imageHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "90px",
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
            maxWidth: "900px",
            width: "100%",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h1
            style={{
              color: "#d4af37",
              fontSize: "clamp(40px,10vw,90px)",
              fontWeight: 900,
              marginBottom: "20px",
              lineHeight: 1.05,
            }}
          >
            {nutrition.titre}
          </h1>

          <p
            style={{
              fontSize: "clamp(18px,5vw,22px)",
              lineHeight: 1.8,
              marginBottom: "35px",
            }}
          >
            {nutrition.sousTitre}
          </p>

          <a
            href="/contact"
            style={{
              background: "#d4af37",
              color: "#000",
              textDecoration: "none",
              padding: "18px 40px",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            {nutrition.bouton}
          </a>
        </div>
      </section>
      {/* IMPORTANCE DE LA NUTRITION */}

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
          {nutrition.imageImportance && (
            <img
              src={nutrition.imageImportance}
              alt="Pourquoi la nutrition est importante"
              style={{
                width: "100%",
                borderRadius: "24px",
                objectFit: "cover",
                boxShadow: "0 25px 60px rgba(0,0,0,.45)",
                border: "2px solid rgba(212,175,55,.20)",
              }}
            />
          )}
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
            Pourquoi la nutrition est-elle si importante ?
          </h2>

          <p
            style={{
              color: "#ececec",
              fontSize: "clamp(17px,4.5vw,20px)",
              lineHeight: 1.9,
              whiteSpace: "pre-line",
              textAlign: "justify",
            }}
          >
            {nutrition.importance}
          </p>
        </div>
      </section>

      {/* ACCOMPAGNEMENT */}

      <section
        style={{
          background: "#111111",
          padding: "70px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1300px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: "40px",
            alignItems: "center",
          }}
        >
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
              Comment HealthyFit vous accompagne
            </h2>

            <p
              style={{
                color: "#ececec",
                fontSize: "clamp(17px,4.5vw,20px)",
                lineHeight: 1.9,
                whiteSpace: "pre-line",
                textAlign: "justify",
              }}
            >
              {nutrition.accompagnement}
            </p>
          </div>

          <div>
            {nutrition.imageCoach && (
              <img
                src={nutrition.imageCoach}
                alt="Accompagnement"
                style={{
                  width: "100%",
                  borderRadius: "24px",
                  objectFit: "cover",
                  boxShadow: "0 25px 60px rgba(0,0,0,.45)",
                  border: "2px solid rgba(212,175,55,.20)",
                }}
              />
            )}
          </div>
        </div>
      </section>. 
       {/* NOTRE MÉTHODE */}

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#d4af37",
            fontSize: "clamp(36px,8vw,52px)",
            fontWeight: 900,
            marginBottom: "20px",
          }}
        >
          Notre méthode
        </h2>

        <p
          style={{
            color: "#d5d5d5",
            fontSize: "clamp(18px,4.5vw,20px)",
            marginBottom: "50px",
            lineHeight: 1.8,
          }}
        >
          Un accompagnement simple, personnalisé et progressif pour vous aider
          à atteindre vos objectifs durablement.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: "25px",
          }}
        >
          {[
            {
              numero: "01",
              titre: "Votre bilan",
              texte:
                "Nous prenons le temps de comprendre votre situation, vos habitudes et vos objectifs.",
            },
            {
              numero: "02",
              titre: "Vos objectifs",
              texte:
                "Nous définissons ensemble des objectifs réalistes et adaptés à votre mode de vie.",
            },
            {
              numero: "03",
              titre: "Votre accompagnement",
              texte:
                "Vous recevez des conseils simples et personnalisés pour progresser à votre rythme.",
            },
            {
              numero: "04",
              titre: "Votre suivi",
              texte:
                "Nous restons présents pour vous accompagner, ajuster et répondre à vos questions.",
            },
          ].map((item) => (
            <div
              key={item.numero}
              style={{
                background: "#171717",
                padding: "35px 25px",
                borderRadius: "22px",
                border: "1px solid rgba(212,175,55,.20)",
                boxShadow: "0 15px 40px rgba(0,0,0,.35)",
              }}
            >
              <div
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  background: "#d4af37",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: 900,
                  margin: "0 auto 20px",
                }}
              >
                {item.numero}
              </div>

              <h3
                style={{
                  color: "#d4af37",
                  fontSize: "26px",
                  marginBottom: "18px",
                }}
              >
                {item.titre}
              </h3>

              <p
                style={{
                  color: "#dddddd",
                  lineHeight: 1.8,
                  fontSize: "17px",
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
          background: "linear-gradient(180deg,#161616,#0b0b0b)",
          padding: "80px 20px",
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
              fontSize: "clamp(36px,8vw,54px)",
              fontWeight: 900,
              marginBottom: "25px",
              lineHeight: 1.15,
            }}
          >
            Prêt à reprendre votre alimentation en main ?
          </h2>

          <p
            style={{
              color: "#e4e4e4",
              fontSize: "clamp(18px,4.5vw,21px)",
              lineHeight: 1.9,
              marginBottom: "40px",
            }}
          >
            Chaque changement commence par une première discussion.
            <br />
            Venez réaliser votre bilan nutritionnel et découvrons ensemble
            comment atteindre vos objectifs grâce à un accompagnement
            personnalisé.
          </p>

          <a
            href="/contact"
            style={{
              display: "inline-block",
              background: "#d4af37",
              color: "#000",
              textDecoration: "none",
              padding: "18px 45px",
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: "20px",
              boxShadow: "0 10px 25px rgba(212,175,55,.35)",
            }}
          >
            {nutrition.bouton}
          </a>
        </div>
      </section>
    </main>
  );
}                