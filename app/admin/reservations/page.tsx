"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ReservationStatut,
  ReservationType,
} from "@prisma/client";
import {
  CONTACT_LABELS,
  getStatutConfig,
  getTypeLabel,
  SOURCE_LABELS,
  STATUTS_RESERVATION,
} from "@/lib/reservations";
import {
  getJourLabel,
  getMomentLabel,
} from "@/lib/disponibilites";

type Reservation = {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  type: ReservationType;
  objectifs: string[];
  autreObjectif: string | null;
  jourDisponibilite: string | null;
  disponibilite: string | null;
  contactPreference: string;
  source: string;
  recommandation: string | null;
  autreSource: string | null;
  message: string | null;
  statut: ReservationStatut;
  createdAt: string;
  seance: { id: number; titre: string } | null;
  coach: { id: number; prenom: string; nom: string } | null;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<ReservationStatut | "ALL">(
    "ALL"
  );
  const [selectionId, setSelectionId] = useState<number | null>(null);
  const [majEnCours, setMajEnCours] = useState<number | null>(null);

  async function charger() {
    setLoading(true);
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    charger();
  }, []);

  const stats = useMemo(() => {
    const counts: Record<string, number> = { ALL: reservations.length };
    STATUTS_RESERVATION.forEach((s) => {
      counts[s.value] = reservations.filter((r) => r.statut === s.value).length;
    });
    return counts;
  }, [reservations]);

  const reservationsFiltrees = useMemo(() => {
    if (filtreStatut === "ALL") return reservations;
    return reservations.filter((r) => r.statut === filtreStatut);
  }, [reservations, filtreStatut]);

  const selection = reservations.find((r) => r.id === selectionId) ?? null;

  async function changerStatut(id: number, statut: ReservationStatut) {
    setMajEnCours(id);
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });

      if (!res.ok) {
        alert("Impossible de mettre à jour le statut.");
        return;
      }

      const updated = await res.json();
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
      );
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour.");
    } finally {
      setMajEnCours(null);
    }
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer cette réservation ?")) return;

    const res = await fetch(`/api/reservations/${id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Impossible de supprimer.");
      return;
    }

    setReservations((prev) => prev.filter((r) => r.id !== id));
    if (selectionId === id) setSelectionId(null);
  }

  return (
    <div>
      <div className="hf-admin-page-head">
        <div>
          <h1>📅 Réservations</h1>
          <p>Gérez les demandes reçues depuis le formulaire Contact.</p>
        </div>
        <button type="button" className="hf-admin-btn" onClick={charger}>
          🔄 Actualiser
        </button>
      </div>

      <div className="hf-admin-filters">
        <button
          type="button"
          className={`hf-admin-filter${filtreStatut === "ALL" ? " active" : ""}`}
          onClick={() => setFiltreStatut("ALL")}
        >
          Toutes ({stats.ALL ?? 0})
        </button>

        {STATUTS_RESERVATION.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`hf-admin-filter${filtreStatut === s.value ? " active" : ""}`}
            onClick={() => setFiltreStatut(s.value)}
            style={
              filtreStatut === s.value
                ? {
                    background: s.bg,
                    color: s.color,
                    boxShadow: `0 4px 16px ${s.color}33`,
                  }
                : undefined
            }
          >
            {s.emoji} {s.label} ({stats[s.value] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="hf-admin-empty">Chargement...</p>
      ) : reservationsFiltrees.length === 0 ? (
        <div className="hf-admin-card hf-admin-empty">
          Aucune réservation pour le moment.
        </div>
      ) : (
        <div className="hf-admin-table-wrap">
          <table className="hf-admin-table">
            <thead>
              <tr>
                {["Date", "Nom", "Téléphone", "Coach", "Type", "Statut", ""].map(
                  (col) => (
                    <th key={col}>{col}</th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {reservationsFiltrees.map((r) => {
                const statutCfg = getStatutConfig(r.statut);
                const isSelected = selectionId === r.id;

                return (
                  <tr
                    key={r.id}
                    className={isSelected ? "selected" : ""}
                    onClick={() =>
                      setSelectionId(isSelected ? null : r.id)
                    }
                  >
                    <td>{formatDate(r.createdAt)}</td>
                    <td style={{ fontWeight: 600 }}>
                      {r.prenom} {r.nom}
                    </td>
                    <td>
                      <a
                        href={`tel:${r.telephone}`}
                        style={{ color: "#fff", textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {r.telephone}
                      </a>
                    </td>
                    <td>
                      {r.coach
                        ? `${r.coach.prenom} ${r.coach.nom}`
                        : "—"}
                    </td>
                    <td>{getTypeLabel(r.type)}</td>
                    <td>
                      <select
                        value={r.statut}
                        disabled={majEnCours === r.id}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          changerStatut(
                            r.id,
                            e.target.value as ReservationStatut
                          )
                        }
                        style={{
                          background: statutCfg.bg,
                          color: statutCfg.color,
                          border: `1px solid ${statutCfg.color}`,
                          borderRadius: 8,
                          padding: "8px 10px",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        {STATUTS_RESERVATION.map((s) => (
                          <option
                            key={s.value}
                            value={s.value}
                            style={{ background: "#111", color: "#fff" }}
                          >
                            {s.emoji} {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="hf-admin-btn hf-admin-btn-danger hf-admin-btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          supprimer(r.id);
                        }}
                      >
                        Suppr.
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selection && (
        <div className="hf-admin-card hf-admin-detail">
          <h2>
            Détail — {selection.prenom} {selection.nom}
          </h2>

          <div className="hf-admin-detail-grid">
            <Detail label="Email" value={selection.email} />
            <Detail label="Téléphone" value={selection.telephone} />
            <Detail label="Type" value={getTypeLabel(selection.type)} />
            <Detail
              label="Séance"
              value={selection.seance?.titre ?? "—"}
            />
            <Detail
              label="Coach"
              value={
                selection.coach
                  ? `${selection.coach.prenom} ${selection.coach.nom}`
                  : "Aucune préférence"
              }
            />
            <Detail
              label="Contact préféré"
              value={
                CONTACT_LABELS[selection.contactPreference] ??
                selection.contactPreference
              }
            />
            <Detail
              label="Source"
              value={SOURCE_LABELS[selection.source] ?? selection.source}
            />
            {selection.jourDisponibilite && (
              <Detail
                label="Jour souhaité"
                value={getJourLabel(selection.jourDisponibilite)}
              />
            )}
            {selection.disponibilite && (
              <Detail
                label="Moment souhaité"
                value={getMomentLabel(selection.disponibilite)}
              />
            )}
            {selection.recommandation && (
              <Detail
                label="Recommandé par"
                value={selection.recommandation}
              />
            )}
            {selection.autreSource && (
              <Detail label="Autre source" value={selection.autreSource} />
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <strong style={{ color: "#d4af37" }}>Objectifs :</strong>
            <p style={{ color: "#ddd", marginTop: 8 }}>
              {selection.objectifs.join(", ")}
              {selection.autreObjectif
                ? ` — ${selection.autreObjectif}`
                : ""}
            </p>
          </div>

          {selection.message && (
            <div style={{ marginTop: 16 }}>
              <strong style={{ color: "#d4af37" }}>Message :</strong>
              <p style={{ color: "#ddd", marginTop: 8, whiteSpace: "pre-wrap" }}>
                {selection.message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="hf-admin-detail-item">
      <label>{label}</label>
      <span>{value}</span>
    </div>
  );
}
