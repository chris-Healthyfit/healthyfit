import type { Bilan } from "@prisma/client";

export const BILAN_RAPPEL_JOURS = 21;

export const BILAN_CHECKLIST = [
  "Refaire les photos",
  "Reprendre les mensurations",
  "Encoder les mesures Tanita",
  "Faire le point avec le client",
] as const;

export type BilanDiff = {
  key: string;
  label: string;
  ancien: number | null;
  nouveau: number | null;
  diff: number | null;
  unit: string;
  positiveIsGood: boolean;
};

const METRICS: {
  key: keyof Bilan;
  label: string;
  unit: string;
  positiveIsGood: boolean;
}[] = [
  { key: "poids", label: "Poids", unit: "kg", positiveIsGood: false },
  { key: "masseGrasse", label: "Masse grasse", unit: "%", positiveIsGood: false },
  {
    key: "masseMusculaire",
    label: "Masse musculaire",
    unit: "kg",
    positiveIsGood: true,
  },
  {
    key: "graisseViscerale",
    label: "Graisse viscérale",
    unit: "",
    positiveIsGood: false,
  },
  { key: "eauCorporelle", label: "Eau corporelle", unit: "%", positiveIsGood: true },
  {
    key: "ageMetabolique",
    label: "Âge métabolique",
    unit: "ans",
    positiveIsGood: false,
  },
  {
    key: "metabolismeBase",
    label: "Métabolisme de base",
    unit: "kcal",
    positiveIsGood: true,
  },
];

export function compareBilans(ancien: Bilan, nouveau: Bilan): BilanDiff[] {
  return METRICS.map(({ key, label, unit, positiveIsGood }) => {
    const a = ancien[key] as number | null | undefined;
    const n = nouveau[key] as number | null | undefined;
    const ancienVal = a != null ? Number(a) : null;
    const nouveauVal = n != null ? Number(n) : null;
    const diff =
      ancienVal != null && nouveauVal != null
        ? Math.round((nouveauVal - ancienVal) * 10) / 10
        : null;
    return {
      key: String(key),
      label,
      ancien: ancienVal,
      nouveau: nouveauVal,
      diff,
      unit,
      positiveIsGood,
    };
  });
}

export function daysSince(date: Date) {
  const ms = Date.now() - new Date(date).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function needsBilanReminder(lastBilanDate: Date | null) {
  if (!lastBilanDate) return true;
  return daysSince(lastBilanDate) >= BILAN_RAPPEL_JOURS;
}

export function formatDiff(diff: number | null, unit: string) {
  if (diff == null) return "—";
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff}${unit ? ` ${unit}` : ""}`;
}
