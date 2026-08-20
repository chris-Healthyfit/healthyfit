import { relinkOrphanCoachAccounts } from "../lib/club/relink-coach-accounts";

async function main() {
  const results = await relinkOrphanCoachAccounts();
  console.log("Rattachement comptes coach :");
  for (const r of results) {
    console.log(`  ${r.identifiant} → ${r.status}`);
  }
  if (results.length === 0) console.log("  (rien à rattacher)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
