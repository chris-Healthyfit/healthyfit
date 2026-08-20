# Restaurer les données HealthyFit (Neon)

## Ce qui s'est passé

Une commande **`npx prisma db push --force-reset`** a **effacé toute la base PostgreSQL** (Neon), puis le script de démo (`npm run db:seed`) a recréé des **fausses données** (32 clients fictifs, etc.).

**Données perdues dans la base actuelle :**
- Séances admin (`Admin → Séances`) : **0**
- Galerie, témoignages, réservations, nutrition, contact : **0**
- Tes vrais clients club (remplacés par le seed de démo)

Les **463 présences** visibles sont celles du seed, pas ton historique réel.

---

## Solution : restauration Neon (recommandé)

Neon conserve des **sauvegardes point-in-time** (selon ton plan).

1. Va sur [https://console.neon.tech](https://console.neon.tech)
2. Ouvre le projet **healthyfit** / base **neondb**
3. Menu **Branches** ou **Restore**
4. Choisis un **point de restauration AVANT** le reset (idéalement **1er ou 2 août**, avant la refonte CRM)
5. Crée une **branche de restauration** ou restaure la branche principale
6. Si tu crées une branche, copie la nouvelle `DATABASE_URL` dans ton `.env`
7. Relance l'app : `npm run dev`

> **Ne relance surtout pas** `db push --force-reset` ni `accept-data-loss` sans sauvegarde.

---

## Après restauration

1. Vérifie dans **Admin → Séances** que tes séances sont revenues
2. Vérifie **Espace club → Clients** (tes vrais clients)
3. Pour synchroniser le schéma **sans effacer les données** :
   ```powershell
   cd C:\Users\Chris\Desktop\healthyfit
   npx prisma db push
   ```
   (sans `--force-reset`, sans `--accept-data-loss`)

---

## Si Neon ne permet pas la restauration (plan gratuit limité)

Il faudra **re-saisir manuellement** :
- Admin → Séances
- Admin → Galerie / Témoignages
- Espace club → Clients

Les **images** uploadées sur Vercel Blob peuvent encore exister si tu as gardé les URLs quelque part.

---

## Contact

Si tu as besoin d'aide pour la restauration Neon, dis-moi ton plan Neon (Free / Pro) et la date approximative où tes données étaient encore OK.
