import { prisma } from "@/lib/prisma";
import {
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "@/lib/club/presences";
import { needsBilanReminder } from "@/lib/club/bilans";
import { computeHealthyFitScore } from "@/lib/club/score";

export async function getAdminDashboardStats() {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();

  const [
    recetteJour,
    presencesJour,
    recetteMois,
    presencesMois,
    nouveauxClients,
    bilansMois,
  ] = await Promise.all([
    prisma.presence.aggregate({
      where: { date: { gte: todayStart, lte: todayEnd } },
      _sum: { montantCentimes: true },
    }),
    prisma.presence.count({
      where: { date: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.presence.aggregate({
      where: { date: { gte: monthStart, lte: monthEnd } },
      _sum: { montantCentimes: true },
    }),
    prisma.presence.count({
      where: { date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.clubMember.count({
      where: { createdAt: { gte: monthStart, lte: monthEnd }, estClient: true },
    }),
    prisma.bilan.count({
      where: { date: { gte: monthStart, lte: monthEnd } },
    }),
  ]);

  return {
    jour: {
      recetteCentimes: recetteJour._sum.montantCentimes ?? 0,
      presences: presencesJour,
    },
    mois: {
      recetteCentimes: recetteMois._sum.montantCentimes ?? 0,
      presences: presencesMois,
      nouveauxClients,
      bilans: bilansMois,
    },
  };
}

export async function getCoachDashboardStats(coachId: number) {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const monthStart = startOfMonth();
  const yearStart = startOfYear();

  const memberWhere = { coachReferentId: coachId, actif: true };

  const [presencesJour, membres, presencesMois] = await Promise.all([
    prisma.presence.findMany({
      where: {
        coachId,
        date: { gte: todayStart, lte: todayEnd },
      },
      include: {
        member: { select: { id: true, prenom: true, nom: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.clubMember.findMany({
      where: memberWhere,
      include: {
        bilans: { orderBy: { date: "desc" }, take: 1 },
        presences: { orderBy: { date: "desc" }, take: 1 },
      },
    }),
    prisma.presence.count({
      where: {
        member: memberWhere,
        date: { gte: monthStart },
      },
    }),
  ]);

  const aRelancer = membres.filter((m) => {
    const last = m.presences[0]?.date;
    if (!last) return true;
    const jours = Math.floor(
      (Date.now() - new Date(last).getTime()) / (86400000)
    );
    return jours >= 14;
  });

  const bilanARfaire = membres.filter((m) => {
    const last = m.bilans[0]?.date ?? null;
    return needsBilanReminder(last);
  });

  return {
    jour: {
      presences: presencesJour.length,
      listePresences: presencesJour,
    },
    clientsActifs: membres.filter((m) => m.estClient).length,
    presencesMois,
    aRelancer: aRelancer.slice(0, 10).map((m) => ({
      id: m.id,
      prenom: m.prenom,
      nom: m.nom,
      dernierePresence: m.presences[0]?.date ?? null,
    })),
    bilanARfaire: bilanARfaire.slice(0, 10).map((m) => ({
      id: m.id,
      prenom: m.prenom,
      nom: m.nom,
      dernierBilan: m.bilans[0]?.date ?? null,
    })),
  };
}

export async function getMemberActivity(memberId: number) {
  const yearStart = startOfYear();
  const monthStart = startOfMonth();

  const [mois, annee, total, derniere] = await Promise.all([
    prisma.presence.count({
      where: { memberId, date: { gte: monthStart } },
    }),
    prisma.presence.count({
      where: { memberId, date: { gte: yearStart } },
    }),
    prisma.presence.count({ where: { memberId } }),
    prisma.presence.findFirst({
      where: { memberId },
      orderBy: { date: "desc" },
    }),
  ]);

  return { mois, annee, total, derniere: derniere?.date ?? null };
}

export async function refreshMemberScore(memberId: number) {
  const member = await prisma.clubMember.findUnique({
    where: { id: memberId },
    include: {
      presences: { orderBy: { date: "desc" } },
      bilans: { orderBy: { date: "desc" } },
    },
  });
  if (!member) return null;

  const score = computeHealthyFitScore({
    member,
    presences: member.presences,
    bilans: member.bilans,
  });

  await prisma.clubMember.update({
    where: { id: memberId },
    data: { scoreProgression: score },
  });

  return score;
}
