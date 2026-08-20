/** Jours en français (index = getDay()) */
export const JOURS_SEMAINE = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
] as const;

/** True si l'horaire catalogue contient le jour de la date (ex. « Dimanche 13H00 »). */
export function seanceEstDuJour(horaire: string, date = new Date()) {
  const jour = JOURS_SEMAINE[date.getDay()];
  return horaire.toLowerCase().includes(jour.toLowerCase());
}

/** Séances sans jour dans l'horaire — toujours proposées. */
export function seanceSansJour(horaire: string) {
  return !JOURS_SEMAINE.some((j) => horaire.toLowerCase().includes(j.toLowerCase()));
}
