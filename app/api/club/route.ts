import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auditMutation } from "@/lib/api-audit";

export async function GET() {
  try {
    let club = await prisma.club.findFirst();

    if (!club) {
      club = await prisma.club.create({
        data: {
          titre: "LE CLUB",
          sousTitre:
            "Bien plus qu'une salle de sport.",
          philosophie:
            "Chez HealthyFit, nous croyons qu'un accompagnement personnalisé est la clé de la réussite.",
          salle:
            "Découvrez un espace moderne, convivial et pensé pour votre bien-être.",
          image1: "",
          image2: "",
          bouton: "Réserver mon bilan",
        },
      });
    }

    return NextResponse.json(club);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const club = await prisma.club.findFirst();

    if (!club) {
      return NextResponse.json(
        { error: "Club introuvable." },
        { status: 404 }
      );
    }

    const updated = await prisma.club.update({
      where: {
        id: club.id,
      },
      data: {
        titre: body.titre,
        sousTitre: body.sousTitre,
        philosophie: body.philosophie,
        salle: body.salle,
        image1: body.image1,
        image2: body.image2,
        bouton: body.bouton,
      },
    });

    await auditMutation(request, {
      action: "UPDATE",
      entity: "club",
      entityId: updated.id,
      details: updated.titre,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}