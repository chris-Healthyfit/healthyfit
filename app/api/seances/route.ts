import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auditMutation } from "@/lib/api-audit";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const seances = await prisma.seance.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(seances);
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

    const seance = await prisma.seance.create({
      data: {
        horaire: body.horaire,
        titre: body.titre,
        description: body.description,
        duree: body.duree,
        niveau: body.niveau,
        prix: body.prix,
        image: body.image,
      },
    });

    await auditMutation(request, {
      action: "CREATE",
      entity: "seance",
      entityId: seance.id,
      details: seance.titre,
    });

    return NextResponse.json(seance);
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