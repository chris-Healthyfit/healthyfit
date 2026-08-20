import { ReservationStatut, ReservationType } from "@prisma/client";

export const STATUTS_RESERVATION: {
  value: ReservationStatut;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}[] = [
  {
    value: "NEW",
    label: "Nouveau",
    emoji: "🟡",
    color: "#f0c419",
    bg: "rgba(240,196,25,0.15)",
  },
  {
    value: "CONTACTED",
    label: "Contacté",
    emoji: "🔵",
    color: "#4da3ff",
    bg: "rgba(77,163,255,0.15)",
  },
  {
    value: "APPOINTMENT_SET",
    label: "Rendez-vous fixé",
    emoji: "🟢",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.15)",
  },
  {
    value: "CLIENT",
    label: "Devenu client",
    emoji: "💚",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
  },
  {
    value: "CLOSED",
    label: "Sans suite",
    emoji: "🔴",
    color: "#f87171",
    bg: "rgba(248,113,113,0.15)",
  },
];

export function getStatutLabel(statut: ReservationStatut): string {
  return (
    STATUTS_RESERVATION.find((s) => s.value === statut)?.label ?? statut
  );
}

export function getStatutConfig(statut: ReservationStatut) {
  return (
    STATUTS_RESERVATION.find((s) => s.value === statut) ??
    STATUTS_RESERVATION[0]
  );
}

export function getTypeLabel(type: ReservationType): string {
  return type === "SEANCE" ? "Séance" : "Bilan";
}

export const SOURCE_LABELS: Record<string, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  GOOGLE: "Google",
  PROCHE: "Un proche",
  PASSAGE_CLUB: "Passage devant le club",
  AUTRE: "Autre",
};

export const CONTACT_LABELS: Record<string, string> = {
  TELEPHONE: "Téléphone",
  SMS: "SMS",
  EMAIL: "Email",
};
