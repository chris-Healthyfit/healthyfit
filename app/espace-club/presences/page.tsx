"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JOURS_SEMAINE } from "@/lib/club/seance-jour";
import { parseApiResponse } from "@/lib/parse-api-response";

type PaymentPreview = {
  mode: string;
  label: string;
  montantLabel: string;
  montantCentimes?: number;
  carteRestantes: number | null;
  useCarte: boolean;
};

type SearchResult = {
  id: number;
  prenom: string;
  nom: string | null;
  estVip: boolean;
  abonnementType: string;
  seancesCarteRestantes: number | null;
  paymentPreview: PaymentPreview;
};

type Tarif = {
  code: string;
  label: string;
  montantCentimes: number;
  seancesIncluses?: number | null;
};

type PayMode = "auto" | "SEANCE" | "VIP" | "CARTE_10" | "OFFERTE";

type SeanceJour = {
  seanceId: number;
  seanceClubId: number | null;
  horaire: string;
  titre: string;
  niveau: string;
  presences: number;
  recetteCentimes?: number;
  coach: { prenom: string } | null;
};

type PresenceHistorique = {
  id: number;
  date: string;
  mode: string;
  member: { prenom: string; nom: string | null };
  seanceClub: { horaire: string; label: string | null } | null;
};

const MOTIFS = [
  ["CADEAU", "Cadeau"],
  ["COACH", "Coach"],
  ["ANNIVERSAIRE", "Anniversaire"],
  ["GESTE_COMMERCIAL", "Geste commercial"],
  ["AUTRE", "Autre"],
] as const;

const PAY_MODES: { id: PayMode; label: string }[] = [
  { id: "auto", label: "Automatique" },
  { id: "SEANCE", label: "Séance unitaire" },
  { id: "VIP", label: "VIP" },
  { id: "CARTE_10", label: "Carte" },
  { id: "OFFERTE", label: "Offerte" },
];

function fmt(c?: number) {
  if (c == null) return "";
  return `${(c / 100).toFixed(0)} €`;
}

function labelSeance(horaire: string, titre: string) {
  return titre ? `${horaire} — ${titre}` : horaire;
}

export default function PresencesPage() {
  const [seances, setSeances] = useState<SeanceJour[]>([]);
  const [selectedSeanceId, setSelectedSeanceId] = useState<number | null>(null);
  const [canViewFinances, setCanViewFinances] = useState(false);

  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [payMode, setPayMode] = useState<PayMode>("auto");
  const [motif, setMotif] = useState("");
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [loading, setLoading] = useState(false);
  const [openingSeance, setOpeningSeance] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [historique, setHistorique] = useState<PresenceHistorique[]>([]);
  const [filtreSeance, setFiltreSeance] = useState<number | "all">("all");
  const [showAllSeances, setShowAllSeances] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const jourLabel = JOURS_SEMAINE[new Date().getDay()];

  const selectedSeance = seances.find((s) => s.seanceClubId === selectedSeanceId);

  async function chargerSeances(all = showAllSeances) {
    const params = all ? "?all=1" : "";
    const res = await fetch(`/api/club/seances-collectives${params}`);
    if (res.ok) {
      const data = await res.json();
      setLoadError(null);
      setSeances(
        data.map((s: Record<string, unknown>) => ({
          seanceId: s.seanceId,
          seanceClubId: s.seanceClubId ?? s.id ?? null,
          horaire: s.horaire,
          titre: s.titre,
          niveau: s.niveau,
          presences: s.presences ?? 0,
          recetteCentimes: s.recetteCentimes,
          coach: s.coach,
        }))
      );
    } else {
      setSeances([]);
      setLoadError("Impossible de charger les séances. Rechargez la page.");
    }
  }

  async function chargerHistorique(seanceClubId?: number) {
    const params = new URLSearchParams({ jour: "1" });
    if (seanceClubId) params.set("seanceClubId", String(seanceClubId));
    const res = await fetch(`/api/club/presences?${params}`);
    if (res.ok) setHistorique(await res.json());
  }

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCanViewFinances(d.canViewFinances === true));
    fetch("/api/club/tarifs")
      .then((r) => (r.ok ? r.json() : []))
      .then(setTarifs);
  }, []);

  useEffect(() => {
    chargerSeances(showAllSeances);
  }, [showAllSeances]);

  useEffect(() => {
    if (filtreSeance === "all") chargerHistorique();
    else chargerHistorique(filtreSeance);
  }, [filtreSeance, success]);

  useEffect(() => {
    if (selectedSeanceId) inputRef.current?.focus();
  }, [selectedSeanceId]);

  async function ouvrirSeance(catalog: SeanceJour) {
    if (catalog.seanceClubId) {
      setSelectedSeanceId(catalog.seanceClubId);
      return;
    }

    setOpeningSeance(true);
    const res = await fetch("/api/club/seances-collectives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seanceId: catalog.seanceId }),
    });
    setOpeningSeance(false);

    if (res.ok) {
      const s = await res.json();
      setSelectedSeanceId(s.id);
      chargerSeances();
    } else {
      const err = await res.json();
      alert(err.error ?? "Erreur");
    }
  }

  const search = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const res = await fetch(
      `/api/club/members/search?q=${encodeURIComponent(term)}`
    );
    if (res.ok) setResults(await res.json());
  }, []);

  function onQueryChange(value: string) {
    setQ(value);
    setSelected(null);
    setSuccess(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 120);
  }

  function pick(client: SearchResult) {
    setSelected(client);
    setQ(`${client.prenom} ${client.nom ?? ""}`.trim());
    setResults([]);
    setPayMode("auto");
    setMotif("");
    setSuccess(null);
  }

  function tarifMontant(code: string, fallback: number) {
    return tarifs.find((t) => t.code === code)?.montantCentimes ?? fallback;
  }

  function hasActiveCarte(client: SearchResult) {
    return (
      client.paymentPreview.useCarte &&
      (client.seancesCarteRestantes ?? 0) > 0
    );
  }

  function paymentSummary(client: SearchResult, mode: PayMode) {
    if (mode === "auto") {
      return {
        label: client.paymentPreview.label,
        amount: client.paymentPreview.montantLabel,
      };
    }
    if (mode === "OFFERTE") return { label: "Séance offerte", amount: "Offerte" };
    if (mode === "VIP") {
      const m = tarifMontant("VIP", 600);
      return { label: "VIP", amount: fmt(m) };
    }
    if (mode === "CARTE_10") {
      const rest = client.seancesCarteRestantes ?? 0;
      if (rest > 0) {
        return {
          label: "Carte 10",
          amount: `${rest} séance${rest > 1 ? "s" : ""} restante${rest > 1 ? "s" : ""}`,
        };
      }
      return { label: "Carte 10", amount: "Aucune carte active" };
    }
    const m = tarifMontant("SEANCE", 800);
    return { label: "Séance", amount: fmt(m) };
  }

  async function refreshSelected(client: SearchResult) {
    const term = client.prenom.trim();
    if (term.length < 2) return client;
    const res = await fetch(
      `/api/club/members/search?q=${encodeURIComponent(term)}`
    );
    if (!res.ok) return client;
    const list: SearchResult[] = await res.json();
    return list.find((m) => m.id === client.id) ?? client;
  }

  async function valider(options?: { vendreCarte?: boolean; estVip?: boolean }) {
    if (!selected || !selectedSeanceId) return;
    const mode = payMode === "auto" ? undefined : payMode;
    if (mode === "OFFERTE" && !motif) {
      alert("Sélectionnez un motif pour la séance offerte.");
      return;
    }
    if (mode === "CARTE_10" && !hasActiveCarte(selected) && !options?.vendreCarte) {
      alert("Ce client n'a pas de carte active. Vendez une carte ci-dessous.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/club/presences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: selected.id,
        seanceClubId: selectedSeanceId,
        isException: mode != null,
        mode,
        vendreCarte: options?.vendreCarte === true,
        estVip: options?.estVip,
        motifOffert: mode === "OFFERTE" ? motif : undefined,
      }),
    });
    const parsed = await parseApiResponse<{
      carteVendue?: { message?: string } | null;
    }>(res);
    setLoading(false);

    if (!parsed.ok) {
      alert(parsed.error || "Erreur");
      return;
    }

    const extra = parsed.data?.carteVendue?.message
      ? ` · ${parsed.data.carteVendue.message}`
      : "";
    setSuccess(`${selected.prenom} — présence enregistrée ✓${extra}`);
    setSelected(null);
    setQ("");
    setPayMode("auto");
    setMotif("");
    chargerSeances();
    inputRef.current?.focus();
  }

  async function vendreCarteSeule(estVip: boolean) {
    if (!selected) return;
    setLoading(true);
    const res = await fetch(`/api/club/members/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "vendreCarte", estVip }),
    });
    const parsed = await parseApiResponse<{ message?: string }>(res);
    setLoading(false);
    if (!parsed.ok) {
      alert(parsed.error || "Erreur");
      return;
    }
    const updated = await refreshSelected(selected);
    setSelected(updated);
    setPayMode("CARTE_10");
    setSuccess(parsed.data?.message ?? "Carte vendue ✓");
  }

  const preview = selected ? paymentSummary(selected, payMode) : null;
  const carteActive = selected ? hasActiveCarte(selected) : false;
  const prixCarteClassique = tarifMontant("CARTE_CLASSIQUE", 8000);
  const prixCarteVip = tarifMontant("CARTE_VIP", 6000);
  const totalJour = seances.reduce((s, x) => s + x.presences, 0);
  const recetteJour = seances.reduce(
    (s, x) => s + (x.recetteCentimes ?? 0),
    0
  );

  const seancesOuvertes = seances.filter((s) => s.seanceClubId != null);

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>⚡ Présences</h1>
          <p>Sélectionnez une séance enregistrée, puis enregistrez les clients.</p>
        </div>
      </div>

      {/* Étape 1 — Séance */}
      <div className="hf-admin-card" style={{ marginBottom: 20 }}>
        <h2 className="hf-admin-form-title">1. Séance du jour — {jourLabel}</h2>
        {!selectedSeanceId ? (
          <>
            {loadError && (
              <p className="hf-admin-alert error" style={{ marginBottom: 12 }}>
                {loadError}
              </p>
            )}
            {seances.length === 0 ? (
              <div>
                <p className="hf-admin-entity-meta">
                  {showAllSeances
                    ? "Aucune séance dans Admin → Séances."
                    : `Aucune séance prévue le ${jourLabel}.`}
                </p>
                {!showAllSeances && (
                  <button
                    type="button"
                    className="hf-admin-btn hf-admin-btn-ghost hf-admin-btn-sm"
                    style={{ marginTop: 12 }}
                    onClick={() => setShowAllSeances(true)}
                  >
                    Voir toutes les séances
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="hf-seance-picker">
                {seances.map((s) => (
                  <button
                    key={s.seanceId}
                    type="button"
                    className="hf-seance-chip"
                    disabled={openingSeance}
                    onClick={() => ouvrirSeance(s)}
                  >
                    <strong>{labelSeance(s.horaire, s.titre)}</strong>
                    <span className="hf-admin-entity-meta">{s.niveau}</span>
                    {s.presences > 0 && (
                      <span>
                        {s.presences} présence{s.presences > 1 ? "s" : ""}
                      </span>
                    )}
                    {canViewFinances && s.recetteCentimes != null && s.recetteCentimes > 0 && (
                      <span className="hf-seance-recette">{fmt(s.recetteCentimes)}</span>
                    )}
                  </button>
                ))}
                </div>
                {!showAllSeances && (
                  <button
                    type="button"
                    className="hf-admin-btn hf-admin-btn-ghost hf-admin-btn-sm"
                    style={{ marginTop: 12 }}
                    onClick={() => setShowAllSeances(true)}
                  >
                    Voir toutes les séances de la semaine
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <div className="hf-seance-active">
            <div>
              <strong>
                {labelSeance(selectedSeance!.horaire, selectedSeance!.titre)}
              </strong>
              <span className="hf-admin-entity-meta" style={{ marginLeft: 12 }}>
                {selectedSeance!.presences} client
                {selectedSeance!.presences > 1 ? "s" : ""}
                {canViewFinances && selectedSeance!.recetteCentimes != null && selectedSeance!.recetteCentimes > 0 && (
                  <> · {fmt(selectedSeance!.recetteCentimes)}</>
                )}
              </span>
            </div>
            <button
              type="button"
              className="hf-admin-btn hf-admin-btn-ghost hf-admin-btn-sm"
              onClick={() => {
                setSelectedSeanceId(null);
                setSelected(null);
                setQ("");
              }}
            >
              Changer de séance
            </button>
          </div>
        )}
      </div>

      {/* Étape 2 — Enregistrement */}
      {selectedSeanceId && (
        <div className="hf-presence-flow">
          <div className="hf-admin-card hf-presence-search">
            <label className="hf-admin-label">2. Rechercher un client</label>
            <input
              ref={inputRef}
              className="hf-admin-input hf-presence-input"
              placeholder="Ex : chr…"
              value={q}
              onChange={(e) => onQueryChange(e.target.value)}
              autoComplete="off"
            />

            {results.length > 0 && !selected && (
              <ul className="hf-presence-results">
                {results.map((r) => (
                  <li key={r.id}>
                    <button type="button" onClick={() => pick(r)}>
                      <strong>
                        {r.prenom} {r.nom ?? ""}
                      </strong>
                      {r.estVip && <span className="hf-admin-tag">VIP</span>}
                      {r.abonnementType === "CARTE_10" && (
                        <span className="hf-admin-tag">Carte</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selected && preview && (
            <div className="hf-admin-card hf-presence-confirm">
              <div className="hf-presence-client-name">
                {selected.prenom} {selected.nom ?? ""}
              </div>

              <p className="hf-admin-label" style={{ marginTop: 16 }}>
                Mode de paiement
              </p>
              <div className="hf-admin-filters hf-presence-pay-modes">
                {PAY_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`hf-admin-filter${payMode === m.id ? " active" : ""}`}
                    onClick={() => setPayMode(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="hf-presence-payment">
                <span className="hf-presence-mode">{preview.label}</span>
                <span className="hf-presence-amount">{preview.amount}</span>
              </div>

              {payMode === "OFFERTE" && (
                <select
                  className="hf-admin-input hf-admin-select"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  style={{ marginTop: 12 }}
                >
                  <option value="">Motif…</option>
                  {MOTIFS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              )}

              {!carteActive && (
                <div className="hf-presence-carte-vendre">
                  <p className="hf-admin-label">💳 Vendre une carte</p>
                  <p className="hf-admin-entity-meta" style={{ marginBottom: 10 }}>
                    11 séances (10 + 1 offerte) — recette encaissée immédiatement.
                  </p>
                  <div className="hf-admin-quick-actions">
                    <button
                      type="button"
                      className="hf-admin-btn hf-admin-btn-sm"
                      disabled={loading}
                      onClick={() => vendreCarteSeule(false)}
                    >
                      Carte classique — {fmt(prixCarteClassique)}
                    </button>
                    <button
                      type="button"
                      className="hf-admin-btn hf-admin-btn-sm"
                      disabled={loading}
                      onClick={() => vendreCarteSeule(true)}
                    >
                      Carte VIP — {fmt(prixCarteVip)}
                    </button>
                    <button
                      type="button"
                      className="hf-admin-btn hf-admin-btn-sm"
                      disabled={loading}
                      onClick={() => valider({ vendreCarte: true, estVip: false })}
                    >
                      Classique + présence
                    </button>
                    <button
                      type="button"
                      className="hf-admin-btn hf-admin-btn-sm"
                      disabled={loading}
                      onClick={() => valider({ vendreCarte: true, estVip: true })}
                    >
                      VIP + présence
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="hf-admin-btn hf-presence-validate"
                disabled={
                  loading ||
                  (payMode === "CARTE_10" && !carteActive) ||
                  (payMode === "OFFERTE" && !motif)
                }
                onClick={() => valider()}
              >
                {loading ? "…" : "Valider la présence"}
              </button>
            </div>
          )}

          {success && <div className="hf-admin-alert success">{success}</div>}
        </div>
      )}

      {/* Historique */}
      <p className="hf-admin-section-title" style={{ marginTop: 32 }}>
        Historique du jour
        <span className="hf-admin-entity-meta" style={{ marginLeft: 12 }}>
          {totalJour} présence{totalJour > 1 ? "s" : ""}
          {canViewFinances && recetteJour > 0 && <> · {fmt(recetteJour)}</>}
        </span>
      </p>

      <div className="hf-admin-filters" style={{ maxWidth: 640, marginBottom: 16 }}>
        <button
          type="button"
          className={`hf-admin-filter${filtreSeance === "all" ? " active" : ""}`}
          onClick={() => setFiltreSeance("all")}
        >
          Toutes
        </button>
        {seancesOuvertes.map((s) => (
          <button
            key={s.seanceClubId!}
            type="button"
            className={`hf-admin-filter${filtreSeance === s.seanceClubId ? " active" : ""}`}
            onClick={() => setFiltreSeance(s.seanceClubId!)}
          >
            {s.horaire} ({s.presences})
          </button>
        ))}
      </div>

      <div className="hf-admin-list-compact">
        {historique.map((p) => (
          <div key={p.id} className="hf-historique-row">
            <div className="hf-historique-date">
              {p.seanceClub
                ? labelSeance(p.seanceClub.horaire, p.seanceClub.label ?? "")
                : "—"}
            </div>
              <div className="hf-historique-body">
                <strong>
                  {p.member.prenom} {p.member.nom ?? ""}
                </strong>
                <span className="hf-admin-tag" style={{ marginLeft: 8 }}>
                  {p.mode}
                </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
