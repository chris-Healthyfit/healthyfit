"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Member = {
  id: number;
  prenom: string;
  nom: string | null;
  estVip: boolean;
  actif: boolean;
};

type CoachOption = { id: number; prenom: string; nom: string };

type CoachInfo = {
  coach: { id: number; prenom: string; nom: string };
  members: Member[];
  linked: { members: number; presences: number; seances: number };
  autresCoachs: CoachOption[];
};

export default function SupprimerCoachPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [info, setInfo] = useState<CoachInfo | null>(null);
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [seancesCoachId, setSeancesCoachId] = useState("");
  const [bulkCoachId, setBulkCoachId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch(`/api/coachs/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: CoachInfo) => {
        setInfo(d);
        const initial: Record<number, string> = {};
        for (const m of d.members) initial[m.id] = "";
        setAssignments(initial);
      })
      .catch(() => setErreur("Coach introuvable."))
      .finally(() => setLoading(false));
  }, [id]);

  function appliquerBulk() {
    if (!bulkCoachId || !info) return;
    const next: Record<number, string> = {};
    for (const m of info.members) next[m.id] = bulkCoachId;
    setAssignments(next);
  }

  function coachLabel(c: CoachOption) {
    return `${c.prenom} ${c.nom}`;
  }

  const linkedTotal = info
    ? info.linked.members + info.linked.presences + info.linked.seances
    : 0;
  const needsReassign = linkedTotal > 0;
  const allMembersAssigned =
    !info?.members.length ||
    info.members.every((m) => assignments[m.id] && assignments[m.id] !== id);
  const seancesOk = !info?.linked.seances || !!seancesCoachId;

  async function confirmerSuppression() {
    if (!info) return;

    if (info.members.length && !allMembersAssigned) {
      setErreur("Assignez un coach à chaque client.");
      return;
    }
    if (info.linked.seances && !seancesCoachId) {
      setErreur("Choisissez qui reprend les séances collectives.");
      return;
    }

    setSubmitting(true);
    setErreur("");

    const payload: Record<string, unknown> = {};
    if (info.members.length) {
      payload.memberAssignments = info.members.map((m) => ({
        memberId: m.id,
        coachId: Number(assignments[m.id]),
      }));
    }
    if (info.linked.seances) {
      payload.seancesCoachId = Number(seancesCoachId);
    }

    const res = await fetch(`/api/coachs/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (res.ok) {
      router.push("/admin/coachs");
      router.refresh();
      return;
    }

    const data = await res.json().catch(() => ({}));
    setErreur(data.error ?? "Suppression impossible.");
  }

  if (loading) {
    return (
      <div className="hf-admin-page-head">
        <p className="hf-admin-entity-meta">Chargement…</p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="hf-admin-page-head">
        <p className="hf-admin-alert error">{erreur || "Coach introuvable."}</p>
        <Link href="/admin/coachs" className="hf-admin-back">
          ← Retour aux coachs
        </Link>
      </div>
    );
  }

  const { coach, members, linked, autresCoachs } = info;
  const canSubmit =
    autresCoachs.length > 0 &&
    (!needsReassign || (allMembersAssigned && seancesOk));

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <Link href="/admin/coachs" className="hf-admin-back">
            ← Retour aux coachs
          </Link>
          <h1>
            🗑 Supprimer {coach.prenom} {coach.nom}
          </h1>
          <p>
            {needsReassign
              ? "Choisissez client par client qui reprend chaque personne."
              : "Aucune donnée liée — suppression directe possible."}
          </p>
        </div>
      </div>

      <div className="hf-admin-card hf-reassign-panel">
        {needsReassign && (
          <>
            <ul className="hf-reassign-stats">
              {linked.members > 0 && (
                <li>
                  <strong>{linked.members}</strong> client
                  {linked.members > 1 ? "s" : ""}
                </li>
              )}
              {linked.presences > 0 && (
                <li>
                  <strong>{linked.presences}</strong> présence
                  {linked.presences > 1 ? "s" : ""}
                </li>
              )}
              {linked.seances > 0 && (
                <li>
                  <strong>{linked.seances}</strong> séance
                  {linked.seances > 1 ? "s" : ""} collective
                  {linked.seances > 1 ? "s" : ""}
                </li>
              )}
            </ul>

            {members.length > 0 && (
              <>
                <h2 className="hf-admin-form-title">Clients à réassigner</h2>

                {autresCoachs.length === 0 ? (
                  <p className="hf-admin-alert error">
                    Aucun autre coach. Ajoutez-en un avant de supprimer.
                  </p>
                ) : (
                  <>
                    <div className="hf-reassign-bulk">
                      <label className="hf-admin-label">
                        Tout assigner rapidement à
                      </label>
                      <div className="hf-reassign-bulk-row">
                        <select
                          className="hf-admin-input hf-admin-select"
                          value={bulkCoachId}
                          onChange={(e) => setBulkCoachId(e.target.value)}
                        >
                          <option value="">Choisir…</option>
                          {autresCoachs.map((c) => (
                            <option key={c.id} value={c.id}>
                              {coachLabel(c)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="hf-admin-btn hf-admin-btn-ghost hf-admin-btn-sm"
                          disabled={!bulkCoachId}
                          onClick={appliquerBulk}
                        >
                          Appliquer à tous
                        </button>
                      </div>
                    </div>

                    <div className="hf-reassign-list">
                      {members.map((m) => (
                        <div key={m.id} className="hf-reassign-row">
                          <div className="hf-reassign-member">
                            <strong>
                              {m.prenom} {m.nom ?? ""}
                            </strong>
                            <span className="hf-admin-entity-meta">
                              {!m.actif && "Inactif · "}
                              {m.estVip && "VIP"}
                            </span>
                          </div>
                          <select
                            className="hf-admin-input hf-admin-select hf-reassign-select"
                            value={assignments[m.id] ?? ""}
                            onChange={(e) =>
                              setAssignments((prev) => ({
                                ...prev,
                                [m.id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">→ Choisir un coach</option>
                            {autresCoachs.map((c) => (
                              <option key={c.id} value={c.id}>
                                {coachLabel(c)}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {linked.seances > 0 && autresCoachs.length > 0 && (
              <div className="hf-admin-field" style={{ marginTop: 28 }}>
                <label className="hf-admin-label">
                  Séances collectives → reprendues par
                </label>
                <select
                  className="hf-admin-input hf-admin-select"
                  value={seancesCoachId}
                  onChange={(e) => setSeancesCoachId(e.target.value)}
                >
                  <option value="">Choisir un coach…</option>
                  {autresCoachs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {coachLabel(c)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {!needsReassign && (
          <p className="hf-admin-entity-meta">
            Confirmez la suppression de{" "}
            <strong>
              {coach.prenom} {coach.nom}
            </strong>
            .
          </p>
        )}

        {erreur && (
          <p className="hf-admin-alert error" style={{ marginTop: 16 }}>
            {erreur}
          </p>
        )}

        <div className="hf-reassign-actions">
          <Link href="/admin/coachs" className="hf-admin-btn hf-admin-btn-ghost">
            Annuler
          </Link>
          <button
            type="button"
            className="hf-admin-btn hf-admin-btn-danger"
            disabled={submitting || !canSubmit}
            onClick={confirmerSuppression}
          >
            {submitting
              ? "Suppression…"
              : needsReassign
                ? "Réassigner et supprimer"
                : "Supprimer définitivement"}
          </button>
        </div>
      </div>
    </>
  );
}
