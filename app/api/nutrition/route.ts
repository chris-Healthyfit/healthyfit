import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let nutrition = await prisma.nutrition.findFirst();

    if (!nutrition) {
      nutrition = await prisma.nutrition.create({
        data: {
          titre: "La nutrition est la base de vos résultats.",
          sousTitre:
            "Que votre objectif soit de perdre du poids, gagner en énergie ou améliorer votre bien-être, votre alimentation joue un rôle essentiel.",

          importance:
            "Faire du sport est indispensable, mais votre alimentation influence directement votre énergie, votre récupération, votre progression et votre composition corporelle. Une bonne nutrition permet d'obtenir des résultats durables sans tomber dans les régimes extrêmes.",

          accompagnement:
            "Chez HealthyFit, nous prenons le temps de comprendre vos habitudes, votre rythme de vie et vos objectifs afin de vous proposer des conseils simples, réalistes et adaptés à votre quotidien.",

          imageHero: "",
          imageImportance: "",
          imageCoach: "",

          bouton: "Réserver mon bilan",
        },
      });
    }

    return NextResponse.json(nutrition);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const nutrition = await prisma.nutrition.findFirst();

    if (!nutrition) {
      return NextResponse.json(
        { error: "Introuvable" },
        { status: 404 }
      );
    }

    const updated = await prisma.nutrition.update({
      where: {
        id: nutrition.id,
      },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}