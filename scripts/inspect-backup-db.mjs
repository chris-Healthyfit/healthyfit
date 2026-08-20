import sqlite3 from "sqlite3";

const paths = [
  String.raw`C:\Users\Chris\Desktop\back up\healthyfit 5\prisma\healthyfit.db`,
  String.raw`C:\Users\Chris\Desktop\back up\healthyfit\prisma\healthyfit.db`,
];

function inspect(path) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);

      db.all(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
        (e, tables) => {
          if (e) return reject(e);
          console.log("\n===", path, "===");
          console.log("Tables:", tables.map((t) => t.name).join(", "));

          db.get("SELECT COUNT(*) as c FROM Seance", (e2, count) => {
            if (!e2) console.log("Seance count:", count.c);

            db.all(
              "SELECT id, horaire, titre FROM Seance LIMIT 10",
              (e3, seances) => {
                if (!e3) console.log("Séances:", seances);

                const checks = [
                  "Galerie",
                  "Temoignage",
                  "Coach",
                  "ClubMember",
                  "Presence",
                  "Reservation",
                ];
                let i = 0;
                function next() {
                  if (i >= checks.length) {
                    db.close();
                    return resolve();
                  }
                  const t = checks[i++];
                  db.get(`SELECT COUNT(*) as c FROM ${t}`, (e4, row) => {
                    if (!e4) console.log(`${t}:`, row.c);
                    next();
                  });
                }
                next();
              }
            );
          });
        }
      );
    });
  });
}

for (const p of paths) {
  await inspect(p).catch((e) => console.error(p, e.message));
}
