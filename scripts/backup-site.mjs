/**
 * Sauvegarde complète HealthyFit : base Neon + uploads + config.
 * Usage : npm run db:backup
 */
import { PrismaClient } from "@prisma/client";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const prisma = new PrismaClient();

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

async function exportTable(name, fn) {
  try {
    const rows = await fn();
    return { name, count: rows.length, rows };
  } catch (e) {
    return { name, count: 0, rows: [], error: String(e) };
  }
}

async function main() {
  const backupRoot = join(
    String.raw`C:\Users\Chris\Desktop\back up`,
    `healthyfit-backup-${stamp()}`
  );
  const dataDir = join(backupRoot, "database");
  mkdirSync(dataDir, { recursive: true });

  console.log("📦 Sauvegarde HealthyFit →", backupRoot);

  const exports = await Promise.all([
    exportTable("admin", () => prisma.admin.findMany()),
    exportTable("auditLog", () => prisma.auditLog.findMany()),
    exportTable("seance", () => prisma.seance.findMany()),
    exportTable("coach", () => prisma.coach.findMany()),
    exportTable("clubMember", () => prisma.clubMember.findMany()),
    exportTable("carteClub", () => prisma.carteClub.findMany()),
    exportTable("clubTarif", () => prisma.clubTarif.findMany()),
    exportTable("seanceClub", () => prisma.seanceClub.findMany()),
    exportTable("presence", () => prisma.presence.findMany()),
    exportTable("bilan", () => prisma.bilan.findMany()),
    exportTable("stockItem", () => prisma.stockItem.findMany()),
    exportTable("fitCostItem", () => prisma.fitCostItem.findMany()),
    exportTable("financeConfig", () => prisma.financeConfig.findMany()),
    exportTable("charge", () => prisma.charge.findMany()),
    exportTable("stockPurchase", () =>
      prisma.stockPurchase.findMany({ include: { lines: true } })
    ),
    exportTable("stockMovement", () => prisma.stockMovement.findMany()),
    exportTable("vente", () => prisma.vente.findMany()),
    exportTable("accountingEntry", () => prisma.accountingEntry.findMany()),
    exportTable("club", () => prisma.club.findMany()),
    exportTable("nutrition", () => prisma.nutrition.findMany()),
    exportTable("temoignage", () => prisma.temoignage.findMany()),
    exportTable("galerie", () => prisma.galerie.findMany()),
    exportTable("contact", () => prisma.contact.findMany()),
    exportTable("reservation", () => prisma.reservation.findMany()),
  ]);

  for (const exp of exports) {
    writeFileSync(
      join(dataDir, `${exp.name}.json`),
      JSON.stringify(exp.rows, null, 2),
      "utf8"
    );
    console.log(`  ✅ ${exp.name}: ${exp.count}${exp.error ? ` (⚠ ${exp.error})` : ""}`);
  }

  writeFileSync(
    join(dataDir, "_summary.json"),
    JSON.stringify(
      exports.map(({ name, count, error }) => ({ name, count, error })),
      null,
      2
    ),
    "utf8"
  );

  const uploadsSrc = join(ROOT, "public", "uploads");
  const uploadsDst = join(backupRoot, "public", "uploads");
  if (existsSync(uploadsSrc)) {
    cpSync(uploadsSrc, uploadsDst, { recursive: true });
    console.log("  ✅ public/uploads copié");
  } else {
    console.log("  ⚠ public/uploads introuvable");
  }

  cpSync(join(ROOT, "prisma", "schema.prisma"), join(backupRoot, "schema.prisma"));

  const envPath = join(ROOT, ".env");
  if (existsSync(envPath)) {
    cpSync(envPath, join(backupRoot, ".env.backup"));
    console.log("  ✅ .env sauvegardé (.env.backup)");
  }

  let gitInfo = {};
  try {
    gitInfo = {
      branch: execSync("git rev-parse --abbrev-ref HEAD", { cwd: ROOT })
        .toString()
        .trim(),
      commit: execSync("git rev-parse HEAD", { cwd: ROOT }).toString().trim(),
      message: execSync("git log -1 --format=%s", { cwd: ROOT })
        .toString()
        .trim(),
      status: execSync("git status --short", { cwd: ROOT }).toString().trim(),
    };
  } catch {
    gitInfo = { note: "git non disponible" };
  }

  const manifest = {
    date: new Date().toISOString(),
    project: ROOT,
    backupRoot,
    git: gitInfo,
    tables: exports.map(({ name, count }) => ({ name, count })),
  };

  writeFileSync(
    join(backupRoot, "MANIFEST.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  writeFileSync(
    join(backupRoot, "LISEZMOI.txt"),
    `Sauvegarde HealthyFit
==================
Date : ${manifest.date}
Dossier : ${backupRoot}

Contenu :
- database/*.json  → export complet de la base Neon
- public/uploads/  → toutes les photos
- schema.prisma    → schéma base de données
- .env.backup      → connexion Neon (confidentiel)
- MANIFEST.json    → résumé

Pour restaurer le site vitrine depuis l'ancien backup SQLite :
  npm run db:restore-backup

Cette sauvegarde JSON peut servir à reconstruire la base si besoin.
`,
    "utf8"
  );

  console.log("\n🎉 Backup terminé :", backupRoot);
}

main()
  .catch((e) => {
    console.error("❌ Erreur backup:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
