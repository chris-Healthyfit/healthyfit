"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Coach = { id: number; prenom: string; nom: string };
type Membre = {
  id: number;
  prenom: string;
  nom: string | null;
  telephone: string | null;
  estClient: boolean;
  actif: boolean;
  estVip: boolean;
  aNutrition: boolean;
  notes: string | null;
  coachReferent: Coach;
};

export default function ClientsPageWrapper() {
  return (
    <Suspense fallback={<p className="hf-admin-entity-meta">Chargement…</p>}>
      <ClientsPage />
    </Suspense>
  );
}

function ClientsPage() {
  const searchParams = useSearchParams();
  const alarmeParam = searchParams.get("alarme");
  const [alarmeIds, setAlarmeIds] = useState<number[] | null>(null);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [coachs, setCoachs] = useState<Coach[]>([]);
  const [filtre, setFiltre] = useState<
    "all" | "actif" | "inactif" | "vip" | "nutrition"
  >("all");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [estClient, setEstClient] = useState(true);
  const [estVip, setEstVip] = useState(false);
  const [aNutrition, setANutrition] = useState(false);
  const [coachReferentId, setCoachReferentId] = useState("");
  const [notes, setNotes] = useState("");
  const [me, setMe] = useState<{ role: string; coachId: number | null } | null>(
    null
  );

  async function charger() {
    const res = await fetch("/api/club/members");
    if (res.ok) setMembres(await res.json());
  }

  useEffect(() => {
    fetch("/api/coachs")
      .then((r) => r.ok && r.json())
      .then(setCoachs);
    fetch("/api/me")
      .then((r) => r.ok && r.json())
      .then((d) => {
        if (d) {
          setMe(d);
          if (d.coachId) setCoachReferentId(String(d.coachId));
        }
      });
    charger();
  }, []);

  useEffect(() => {
    if (alarmeParam === "bilan" || alarmeParam === "relance") {
      fetch("/api/club/alarmes")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!d) return;
          const ids =
            alarmeParam === "bilan"
              ? d.bilans.membres.map((m: { id: number }) => m.id)
              : d.relances.membres.map((m: { id: number }) => m.id);
          setAlarmeIds(ids);
        });
    } else {
      setAlarmeIds(null);
    }
  }, [alarmeParam]);

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/club/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom,
        nom,
        telephone,
        estClient,
        estVip,
        aNutrition,
        coachReferentId: Number(coachReferentId),
        notes,
      }),
    });
    if (!res.ok) {
      alert("Erreur à la création.");
      return;
    }
    setPrenom("");
    setNom("");
    setTelephone("");
    setNotes("");
    setEstVip(false);
    setANutrition(false);
    charger();
  }

  async function patchMember(id: number, data: Record<string, unknown>) {
    const res = await fetch(`/api/club/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) charger();
  }

  async function supprimer(id: number) {
    if (!confirm("Supprimer ce membre ?")) return;
    await fetch(`/api/club/members/${id}`, { method: "DELETE" });
    charger();
  }

  const filtres = membres.filter((m) => {
    if (alarmeIds) return alarmeIds.includes(m.id);
    if (filtre === "actif") return m.actif;
    if (filtre === "inactif") return !m.actif;
    if (filtre === "vip") return m.estVip;
    if (filtre === "nutrition") return m.aNutrition;
    return true;
  });

  const alarmeLabel =
    alarmeParam === "bilan"
      ? "Bilans à refaire"
      : alarmeParam === "relance"
        ? "Clients à relancer"
        : null;

  const isDirection = me?.role === "SUPER_ADMIN";

  return (
    <>
      <div className="hf-admin-page-head">
        <div>
          <h1>👥 Clients</h1>
          <p>
            {alarmeLabel ?? "Statut actif/inactif, VIP et nutrition."}
          </p>
        </div>
        {alarmeLabel && (
          <Link href="/espace-club/clients" className="hf-admin-btn hf-admin-btn-ghost">
            ✕ Tous les clients
          </Link>
        )}
      </div>

      {alarmeLabel && (
        <div className="hf-admin-alert warning" style={{ marginBottom: 20 }}>
          ⚠️ {filtres.length} client{filtres.length > 1 ? "s" : ""} — {alarmeLabel.toLowerCase()}
        </div>
      )}

      <form onSubmit={ajouter} className="hf-admin-card" style={{ marginBottom: 28 }}>
        <h2 className="hf-admin-form-title">Ajouter un client</h2>
        <div
          className="hf-admin-split"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
        >
          <div className="hf-admin-field">
            <label className="hf-admin-label">Prénom *</label>
            <input
              className="hf-admin-input"
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Nom</label>
            <input
              className="hf-admin-input"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="hf-admin-field">
            <label className="hf-admin-label">Téléphone</label>
            <input
              className="hf-admin-input"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
          </div>
          {isDirection && (
            <div className="hf-admin-field">
              <label className="hf-admin-label">Coach référent *</label>
              <select
                className="hf-admin-input hf-admin-select"
                required
                value={coachReferentId}
                onChange={(e) => setCoachReferentId(e.target.value)}
              >
                <option value="">Choisir…</option>
                {coachs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.prenom} {c.nom}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <label className="hf-admin-check">
            <input
              type="radio"
              checked={estClient}
              onChange={() => setEstClient(true)}
            />{" "}
            Client
          </label>
          <label className="hf-admin-check">
            <input
              type="radio"
              checked={!estClient}
              onChange={() => setEstClient(false)}
            />{" "}
            Non-client
          </label>
          <label className="hf-admin-check">
            <input
              type="checkbox"
              checked={estVip}
              onChange={(e) => setEstVip(e.target.checked)}
            />{" "}
            VIP
          </label>
          <label className="hf-admin-check">
            <input
              type="checkbox"
              checked={aNutrition}
              onChange={(e) => setANutrition(e.target.checked)}
            />{" "}
            Nutrition
          </label>
        </div>
        <button type="submit" className="hf-admin-btn">
          Ajouter
        </button>
      </form>

      {!alarmeLabel && (
      <div
        className="hf-admin-filters"
        style={{
          gridTemplateColumns: "repeat(5, 1fr)",
          maxWidth: 720,
          marginBottom: 24,
        }}
      >
        {(
          [
            ["all", "Tous"],
            ["actif", "Actifs"],
            ["inactif", "Inactifs"],
            ["vip", "VIP"],
            ["nutrition", "Nutrition"],
          ] as const
        ).map(([f, label]) => (
          <button
            key={f}
            type="button"
            className={`hf-admin-filter${filtre === f ? " active" : ""}`}
            onClick={() => setFiltre(f)}
          >
            {label}
          </button>
        ))}
      </div>
      )}

      <div className="hf-admin-grid-cards">
        {filtres.map((m) => (
          <article
            key={m.id}
            className="hf-admin-entity-card"
            style={{ opacity: m.actif ? 1 : 0.65 }}
          >
            <div className="hf-admin-entity-body">
              <Link href={`/espace-club/clients/${m.id}`} className="hf-admin-link">
                <h3 className="hf-admin-entity-title">
                  {m.prenom} {m.nom ?? ""}
                {m.estVip && (
                  <span
                    className="hf-admin-tag"
                    style={{
                      marginLeft: 8,
                      background: "linear-gradient(135deg, #f4d66a, #d4af37)",
                      color: "#000",
                    }}
                  >
                    VIP
                  </span>
                )}
              </h3>
              </Link>
              <div className="hf-admin-tags">
                <span
                  className="hf-admin-tag"
                  style={{ color: m.actif ? "#8f8" : "#f88" }}
                >
                  {m.actif ? "Actif" : "Inactif"}
                </span>
                <span className="hf-admin-tag">
                  {m.estClient ? "Client" : "Non-client"}
                </span>
                {m.aNutrition && (
                  <span className="hf-admin-tag">🥗 Nutrition</span>
                )}
                <span className="hf-admin-tag">
                  Coach : {m.coachReferent.prenom}
                </span>
                {m.telephone && (
                  <span className="hf-admin-tag">{m.telephone}</span>
                )}
              </div>
              {m.notes && (
                <p className="hf-admin-entity-meta" style={{ marginTop: 12 }}>
                  {m.notes}
                </p>
              )}
              <div
                className="hf-admin-entity-actions"
                style={{ flexWrap: "wrap", gap: 8, marginTop: 16 }}
              >
                <button
                  type="button"
                  className="hf-admin-btn hf-admin-btn-sm hf-admin-btn-ghost"
                  onClick={() => patchMember(m.id, { actif: !m.actif })}
                >
                  {m.actif ? "Passer inactif" : "Réactiver"}
                </button>
                <button
                  type="button"
                  className="hf-admin-btn hf-admin-btn-sm hf-admin-btn-ghost"
                  onClick={() => patchMember(m.id, { estVip: !m.estVip })}
                >
                  {m.estVip ? "Retirer VIP" : "Marquer VIP"}
                </button>
                <button
                  type="button"
                  className="hf-admin-btn hf-admin-btn-sm hf-admin-btn-ghost"
                  onClick={() =>
                    patchMember(m.id, { aNutrition: !m.aNutrition })
                  }
                >
                  {m.aNutrition ? "Sans nutrition" : "+ Nutrition"}
                </button>
                <button
                  type="button"
                  className="hf-admin-btn hf-admin-btn-danger hf-admin-btn-sm"
                  onClick={() => supprimer(m.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
