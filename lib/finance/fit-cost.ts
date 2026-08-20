import { prisma } from "@/lib/prisma";

export async function getFinanceConfig() {
  let config = await prisma.financeConfig.findUnique({ where: { id: 1 } });
  if (!config) {
    config = await prisma.financeConfig.create({
      data: { id: 1, coutBilanCentimes: 350 },
    });
  }
  return config;
}

export async function ensureFitCostItems() {
  const defaults = [
    { nom: "CR7", section: "Hydratation", coutPortionCentimes: 35, ordre: 1 },
    { nom: "Eau", section: "Hydratation", coutPortionCentimes: 10, ordre: 2 },
    { nom: "Rebuild", section: "Récupération", coutPortionCentimes: 180, ordre: 3 },
    { nom: "Eau récup.", section: "Récupération", coutPortionCentimes: 10, ordre: 4 },
    { nom: "Goblet", section: "Récupération", coutPortionCentimes: 15, ordre: 5 },
    { nom: "Paille", section: "Récupération", coutPortionCentimes: 5, ordre: 6 },
    { nom: "Capuchon", section: "Récupération", coutPortionCentimes: 8, ordre: 7 },
    { nom: "Chips éventuelles", section: "Récupération", coutPortionCentimes: 26, ordre: 8 },
  ];

  for (const item of defaults) {
    const existing = await prisma.fitCostItem.findFirst({
      where: { nom: item.nom },
    });
    if (!existing) {
      await prisma.fitCostItem.create({ data: item });
    }
  }
}

export async function computeFitCostCentimes() {
  await ensureFitCostItems();
  const items = await prisma.fitCostItem.findMany({ where: { actif: true } });
  return Math.round(
    items.reduce(
      (sum, i) => sum + i.coutPortionCentimes * i.portionsParSeance,
      0
    )
  );
}

export async function getFitCostBreakdown() {
  await ensureFitCostItems();
  const items = await prisma.fitCostItem.findMany({
    where: { actif: true },
    orderBy: { ordre: "asc" },
  });

  const bySection: Record<string, { items: typeof items; total: number }> = {};
  for (const item of items) {
    const cost = Math.round(item.coutPortionCentimes * item.portionsParSeance);
    if (!bySection[item.section]) {
      bySection[item.section] = { items: [], total: 0 };
    }
    bySection[item.section].items.push(item);
    bySection[item.section].total += cost;
  }

  const total = Object.values(bySection).reduce((s, v) => s + v.total, 0);
  return { bySection, total, items };
}
