"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BILAN_CHECKLIST, formatDiff } from "@/lib/club/bilans";

type BilanDiff = {
  label: string;
  ancien: number | null;
  nouveau: number | null;
  diff: number | null;
  unit: string;
  positiveIsGood: boolean;
};

type Fiche = {
  id: number;
  prenom: string;
  nom: string | null;
  telephone: string | null;
  facebook: string | null;
  objectif: string | null;
  transformation: string | null;
  photoAvant: string | null;
  photoApres: string | null;
  nutritionProgramme: string | null;
  nutritionProduits: string | null;
  nutritionNotes: string | null;
  aNutrition: boolean;
  abonnementType: string;
  seancesCarteRestantes: number | null;
  estVip?: boolean;
  carteActive?: {
    id: number;
    type: string;
    seancesRestantes: number;
    montantVenteCentimes: number;
    coutFitReserveCentimes: number;
    dateVente: string;
  } | null;
  prixCarteClassique?: number;
  prixCarteVip?: number;
  createdAt: string;
  coachReferent: { prenom: string; nom: string };
  activite: {
    mois: number;
    annee: number;
    total: number;
    derniere: string | null;
  };
  comparaison: BilanDiff[] | null;
  rappelBilan: { actif: boolean; joursDepuis: number | null };
  score: { emoji: string; label: string } | null;
  dernierBilan: {
    id: number;
    date: string;
    poids: number | null;
    masseGrasse: number | null;
    masseMusculaire: number | null;
    graisseViscerale: number | null;
    eauCorporelle: number | null;
    ageMetabolique: number | null;
    metabolismeBase: number | null;
    tourTaille: number | null;
    tourHanches: number | null;
    tourPoitrine: number | null;
    bras: number | null;
    cuisse: number | null;
    mollet: number | null;
  } | null;
};

export default function FicheClientPage() {
  const params = useParams();
  const id = params.id as string;
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [showBilanForm, setShowBilanForm] = useState(false);
  const [bilanForm, setBilanForm] = useState<Record<string, string>>({});
  const [carteMsg, setCarteMsg] = useState<string | null>(null);
  const [carteLoading, setCarteLoading] = useState(false);

  async function charger() {
    const res = await fetch(`/api/club/members/${id}`);
    if (res.ok) setFiche(await res.json());
  }

  useEffect(() => {
    charger();
  }, [id]);

  function fmt(c: number) {
    return `${(c / 100).toFixed(c % 100 === 0 ? 0 : 2).replace(".", ",")} €`;
  }

  async function vendreCarte(estVip: boolean) {
    setCarteLoading(true);
    setCarteMsg(null);
    const res = await fetch(`/api/club/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "vendreCarte", estVip }),
    });
    const data = await res.json();
    setCarteLoading(false);
    if (res.ok) {
      setCarteMsg(data.message ?? "Carte vendue ✓");
      charger();
    } else {
      setCarteMsg(data.error ?? "Erreur");
    }
  }

  async function creerBilan(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/club/bilans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: Number(id), ...bilanForm, checklistComplete: true }),
    });
    if (res.ok) {
      setShowBilanForm(false);
      setBilanForm({});
      charger();
    }
  }

  if (!fiche) {
    return <p className="hf-admin-entity-meta">Chargement…</p>;
  }

  const b = fiche.dernierBilan;

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <Link href="/espace-club/clients" className="hf-admin-back">
            ← Clients
          </Link>
          <h1>
            {fiche.prenom} {fiche.nom ?? ""}
          </h1>
          <p>
            Coach : {fiche.coachReferent.prenom} · Inscrit le{" "}
            {new Date(fiche.createdAt).toLocaleDateString("fr-BE")}
          </p>
        </div>
        <div className="hf-admin-header-actions">
          <Link
            href={`/espace-club/clients/${id}/historique`}
            className="hf-admin-btn hf-admin-btn-ghost"
          >
            📂 Historique
          </Link>
          <button
            type="button"
            className="hf-admin-btn hf-admin-btn-lg"
            onClick={() => setShowBilanForm(true)}
          >
            ➕ Nouveau bilan
          </button>
        </div>
      </div>

      {fiche.rappelBilan.actif && (
        <div className="hf-admin-alert warning">
          <strong>⚠️ Suivi à effectuer cette semaine</strong>
          <ul className="hf-bilan-checklist">
            {BILAN_CHECKLIST.map((item) => (
              <li key={item}>☐ {item}</li>
            ))}
          </ul>
        </div>
      )}

      {fiche.score && (
        <div className="hf-admin-card" style={{ marginBottom: 20 }}>
          <strong>
            {fiche.score.emoji} {fiche.score.label}
          </strong>
          <span className="hf-admin-entity-meta"> — Score HealthyFit</span>
        </div>
      )}

      <section className="hf-admin-card" style={{ marginBottom: 20 }}>
        <h2 className="hf-admin-form-title">💳 Carte 10 séances (11 avec offerte)</h2>
          {fiche.carteActive ? (
            <div className="hf-carte-active">
              <p>
                <strong>
                  Carte {fiche.carteActive.type === "VIP" ? "VIP" : "classique"} active
                </strong>
                — {fiche.carteActive.seancesRestantes} séance
                {fiche.carteActive.seancesRestantes > 1 ? "s" : ""} restante
                {fiche.carteActive.seancesRestantes > 1 ? "s" : ""}
              </p>
              <p className="hf-admin-entity-meta">
                Vendue le{" "}
                {new Date(fiche.carteActive.dateVente).toLocaleDateString("fr-BE")}{" "}
                · {fmt(fiche.carteActive.montantVenteCentimes)} encaissés · coût futur
                réservé {fmt(fiche.carteActive.coutFitReserveCentimes)}
              </p>
            </div>
          ) : (
            <div className="hf-carte-vendre">
              <p className="hf-admin-entity-meta" style={{ marginBottom: 12 }}>
                La vente enregistre immédiatement la recette et réserve le coût FIT des
                11 séances.
              </p>
              <div className="hf-admin-quick-actions">
                <button
                  type="button"
                  className="hf-admin-btn"
                  disabled={carteLoading}
                  onClick={() => vendreCarte(false)}
                >
                  Carte classique — {fmt(fiche.prixCarteClassique ?? 8000)}
                </button>
                <button
                  type="button"
                  className="hf-admin-btn"
                  disabled={carteLoading}
                  onClick={() => vendreCarte(true)}
                >
                  Carte VIP — {fmt(fiche.prixCarteVip ?? 6000)}
                </button>
              </div>
            </div>
          )}
          {carteMsg && (
            <p
              className={`hf-admin-alert ${carteMsg.includes("Erreur") ? "error" : "success"}`}
              style={{ marginTop: 12 }}
            >
              {carteMsg}
            </p>
        )}
      </section>

      <div className="hf-fiche-grid">
        <section className="hf-admin-card">
          <h2 className="hf-admin-form-title">Informations</h2>
          <dl className="hf-fiche-dl">
            <dt>Téléphone</dt>
            <dd>{fiche.telephone ?? "—"}</dd>
            <dt>Facebook</dt>
            <dd>{fiche.facebook ?? "—"}</dd>
            <dt>Objectif</dt>
            <dd>{fiche.objectif ?? "—"}</dd>
            <dt>Transformation</dt>
            <dd>{fiche.transformation ?? "—"}</dd>
            <dt>Abonnement</dt>
            <dd>
              {fiche.abonnementType}
              {fiche.seancesCarteRestantes != null &&
                ` (${fiche.seancesCarteRestantes} restantes)`}
            </dd>
          </dl>
        </section>

        <section className="hf-admin-card">
          <h2 className="hf-admin-form-title">Photos</h2>
          <div className="hf-fiche-photos">
            <div>
              <p className="hf-admin-label">Avant</p>
              {fiche.photoAvant ? (
                <img src={fiche.photoAvant} alt="Avant" className="hf-fiche-photo" />
              ) : (
                <div className="hf-fiche-photo placeholder">Pas encore</div>
              )}
            </div>
            <div>
              <p className="hf-admin-label">Après</p>
              {fiche.photoApres ? (
                <img src={fiche.photoApres} alt="Après" className="hf-fiche-photo" />
              ) : (
                <div className="hf-fiche-photo placeholder">En progression</div>
              )}
            </div>
          </div>
        </section>

        <section className="hf-admin-card">
          <h2 className="hf-admin-form-title">Activité</h2>
          <dl className="hf-fiche-dl">
            <dt>Ce mois</dt>
            <dd>{fiche.activite.mois} présences</dd>
            <dt>Cette année</dt>
            <dd>{fiche.activite.annee}</dd>
            <dt>Total</dt>
            <dd>{fiche.activite.total}</dd>
            <dt>Dernière présence</dt>
            <dd>
              {fiche.activite.derniere
                ? new Date(fiche.activite.derniere).toLocaleDateString("fr-BE")
                : "—"}
            </dd>
          </dl>
        </section>

        {fiche.aNutrition && (
          <section className="hf-admin-card">
            <h2 className="hf-admin-form-title">🥗 Nutrition</h2>
            <dl className="hf-fiche-dl">
              <dt>Programme</dt>
              <dd>{fiche.nutritionProgramme ?? "—"}</dd>
              <dt>Produits</dt>
              <dd>{fiche.nutritionProduits ?? "—"}</dd>
              <dt>Notes</dt>
              <dd>{fiche.nutritionNotes ?? "—"}</dd>
            </dl>
          </section>
        )}
      </div>

      {b && (
        <>
          <p className="hf-admin-section-title">Dernier bilan</p>
          <div className="hf-admin-card">
            <p className="hf-admin-entity-meta">
              {new Date(b.date).toLocaleDateString("fr-BE")}
            </p>
            {fiche.comparaison && (
              <div className="hf-comparaison-grid">
                {fiche.comparaison.map((c) => (
                  <div key={c.label} className="hf-comparaison-item">
                    <span className="hf-comparaison-label">{c.label}</span>
                    <span className="hf-comparaison-values">
                      {c.ancien ?? "—"} → {c.nouveau ?? "—"}
                    </span>
                    {c.diff != null && (
                      <span
                        className={`hf-comparaison-diff${
                          (c.positiveIsGood ? c.diff > 0 : c.diff < 0)
                            ? " good"
                            : c.diff === 0
                              ? ""
                              : " bad"
                        }`}
                      >
                        {formatDiff(c.diff, c.unit)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {showBilanForm && (
        <div className="hf-admin-overlay" onClick={() => setShowBilanForm(false)}>
          <form
            className="hf-admin-card hf-bilan-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={creerBilan}
          >
            <h2 className="hf-admin-form-title">Nouveau bilan</h2>
            <div className="hf-bilan-form-grid">
              {[
                ["poids", "Poids (kg)"],
                ["taille", "Taille (cm)"],
                ["tourTaille", "Tour de taille"],
                ["tourHanches", "Tour de hanches"],
                ["tourPoitrine", "Tour de poitrine"],
                ["bras", "Bras"],
                ["cuisse", "Cuisse"],
                ["mollet", "Mollet"],
                ["masseGrasse", "Masse grasse %"],
                ["masseMusculaire", "Masse musculaire"],
                ["graisseViscerale", "Graisse viscérale"],
                ["eauCorporelle", "Eau corporelle %"],
                ["ageMetabolique", "Âge métabolique"],
                ["metabolismeBase", "Métabolisme de base"],
              ].map(([key, label]) => (
                <div key={key} className="hf-admin-field">
                  <label className="hf-admin-label">{label}</label>
                  <input
                    className="hf-admin-input"
                    value={bilanForm[key] ?? ""}
                    onChange={(e) =>
                      setBilanForm((p) => ({ ...p, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button type="submit" className="hf-admin-btn">
                Enregistrer
              </button>
              <button
                type="button"
                className="hf-admin-btn hf-admin-btn-ghost"
                onClick={() => setShowBilanForm(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
