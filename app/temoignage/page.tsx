import Navbar from "@/components/Navbar";

type Temoignage = {
  id: number;
  prenom: string;
  texte: string;
  image: string;
};

import { headers } from "next/headers";

async function getTemoignages(): Promise<Temoignage[]> {
  try {
    const h = await headers();

    const host = h.get("host");
    const protocol =
      process.env.NODE_ENV === "development" ? "http" : "https";

    const res = await fetch(
      `${protocol}://${host}/api/temoignages`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) return [];

    return await res.json();
  } catch {
    return [];
  }
}

export default async function TemoignagesPage() {
  const temoignages = await getTemoignages();

  return (
    <main
      style={{
        background: "#0b0b0b",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <Navbar />

      <section
        style={{
          padding: "120px 20px 60px",
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(40px,10vw,58px)",
            color: "#d4af37",
            marginBottom: "20px",
            lineHeight: 1.1,
          }}
        >
          Leurs résultats parlent d'eux-mêmes
        </h1>

        <p
          style={{
            maxWidth: "850px",
            margin: "0 auto",
            color: "#d0d0d0",
            fontSize: "clamp(18px,4.5vw,20px)",
            lineHeight: 1.8,
          }}
        >
          Derrière chaque résultat se cache un accompagnement, de la
          motivation et de la régularité. Découvrez quelques-uns des parcours
          de nos membres.
        </p>
      </section>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 18px 80px",
          display: "grid",
          gap: "24px",
        }}
      >
        {temoignages.map((temoignage) => (
          <div
            key={temoignage.id}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: "25px",
              alignItems: "center",
              background: "#151515",
              border: "1px solid rgba(212,175,55,.18)",
              borderRadius: "22px",
              padding: "20px",
            }}
          >
            <img
              src={temoignage.image}
              alt={temoignage.prenom}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "300px",
                objectFit: "contain",
                borderRadius: "16px",
                border: "1px solid rgba(212,175,55,.25)",
                background: "#111",
                display: "block",
              }}
            />

            <div>
              <h2
                style={{
                  color: "#d4af37",
                  fontSize: "clamp(28px,7vw,34px)",
                  marginBottom: "18px",
                  textAlign: "center",
                }}
              >
                {temoignage.prenom}
              </h2>

              <div
                style={{
                  width: "70px",
                  height: "3px",
                  background: "#d4af37",
                  margin: "0 auto 25px",
                  borderRadius: "10px",
                }}
              />

              <p
                style={{
                  color: "#ddd",
                  fontSize: "clamp(17px,4.5vw,18px)",
                  lineHeight: 1.9,
                  whiteSpace: "pre-wrap",
                  textAlign: "justify",
                }}
              >
                {temoignage.texte}
              </p>
            </div>
          </div>
        ))}
      </section>
       <section
        style={{
          padding: "0 20px 80px",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            background: "#151515",
            border: "1px solid rgba(212,175,55,.25)",
            borderRadius: "22px",
            padding: "50px 25px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#d4af37",
              fontSize: "clamp(34px,8vw,42px)",
              marginBottom: "20px",
              lineHeight: 1.2,
            }}
          >
            Et si le prochain témoignage était le vôtre ?
          </h2>

          <p
            style={{
              color: "#d0d0d0",
              fontSize: "clamp(17px,4.5vw,18px)",
              lineHeight: 1.8,
              maxWidth: "700px",
              margin: "0 auto 35px",
            }}
          >
            Prenez rendez-vous pour votre bilan personnalisé et commencez votre
            propre transformation avec HealthyFit.
          </p>

          <a
            href="/contact"
            style={{
              display: "inline-block",
              background: "#d4af37",
              color: "#000",
              padding: "18px 40px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "18px",
              boxShadow: "0 10px 25px rgba(212,175,55,.35)",
            }}
          >
            Réserver mon bilan
          </a>
        </div>
      </section>
    </main>
  );
}               