"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDiff } from "@/lib/club/bilans";

type Bilan = {
  id: number;
  date: string;
  poids: number | null;
  masseGrasse: number | null;
  masseMusculaire: number | null;
  photoAvant: string | null;
  photoApres: string | null;
};

export default function HistoriquePage() {
  const params = useParams();
  const id = params.id as string;
  const [bilans, setBilans] = useState<Bilan[]>([]);
  const [prenom, setPrenom] = useState("");

  useEffect(() => {
    fetch(`/api/club/members/${id}`)
      .then((r) => r.ok && r.json())
      .then((d) => {
        if (d) {
          setPrenom(d.prenom);
          setBilans(d.bilans ?? []);
        }
      });
  }, [id]);

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <Link href={`/espace-club/clients/${id}`} className="hf-admin-back">
            ← Fiche client
          </Link>
          <h1>📂 Historique — {prenom}</h1>
          <p>{bilans.length} bilan{bilans.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="hf-admin-grid-cards">
        {bilans.map((b, i) => {
          const prev = bilans[i + 1];
          const comp =
            prev && b.masseGrasse != null && prev.masseGrasse != null
              ? [
                  {
                    label: "Masse grasse",
                    diff: Math.round((b.masseGrasse! - prev.masseGrasse!) * 10) / 10,
                    unit: "%",
                  },
                  {
                    label: "Poids",
                    diff:
                      b.poids != null && prev.poids != null
                        ? Math.round((b.poids - prev.poids) * 10) / 10
                        : null,
                    unit: "kg",
                  },
                ].filter((x) => x.diff != null)
              : null;
          return (
            <article key={b.id} className="hf-admin-entity-card">
              <div className="hf-admin-entity-body">
                <h3 className="hf-admin-entity-title">
                  {new Date(b.date).toLocaleDateString("fr-BE")}
                </h3>
                {comp && comp.length > 0 && (
                  <div className="hf-comparaison-grid compact">
                    {comp.map((c) => (
                      <div key={c.label} className="hf-comparaison-item">
                        <span className="hf-comparaison-label">{c.label}</span>
                        {c.diff != null && (
                          <span className="hf-comparaison-diff">
                            {formatDiff(c.diff, c.unit)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
