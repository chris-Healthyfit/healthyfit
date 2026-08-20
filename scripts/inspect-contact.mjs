import sqlite3 from "sqlite3";

const BACKUP_DB = String.raw`C:\Users\Chris\Desktop\back up\healthyfit 5\prisma\healthyfit.db`;
const db = new sqlite3.Database(BACKUP_DB, sqlite3.OPEN_READONLY);

db.all("PRAGMA table_info(Contact)", (e, r) => {
  console.log("Contact columns:", r);
  db.all("SELECT * FROM Contact LIMIT 1", (e2, rows) => {
    console.log("Contact sample:", rows);
    db.close();
  });
});
