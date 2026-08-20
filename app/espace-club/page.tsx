"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AlarmeMembre = {
  id: number;
  prenom: string;
  nom: string | null;
};

type Alarmes = {
  bilans: { count: number; membres: AlarmeMembre[] };
  relances: { count: number; membres: AlarmeMembre[] };
  stock: { count: number };
  total: number;
};

type DashboardAdmin = {
  jour: { recetteCentimes: number; presences: number };
  mois: {
    recetteCentimes: number;
    presences: number;
    nouveauxClients: number;
    bilans: number;
  };
};

type DashboardCoach = {
  jour: { presences: number };
  clientsActifs: number;
  presencesMois: number;
};

function fmt(centimes: number) {
  return `${(centimes / 100).toFixed(0)} €`;
}

function AlarmesBanner({
  alarmes,
  isAdmin,
}: {
  alarmes: Alarmes;
  isAdmin: boolean;
}) {
  if (alarmes.total === 0) return null;

  return (
    <section className="hf-alarmes-banner">
      <div className="hf-alarmes-header">
        <span className="hf-alarmes-pulse">⚠️</span>
        <div>
          <strong>{alarmes.total} alerte{alarmes.total > 1 ? "s" : ""}</strong>
          <span className="hf-alarmes-sub"> — action requise</span>
        </div>
      </div>
      <div className="hf-alarmes-grid">
        {alarmes.bilans.count > 0 && (
          <Link
            href="/espace-club/clients?alarme=bilan"
            className="hf-alarme-card bilan"
          >
            <span className="hf-alarme-count">{alarmes.bilans.count}</span>
            <span className="hf-alarme-label">
              Bilan{alarmes.bilans.count > 1 ? "s" : ""} à refaire
            </span>
            <span className="hf-alarme-action">Voir →</span>
          </Link>
        )}
        {alarmes.relances.count > 0 && (
          <Link
            href="/espace-club/clients?alarme=relance"
            className="hf-alarme-card relance"
          >
            <span className="hf-alarme-count">{alarmes.relances.count}</span>
            <span className="hf-alarme-label">
              Client{alarmes.relances.count > 1 ? "s" : ""} à relancer
            </span>
            <span className="hf-alarme-action">Voir →</span>
          </Link>
        )}
        {isAdmin && alarmes.stock.count > 0 && (
          <Link href="/espace-club/stock" className="hf-alarme-card stock">
            <span className="hf-alarme-count">{alarmes.stock.count}</span>
            <span className="hf-alarme-label">
              Alerte{alarmes.stock.count > 1 ? "s" : ""} stock
            </span>
            <span className="hf-alarme-action">Voir →</span>
          </Link>
        )}
      </div>
    </section>
  );
}

export default function EspaceClubDashboard() {
  const [prenom, setPrenom] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<{
    clients: number;
    dashboard: DashboardAdmin | DashboardCoach | null;
    alarmes: Alarmes | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setPrenom(d.prenom);
          setIsAdmin(d.canViewFinances === true);
        }
      });
    fetch("/api/club/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d));
  }, []);

  const dash = stats?.dashboard;
  const alarmes = stats?.alarmes;

  return (
    <>
      <div className="hf-admin-hero">
        <h1>Espace Club{prenom ? ` — ${prenom}` : ""}</h1>
        <p>
          {isAdmin
            ? "Vue direction — activité, recettes et suivi global."
            : "Vos clients, présences et bilans du jour."}
        </p>
      </div>

      {alarmes && (
        <AlarmesBanner alarmes={alarmes} isAdmin={isAdmin} />
      )}

      <div className="hf-admin-quick-actions" style={{ marginBottom: 28 }}>
        <Link href="/espace-club/presences" className="hf-admin-btn hf-admin-btn-lg">
          ⚡ Enregistrer une présence
        </Link>
      </div>

      {isAdmin && dash && "mois" in dash && (
        <>
          <p className="hf-admin-section-title">Aujourd&apos;hui</p>
          <div className="hf-admin-stats">
            <div className="hf-admin-stat highlight">
              <div className="hf-admin-stat-icon">💰</div>
              <div className="hf-admin-stat-value">{fmt(dash.jour.recetteCentimes)}</div>
              <div className="hf-admin-stat-label">Recette du jour</div>
            </div>
            <div className="hf-admin-stat">
              <div className="hf-admin-stat-icon">✓</div>
              <div className="hf-admin-stat-value">{dash.jour.presences}</div>
              <div className="hf-admin-stat-label">Présences</div>
            </div>
          </div>

          <p className="hf-admin-section-title">Ce mois</p>
          <div className="hf-admin-stats">
            <div className="hf-admin-stat highlight">
              <div className="hf-admin-stat-icon">📈</div>
              <div className="hf-admin-stat-value">{fmt(dash.mois.recetteCentimes)}</div>
              <div className="hf-admin-stat-label">Chiffre d&apos;affaires</div>
            </div>
            <div className="hf-admin-stat">
              <div className="hf-admin-stat-icon">✓</div>
              <div className="hf-admin-stat-value">{dash.mois.presences}</div>
              <div className="hf-admin-stat-label">Présences</div>
            </div>
            <div className="hf-admin-stat">
              <div className="hf-admin-stat-icon">👤</div>
              <div className="hf-admin-stat-value">{dash.mois.nouveauxClients}</div>
              <div className="hf-admin-stat-label">Nouveaux clients</div>
            </div>
            <div className="hf-admin-stat">
              <div className="hf-admin-stat-icon">📋</div>
              <div className="hf-admin-stat-value">{dash.mois.bilans}</div>
              <div className="hf-admin-stat-label">Bilans réalisés</div>
            </div>
          </div>
        </>
      )}

      {!isAdmin && dash && !("mois" in dash) && (
        <>
          <p className="hf-admin-section-title">Aujourd&apos;hui</p>
          <div className="hf-admin-stats">
            <div className="hf-admin-stat highlight">
              <div className="hf-admin-stat-icon">✓</div>
              <div className="hf-admin-stat-value">{dash.jour.presences}</div>
              <div className="hf-admin-stat-label">Mes présences</div>
            </div>
            <div className="hf-admin-stat">
              <div className="hf-admin-stat-icon">👥</div>
              <div className="hf-admin-stat-value">{dash.clientsActifs}</div>
              <div className="hf-admin-stat-label">Clients actifs</div>
            </div>
            <div className="hf-admin-stat">
              <div className="hf-admin-stat-icon">📅</div>
              <div className="hf-admin-stat-value">{dash.presencesMois}</div>
              <div className="hf-admin-stat-label">Présences ce mois</div>
            </div>
          </div>
        </>
      )}

      <p className="hf-admin-section-title">Accès rapide</p>
      <div className="hf-admin-modules">
        <Link href="/espace-club/presences" className="hf-admin-module">
          <div className="hf-admin-module-icon">⚡</div>
          <h3>Présences</h3>
          <p>Enregistrement ultra-rapide.</p>
        </Link>
        <Link href="/espace-club/clients" className="hf-admin-module">
          <div className="hf-admin-module-icon">👥</div>
          <h3>Clients</h3>
          <p>Fiches, bilans et suivi.</p>
        </Link>
        {isAdmin && (
          <Link href="/espace-club/finances" className="hf-admin-module">
            <div className="hf-admin-module-icon">📊</div>
            <h3>Centre Financier</h3>
            <p>Recettes, bénéfices et charges.</p>
          </Link>
        )}
      </div>
    </>
  );
}
