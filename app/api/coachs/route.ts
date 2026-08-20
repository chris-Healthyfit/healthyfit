import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auditMutation } from "@/lib/api-audit";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coachs = await prisma.coach.findMany();

    return NextResponse.json(coachs);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const coach = await prisma.coach.create({
      data: {
        prenom: body.prenom,
        nom: body.nom,
        telephone: body.telephone,
        facebook: body.facebook,
        description: body.description,
        image: body.image,
      },
    });

    await auditMutation(request, {
      action: "CREATE",
      entity: "coach",
      entityId: coach.id,
      details: `${coach.prenom} ${coach.nom}`,
    });

    return NextResponse.json(coach);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}