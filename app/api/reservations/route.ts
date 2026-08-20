import { NextRequest, NextResponse } from "next/server";
import {
  ContactPreference,
  Disponibilite,
  ReservationType,
  SourceConnaissance,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  JOURS_DISPONIBLES,
  MOMENTS_DISPONIBLES,
} from "@/lib/disponibilites";
import { envoyerEmailsReservation } from "@/lib/email";

export const dynamic = "force-dynamic";

type ReservationBody = {
  nom?: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  type?: ReservationType;
  objectifs?: string[];
  autreObjectif?: string | null;
  seanceId?: number | null;
  coachId?: number | null;
  jourDisponibilite?: string | null;
  disponibilite?: Disponibilite | null;
  contactPreference?: ContactPreference;
  source?: SourceConnaissance;
  recommandation?: string | null;
  autreSource?: string | null;
  message?: string | null;
  rgpd?: boolean;
};

import { verifySessionToken } from "@/lib/admin-auth";

async function isAuthenticated(req: NextRequest) {
  return !!(await verifySessionToken(req.cookies.get("admin")?.value));
}

function nettoyerTexte(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function validerEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validerReservation(body: ReservationBody) {
  const nom = nettoyerTexte(body.nom, 100);
  const prenom = nettoyerTexte(body.prenom, 100);
  const telephone = nettoyerTexte(body.telephone, 30);
  const email = nettoyerTexte(body.email, 150).toLowerCase();
  const message = body.message ? nettoyerTexte(body.message, 2000) : null;
  const autreObjectif = body.autreObjectif
    ? nettoyerTexte(body.autreObjectif, 300)
    : null;
  const recommandation = body.recommandation
    ? nettoyerTexte(body.recommandation, 200)
    : null;
  const autreSource = body.autreSource
    ? nettoyerTexte(body.autreSource, 200)
    : null;

  if (!nom) return { error: "Le nom est obligatoire." };
  if (!prenom) return { error: "Le prénom est obligatoire." };
  if (!telephone) return { error: "Le téléphone est obligatoire." };
  if (!email || !validerEmail(email)) {
    return { error: "Une adresse email valide est obligatoire." };
  }
  if (body.rgpd !== true) {
    return { error: "Vous devez accepter la politique de confidentialité." };
  }

  if (body.type !== "SEANCE" && body.type !== "BILAN") {
    return { error: "Veuillez choisir une demande (séance ou bilan)." };
  }

  const objectifs = Array.isArray(body.objectifs)
    ? body.objectifs
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 15)
    : [];

  if (objectifs.length === 0) {
    return { error: "Veuillez sélectionner au moins un objectif." };
  }

  const contientAutre = objectifs.some(
    (objectif) => objectif.toLowerCase() === "autre"
  );

  if (contientAutre && !autreObjectif) {
    return {
      error: "Veuillez préciser votre objectif lorsque vous choisissez « Autre ».",
    };
  }

  const disponibilitesBilan: Disponibilite[] = [
    "MATIN",
    "MIDI",
    "APRES_MIDI",
    "SOIR",
  ];

  const joursValides = JOURS_DISPONIBLES.map((jour) => jour.value);

  let jourDisponibilite: string | null = null;
  let disponibilite: Disponibilite | null = null;

  if (body.type === "BILAN") {
    jourDisponibilite = nettoyerTexte(body.jourDisponibilite, 50);

    if (
      !jourDisponibilite ||
      !(joursValides as readonly string[]).includes(jourDisponibilite)
    ) {
      return { error: "Veuillez sélectionner un jour de disponibilité." };
    }

    if (
      !body.disponibilite ||
      !disponibilitesBilan.includes(body.disponibilite)
    ) {
      return { error: "Veuillez sélectionner un moment de disponibilité." };
    }

    disponibilite = body.disponibilite;
  }

  const preferences: ContactPreference[] = ["TELEPHONE", "SMS", "EMAIL"];

  if (
    !body.contactPreference ||
    !preferences.includes(body.contactPreference)
  ) {
    return { error: "Veuillez indiquer votre préférence de contact." };
  }

  const sources: SourceConnaissance[] = [
    "FACEBOOK",
    "INSTAGRAM",
    "GOOGLE",
    "PROCHE",
    "PASSAGE_CLUB",
    "AUTRE",
  ];

  if (!body.source || !sources.includes(body.source)) {
    return { error: "Veuillez indiquer comment vous nous avez connus." };
  }

  if (body.source === "PROCHE" && !recommandation) {
    return { error: "Veuillez indiquer qui vous a recommandé." };
  }

  if (body.source === "AUTRE" && !autreSource) {
    return { error: "Veuillez préciser comment vous nous avez connus." };
  }

  let seanceId: number | null = null;
  let coachId: number | null = null;

  if (body.type === "SEANCE") {
    if (body.seanceId === undefined || body.seanceId === null) {
      return { error: "Veuillez choisir une séance." };
    }

    const seanceIdNumber = Number(body.seanceId);

    if (!Number.isInteger(seanceIdNumber) || seanceIdNumber <= 0) {
      return { error: "La séance sélectionnée est invalide." };
    }

    seanceId = seanceIdNumber;
  }

  if (body.coachId !== undefined && body.coachId !== null && body.coachId !== 0) {
    const coachIdNumber = Number(body.coachId);

    if (!Number.isInteger(coachIdNumber) || coachIdNumber <= 0) {
      return { error: "Le coach sélectionné est invalide." };
    }

    coachId = coachIdNumber;
  }

  return {
    data: {
      nom,
      prenom,
      telephone,
      email,
      type: body.type,
      objectifs,
      autreObjectif: contientAutre ? autreObjectif : null,
      seanceId,
      coachId,
      jourDisponibilite,
      disponibilite,
      contactPreference: body.contactPreference,
      source: body.source,
      recommandation: body.source === "PROCHE" ? recommandation : null,
      autreSource: body.source === "AUTRE" ? autreSource : null,
      message,
    },
  };
}

// POST — création publique depuis le formulaire Contact
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReservationBody;
    const validation = validerReservation(body);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { data } = validation;

    if (data.seanceId) {
      const seance = await prisma.seance.findUnique({
        where: { id: data.seanceId },
        select: { id: true },
      });

      if (!seance) {
        return NextResponse.json(
          { error: "La séance sélectionnée n'existe plus." },
          { status: 400 }
        );
      }
    }

    if (data.coachId) {
      const coach = await prisma.coach.findUnique({
        where: { id: data.coachId },
        select: { id: true },
      });

      if (!coach) {
        return NextResponse.json(
          { error: "Le coach sélectionné n'existe plus." },
          { status: 400 }
        );
      }
    }

    const reservation = await prisma.reservation.create({
      data,
      include: {
        seance: {
          select: {
            id: true,
            titre: true,
          },
        },
        coach: {
          select: {
            id: true,
            prenom: true,
            nom: true,
          },
        },
      },
    });

    envoyerEmailsReservation({
      nom: reservation.nom,
      prenom: reservation.prenom,
      telephone: reservation.telephone,
      email: reservation.email,
      type: reservation.type,
      objectifs: reservation.objectifs,
      autreObjectif: reservation.autreObjectif,
      seanceTitre: reservation.seance?.titre ?? null,
      coachNom: reservation.coach
        ? `${reservation.coach.prenom} ${reservation.coach.nom}`
        : null,
      jourDisponibilite: reservation.jourDisponibilite,
      momentDisponibilite: reservation.disponibilite,
      contactPreference: reservation.contactPreference,
      source: reservation.source,
      recommandation: reservation.recommandation,
      autreSource: reservation.autreSource,
      message: reservation.message,
    }).catch((err) => console.error("Erreur envoi emails:", err));

    return NextResponse.json(
      {
        success: true,
        message:
          "Merci ! Votre demande a bien été envoyée. Un coach HealthyFit vous contactera rapidement.",
        reservation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur création réservation :", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}

// GET — liste réservée à l'administration
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        seance: {
          select: {
            id: true,
            titre: true,
          },
        },
        coach: {
          select: {
            id: true,
            prenom: true,
            nom: true,
          },
        },
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Erreur lecture réservations :", error);

    return NextResponse.json(
      { error: "Impossible de charger les réservations." },
      { status: 500 }
    );
  }
}
