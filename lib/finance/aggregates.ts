import { prisma } from "@/lib/prisma";
import {
  endOfDay,
  getPeriodRange,
  startOfDay,
  type FinancePeriod,
} from "@/lib/finance/periods";

function sumField(
  entries: { recetteCentimes: number; depenseCentimes: number; coutCentimes: number; beneficeCentimes: number }[],
  field: "recetteCentimes" | "depenseCentimes" | "coutCentimes" | "beneficeCentimes"
) {
  return entries.reduce((s, e) => s + e[field], 0);
}

export async function getEntriesInRange(start: Date, end: Date) {
  return prisma.accountingEntry.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "desc" },
  });
}

export async function getFinanceSummary(start: Date, end: Date) {
  const entries = await getEntriesInRange(start, end);
  const presences = await prisma.presence.findMany({
    where: { date: { gte: start, lte: end } },
  });
  const bilans = await prisma.bilan.count({
    where: { date: { gte: start, lte: end } },
  });
  const ventesNutrition = entries.filter((e) => e.type === "VENTE_NUTRITION");
  const ventesSkin = entries.filter((e) => e.type === "VENTE_SKIN");
  const recetteCartes = entries
    .filter((e) => e.type === "VENTE_CARTE")
    .reduce((s, e) => s + e.recetteCentimes, 0);

  const sportEntries = entries.filter(
    (e) => e.categorie === "SPORT" && e.type === "PRESENCE_RECETTE"
  );

  const recetteSport = sumField(sportEntries, "recetteCentimes") + recetteCartes;
  const recetteNutrition = sumField(ventesNutrition, "recetteCentimes");
  const recetteSkin = sumField(ventesSkin, "recetteCentimes");
  const recetteTotal = sumField(entries, "recetteCentimes");
  const depenses = sumField(entries, "depenseCentimes");
  const coutFit = entries
    .filter((e) => e.type === "PRESENCE_COUT_FIT" || e.type === "CARTE_COUT_SEANCE")
    .reduce((s, e) => s + e.coutCentimes, 0);
  const achats = entries
    .filter((e) => e.type === "ACHAT")
    .reduce((s, e) => s + e.depenseCentimes, 0);
  const charges = entries
    .filter((e) => e.type === "CHARGE")
    .reduce((s, e) => s + e.depenseCentimes, 0);
  const benefice = sumField(entries, "beneficeCentimes");

  const offertes = presences.filter((p) => p.mode === "OFFERTE").length;

  return {
    recetteTotal,
    recetteSport,
    recetteNutrition,
    recetteSkin,
    depenses,
    coutFit,
    achats,
    charges,
    chargesFixes: charges,
    chargesVariables: coutFit + achats,
    benefice,
    presences: presences.length,
    bilans,
    ventesNutrition: ventesNutrition.length,
    ventesSkin: ventesSkin.length,
    offertes,
    margeMoyenne:
      recetteTotal > 0 ? Math.round((benefice / recetteTotal) * 100) : 0,
    repartitionSport: {
      seances: presences.filter((p) => p.mode === "SEANCE").length,
      vip: presences.filter((p) => p.mode === "VIP").length,
      cartes: presences.filter((p) => p.mode === "CARTE_10").length,
      offertes,
    },
  };
}

export async function getFinanceDashboard() {
  const weekRange = getPeriodRange("week");
  const monthRange = getPeriodRange("month");
  const yearRange = getPeriodRange("year");

  const [today, week, month, year] = await Promise.all([
    getFinanceSummary(startOfDay(), endOfDay()),
    getFinanceSummary(weekRange.start, weekRange.end),
    getFinanceSummary(monthRange.start, monthRange.end),
    getFinanceSummary(yearRange.start, yearRange.end),
  ]);

  return { today, week, month, year };
}

export async function getRentabiliteTable(period: FinancePeriod = "month") {
  const { start, end } = getPeriodRange(period);
  const entries = await getEntriesInRange(start, end);

  const rows = ["SPORT", "NUTRITION", "SKIN", "BILAN"].map((cat) => {
    const catEntries = entries.filter((e) => e.categorie === cat);
    const recette = sumField(catEntries, "recetteCentimes");
    const cout = sumField(catEntries, "coutCentimes");
    const depense = sumField(catEntries, "depenseCentimes");
    const coutTotal = cout + depense;
    const benefice = recette - coutTotal;
    const marge = recette > 0 ? Math.round((benefice / recette) * 100) : 0;
    return {
      activite: cat,
      recette,
      cout: coutTotal,
      benefice,
      marge,
    };
  });

  return rows;
}

export async function getChartData(period: FinancePeriod = "month") {
  const { start, end } = getPeriodRange(period);
  const entries = await getEntriesInRange(start, end);

  const byDay: Record<string, { recette: number; benefice: number }> = {};
  for (const e of entries) {
    const key = e.date.toISOString().slice(0, 10);
    if (!byDay[key]) byDay[key] = { recette: 0, benefice: 0 };
    byDay[key].recette += e.recetteCentimes;
    byDay[key].benefice += e.beneficeCentimes;
  }

  const evolution = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  const summary = await getFinanceSummary(start, end);

  return {
    evolution,
    repartitionRecettes: [
      { label: "Sport", value: summary.recetteSport },
      { label: "Nutrition", value: summary.recetteNutrition },
      { label: "Skin", value: summary.recetteSkin },
    ].filter((x) => x.value > 0),
    repartitionDepenses: [
      { label: "Coût FIT", value: summary.coutFit },
      { label: "Achats", value: summary.achats },
      { label: "Charges", value: summary.charges },
    ].filter((x) => x.value > 0),
  };
}
