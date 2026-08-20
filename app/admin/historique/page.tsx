"use client";

import { useEffect, useState } from "react";
import { ACTION_LABELS, ENTITY_LABELS } from "@/lib/audit-labels";

type AuditLog = {
  id: number;
  action: keyof typeof ACTION_LABELS;
  entity: string | null;
  entityId: number | null;
  details: string | null;
  ip: string | null;
  createdAt: string;
  admin: {
    prenom: string;
    nom: string;
    identifiant: string;
  } | null;
};

export default function AdminHistoriquePage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filtre, setFiltre] = useState("tout");

  async function charger(f: string) {
    const params = f === "tout" ? "" : `?filtre=${f}`;
    const res = await fetch(`/api/audit${params}`);
    if (res.ok) setLogs(await res.json());
  }

  useEffect(() => {
    charger(filtre);
  }, [filtre]);

  function formatDate(value: string) {
    return new Date(value).toLocaleString("fr-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const filtres = [
    { id: "tout", label: "Tout" },
    { id: "connexions", label: "Connexions" },
    { id: "modifications", label: "Modifications" },
  ];

  return (
    <div>
      <div className="hf-admin-page-head">
        <div>
          <h1>📋 Historique</h1>
          <p>Connexions et modifications effectuées par les administrateurs.</p>
        </div>
      </div>

      <div className="hf-admin-filters" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 160px))" }}>
        {filtres.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`hf-admin-filter${filtre === f.id ? " active" : ""}`}
            onClick={() => setFiltre(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="hf-admin-table-wrap">
        <table className="hf-admin-table">
          <thead>
            <tr>
              {["Date", "Admin", "Action", "Zone", "Détail", "IP"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="hf-admin-empty">
                  Aucun événement pour le moment.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ cursor: "default" }}>
                  <td style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                    {formatDate(log.createdAt)}
                  </td>
                  <td>
                    {log.admin
                      ? `${log.admin.prenom} ${log.admin.nom}`
                      : "—"}
                  </td>
                  <td>{ACTION_LABELS[log.action]}</td>
                  <td style={{ color: "#aaa" }}>
                    {log.entity
                      ? ENTITY_LABELS[log.entity] ?? log.entity
                      : "—"}
                  </td>
                  <td style={{ fontSize: 13, maxWidth: 280 }}>
                    {log.details ?? "—"}
                  </td>
                  <td style={{ fontSize: 12, color: "#666" }}>
                    {log.ip ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
