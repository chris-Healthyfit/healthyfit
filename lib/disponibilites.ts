export type MomentDisponibilite =
  | "MATIN"
  | "MIDI"
  | "APRES_MIDI"
  | "SOIR";

export const JOURS_DISPONIBLES = [
  { value: "LUNDI", label: "Lundi" },
  { value: "MARDI", label: "Mardi" },
  { value: "MERCREDI", label: "Mercredi" },
  { value: "JEUDI", label: "Jeudi" },
  { value: "VENDREDI", label: "Vendredi" },
  { value: "SAMEDI", label: "Samedi" },
  { value: "DIMANCHE", label: "Dimanche" },
  { value: "PEU_IMPORTE", label: "Peu importe" },
] as const;

export const MOMENTS_DISPONIBLES: {
  value: MomentDisponibilite;
  label: string;
}[] = [
  { value: "MATIN", label: "Matin" },
  { value: "MIDI", label: "Midi" },
  { value: "APRES_MIDI", label: "Après-midi" },
  { value: "SOIR", label: "Soir" },
];

export function getJourLabel(value: string): string {
  return JOURS_DISPONIBLES.find((jour) => jour.value === value)?.label ?? value;
}

export function getMomentLabel(value: string): string {
  return MOMENTS_DISPONIBLES.find((moment) => moment.value === value)?.label ?? value;
}
