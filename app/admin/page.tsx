import Link from "next/link";

const modules = [
  {
    titre: "Séances",
    description: "Gérer les séances proposées par HealthyFit.",
    lien: "/admin/seances",
    emoji: "🏋️",
  },
  {
    titre: "Coachs",
    description: "Ajouter, modifier ou supprimer les coachs.",
    lien: "/admin/coachs",
    emoji: "👥",
  },
  {
    titre: "Le Club",
    description: "Modifier la présentation du club.",
    lien: "/admin/club",
    emoji: "🏢",
  },
  {
    titre: "Nutrition",
    description: "Gérer la page Nutrition.",
    lien: "/admin/nutrition",
    emoji: "🥗",
  },
  {
    titre: "Témoignages",
    description: "Ajouter, modifier ou supprimer les témoignages.",
    lien: "/admin/temoignages",
    emoji: "💬",
  },
  {
    titre: "Galerie",
    description: "Ajouter et supprimer les photos.",
    lien: "/admin/galerie",
    emoji: "🖼️",
  },
  {
    titre: "Contact",
    description: "Modifier les coordonnées et les horaires.",
    lien: "/admin/contact",
    emoji: "📞",
  },
];

export default function Admin() {
  return (
    <>
      <h1
        style={{
          color: "#d4af37",
          fontSize: "clamp(34px,8vw,42px)",
          marginBottom: 10,
          fontWeight: 900,
          textAlign: "center",
        }}
      >
        Tableau de bord
      </h1>

      <p
        style={{
          color: "#9d9d9d",
          marginBottom: 30,
          fontSize: "clamp(16px,4vw,18px)",
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        Bienvenue dans l'administration HealthyFit.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 20,
        }}
      >
        {modules.map((module) => (
          <Link
            key={module.titre}
            href={module.lien}
            style={{
              background: "#171717",
              border: "1px solid rgba(212,175,55,.15)",
              borderRadius: 18,
              padding: 22,
              textDecoration: "none",
              transition: ".25s",
              color: "#fff",
            }}
          >
            <div
              style={{
                fontSize: 36,
                marginBottom: 15,
              }}
            >
              {module.emoji}
            </div>

            <h2
              style={{
                margin: 0,
                color: "#d4af37",
                fontSize: "clamp(22px,6vw,26px)",
              }}
            >
              {module.titre}
            </h2>

            <p
              style={{
                color: "#bdbdbd",
                marginTop: 12,
                lineHeight: 1.6,
                fontSize: "15px",
              }}
            >
              {module.description}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}