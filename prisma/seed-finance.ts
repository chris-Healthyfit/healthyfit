import { PrismaClient } from "@prisma/client";
import { ensureDefaultTarifs } from "../lib/club/tarifs";
import { ensureFitCostItems, computeFitCostCentimes } from "../lib/finance/fit-cost";
import { recordPresenceFinance, recordBilanFinance, recordVenteFinance, recordPurchaseFinance, recordChargePayment } from "../lib/finance/ledger";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysAhead(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

export async function seedFinance() {
  console.log("💰 Seed finance…");

  await ensureDefaultTarifs();
  await ensureFitCostItems();
  await prisma.financeConfig.upsert({
    where: { id: 1 },
    create: { id: 1, coutBilanCentimes: 350 },
    update: {},
  });

  const stockProducts = [
    { nom: "CR7", categorie: "Hydratation", quantite: 48, seuilAlerte: 10, prixAchatCentimes: 1680, nombrePortions: 48, deduitParPresence: true },
    { nom: "Rebuild", categorie: "Récupération", quantite: 8, seuilAlerte: 5, prixAchatCentimes: 4600, nombrePortions: 20, deduitParPresence: true },
    { nom: "Eau", categorie: "Hydratation", quantite: 200, seuilAlerte: 50, prixAchatCentimes: 2000, nombrePortions: 200 },
    { nom: "Aloe", categorie: "Nutrition", quantite: 12, seuilAlerte: 3, prixAchatCentimes: 3600, nombrePortions: 12 },
    { nom: "Protein Skin", categorie: "Skin", quantite: 6, seuilAlerte: 2, prixAchatCentimes: 8900, nombrePortions: 6 },
  ];

  for (const p of stockProducts) {
    const existing = await prisma.stockItem.findFirst({ where: { nom: p.nom } });
    const coutPortion = Math.round(p.prixAchatCentimes / p.nombrePortions);
    if (existing) {
      await prisma.stockItem.update({
        where: { id: existing.id },
        data: { ...p, coutPortionCentimes: coutPortion },
      });
    } else {
      await prisma.stockItem.create({
        data: { ...p, coutPortionCentimes: coutPortion },
      });
    }
  }

  const rebuild = await prisma.stockItem.findFirst({ where: { nom: "Rebuild" } });
  const cr7 = await prisma.stockItem.findFirst({ where: { nom: "CR7" } });
  if (rebuild) {
    await prisma.fitCostItem.updateMany({
      where: { nom: "Rebuild" },
      data: { stockItemId: rebuild.id },
    });
  }
  if (cr7) {
    await prisma.fitCostItem.updateMany({
      where: { nom: "CR7" },
      data: { stockItemId: cr7.id },
    });
  }

  const chargesData = [
    { nom: "Loyer", categorie: "Fixe", montantCentimes: 75000, frequence: "MENSUELLE" as const, prochaineEcheance: daysAhead(3) },
    { nom: "UCM", categorie: "Fixe", montantCentimes: 12000, frequence: "MENSUELLE" as const, prochaineEcheance: daysAhead(7) },
    { nom: "Comptable", categorie: "Fixe", montantCentimes: 15000, frequence: "MENSUELLE" as const, prochaineEcheance: daysAhead(1) },
    { nom: "Sabam", categorie: "Fixe", montantCentimes: 4500, frequence: "TRIMESTRIELLE" as const, prochaineEcheance: daysAhead(20) },
    { nom: "Assurance", categorie: "Fixe", montantCentimes: 8900, frequence: "ANNUELLE" as const, prochaineEcheance: daysAhead(45) },
  ];

  for (const c of chargesData) {
    const exists = await prisma.charge.findFirst({ where: { nom: c.nom } });
    if (!exists) await prisma.charge.create({ data: c });
  }

  const entryCount = await prisma.accountingEntry.count();
  if (entryCount > 50) {
    console.log("✅ Finance déjà seedée.");
    return;
  }

  const coutFit = await computeFitCostCentimes();
  const presences = await prisma.presence.findMany({
    include: { member: { select: { prenom: true, nom: true } } },
    orderBy: { date: "asc" },
  });

  for (const p of presences) {
    const benefice = p.montantCentimes - coutFit;
    await prisma.presence.update({
      where: { id: p.id },
      data: { coutFitCentimes: coutFit, beneficeCentimes: benefice },
    });
    await recordPresenceFinance(
      {
        id: p.id,
        date: p.date,
        montantCentimes: p.montantCentimes,
        mode: p.mode,
        member: p.member,
      },
      coutFit
    );
  }

  const bilans = await prisma.bilan.findMany({
    include: { member: { select: { prenom: true } } },
  });
  const config = await prisma.financeConfig.findUnique({ where: { id: 1 } });
  const coutBilan = config?.coutBilanCentimes ?? 350;

  for (const b of bilans) {
    await prisma.bilan.update({
      where: { id: b.id },
      data: { coutCentimes: coutBilan },
    });
    await recordBilanFinance(
      { id: b.id, date: b.date, member: b.member },
      coutBilan
    );
  }

  for (let i = 0; i < 24; i++) {
    await prisma.vente.create({
      data: {
        type: i % 3 === 0 ? "SKIN" : "NUTRITION",
        libelle: i % 3 === 0 ? "Crème Skin" : "Programme nutrition 30j",
        montantCentimes: i % 3 === 0 ? 4500 : 8900,
        date: daysAgo(i * 4),
      },
    }).then(async (v) => recordVenteFinance(v));
  }

  if (rebuild && cr7) {
    const purchase = await prisma.stockPurchase.create({
      data: {
        date: daysAgo(2),
        totalCentimes: 13800,
        notes: "3 Rebuild, 2 CR7",
        lines: {
          create: [
            { stockItemId: rebuild.id, quantite: 3, prixUnitaireCentimes: 4600 },
            { stockItemId: cr7.id, quantite: 2, prixUnitaireCentimes: 840 },
          ],
        },
      },
    });
    await recordPurchaseFinance(purchase);
  }

  const loyer = await prisma.charge.findFirst({ where: { nom: "Loyer" } });
  if (loyer) {
    await recordChargePayment(loyer, daysAgo(28));
  }

  console.log("✅ Seed finance terminé.");
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  seedFinance()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
