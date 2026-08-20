import sqlite3 from "sqlite3";

const BACKUP = String.raw`C:\Users\Chris\Desktop\back up\healthyfit 5\prisma\healthyfit.db`;
const db = new sqlite3.Database(BACKUP, sqlite3.OPEN_READONLY);

db.all("SELECT id, prenom, nom, description, image FROM Coach", (e, coaches) => {
  if (e) throw e;
  console.log("COACHES BACKUP:", JSON.stringify(coaches, null, 2));
  db.all("SELECT id, horaire, titre, image FROM Seance", (e2, seances) => {
    if (e2) throw e2;
    console.log("SEANCES IMAGES:", seances.map((s) => s.image));
    db.all("SELECT id, titre, image FROM Galerie", (e3, galerie) => {
      console.log("GALERIE:", galerie);
      db.close();
    });
  });
});
