import type { AuditAction } from "@prisma/client";

export const ACTION_LABELS: Record<AuditAction, string> = {
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
};

export const ENTITY_LABELS: Record<string, string> = {
  admin: "Administrateur",
  coach: "Coach",
  seance: "Séance",
  club: "Club",
  contact: "Contact",
  galerie: "Galerie",
  nutrition: "Nutrition",
  temoignage: "Témoignage",
  reservation: "Réservation",
  club_member: "Client club",
  club_tarif: "Tarif",
  bilan: "Bilan",
  presence: "Présence",
  stock_item: "Stock",
  upload: "Upload",
};
