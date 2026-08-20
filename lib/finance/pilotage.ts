import { prisma } from "@/lib/prisma";
import { getCartesReserveStats } from "@/lib/club/cartes";
import { getFinanceConfig } from "@/lib/finance/fit-cost";
import { getUpcomingCharges } from "@/lib/finance/charges";

function sumRecettes(entries: { recetteCentimes: number }[]) {
  return entries.reduce((s, e) => s + e.recetteCentimes, 0);
}

/** Indicateurs de pilotage HealthyFit (Chris & Sarah). */
export async function getPilotageFinancier() {
  const entries = await prisma.accountingEntry.findMany();

  const argentGagneCentimes = sumRecettes(entries);

  const cartes = await getCartesReserveStats();

  const coutBilansRealises = entries
    .filter((e) => e.type === "BILAN_COUT")
    .reduce((s, e) => s + e.coutCentimes, 0);

  const achatsStock = entries
    .filter((e) => e.type === "ACHAT")
    .reduce((s, e) => s + e.depenseCentimes, 0);

  const coutFitRealise = entries
    .filter((e) => e.type === "PRESENCE_COUT_FIT" || e.type === "CARTE_COUT_SEANCE")
    .reduce((s, e) => s + e.coutCentimes, 0);

  const stockItems = await prisma.stockItem.findMany();
  const stockAlerteCentimes = stockItems.reduce((s, item) => {
    if (item.quantite >= item.seuilAlerte) return s;
    const manque = item.seuilAlerte - item.quantite;
    const cout = item.coutPortionCentimes ?? item.prixAchatCentimes ?? 0;
    return s + manque * cout;
  }, 0);

  const argentStockCentimes =
    cartes.coutFuturCentimes + stockAlerteCentimes + achatsStock;

  const argentBilansCentimes = coutBilansRealises;

  const charges = await prisma.charge.findMany({ where: { actif: true } });
  const chargesFixesMensuelles = charges.reduce((s, c) => {
    switch (c.frequence) {
      case "HEBDOMADAIRE":
        return s + c.montantCentimes * 4;
      case "MENSUELLE":
        return s + c.montantCentimes;
      case "TRIMESTRIELLE":
        return s + Math.round(c.montantCentimes / 3);
      case "SEMESTRIELLE":
        return s + Math.round(c.montantCentimes / 6);
      case "ANNUELLE":
        return s + Math.round(c.montantCentimes / 12);
      default:
        return s + c.montantCentimes;
    }
  }, 0);

  const echeances = await getUpcomingCharges(30);
  const chargesAVenirCentimes = echeances.reduce(
    (s, e) => s + e.montantCentimes,
    0
  );

  const argentDisponibleCentimes =
    argentGagneCentimes -
    argentStockCentimes -
    argentBilansCentimes -
    chargesFixesMensuelles;

  const config = await getFinanceConfig();
  const fitUnit = await import("@/lib/finance/fit-cost").then((m) =>
    m.computeFitCostCentimes()
  );

  const ventesCartes = entries.filter((e) => e.type === "VENTE_CARTE");
  const recetteCartesCentimes = sumRecettes(ventesCartes);

  return {
    argentGagneCentimes,
    argentStockCentimes,
    argentBilansCentimes,
    argentDisponibleCentimes,
    chargesFixesMensuellesCentimes: chargesFixesMensuelles,
    chargesAVenirCentimes,
    cartes: {
      actives: cartes.cartesActives,
      seancesRestantes: cartes.seancesRestantes,
      coutFuturCentimes: cartes.coutFuturCentimes,
    },
    recetteCartesCentimes,
    ventesCartes: ventesCartes.length,
    coutFitUnitaireCentimes: fitUnit,
    coutBilanUnitaireCentimes: config.coutBilanCentimes,
    coutFitRealiseCentimes: coutFitRealise,
  };
}
