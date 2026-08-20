/** Carte 10+1 offerte : 11 séances au compteur. */
export const CARTE_SEANCES_TOTAL = 11;

export const CARTE_PRIX_CLASSIQUE_CENTIMES = 8000;
export const CARTE_PRIX_VIP_CENTIMES = 6000;

export const CARTE_TARIF_CODES = {
  CLASSIQUE: "CARTE_CLASSIQUE",
  VIP: "CARTE_VIP",
} as const;

export function prixCarteCentimes(estVip: boolean, override?: number) {
  if (override != null && override > 0) return override;
  return estVip ? CARTE_PRIX_VIP_CENTIMES : CARTE_PRIX_CLASSIQUE_CENTIMES;
}

export function labelCarte(type: "CLASSIQUE" | "VIP") {
  return type === "VIP" ? "Carte 10 VIP" : "Carte 10 classique";
}
