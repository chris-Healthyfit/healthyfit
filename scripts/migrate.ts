import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateTable<T>(
  sqlite: any,
  table: string,
  create: (row: any) => Promise<T>
) {
  const rows = await sqlite.all(`SELECT * FROM ${table}`);

  console.log(`\n📦 ${table} : ${rows.length} ligne(s)`);

  let ok = 0;

  for (const row of rows) {
    try {
      await create(row);
      ok++;
    } catch (e: any) {
      console.log(`⚠️ ${table} id=${row.id} ignoré : ${e.message}`);
    }
  }

  console.log(`✅ ${ok}/${rows.length} importées`);
}

async function main() {
  const sqlite = await open({
    filename: "./prisma/healthyfit.db",
    driver: sqlite3.Database,
  });

  console.log("");
  console.log("====================================");
  console.log(" MIGRATION SQLITE -> POSTGRESQL");
  console.log("====================================");
    await migrateTable(sqlite, "Seance", async (row) => {
    await prisma.seance.create({
      data: {
        id: row.id,
        horaire: row.horaire,
        titre: row.titre,
        description: row.description,
        duree: row.duree,
        niveau: row.niveau,
        prix: row.prix,
        image: row.image,
        createdAt: new Date(row.createdAt),
      },
    });
  });

  await migrateTable(sqlite, "Coach", async (row) => {
    await prisma.coach.create({
      data: {
        id: row.id,
        prenom: row.prenom,
        nom: row.nom,
        telephone: row.telephone,
        facebook: row.facebook,
        description: row.description,
        image: row.image,
        ordre: row.ordre,
        createdAt: new Date(row.createdAt),
      },
    });
  });

  await migrateTable(sqlite, "Club", async (row) => {
    await prisma.club.create({
      data: {
        id: row.id,
        titre: row.titre,
        sousTitre: row.sousTitre,
        philosophie: row.philosophie,
        salle: row.salle,
        image1: row.image1,
        image2: row.image2,
        bouton: row.bouton,
        createdAt: new Date(row.createdAt),
      },
    });
  });

  await migrateTable(sqlite, "Nutrition", async (row) => {
    await prisma.nutrition.create({
      data: {
        id: row.id,
        titre: row.titre,
        sousTitre: row.sousTitre,
        importance: row.importance,
        accompagnement: row.accompagnement,
        imageHero: row.imageHero,
        imageImportance: row.imageImportance,
        imageCoach: row.imageCoach,
        bouton: row.bouton,
        createdAt: new Date(row.createdAt),
      },
    });
  });
    await migrateTable(sqlite, "Galerie", async (row) => {
    await prisma.galerie.create({
      data: {
        id: row.id,
        titre: row.titre,
        categorie: row.categorie,
        image: row.image,
        ordre: row.ordre,
        actif: row.actif === 1 || row.actif === true,
        createdAt: new Date(row.createdAt),
      },
    });
  });

  await migrateTable(sqlite, "Temoignage", async (row) => {
    await prisma.temoignage.create({
      data: {
        id: row.id,
        prenom: row.prenom,
        texte: row.texte,
        image: row.image,
        ordre: row.ordre,
        actif: row.actif === 1 || row.actif === true,
        createdAt: new Date(row.createdAt),
      },
    });
  });

  await migrateTable(sqlite, "Contact", async (row) => {
    await prisma.contact.create({
      data: {
        id: row.id,
        nom: row.nom,
        adresse: row.adresse,
        telephone: row.telephone,
        email: row.email,
        horaires: row.horaires,
        facebook: row.facebook,
        googleMaps: row.googleMaps,
        introduction: row.introduction,
        createdAt: new Date(row.createdAt),
      },
    });
  });

  console.log("");
  console.log("🔄 Synchronisation des séquences PostgreSQL...");

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"Seance"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Seance"), 1),
      true
    );
  `);

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"Coach"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Coach"), 1),
      true
    );
  `);

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"Club"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Club"), 1),
      true
    );
  `);

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"Nutrition"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Nutrition"), 1),
      true
    );
  `);

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"Galerie"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Galerie"), 1),
      true
    );
  `);

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"Temoignage"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Temoignage"), 1),
      true
    );
  `);

  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"Contact"', 'id'),
      COALESCE((SELECT MAX(id) FROM "Contact"), 1),
      true
    );
  `);

  console.log("✅ Séquences PostgreSQL synchronisées.");
  console.log("🎉 Migration terminée avec succès !");

  await sqlite.close();
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ Erreur durant la migration");
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });