"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type Contact = {
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  horaires: string;
  facebook: string;
  googleMaps: string;
  introduction: string;
};

export default function Contact() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function charger() {
      try {
        const res = await fetch("/api/contact");
        const data = await res.json();
        setContact(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    charger();
  }, []);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0b0b0b",
          color: "white",
        }}
      >
        <Navbar />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            fontSize: "clamp(18px,5vw,22px)",
          }}
        >
          Chargement...
        </div>
      </main>
    );
  }

  if (!contact) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0b0b0b",
          color: "white",
        }}
      >
        <Navbar />

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "110px 20px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#d4af37",
              fontSize: "clamp(40px,10vw,52px)",
              marginBottom: 20,
            }}
          >
            Contact
          </h1>

          <p
            style={{
              color: "#bdbdbd",
              fontSize: "clamp(17px,4.5vw,18px)",
            }}
          >
            Les informations de contact seront bientôt disponibles.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "white",
      }}
    >
      <Navbar />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "100px 20px 40px",
        }}
      >
        <h1
          style={{
            color: "#d4af37",
            fontSize: "clamp(40px,10vw,52px)",
            textAlign: "center",
            marginBottom: 15,
          }}
        >
          Contact
        </h1>

        <p
          style={{
            color: "#bdbdbd",
            textAlign: "center",
            fontSize: "clamp(17px,4.5vw,18px)",
            marginBottom: 50,
            maxWidth: "800px",
            marginInline: "auto",
            lineHeight: 1.8,
          }}
        >
          {contact.introduction}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: 30,
          }}
        >
                    <div
            style={{
              background: "#141414",
              border: "1px solid rgba(212,175,55,.2)",
              borderRadius: 20,
              padding: "30px 25px",
            }}
          >
            <h2
              style={{
                color: "#d4af37",
                marginBottom: 25,
                fontSize: "clamp(28px,7vw,34px)",
              }}
            >
              {contact.nom}
            </h2>

            <p style={{ lineHeight: 1.8 }}>
              <strong>📍 Adresse</strong>
              <br />
              {contact.adresse}
            </p>

            <p style={{ lineHeight: 1.8 }}>
              <strong>📞 Téléphone</strong>
              <br />
              <a
                href={`tel:${contact.telephone}`}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                {contact.telephone}
              </a>
            </p>

            <p style={{ lineHeight: 1.8 }}>
              <strong>✉️ E-mail</strong>
              <br />
              <a
                href={`mailto:${contact.email}`}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                {contact.email}
              </a>
            </p>

            <p style={{ lineHeight: 1.8 }}>
              <strong>🕒 Horaires</strong>
              <br />
              {contact.horaires}
            </p>

            <a
              href={contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 25,
                background: "#d4af37",
                color: "#000",
                padding: "14px 28px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Notre Facebook
            </a>
          </div>

          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(212,175,55,.2)",
              minHeight: 380,
            }}
          >
            {contact.googleMaps ? (
              <iframe
                src={contact.googleMaps}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#888",
                  background: "#141414",
                }}
              >
                Carte indisponible.
              </div>
            )}
          </div>
        </div>
             <div
          style={{
            marginTop: 60,
            background: "#141414",
            border: "1px solid rgba(212,175,55,.2)",
            borderRadius: 20,
            padding: "50px 20px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#d4af37",
              fontSize: "clamp(34px,8vw,42px)",
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            Prêt à atteindre vos objectifs ?
          </h2>

          <p
            style={{
              color: "#bdbdbd",
              fontSize: "clamp(17px,4.5vw,18px)",
              lineHeight: 1.8,
              maxWidth: 750,
              margin: "0 auto 35px",
            }}
          >
            Chaque parcours est unique. Découvrez nos coachs et trouvez celui
            qui correspond le mieux à vos besoins et à vos ambitions.
          </p>

          <Link
            href="/coachs"
            style={{
              display: "inline-block",
              background: "#d4af37",
              color: "#000",
              padding: "16px 36px",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "18px",
              boxShadow: "0 10px 25px rgba(212,175,55,.35)",
            }}
          >
            ✨ Choisir mon coach
          </Link>
        </div>
      </div>
    </main>
  );
}   