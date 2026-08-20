import type { CarteType, Prisma } from "@prisma/client";
import { addLedgerEntry } from "@/lib/finance/ledger";
import {
  CARTE_SEANCES_TOTAL,
  labelCarte,
} from "@/lib/club/cartes-config";

export async function recordCarteVenteFinance(
  input: {
    carteId: number;
    member: { prenom: string; nom: string | null };
    type: CarteType;
    montantCentimes: number;
    coutFitReserveCentimes: number;
    beneficePotentielCentimes: number;
    fitUnitaireCentimes: number;
  },
  tx?: Prisma.TransactionClient
) {
  const nom = `${input.member.prenom}${input.member.nom ? ` ${input.member.nom}` : ""}`;
  const label = labelCarte(input.type);

  await addLedgerEntry(
    {
      type: "VENTE_CARTE",
      categorie: "SPORT",
      libelle: `${label} — ${nom}`,
      recetteCentimes: input.montantCentimes,
      beneficeCentimes: input.beneficePotentielCentimes,
      referenceType: "carte",
      referenceId: input.carteId,
    },
    tx
  );

  await addLedgerEntry(
    {
      type: "CARTE_COUT_RESERVE",
      categorie: "RESERVE",
      libelle: `Coût futur ${CARTE_SEANCES_TOTAL} séances FIT — ${nom}`,
      coutCentimes: input.coutFitReserveCentimes,
      depenseCentimes: 0,
      beneficeCentimes: -input.coutFitReserveCentimes,
      referenceType: "carte",
      referenceId: input.carteId,
    },
    tx
  );
}

export async function recordCarteConsommationFinance(
  input: {
    carteId: number;
    presenceId: number;
    member: { prenom: string; nom: string | null };
    fitUnitaireCentimes: number;
    seancesRestantes: number;
  },
  tx?: Prisma.TransactionClient
) {
  const nom = `${input.member.prenom}${input.member.nom ? ` ${input.member.nom}` : ""}`;

  await addLedgerEntry(
    {
      type: "CARTE_COUT_SEANCE",
      categorie: "SPORT",
      libelle: `Séance carte — ${nom} (${input.seancesRestantes} restante${input.seancesRestantes > 1 ? "s" : ""})`,
      coutCentimes: input.fitUnitaireCentimes,
      depenseCentimes: input.fitUnitaireCentimes,
      beneficeCentimes: -input.fitUnitaireCentimes,
      referenceType: "presence",
      referenceId: input.presenceId,
    },
    tx
  );
}
