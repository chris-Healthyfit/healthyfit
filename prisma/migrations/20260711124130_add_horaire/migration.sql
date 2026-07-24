-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Seance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "horaire" TEXT NOT NULL DEFAULT '',
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duree" TEXT NOT NULL,
    "niveau" TEXT NOT NULL,
    "calories" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Seance" ("calories", "createdAt", "description", "duree", "id", "image", "niveau", "titre") SELECT "calories", "createdAt", "description", "duree", "id", "image", "niveau", "titre" FROM "Seance";
DROP TABLE "Seance";
ALTER TABLE "new_Seance" RENAME TO "Seance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
