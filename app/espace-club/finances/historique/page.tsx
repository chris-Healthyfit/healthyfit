"use client";

import { useEffect, useState } from "react";

function fmt(c: number) {
  return `${(c / 100).toFixed(2).replace(".", ",")} €`;
}

type Entry = {
  id: number;
  date: string;
  type: string;
  libelle: string;
  recetteCentimes: number;
  depenseCentimes: number;
  coutCentimes: number;
  beneficeCentimes: number;
};

export default function HistoriqueFinancePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetch(`/api/club/finance/historique?period=${period}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setEntries);
  }, [period]);

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>📋 Historique comptable</h1>
          <p>Toutes les opérations enregistrées automatiquement.</p>
        </div>
      </div>

      <div className="hf-admin-filters" style={{ maxWidth: 480, marginBottom: 24 }}>
        {(["today", "week", "month", "year"] as const).map((p) => (
          <button
            key={p}
            type="button"
            className={`hf-admin-filter${period === p ? " active" : ""}`}
            onClick={() => setPeriod(p)}
          >
            {p === "today" ? "Aujourd'hui" : p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
          </button>
        ))}
      </div>

      <div className="hf-admin-list-compact">
        {entries.map((e) => (
          <div key={e.id} className="hf-historique-row">
            <div className="hf-historique-date">
              {new Date(e.date).toLocaleDateString("fr-BE")}
            </div>
            <div className="hf-historique-body">
              <strong>{e.libelle}</strong>
              <div className="hf-historique-amounts">
                {e.recetteCentimes > 0 && (
                  <span className="good">+{fmt(e.recetteCentimes)}</span>
                )}
                {e.coutCentimes > 0 && e.type.includes("FIT") && (
                  <span className="muted">Coût {fmt(e.coutCentimes)}</span>
                )}
                {e.depenseCentimes > 0 && !e.type.includes("FIT") && (
                  <span className="bad">-{fmt(e.depenseCentimes)}</span>
                )}
                {e.beneficeCentimes !== 0 && (
                  <span className={e.beneficeCentimes >= 0 ? "good" : "bad"}>
                    Bénéfice {e.beneficeCentimes >= 0 ? "+" : ""}
                    {fmt(Math.abs(e.beneficeCentimes))}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
