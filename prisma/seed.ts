import {
  PrismaClient,
  AbonnementType,
  PresenceMode,
  ScoreProgression,
} from "@prisma/client";
import { hashPassword } from "../lib/password";
import { DEFAULT_TARIFS } from "../lib/club/tarifs";
import { computeHealthyFitScore } from "../lib/club/score";

const SEANCES_CATALOGUE = [
  { horaire: "09:00", titre: "Renforcement matinal", duree: "45 min", niveau: "Tous niveaux", prix: "8" },
  { horaire: "10:30", titre: "Cardio & tonification", duree: "45 min", niveau: "Intermédiaire", prix: "8" },
  { horaire: "18:00", titre: "Full body", duree: "1h", niveau: "Tous niveaux", prix: "8" },
  { horaire: "19:30", titre: "HIIT du soir", duree: "45 min", niveau: "Avancé", prix: "8" },
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

async function ensureCatalogSeances() {
  const count = await prisma.seance.count();
  if (count > 0) {
    return prisma.seance.findMany({ orderBy: { id: "asc" } });
  }
  for (const s of SEANCES_CATALOGUE) {
    await prisma.seance.create({
      data: {
        horaire: s.horaire,
        titre: s.titre,
        description: s.titre,
        duree: s.duree,
        niveau: s.niveau,
        prix: s.prix,
        image: "",
      },
    });
  }
  return prisma.seance.findMany({ orderBy: { id: "asc" } });
}

async function getOrCreateSeanceClub(
  date: Date,
  horaire: string,
  titre: string,
  coachId: number
) {
  const day = startOfDay(date);
  const existing = await prisma.seanceClub.findUnique({
    where: { date_horaire: { date: day, horaire } },
  });
  if (existing) return existing;
  return prisma.seanceClub.create({
    data: { date: day, horaire, label: titre, coachId },
  });
}

const prisma = new PrismaClient();

const PRENOMS = [
  "Chris", "Christophe", "Christine", "Marie", "Sophie", "Julie", "Laura",
  "Emma", "Léa", "Camille", "Nicolas", "Thomas", "Pierre", "Marc", "David",
  "Sarah", "Anna", "Claire", "Isabelle", "Nathalie", "Valérie", "Céline",
  "Antoine", "Maxime", "Lucas", "Hugo", "Olivier", "Fabrice", "Kevin", "Jordan",
  "Mélanie", "Audrey", "Caroline", "Sandrine", "Patricia",
];

const NOMS = [
  "Golard", "Martin", "Dubois", "Bernard", "Petit", "Robert", "Richard",
  "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel",
  "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier",
];

const OBJECTIFS = [
  "Perte de poids",
  "Prise de masse",
  "Remise en forme",
  "Tonification",
  "Préparation sportive",
  "Bien-être général",
];

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("🌱 Seed HealthyFit CRM…");

  for (const t of DEFAULT_TARIFS) {
    await prisma.clubTarif.upsert({
      where: { code: t.code },
      create: {
        code: t.code,
        label: t.label,
        montantCentimes: t.montantCentimes,
        seancesIncluses: "seancesIncluses" in t ? t.seancesIncluses : null,
        ordre: t.ordre,
      },
      update: {
        label: t.label,
        montantCentimes: t.montantCentimes,
        seancesIncluses: "seancesIncluses" in t ? t.seancesIncluses : null,
      },
    });
  }

  const tarifs = await prisma.clubTarif.findMany();
  const tarifMap = Object.fromEntries(tarifs.map((t) => [t.code, t]));

  const catalogSeances = await ensureCatalogSeances();

  const coachData = [
    { prenom: "Chris", nom: "Golard", ordre: 1 },
    { prenom: "Sarah", nom: "HealthyFit", ordre: 2 },
    { prenom: "Amandine", nom: "Coach", ordre: 3 },
    { prenom: "Ophélie", nom: "Coach", ordre: 4 },
  ];

  const coachs = [];
  for (const c of coachData) {
    const existing = await prisma.coach.findFirst({
      where: { prenom: c.prenom, nom: c.nom },
    });
    if (existing) {
      coachs.push(existing);
    } else {
      coachs.push(
        await prisma.coach.create({
          data: {
            prenom: c.prenom,
            nom: c.nom,
            telephone: "04xx xx xx xx",
            facebook: "https://facebook.com/healthyfit",
            description: `Coach ${c.prenom}`,
            image: "/images/coach-placeholder.jpg",
            ordre: c.ordre,
          },
        })
      );
    }
  }

  const pwd = await hashPassword("healthyfit");
  for (const [identifiant, prenom, nom, coachIdx] of [
    ["chris", "Chris", "Golard", 0],
    ["sarah", "Sarah", "HealthyFit", 1],
  ] as const) {
    await prisma.admin.upsert({
      where: { identifiant },
      create: {
        prenom,
        nom,
        identifiant,
        passwordHash: pwd,
        role: "SUPER_ADMIN",
        coachId: coachs[coachIdx].id,
      },
      update: { role: "SUPER_ADMIN", coachId: coachs[coachIdx].id },
    });
  }

  for (const [identifiant, prenom, coachIdx] of [
    ["amandine", "Amandine", 2],
    ["ophelie", "Ophélie", 3],
  ] as const) {
    await prisma.admin.upsert({
      where: { identifiant },
      create: {
        prenom,
        nom: "Coach",
        identifiant,
        passwordHash: pwd,
        role: "COACH",
        coachId: coachs[coachIdx].id,
      },
      update: { role: "COACH", coachId: coachs[coachIdx].id },
    });
  }

  const memberCount = await prisma.clubMember.count();
  if (memberCount >= 30) {
    console.log("✅ Données déjà présentes, seed partiel terminé.");
    return;
  }

  const members = [];
  for (let i = 0; i < 32; i++) {
    const prenom = pick(PRENOMS, i);
    const nom = pick(NOMS, i + 3);
    let abonnementType: AbonnementType = "SEANCE";
    let estVip = false;
    let seancesCarteRestantes: number | null = null;

    if (i % 5 === 0) {
      abonnementType = "VIP";
      estVip = true;
    } else if (i % 4 === 1) {
      abonnementType = "CARTE_10";
      seancesCarteRestantes = 3 + (i % 8);
    }

    const actif = i % 9 !== 0;
    const aNutrition = i % 3 === 0;
    const coach = coachs[i % coachs.length];
    const createdAt = daysAgo(30 + i * 4);

    const member = await prisma.clubMember.create({
      data: {
        prenom,
        nom,
        telephone: `04${String(70000000 + i).slice(0, 8)}`,
        facebook: i % 2 === 0 ? `fb.com/${prenom.toLowerCase()}` : null,
        estClient: true,
        actif,
        estVip,
        aNutrition,
        abonnementType,
        seancesCarteRestantes,
        objectif: pick(OBJECTIFS, i),
        transformation: i % 4 === 0 ? "En cours" : null,
        photoAvant: i % 5 !== 0 ? `/images/demo/avant-${(i % 6) + 1}.jpg` : null,
        photoApres: i % 7 === 0 ? `/images/demo/apres-${(i % 4) + 1}.jpg` : null,
        nutritionProgramme: aNutrition ? "Plan hyperprotéiné" : null,
        nutritionProduits: aNutrition ? "Whey, oméga-3" : null,
        nutritionNotes: aNutrition ? "Suivi hebdomadaire" : null,
        coachReferentId: coach.id,
        createdAt,
      },
    });
    members.push(member);
  }

  console.log(`👥 ${members.length} clients créés`);

  for (const member of members) {
    const nbBilans = member.actif ? (member.id % 4) + 1 : 0;
    const bilans = [];

    for (let b = 0; b < nbBilans; b++) {
      const basePoids = 60 + (member.id % 25);
      const delta = b * 1.2;
      const bilan = await prisma.bilan.create({
        data: {
          memberId: member.id,
          date: daysAgo(60 - b * 25),
          poids: basePoids - delta,
          taille: 165 + (member.id % 20),
          tourTaille: 80 - b * 2,
          tourHanches: 95 - b,
          tourPoitrine: 90,
          bras: 28 + b * 0.3,
          cuisse: 55 - b * 0.5,
          mollet: 36,
          masseGrasse: 28 - b * 1.5,
          masseMusculaire: 25 + b * 0.8,
          graisseViscerale: 12 - b,
          eauCorporelle: 52 + b * 0.5,
          ageMetabolique: 35 - b,
          metabolismeBase: 1400 + b * 20,
          checklistComplete: true,
        },
      });
      bilans.push(bilan);
    }

    const nbPresences = member.actif ? 8 + (member.id % 20) : 2;
    for (let p = 0; p < nbPresences; p++) {
      const daysBack = p * 2 + (member.id % 3);
      const presenceDate = daysAgo(daysBack);
      const catalogItem = catalogSeances[p % catalogSeances.length];
      const seanceClub = await getOrCreateSeanceClub(
        presenceDate,
        catalogItem.horaire,
        catalogItem.titre,
        member.coachReferentId
      );

      let mode: PresenceMode = "SEANCE";
      let montant = tarifMap.SEANCE?.montantCentimes ?? 800;

      if (member.abonnementType === "VIP" || member.estVip) {
        mode = "VIP";
        montant = tarifMap.VIP?.montantCentimes ?? 600;
      } else if (member.abonnementType === "CARTE_10" && p % 3 !== 2) {
        mode = "CARTE_10";
        montant = 0;
      }

      if (p === 0 && member.id % 11 === 0) {
        mode = "OFFERTE";
        montant = 0;
      }

      await prisma.presence.create({
        data: {
          memberId: member.id,
          coachId: member.coachReferentId,
          seanceClubId: seanceClub.id,
          date: presenceDate,
          mode,
          montantCentimes: montant,
          tarifCode: mode === "OFFERTE" ? null : mode,
          motifOffert: mode === "OFFERTE" ? "CADEAU" : null,
        },
      });
    }

    if (bilans.length >= 2) {
      const presences = await prisma.presence.findMany({
        where: { memberId: member.id },
        orderBy: { date: "desc" },
      });
      const score = computeHealthyFitScore({
        member,
        presences,
        bilans: bilans.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      });
      await prisma.clubMember.update({
        where: { id: member.id },
        data: { scoreProgression: score as ScoreProgression },
      });
    }
  }

  const bilanSansRecent = members.filter((m) => m.id % 6 === 0);
  for (const m of bilanSansRecent.slice(0, 5)) {
    await prisma.bilan.deleteMany({ where: { memberId: m.id } });
    await prisma.bilan.create({
      data: {
        memberId: m.id,
        date: daysAgo(30),
        poids: 75,
        masseGrasse: 25,
        masseMusculaire: 28,
        checklistComplete: false,
      },
    });
  }

  console.log("🎉 Seed terminé !");
  console.log("   Comptes : chris / sarah / amandine / ophelie — mot de passe : healthyfit");

  const { seedFinance } = await import("./seed-finance");
  await seedFinance();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
