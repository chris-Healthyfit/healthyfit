import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const temoignages = await prisma.temoignage.findMany({
      where: {
        actif: true,
      },
      orderBy: {
        ordre: "asc",
      },
    });

    return NextResponse.json(temoignages);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const temoignage = await prisma.temoignage.create({
      data: {
        prenom: body.prenom,
        texte: body.texte,
        image: body.image,
        ordre: body.ordre ?? 0,
        actif: body.actif ?? true,
      },
    });

    return NextResponse.json(temoignage);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}