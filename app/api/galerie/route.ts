import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET
export async function GET() {
  const galerie = await prisma.galerie.findMany({
    orderBy: {
      ordre: "asc",
    },
  });

  return NextResponse.json(galerie);
}

// POST
export async function POST(req: Request) {
  const body = await req.json();

  const photo = await prisma.galerie.create({
    data: {
      titre: body.titre,
      categorie: body.categorie,
      image: body.image,
      ordre: body.ordre ?? 0,
      actif: body.actif ?? true,
    },
  });

  return NextResponse.json(photo);
}