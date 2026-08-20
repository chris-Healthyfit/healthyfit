import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { computeFitCostCentimes } from "@/lib/finance/fit-cost";

import { consommerSeanceCarte } from "@/lib/club/cartes";



export async function deductFitStock(tx: Prisma.TransactionClient) {

  const fitItems = await tx.fitCostItem.findMany({

    where: { actif: true, stockItemId: { not: null } },

    include: { stockItem: true },

  });



  for (const fit of fitItems) {

    if (!fit.stockItem) continue;

    const delta = -Math.ceil(fit.portionsParSeance);

    if (delta === 0) continue;



    await tx.stockItem.update({

      where: { id: fit.stockItem.id },

      data: { quantite: { increment: delta } },

    });



    await tx.stockMovement.create({

      data: {

        stockItemId: fit.stockItem.id,

        delta,

        libelle: `Présence — ${fit.nom}`,

      },

    });

  }

}



export async function applyPresenceFinance(

  presenceId: number,

  tx: Prisma.TransactionClient

) {

  const presence = await tx.presence.findUnique({

    where: { id: presenceId },

    include: { member: { select: { prenom: true, nom: true, id: true } } },

  });

  if (!presence) return;



  const coutFit = await computeFitCostCentimes();



  if (presence.mode === "CARTE_10") {

    await consommerSeanceCarte(presence.memberId, presenceId, tx);



    await tx.presence.update({

      where: { id: presenceId },

      data: {

        coutFitCentimes: coutFit,

        beneficeCentimes: -coutFit,

        montantCentimes: 0,

      },

    });



    await deductFitStock(tx);

    return;

  }



  const benefice = presence.montantCentimes - coutFit;



  await tx.presence.update({

    where: { id: presenceId },

    data: { coutFitCentimes: coutFit, beneficeCentimes: benefice },

  });



  const { recordPresenceFinance } = await import("@/lib/finance/ledger");

  await recordPresenceFinance(

    {

      id: presence.id,

      date: presence.date,

      montantCentimes: presence.montantCentimes,

      mode: presence.mode,

      member: presence.member,

    },

    coutFit,

    tx

  );



  await deductFitStock(tx);

}



export function computePortionCost(

  prixAchatCentimes: number,

  nombrePortions: number

) {

  if (nombrePortions <= 0) return 0;

  return Math.round(prixAchatCentimes / nombrePortions);

}



export async function updateStockPortionCost(stockItemId: number) {

  const item = await prisma.stockItem.findUnique({

    where: { id: stockItemId },

  });

  if (!item || item.prixAchatCentimes == null) return;



  const cout = computePortionCost(item.prixAchatCentimes, item.nombrePortions);

  await prisma.stockItem.update({

    where: { id: stockItemId },

    data: { coutPortionCentimes: cout },

  });

}

