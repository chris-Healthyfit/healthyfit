import sqlite3 from "sqlite3";
import { PrismaClient } from "@prisma/client";

const BACKUP = String.raw`C:\Users\Chris\Desktop\back up\healthyfit 5\prisma\healthyfit.db`;

function all(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

const prisma = new PrismaClient();

try {
  const db = new sqlite3.Database(BACKUP, sqlite3.OPEN_READONLY);
  const tables = await all(
    db,
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log("=== BACKUP SQLITE ===");
  for (const { name } of tables) {
    if (name.startsWith("_") || name === "sqlite_sequence") continue;
    const rows = await all(db, `SELECT COUNT(*) as c FROM "${name}"`);
    console.log(`${name}: ${rows[0].c}`);
  }

  const temoignages = await all(db, "SELECT id, prenom, actif FROM Temoignage");
  const contacts = await all(db, "SELECT * FROM Contact");
  console.log("\nTemoignages backup:", temoignages);
  console.log("Contact backup:", contacts);

  db.close();

  console.log("\n=== NEON ACTUEL ===");
  const counts = {
    seance: await prisma.seance.count(),
    coach: await prisma.coach.count(),
    galerie: await prisma.galerie.count(),
    temoignage: await prisma.temoignage.count(),
    contact: await prisma.contact.count(),
    clubMember: await prisma.clubMember.count(),
    presence: await prisma.presence.count(),
    reservation: await prisma.reservation.count(),
    bilan: await prisma.bilan.count(),
  };
  console.log(counts);

  const temoignagesDb = await prisma.temoignage.findMany({
    select: { id: true, prenom: true, actif: true, texte: true },
  });
  console.log("\nTemoignages neon:", temoignagesDb);

  const reservations = await prisma.reservation.count();
  console.log("Reservations neon:", reservations);
} finally {
  await prisma.$disconnect();
}
