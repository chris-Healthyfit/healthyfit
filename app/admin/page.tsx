"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  coachs: number;
  seances: number;
  reservations: number;
  newReservations: number;
  temoignages: number;
  galerie: number;
};

const modules = [
  {
    titre: "Séances",
    description: "Horaires, niveaux et tarifs des cours.",
    lien: "/admin/seances",
    emoji: "🏋️",
  },
  {
    titre: "Coachs",
    description: "Profils, photos et coordonnées.",
    lien: "/admin/coachs",
    emoji: "👥",
  },
  {
    titre: "Réservations",
    description: "Demandes reçues depuis le site.",
    lien: "/admin/reservations",
    emoji: "📅",
  },
  {
    titre: "Le Club",
    description: "Présentation et philosophie.",
    lien: "/admin/club",
    emoji: "🏢",
  },
  {
    titre: "Nutrition",
    description: "Page Sport & Nutrition.",
    lien: "/admin/nutrition",
    emoji: "🥗",
  },
  {
    titre: "Témoignages",
    description: "Avis clients du site.",
    lien: "/admin/temoignages",
    emoji: "💬",
  },
  {
    titre: "Galerie",
    description: "Photos du club et des séances.",
    lien: "/admin/galerie",
    emoji: "🖼",
  },
  {
    titre: "Contact",
    description: "Coordonnées et horaires.",
    lien: "/admin/contact",
    emoji: "📞",
  },
];

const clubModules = [
  {
    titre: "Clients",
    description: "Suivi clients et non-clients.",
    lien: "/espace-club/clients",
    emoji: "👥",
  },
  {
    titre: "Stock",
    description: "Produits et quantités.",
    lien: "/espace-club/stock",
    emoji: "📦",
  },
  {
    titre: "Espace club",
    description: "Tableau de bord coachs.",
    lien: "/espace-club",
    emoji: "🏋️",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [prenom, setPrenom] = useState("");
  const [superAdmin, setSuperAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setPrenom(d.prenom);
          setSuperAdmin(d.isSuperAdmin === true);
        }
      });

    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d));
  }, []);

  return (
    <>
      <div className="hf-admin-hero">
        <h1>Bienvenue{prenom ? `, ${prenom}` : ""}</h1>
        <p>
          Pilotez HealthyFit depuis votre espace premium — contenu, réservations
          et équipe en un seul endroit.
        </p>
      </div>

      {stats && (
        <div className="hf-admin-stats">
          <Link
            href="/admin/reservations"
            className={`hf-admin-stat${stats.newReservations > 0 ? " highlight" : ""}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="hf-admin-stat-icon">🔔</div>
            <div className="hf-admin-stat-value">{stats.newReservations}</div>
            <div className="hf-admin-stat-label">Nouvelles réservations</div>
          </Link>
          <div className="hf-admin-stat">
            <div className="hf-admin-stat-icon">📅</div>
            <div className="hf-admin-stat-value">{stats.reservations}</div>
            <div className="hf-admin-stat-label">Total réservations</div>
          </div>
          <div className="hf-admin-stat">
            <div className="hf-admin-stat-icon">👥</div>
            <div className="hf-admin-stat-value">{stats.coachs}</div>
            <div className="hf-admin-stat-label">Coachs actifs</div>
          </div>
          <div className="hf-admin-stat">
            <div className="hf-admin-stat-icon">🏋️</div>
            <div className="hf-admin-stat-value">{stats.seances}</div>
            <div className="hf-admin-stat-label">Séances</div>
          </div>
        </div>
      )}

      <p className="hf-admin-section-title">Modules</p>
      <div className="hf-admin-modules">
        {modules.map((m, i) => (
          <Link
            key={m.titre}
            href={m.lien}
            className="hf-admin-module"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="hf-admin-module-icon">{m.emoji}</div>
            <h3>{m.titre}</h3>
            <p>{m.description}</p>
          </Link>
        ))}
      </div>

      {superAdmin && (
        <>
          <p className="hf-admin-section-title">Espace Club</p>
          <div className="hf-admin-modules">
            {clubModules.map((m, i) => (
              <Link
                key={m.titre}
                href={m.lien}
                className="hf-admin-module"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="hf-admin-module-icon">{m.emoji}</div>
                <h3>{m.titre}</h3>
                <p>{m.description}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
