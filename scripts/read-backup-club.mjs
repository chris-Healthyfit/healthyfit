import sqlite3 from "sqlite3";

const BACKUP = String.raw`C:\Users\Chris\Desktop\back up\healthyfit 5\prisma\healthyfit.db`;
const db = new sqlite3.Database(BACKUP, sqlite3.OPEN_READONLY);

db.get("SELECT * FROM Club LIMIT 1", (e, club) => {
  console.log("CLUB:", club);
  db.get("SELECT * FROM Nutrition LIMIT 1", (e2, n) => {
    console.log("NUTRITION keys:", n ? Object.keys(n) : null, n?.titre);
    db.close();
  });
});
