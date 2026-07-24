import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

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
          maxWidth: "1250px",
          margin: "0 auto",
          padding: "30px 20px 80px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(40px,10vw,72px)",
            fontWeight: 900,
            textTransform: "uppercase",
            background:
              "linear-gradient(180deg,#fff8d7 0%,#f4d66a 25%,#d4af37 55%,#9f7a23 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 3px 10px rgba(0,0,0,.4)",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          NOTRE ÉQUIPE
        </h1>

        <p
          style={{
            marginTop: "30px",
            fontSize: "clamp(17px,4.5vw,22px)",
            color: "#ffffff",
            lineHeight: 1.8,
            maxWidth: "900px",
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "60px",
          }}
        >
          Chez HealthyFit, nos coachs bénéficient d'une formation continue au
          sein de notre structure. Cette exigence nous permet de vous garantir
          un accompagnement personnalisé, professionnel et une expérience
          optimale en sport comme en nutrition.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            gap: "30px",
          }}
        >
          {coachs.map((coach) => (
                        <div
              key={coach.id}
              style={{
                background: "#141414",
                border: "1px solid rgba(212,175,55,.35)",
                borderRadius: "22px",
                overflow: "hidden",
                boxShadow: "0 15px 40px rgba(0,0,0,.45)",
              }}
            >
              <img
                src={coach.image}
                alt={`${coach.prenom} ${coach.nom}`}
                style={{
                  width: "100%",
                  height: "360px",
                  objectFit: "cover",
                }}
              />

              <div
                style={{
                  padding: "25px",
                }}
              >
                <h2
                  style={{
                    fontSize: "clamp(24px,7vw,27px)",
                    color: "#d4af37",
                    margin: 0,
                    fontWeight: 800,
                    lineHeight: 1.2,
                  }}
                >
                  {coach.prenom} {coach.nom}
                </h2>

                <div
                  style={{
                    width: "70px",
                    height: "4px",
                    background: "#d4af37",
                    margin: "18px auto 22px",
                    borderRadius: "999px",
                  }}
                />

                <p
                  style={{
                    color: "#d9d9d9",
                    lineHeight: 1.8,
                    fontSize: "17px",
                    minHeight: "auto",
                    textAlign: "justify",
                  }}
                >
                  {coach.description}
                </p>

                <a
                  href={`tel:${coach.telephone}`}
                  style={{
                    display: "block",
                    marginTop: "22px",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  📞 {coach.telephone}
                </a>

                <a
                  href={coach.facebook}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginTop: "25px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "16px",
                    background:
                      "linear-gradient(180deg,#1877F2,#0C5FD7)",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "18px",
                  }}
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
            </div>
          ))}
        </div>
                {coachs.length === 0 && (
          <div
            style={{
              marginTop: "60px",
              color: "#bdbdbd",
              fontSize: "clamp(18px,5vw,22px)",
              padding: "35px 20px",
              border: "1px solid #2b2b2b",
              borderRadius: "18px",
              background: "#141414",
              lineHeight: 1.7,
            }}
          >
            Aucun coach n'est disponible pour le moment.
          </div>
        )}
      </section>
    </main>
  );
}