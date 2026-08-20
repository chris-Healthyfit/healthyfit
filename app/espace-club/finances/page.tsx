"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Summary = {
  recetteTotal: number;
  benefice: number;
  presences: number;
  bilans: number;
  ventesNutrition: number;
  ventesSkin: number;
  depenses: number;
  achats: number;
  charges: number;
  chargesFixes: number;
  chargesVariables: number;
  margeMoyenne: number;
  recetteSport: number;
  recetteNutrition: number;
  recetteSkin: number;
};

type RentabiliteRow = {
  activite: string;
  recette: number;
  cout: number;
  benefice: number;
  marge: number;
};

type Echeance = {
  id: number;
  nom: string;
  montantCentimes: number;
  joursRestants: number;
};

function fmt(c: number) {
  return `${(c / 100).toFixed(c % 100 === 0 ? 0 : 2).replace(".", ",")} €`;
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`hf-admin-stat${highlight ? " highlight" : ""}`}>
      <div className="hf-admin-stat-value">{value}</div>
      <div className="hf-admin-stat-label">{label}</div>
    </div>
  );
}

function BarChart({
  data,
  title,
}: {
  title: string;
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="hf-admin-card">
      <h3 className="hf-admin-form-title">{title}</h3>
      <div className="hf-chart-bars">
        {data.map((d) => (
          <div key={d.label} className="hf-chart-bar-row">
            <span className="hf-chart-bar-label">{d.label}</span>
            <div className="hf-chart-bar-track">
              <div
                className="hf-chart-bar-fill"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
            <span className="hf-chart-bar-value">{fmt(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type Pilotage = {
  argentGagneCentimes: number;
  argentStockCentimes: number;
  argentBilansCentimes: number;
  argentDisponibleCentimes: number;
  cartes: {
    actives: number;
    seancesRestantes: number;
    coutFuturCentimes: number;
  };
  coutFitUnitaireCentimes: number;
  recetteCartesCentimes: number;
  ventesCartes: number;
};

export default function CentreFinancierPage() {
  const [data, setData] = useState<{
    dashboard: { today: Summary; week: Summary; month: Summary };
    rentabilite: RentabiliteRow[];
    echeances: Echeance[];
    pilotage: Pilotage;
    charts: {
      repartitionRecettes: { label: string; value: number }[];
      repartitionDepenses: { label: string; value: number }[];
      evolution: { date: string; recette: number; benefice: number }[];
    };
  } | null>(null);

  useEffect(() => {
    fetch("/api/club/finance/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData);
  }, []);

  if (!data) {
    return <p className="hf-admin-entity-meta">Chargement du centre financier…</p>;
  }

  const { today, week, month } = data.dashboard;
  const p = data.pilotage;

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>📊 Centre Financier</h1>
          <p>Pilotage HealthyFit — argent réellement disponible.</p>
        </div>
      </div>

      <p className="hf-admin-section-title">Pilotage global</p>
      <div className="hf-admin-stats hf-pilotage-stats">
        <StatCard label="💵 Argent gagné" value={fmt(p.argentGagneCentimes)} highlight />
        <StatCard
          label="📦 Argent à utiliser (stock)"
          value={fmt(p.argentStockCentimes)}
        />
        <StatCard
          label="📋 Argent réservé bilans"
          value={fmt(p.argentBilansCentimes)}
        />
        <StatCard
          label="💰 Argent réellement disponible"
          value={fmt(p.argentDisponibleCentimes)}
          highlight
        />
      </div>

      <div className="hf-admin-card" style={{ marginBottom: 24 }}>
        <h3 className="hf-admin-form-title">💰 Argent réservé (cartes actives)</h3>
        <p className="hf-admin-entity-meta">
          {p.cartes.actives} carte{p.cartes.actives > 1 ? "s" : ""} ·{" "}
          {p.cartes.seancesRestantes} séances restantes ·{" "}
          <strong>{fmt(p.cartes.coutFuturCentimes)}</strong> à prévoir pour les
          produits FIT · coût FIT/séance {fmt(p.coutFitUnitaireCentimes)} ·{" "}
          {p.ventesCartes} vente{p.ventesCartes > 1 ? "s" : ""} (
          {fmt(p.recetteCartesCentimes)} encaissés)
        </p>
      </div>

      {data.echeances.length > 0 && (
        <section className="hf-alarmes-banner" style={{ marginBottom: 24 }}>
          <div className="hf-alarmes-header">
            <span>⚠️</span>
            <strong>Paiements à venir</strong>
          </div>
          <div className="hf-alarmes-grid">
            {data.echeances.slice(0, 5).map((e) => (
              <Link
                key={e.id}
                href="/espace-club/finances/charges"
                className="hf-alarme-card relance"
              >
                <span className="hf-alarme-label">{e.nom}</span>
                <span className="hf-alarme-count" style={{ fontSize: 18 }}>
                  {e.joursRestants <= 0
                    ? "Aujourd'hui"
                    : e.joursRestants === 1
                      ? "Demain"
                      : `Dans ${e.joursRestants} jours`}
                </span>
                <span className="hf-alarme-action">{fmt(e.montantCentimes)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="hf-admin-section-title">Aujourd&apos;hui</p>
      <div className="hf-admin-stats">
        <StatCard label="Recette brute" value={fmt(today.recetteTotal)} highlight />
        <StatCard label="Bénéfice réel" value={fmt(today.benefice)} highlight />
        <StatCard label="Présences" value={String(today.presences)} />
        <StatCard label="Bilans" value={String(today.bilans)} />
        <StatCard label="Nutrition vendue" value={String(today.ventesNutrition)} />
        <StatCard label="Skin vendu" value={String(today.ventesSkin)} />
      </div>

      <p className="hf-admin-section-title">Cette semaine</p>
      <div className="hf-admin-stats">
        <StatCard label="Recette" value={fmt(week.recetteTotal)} />
        <StatCard label="Dépenses" value={fmt(week.depenses)} />
        <StatCard label="Achats" value={fmt(week.achats)} />
        <StatCard label="Charges" value={fmt(week.charges)} />
        <StatCard label="Bénéfice" value={fmt(week.benefice)} highlight />
      </div>

      <p className="hf-admin-section-title">Ce mois</p>
      <div className="hf-admin-stats">
        <StatCard label="Recette totale" value={fmt(month.recetteTotal)} />
        <StatCard label="Charges fixes" value={fmt(month.chargesFixes)} />
        <StatCard label="Charges variables" value={fmt(month.chargesVariables)} />
        <StatCard label="Achats" value={fmt(month.achats)} />
        <StatCard label="Bénéfice net" value={fmt(month.benefice)} highlight />
        <StatCard label="Marge moyenne" value={`${month.margeMoyenne} %`} />
      </div>

      <p className="hf-admin-section-title">Recettes par activité (mois)</p>
      <div className="hf-admin-stats">
        <StatCard label="Sport" value={fmt(month.recetteSport)} />
        <StatCard label="Nutrition" value={fmt(month.recetteNutrition)} />
        <StatCard label="Skin" value={fmt(month.recetteSkin)} />
      </div>

      <p className="hf-admin-section-title">Tableau de rentabilité</p>
      <div className="hf-admin-card hf-rentabilite-table-wrap">
        <table className="hf-rentabilite-table">
          <thead>
            <tr>
              <th>Activité</th>
              <th>Recette</th>
              <th>Coût</th>
              <th>Bénéfice</th>
              <th>Marge</th>
            </tr>
          </thead>
          <tbody>
            {data.rentabilite.map((r) => (
              <tr key={r.activite}>
                <td>{r.activite}</td>
                <td>{fmt(r.recette)}</td>
                <td>{fmt(r.cout)}</td>
                <td className={r.benefice >= 0 ? "good" : "bad"}>{fmt(r.benefice)}</td>
                <td>{r.marge} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hf-finance-charts">
        <BarChart title="Répartition recettes" data={data.charts.repartitionRecettes} />
        <BarChart title="Répartition dépenses" data={data.charts.repartitionDepenses} />
      </div>
    </>
  );
}
