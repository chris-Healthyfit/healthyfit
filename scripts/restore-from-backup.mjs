import sqlite3 from "sqlite3";
import { PrismaClient } from "@prisma/client";

const BACKUP_DB = String.raw`C:\Users\Chris\Desktop\back up\healthyfit 5\prisma\healthyfit.db`;
const prisma = new PrismaClient();

function all(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function main() {
  const db = new sqlite3.Database(BACKUP_DB, sqlite3.OPEN_READONLY);

  const seances = await all(db, "SELECT * FROM Seance ORDER BY id");
  const galerie = await all(db, "SELECT * FROM Galerie ORDER BY id");
  const temoignages = await all(db, "SELECT * FROM Temoignage ORDER BY id");
  const coaches = await all(db, "SELECT * FROM Coach ORDER BY id");
  const club = await all(db, "SELECT * FROM Club ORDER BY id LIMIT 1");
  const nutrition = await all(db, "SELECT * FROM Nutrition ORDER BY id LIMIT 1");
  const contacts = await all(db, "SELECT * FROM Contact ORDER BY id");

  db.close();

  console.log("Backup:", {
    seances: seances.length,
    galerie: galerie.length,
    temoignages: temoignages.length,
    coaches: coaches.length,
    club: club.length,
    nutrition: nutrition.length,
    contacts: contacts.length,
  });

  // Séances
  await prisma.seance.deleteMany({});
  for (const s of seances) {
    await prisma.seance.create({
      data: {
        horaire: s.horaire ?? "",
        titre: s.titre,
        description: s.description,
        duree: s.duree,
        niveau: s.niveau,
        prix: s.prix,
        image: s.image ?? "",
        createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
      },
    });
  }
  console.log(`✅ ${seances.length} séances restaurées`);

  // Galerie
  await prisma.galerie.deleteMany({});
  for (const g of galerie) {
    await prisma.galerie.create({
      data: {
        titre: g.titre,
        categorie: g.categorie,
        image: g.image,
        ordre: g.ordre ?? 0,
        actif: !!g.actif,
        createdAt: g.createdAt ? new Date(g.createdAt) : undefined,
      },
    });
  }
  console.log(`✅ ${galerie.length} photos galerie restaurées`);

  // Témoignages
  await prisma.temoignage.deleteMany({});
  for (const t of temoignages) {
    await prisma.temoignage.create({
      data: {
        prenom: t.prenom,
        texte: t.texte,
        image: t.image ?? "",
        ordre: t.ordre ?? 0,
        actif: !!t.actif,
        createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
      },
    });
  }
  console.log(`✅ ${temoignages.length} témoignages restaurés`);

  // Coachs — mise à jour par prénom/nom
  for (const c of coaches) {
    const existing = await prisma.coach.findFirst({
      where: { prenom: c.prenom, nom: c.nom },
    });
    if (existing) {
      await prisma.coach.update({
        where: { id: existing.id },
        data: {
          telephone: c.telephone,
          facebook: c.facebook,
          description: c.description,
          image: c.image,
          ordre: c.ordre ?? 0,
        },
      });
    } else {
      await prisma.coach.create({
        data: {
          prenom: c.prenom,
          nom: c.nom,
          telephone: c.telephone,
          facebook: c.facebook,
          description: c.description,
          image: c.image,
          ordre: c.ordre ?? 0,
        },
      });
    }
  }
  console.log(`✅ ${coaches.length} coachs synchronisés`);

  // Page Club
  if (club[0]) {
    const c = club[0];
    const existing = await prisma.club.findFirst();
    const data = {
      titre: c.titre,
      sousTitre: c.sousTitre,
      philosophie: c.philosophie,
      salle: c.salle,
      image1: c.image1,
      image2: c.image2,
      bouton: c.bouton,
    };
    if (existing) {
      await prisma.club.update({ where: { id: existing.id }, data });
    } else {
      await prisma.club.create({ data });
    }
    console.log("✅ Page Club restaurée");
  }

  // Nutrition
  if (nutrition[0]) {
    const n = nutrition[0];
    const existing = await prisma.nutrition.findFirst();
    const data = {
      titre: n.titre,
      sousTitre: n.sousTitre,
      importance: n.importance,
      accompagnement: n.accompagnement,
      imageHero: n.imageHero,
      imageImportance: n.imageImportance,
      imageCoach: n.imageCoach,
      bouton: n.bouton,
    };
    if (existing) {
      await prisma.nutrition.update({ where: { id: existing.id }, data });
    } else {
      await prisma.nutrition.create({ data });
    }
    console.log("✅ Page Nutrition restaurée");
  }

  // Contacts
  if (contacts.length) {
    await prisma.contact.deleteMany({});
    for (const c of contacts) {
      await prisma.contact.create({
        data: {
          nom: c.nom ?? "HealthyFit",
          adresse: c.adresse,
          telephone: c.telephone,
          email: c.email,
          facebook: c.facebook,
          horaires: c.horaires,
          googleMaps: c.googleMaps ?? "",
          introduction: c.introduction ?? "",
        },
      });
    }
    console.log(`✅ ${contacts.length} contact(s) restauré(s)`);
  }

  const check = await prisma.seance.findMany({
    select: { horaire: true, titre: true },
    orderBy: { id: "asc" },
  });
  console.log("\nSéances en base:", check);
}

main()
  .catch((e) => {
    console.error("❌ Erreur:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
