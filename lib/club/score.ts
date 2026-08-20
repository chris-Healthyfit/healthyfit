import type { Bilan, ClubMember, Presence, ScoreProgression } from "@prisma/client";
import { BILAN_RAPPEL_JOURS, daysSince } from "@/lib/club/bilans";

type ScoreInput = {
  member: Pick<ClubMember, "createdAt">;
  presences: Pick<Presence, "date">[];
  bilans: Pick<Bilan, "date" | "masseGrasse" | "masseMusculaire" | "graisseViscerale">[];
};

export const SCORE_LABELS: Record<
  ScoreProgression,
  { emoji: string; label: string }
> = {
  EXCELLENT: { emoji: "🟢", label: "Progression excellente" },
  BON: { emoji: "🟡", label: "Bonne progression" },
  A_RELANCER: { emoji: "🟠", label: "Progression à relancer" },
  PRIORITAIRE: { emoji: "🔴", label: "Suivi prioritaire" },
};

export function computeHealthyFitScore(input: ScoreInput): ScoreProgression {
  let points = 50;

  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const presencesMonth = input.presences.filter(
    (p) => new Date(p.date) >= monthAgo
  ).length;

  if (presencesMonth >= 8) points += 25;
  else if (presencesMonth >= 4) points += 15;
  else if (presencesMonth >= 2) points += 5;
  else points -= 15;

  const lastBilan = input.bilans[0];
  if (lastBilan) {
    const jours = daysSince(lastBilan.date);
    if (jours <= BILAN_RAPPEL_JOURS) points += 15;
    else if (jours <= BILAN_RAPPEL_JOURS + 7) points += 5;
    else points -= 20;
  } else {
    points -= 10;
  }

  if (input.bilans.length >= 2) {
    const recent = input.bilans[0];
    const prev = input.bilans[1];

    if (
      recent.masseGrasse != null &&
      prev.masseGrasse != null &&
      recent.masseGrasse < prev.masseGrasse
    ) {
      points += 10;
    }
    if (
      recent.masseMusculaire != null &&
      prev.masseMusculaire != null &&
      recent.masseMusculaire > prev.masseMusculaire
    ) {
      points += 10;
    }
    if (
      recent.graisseViscerale != null &&
      prev.graisseViscerale != null &&
      recent.graisseViscerale < prev.graisseViscerale
    ) {
      points += 5;
    }
  }

  if (points >= 75) return "EXCELLENT";
  if (points >= 55) return "BON";
  if (points >= 35) return "A_RELANCER";
  return "PRIORITAIRE";
}
