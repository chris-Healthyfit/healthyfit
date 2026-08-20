"use client";

import {
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  JOURS_DISPONIBLES,
  MOMENTS_DISPONIBLES,
  MomentDisponibilite,
} from "@/lib/disponibilites";
import "./contact.css";

type Contact = {
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  horaires: string;
  facebook: string;
  googleMaps: string;
  introduction: string;
};

type Seance = {
  id: number;
  horaire: string;
  titre: string;
  duree: string;
  niveau: string;
};

type Coach = {
  id: number;
  prenom: string;
  nom: string;
  description: string;
  image: string;
  ordre: number;
};

type ReservationType = "SEANCE" | "BILAN";
type ContactPreference = "TELEPHONE" | "SMS" | "EMAIL";
type SourceConnaissance =
  | "FACEBOOK"
  | "INSTAGRAM"
  | "GOOGLE"
  | "PROCHE"
  | "PASSAGE_CLUB"
  | "AUTRE";

const OBJECTIFS = [
  "Perdre du poids",
  "Prendre de la masse musculaire",
  "Tonifier mon corps",
  "Retrouver la forme",
  "Gagner en énergie",
  "Améliorer mon alimentation",
  "Bien-être général",
  "Reprendre une activité physique",
  "Autre",
] as const;

const gold = "#d4af37";

const labelStyle: CSSProperties = {
  display: "block",
  color: gold,
  fontWeight: 700,
  marginBottom: 10,
  fontSize: "clamp(15px,3.5vw,17px)",
};

type ChampErreur =
  | "nom"
  | "prenom"
  | "telephone"
  | "email"
  | "objectifs"
  | "autreObjectif"
  | "seanceId"
  | "jourDisponibilite"
  | "momentDisponibilite"
  | "contactPreference"
  | "source"
  | "recommandation"
  | "autreSource"
  | "rgpd";

const LABELS_CHAMPS: Record<ChampErreur, string> = {
  nom: "Nom",
  prenom: "Prénom",
  telephone: "Téléphone",
  email: "Email",
  objectifs: "Mon objectif",
  autreObjectif: "Précisez votre objectif",
  seanceId: "Séance souhaitée",
  jourDisponibilite: "Jour de disponibilité",
  momentDisponibilite: "Moment de disponibilité",
  contactPreference: "Préférence de contact",
  source: "Comment nous avez-vous connus",
  recommandation: "Qui vous a recommandé",
  autreSource: "Précisez la source",
  rgpd: "Acceptation RGPD",
};

function styleChamp(
  champ: ChampErreur,
  champsErreur: Set<ChampErreur>
): string {
  return champsErreur.has(champ)
    ? "contact-input contact-input-error"
    : "contact-input";
}

function styleSection(
  champ: ChampErreur,
  champsErreur: Set<ChampErreur>
): CSSProperties | undefined {
  if (!champsErreur.has(champ)) return undefined;

  return {
    border: "1px solid rgba(255,107,107,.55)",
    borderRadius: 14,
    padding: 14,
    background: "rgba(255,107,107,.06)",
  };
}

function MessageErreurChamp({
  champ,
  champsErreur,
  message,
}: {
  champ: ChampErreur;
  champsErreur: Set<ChampErreur>;
  message?: string;
}) {
  if (!champsErreur.has(champ)) return null;

  return (
    <p
      style={{
        color: "#ff8a8a",
        fontSize: 14,
        marginTop: 8,
        marginBottom: 0,
      }}
    >
      {message ?? "Ce champ est obligatoire."}
    </p>
  );
}

function RadioOption({
  name,
  value,
  checked,
  label,
  onChange,
}: {
  name: string;
  value: string;
  checked: boolean;
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={`contact-radio ${checked ? "contact-radio-checked" : ""}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        style={{ accentColor: gold, width: 18, height: 18 }}
      />
      <span style={{ color: "#fff", fontSize: "clamp(15px,3.5vw,16px)" }}>
        {label}
      </span>
    </label>
  );
}

export default function ContactPage() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [coachs, setCoachs] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<ReservationType>("SEANCE");
  const [objectifs, setObjectifs] = useState<string[]>([]);
  const [autreObjectif, setAutreObjectif] = useState("");
  const [seanceId, setSeanceId] = useState("");
  const [coachId, setCoachId] = useState("");
  const [jourDisponibilite, setJourDisponibilite] = useState("");
  const [momentDisponibilite, setMomentDisponibilite] = useState<
    MomentDisponibilite | ""
  >("");
  const [contactPreference, setContactPreference] = useState<
    ContactPreference | ""
  >("");
  const [source, setSource] = useState<SourceConnaissance | "">("");
  const [recommandation, setRecommandation] = useState("");
  const [autreSource, setAutreSource] = useState("");
  const [message, setMessage] = useState("");
  const [rgpd, setRgpd] = useState(false);

  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  const [champsErreur, setChampsErreur] = useState<Set<ChampErreur>>(new Set());
  const [succes, setSucces] = useState(false);
  const [messageSucces, setMessageSucces] = useState("");
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);

  const formulaireRef = useRef<HTMLElement>(null);

  const coachsTries = useMemo(
    () => [...coachs].sort((a, b) => a.ordre - b.ordre),
    [coachs]
  );

  const coachSelectionne = useMemo(
    () => coachsTries.find((coach) => String(coach.id) === coachId) ?? null,
    [coachsTries, coachId]
  );

  const contientAutreObjectif = objectifs.includes("Autre");

  useEffect(() => {
    async function chargerDonnees() {
      try {
        const [contactRes, seancesRes, coachsRes] = await Promise.all([
          fetch("/api/contact"),
          fetch("/api/seances"),
          fetch("/api/coachs"),
        ]);

        const contactData = await contactRes.json();
        const seancesData = await seancesRes.json();
        const coachsData = await coachsRes.json();

        setContact(contactData);
        setSeances(Array.isArray(seancesData) ? seancesData : []);
        setCoachs(Array.isArray(coachsData) ? coachsData : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    chargerDonnees();
  }, []);

  function fermerFormulaire() {
    setAfficherFormulaire(false);
    setErreur("");
    setChampsErreur(new Set());
  }

  function effacerErreurChamp(champ: ChampErreur) {
    setChampsErreur((prev) => {
      if (!prev.has(champ)) return prev;
      const next = new Set(prev);
      next.delete(champ);
      return next;
    });
  }

  function validerFormulaire(): ChampErreur[] {
    const manquants: ChampErreur[] = [];

    if (!nom.trim()) manquants.push("nom");
    if (!prenom.trim()) manquants.push("prenom");
    if (!telephone.trim()) manquants.push("telephone");
    if (!email.trim()) manquants.push("email");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      manquants.push("email");
    }
    if (objectifs.length === 0) manquants.push("objectifs");
    if (contientAutreObjectif && !autreObjectif.trim()) {
      manquants.push("autreObjectif");
    }
    if (type === "SEANCE" && !seanceId) manquants.push("seanceId");
    if (type === "BILAN") {
      if (!jourDisponibilite) manquants.push("jourDisponibilite");
      if (!momentDisponibilite) manquants.push("momentDisponibilite");
    }
    if (!contactPreference) manquants.push("contactPreference");
    if (!source) manquants.push("source");
    if (source === "PROCHE" && !recommandation.trim()) {
      manquants.push("recommandation");
    }
    if (source === "AUTRE" && !autreSource.trim()) {
      manquants.push("autreSource");
    }
    if (!rgpd) manquants.push("rgpd");

    return manquants;
  }

  function ouvrirFormulaire() {
    setAfficherFormulaire(true);
    setErreur("");

    setTimeout(() => {
      formulaireRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function toggleObjectif(objectif: string) {
    setObjectifs((prev) => {
      const next = prev.includes(objectif)
        ? prev.filter((item) => item !== objectif)
        : [...prev, objectif];

      if (next.length > 0) effacerErreurChamp("objectifs");
      return next;
    });
  }

  function reinitialiserFormulaire() {
    setNom("");
    setPrenom("");
    setTelephone("");
    setEmail("");
    setType("SEANCE");
    setObjectifs([]);
    setAutreObjectif("");
    setSeanceId("");
    setCoachId("");
    setJourDisponibilite("");
    setMomentDisponibilite("");
    setContactPreference("");
    setSource("");
    setRecommandation("");
    setAutreSource("");
    setMessage("");
    setRgpd(false);
    setErreur("");
    setChampsErreur(new Set());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur("");
    setChampsErreur(new Set());

    const manquants = validerFormulaire();

    if (manquants.length > 0) {
      const labels = manquants.map((champ) => LABELS_CHAMPS[champ]);
      setChampsErreur(new Set(manquants));
      setErreur(
        `Veuillez compléter les champs suivants : ${labels.join(", ")}.`
      );

      const premierChamp = document.getElementById(`champ-${manquants[0]}`);
      premierChamp?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setEnvoiEnCours(true);

    try {
      const payload = {
        nom,
        prenom,
        telephone,
        email,
        type,
        objectifs,
        autreObjectif: contientAutreObjectif ? autreObjectif : null,
        seanceId:
          type === "SEANCE" && seanceId ? Number(seanceId) : null,
        coachId: coachId ? Number(coachId) : null,
        jourDisponibilite:
          type === "BILAN" && jourDisponibilite ? jourDisponibilite : null,
        disponibilite:
          type === "BILAN" && momentDisponibilite ? momentDisponibilite : null,
        contactPreference,
        source,
        recommandation: source === "PROCHE" ? recommandation : null,
        autreSource: source === "AUTRE" ? autreSource : null,
        message: message.trim() || null,
        rgpd,
      };

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErreur(data.error || "Une erreur est survenue.");
        return;
      }

      setSucces(true);
      setAfficherFormulaire(true);
      setMessageSucces(
        data.message ||
          "Merci ! Votre demande a bien été envoyée. Un coach HealthyFit vous contactera rapidement."
      );
      reinitialiserFormulaire();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setErreur(
        "Impossible d'envoyer votre demande pour le moment. Veuillez réessayer."
      );
    } finally {
      setEnvoiEnCours(false);
    }
  }

  if (loading) {
    return (
      <main className="hf-page contact-page">
        <Navbar />
        <div className="contact-loading">
          <div className="contact-spinner" />
          <p style={{ fontSize: "clamp(18px,5vw,22px)", color: "#d4af37" }}>
            Chargement...
          </p>
        </div>
      </main>
    );
  }

  if (!contact) {
    return (
      <main className="hf-page contact-page">
        <Navbar />
        <div className="contact-wrap" style={{ textAlign: "center" }}>
          <h1 className="contact-title">Contact</h1>
          <p className="contact-subtitle">
            Les informations de contact seront bientôt disponibles.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="hf-page contact-page">
      <Navbar />

      <div className="contact-wrap">
        <header className="contact-hero">
          <h1 className="contact-title">Contact</h1>
          <div className="contact-divider" />
          <p className="contact-subtitle">{contact.introduction}</p>
        </header>

        {succes && (
          <div className="contact-card contact-success">
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2
              style={{
                color: gold,
                fontSize: "clamp(26px,5vw,34px)",
                marginBottom: 16,
              }}
            >
              Merci !
            </h2>
            <p
              style={{
                color: "#d9d9d9",
                fontSize: "clamp(17px,4vw,19px)",
                lineHeight: 1.8,
                maxWidth: 700,
                margin: "0 auto",
              }}
            >
              {messageSucces}
            </p>
          </div>
        )}

        <div className="contact-grid-2">
          <div className="contact-card contact-info-card">
            <h2
              style={{
                color: gold,
                marginBottom: 25,
                fontSize: "clamp(28px,7vw,34px)",
                fontWeight: 800,
              }}
            >
              {contact.nom}
            </h2>

            <div className="contact-info-row">
              <div className="contact-info-icon">📍</div>
              <div>
                <div className="contact-info-label">Adresse</div>
                <div className="contact-info-value">{contact.adresse}</div>
              </div>
            </div>

            <div className="contact-info-row">
              <div className="contact-info-icon">📞</div>
              <div>
                <div className="contact-info-label">Téléphone</div>
                <div className="contact-info-value">
                  <a href={`tel:${contact.telephone}`}>{contact.telephone}</a>
                </div>
              </div>
            </div>

            <div className="contact-info-row">
              <div className="contact-info-icon">✉️</div>
              <div>
                <div className="contact-info-label">E-mail</div>
                <div className="contact-info-value">
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              </div>
            </div>

            <div className="contact-info-row">
              <div className="contact-info-icon">🕒</div>
              <div>
                <div className="contact-info-label">Horaires</div>
                <div className="contact-info-value">{contact.horaires}</div>
              </div>
            </div>

            <a
              href={contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn-gold"
              style={{ marginTop: 25 }}
            >
              Notre Facebook
            </a>
          </div>

          <div className="contact-map-card">
            {contact.googleMaps ? (
              <iframe
                src={contact.googleMaps}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 380 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation HealthyFit"
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  minHeight: 380,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#888",
                  background: "#141414",
                }}
              >
                Carte indisponible.
              </div>
            )}
          </div>
        </div>

        <div className="contact-card contact-cta">
          <h2 className="contact-cta-title">Prêt à atteindre vos objectifs ?</h2>
          <p className="contact-cta-text">
            Réservez votre séance ou votre bilan Sport &amp; Nutrition.
            Un coach HealthyFit vous recontactera rapidement pour organiser
            votre première expérience.
          </p>

          {!afficherFormulaire && (
            <button
              type="button"
              onClick={ouvrirFormulaire}
              className="contact-btn-gold"
            >
              📅 Réserver ma séance ou mon bilan
            </button>
          )}
        </div>

        {afficherFormulaire && (
          <section
            ref={formulaireRef}
            className="contact-card contact-form-panel"
          >
            <button
              type="button"
              onClick={fermerFormulaire}
              className="contact-btn-close"
            >
              ✕ Fermer
            </button>

            <h2 className="contact-form-title">
              Réservez votre expérience HealthyFit
            </h2>

            <p
              style={{
                color: "#bdbdbd",
                textAlign: "center",
                marginBottom: 35,
                lineHeight: 1.7,
                fontSize: "clamp(16px,3.5vw,18px)",
              }}
            >
              Remplissez ce formulaire et un coach vous recontactera rapidement.
            </p>

            {erreur && <div className="contact-error-banner">{erreur}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 34 }}>
                <h3 className="contact-section-title">Informations</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                  gap: 18,
                }}
              >
                <div id="champ-nom">
                  <label htmlFor="nom" style={labelStyle}>
                    Nom *
                  </label>
                  <input
                    id="nom"
                    type="text"
                    value={nom}
                    onChange={(e) => {
                      setNom(e.target.value);
                      effacerErreurChamp("nom");
                    }}
                    className={styleChamp("nom", champsErreur)}
                  />
                  <MessageErreurChamp champ="nom" champsErreur={champsErreur} />
                </div>

                <div id="champ-prenom">
                  <label htmlFor="prenom" style={labelStyle}>
                    Prénom *
                  </label>
                  <input
                    id="prenom"
                    type="text"
                    value={prenom}
                    onChange={(e) => {
                      setPrenom(e.target.value);
                      effacerErreurChamp("prenom");
                    }}
                    className={styleChamp("prenom", champsErreur)}
                  />
                  <MessageErreurChamp champ="prenom" champsErreur={champsErreur} />
                </div>

                <div id="champ-telephone">
                  <label htmlFor="telephone" style={labelStyle}>
                    Téléphone *
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    value={telephone}
                    onChange={(e) => {
                      setTelephone(e.target.value);
                      effacerErreurChamp("telephone");
                    }}
                    className={styleChamp("telephone", champsErreur)}
                  />
                  <MessageErreurChamp champ="telephone" champsErreur={champsErreur} />
                </div>

                <div id="champ-email">
                  <label htmlFor="email" style={labelStyle}>
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      effacerErreurChamp("email");
                    }}
                    className={styleChamp("email", champsErreur)}
                  />
                  <MessageErreurChamp
                    champ="email"
                    champsErreur={champsErreur}
                    message={
                      email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                        ? "Adresse email invalide."
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 34 }}>
              <h3 className="contact-section-title">Je souhaite</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                  gap: 14,
                }}
              >
                <RadioOption
                  name="type"
                  value="SEANCE"
                  checked={type === "SEANCE"}
                  label="Essayer une séance"
                  onChange={(value) => {
                    setType(value as ReservationType);
                    setJourDisponibilite("");
                    setMomentDisponibilite("");
                  }}
                />
                <RadioOption
                  name="type"
                  value="BILAN"
                  checked={type === "BILAN"}
                  label="Réserver un bilan Sport & Nutrition"
                  onChange={(value) => setType(value as ReservationType)}
                />
              </div>
            </div>

            <div
              id="champ-objectifs"
              style={{ marginBottom: 34, ...styleSection("objectifs", champsErreur) }}
            >
              <h3 className="contact-section-title">Mon objectif</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                  gap: 12,
                }}
              >
                {OBJECTIFS.map((objectif) => {
                  const checked = objectifs.includes(objectif);

                  return (
                    <label
                      key={objectif}
                      className={`contact-checkbox-item ${checked ? "contact-checkbox-checked" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleObjectif(objectif)}
                        style={{ accentColor: gold, width: 18, height: 18 }}
                      />
                      <span style={{ color: "#fff", fontSize: "15px" }}>
                        {objectif}
                      </span>
                    </label>
                  );
                })}
              </div>
              <MessageErreurChamp champ="objectifs" champsErreur={champsErreur} />

              {contientAutreObjectif && (
                <div id="champ-autreObjectif" style={{ marginTop: 18 }}>
                  <label htmlFor="autreObjectif" style={labelStyle}>
                    Précisez votre objectif *
                  </label>
                  <input
                    id="autreObjectif"
                    type="text"
                    value={autreObjectif}
                    onChange={(e) => {
                      setAutreObjectif(e.target.value);
                      effacerErreurChamp("autreObjectif");
                    }}
                    className={styleChamp("autreObjectif", champsErreur)}
                  />
                  <MessageErreurChamp champ="autreObjectif" champsErreur={champsErreur} />
                </div>
              )}
            </div>

            {type === "SEANCE" && (
              <div id="champ-seanceId" style={{ marginBottom: 34 }}>
                <h3 className="contact-section-title">Séance souhaitée</h3>
                <select
                  value={seanceId}
                  onChange={(e) => {
                    setSeanceId(e.target.value);
                    effacerErreurChamp("seanceId");
                  }}
                  className={`${styleChamp("seanceId", champsErreur)} contact-select`}
                >
                  <option value="">Sélectionnez une séance</option>
                  {seances.map((seance) => (
                    <option key={seance.id} value={seance.id}>
                      {seance.titre}
                      {seance.horaire ? ` — ${seance.horaire}` : ""}
                      {seance.niveau ? ` (${seance.niveau})` : ""}
                    </option>
                  ))}
                </select>
                <MessageErreurChamp champ="seanceId" champsErreur={champsErreur} />
                {seances.length === 0 && (
                  <p style={{ color: "#888", marginTop: 10, fontSize: 15 }}>
                    Aucune séance disponible pour le moment.
                  </p>
                )}
              </div>
            )}

            <div style={{ marginBottom: 34 }}>
              <h3 className="contact-section-title">Coach souhaité</h3>
              <select
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
                className="contact-input contact-select"
              >
                <option value="">Aucune préférence</option>
                {coachsTries.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.prenom} {coach.nom}
                  </option>
                ))}
              </select>

              {coachSelectionne && (
                <div className="contact-coach-preview">
                  <img
                    src={coachSelectionne.image}
                    alt={`${coachSelectionne.prenom} ${coachSelectionne.nom}`}
                  />
                  <div>
                    <h4
                      style={{
                        color: gold,
                        fontSize: "clamp(22px,4vw,26px)",
                        marginBottom: 12,
                      }}
                    >
                      {coachSelectionne.prenom} {coachSelectionne.nom}
                    </h4>
                    <p
                      style={{
                        color: "#d9d9d9",
                        lineHeight: 1.8,
                        fontSize: "16px",
                      }}
                    >
                      {coachSelectionne.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {type === "BILAN" && (
              <div style={{ marginBottom: 34 }}>
                <h3 className="contact-section-title">Disponibilités</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                    gap: 18,
                  }}
                >
                  <div id="champ-jourDisponibilite">
                    <label htmlFor="jourDisponibilite" style={labelStyle}>
                      Jour *
                    </label>
                    <select
                      id="jourDisponibilite"
                      value={jourDisponibilite}
                      onChange={(e) => {
                        setJourDisponibilite(e.target.value);
                        effacerErreurChamp("jourDisponibilite");
                      }}
                      className={`${styleChamp("jourDisponibilite", champsErreur)} contact-select`}
                    >
                      <option value="">Sélectionnez un jour</option>
                      {JOURS_DISPONIBLES.map((jour) => (
                        <option key={jour.value} value={jour.value}>
                          {jour.label}
                        </option>
                      ))}
                    </select>
                    <MessageErreurChamp
                      champ="jourDisponibilite"
                      champsErreur={champsErreur}
                    />
                  </div>

                  <div id="champ-momentDisponibilite">
                    <label htmlFor="momentDisponibilite" style={labelStyle}>
                      Moment *
                    </label>
                    <select
                      id="momentDisponibilite"
                      value={momentDisponibilite}
                      onChange={(e) => {
                        setMomentDisponibilite(
                          e.target.value as MomentDisponibilite
                        );
                        effacerErreurChamp("momentDisponibilite");
                      }}
                      className={`${styleChamp("momentDisponibilite", champsErreur)} contact-select`}
                    >
                      <option value="">Sélectionnez un moment</option>
                      {MOMENTS_DISPONIBLES.map((moment) => (
                        <option key={moment.value} value={moment.value}>
                          {moment.label}
                        </option>
                      ))}
                    </select>
                    <MessageErreurChamp
                      champ="momentDisponibilite"
                      champsErreur={champsErreur}
                    />
                  </div>
                </div>
              </div>
            )}

            <div
              id="champ-contactPreference"
              style={{
                marginBottom: 34,
                ...styleSection("contactPreference", champsErreur),
              }}
            >
              <h3 className="contact-section-title">
                Je préfère être recontacté par
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                  gap: 14,
                }}
              >
                <RadioOption
                  name="contactPreference"
                  value="TELEPHONE"
                  checked={contactPreference === "TELEPHONE"}
                  label="Téléphone"
                  onChange={(value) => {
                    setContactPreference(value as ContactPreference);
                    effacerErreurChamp("contactPreference");
                  }}
                />
                <RadioOption
                  name="contactPreference"
                  value="SMS"
                  checked={contactPreference === "SMS"}
                  label="SMS"
                  onChange={(value) => {
                    setContactPreference(value as ContactPreference);
                    effacerErreurChamp("contactPreference");
                  }}
                />
                <RadioOption
                  name="contactPreference"
                  value="EMAIL"
                  checked={contactPreference === "EMAIL"}
                  label="Email"
                  onChange={(value) => {
                    setContactPreference(value as ContactPreference);
                    effacerErreurChamp("contactPreference");
                  }}
                />
              </div>
              <MessageErreurChamp
                champ="contactPreference"
                champsErreur={champsErreur}
              />
            </div>

            <div
              id="champ-source"
              style={{
                marginBottom: 34,
                ...styleSection("source", champsErreur),
              }}
            >
              <h3 className="contact-section-title">
                Comment nous avez-vous connus ?
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                  gap: 14,
                }}
              >
                <RadioOption
                  name="source"
                  value="FACEBOOK"
                  checked={source === "FACEBOOK"}
                  label="Facebook"
                  onChange={(value) => {
                    setSource(value as SourceConnaissance);
                    effacerErreurChamp("source");
                  }}
                />
                <RadioOption
                  name="source"
                  value="INSTAGRAM"
                  checked={source === "INSTAGRAM"}
                  label="Instagram"
                  onChange={(value) => {
                    setSource(value as SourceConnaissance);
                    effacerErreurChamp("source");
                  }}
                />
                <RadioOption
                  name="source"
                  value="GOOGLE"
                  checked={source === "GOOGLE"}
                  label="Google"
                  onChange={(value) => {
                    setSource(value as SourceConnaissance);
                    effacerErreurChamp("source");
                  }}
                />
                <RadioOption
                  name="source"
                  value="PROCHE"
                  checked={source === "PROCHE"}
                  label="Un proche"
                  onChange={(value) => {
                    setSource(value as SourceConnaissance);
                    effacerErreurChamp("source");
                  }}
                />
                <RadioOption
                  name="source"
                  value="PASSAGE_CLUB"
                  checked={source === "PASSAGE_CLUB"}
                  label="Passage devant le club"
                  onChange={(value) => {
                    setSource(value as SourceConnaissance);
                    effacerErreurChamp("source");
                  }}
                />
                <RadioOption
                  name="source"
                  value="AUTRE"
                  checked={source === "AUTRE"}
                  label="Autre"
                  onChange={(value) => {
                    setSource(value as SourceConnaissance);
                    effacerErreurChamp("source");
                  }}
                />
              </div>
              <MessageErreurChamp champ="source" champsErreur={champsErreur} />

              {source === "PROCHE" && (
                <div id="champ-recommandation" style={{ marginTop: 18 }}>
                  <label htmlFor="recommandation" style={labelStyle}>
                    Qui vous a recommandé ? *
                  </label>
                  <input
                    id="recommandation"
                    type="text"
                    value={recommandation}
                    onChange={(e) => {
                      setRecommandation(e.target.value);
                      effacerErreurChamp("recommandation");
                    }}
                    className={styleChamp("recommandation", champsErreur)}
                  />
                  <MessageErreurChamp
                    champ="recommandation"
                    champsErreur={champsErreur}
                  />
                </div>
              )}

              {source === "AUTRE" && (
                <div id="champ-autreSource" style={{ marginTop: 18 }}>
                  <label htmlFor="autreSource" style={labelStyle}>
                    Précisez *
                  </label>
                  <input
                    id="autreSource"
                    type="text"
                    value={autreSource}
                    onChange={(e) => {
                      setAutreSource(e.target.value);
                      effacerErreurChamp("autreSource");
                    }}
                    className={styleChamp("autreSource", champsErreur)}
                  />
                  <MessageErreurChamp
                    champ="autreSource"
                    champsErreur={champsErreur}
                  />
                </div>
              )}
            </div>

            <div style={{ marginBottom: 34 }}>
              <h3 className="contact-section-title">Message libre</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Votre message (optionnel)"
                className="contact-input"
                style={{ resize: "vertical", minHeight: 130 }}
              />
            </div>

            <div
              id="champ-rgpd"
              style={{
                ...styleSection("rgpd", champsErreur),
                marginBottom: 28,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={rgpd}
                  onChange={(e) => {
                    setRgpd(e.target.checked);
                    if (e.target.checked) effacerErreurChamp("rgpd");
                  }}
                  style={{
                    accentColor: gold,
                    width: 18,
                    height: 18,
                    marginTop: 4,
                  }}
                />
                <span style={{ color: "#bdbdbd", lineHeight: 1.7, fontSize: 15 }}>
                  J&apos;accepte que mes données soient utilisées par HealthyFit
                  pour traiter ma demande de réservation, conformément à la
                  politique de confidentialité. *
                </span>
              </label>
              <MessageErreurChamp champ="rgpd" champsErreur={champsErreur} />
            </div>

            <button
              type="submit"
              disabled={envoiEnCours}
              className="contact-submit"
            >
              {envoiEnCours
                ? "Envoi en cours..."
                : type === "SEANCE"
                  ? "🏋️ Réserver ma séance"
                  : "❤️ Réserver mon bilan"}
            </button>
            </form>
          </section>
        )}

        <div className="contact-card contact-cta" style={{ marginTop: 50 }}>
          <h2 className="contact-cta-title">Découvrez nos coachs</h2>
          <p className="contact-cta-text">
            Chaque parcours est unique. Trouvez le coach qui correspond le
            mieux à vos besoins et à vos ambitions.
          </p>

          <Link href="/coachs" className="contact-btn-outline">
            ✨ Choisir mon coach
          </Link>
        </div>
      </div>
    </main>
  );
}
