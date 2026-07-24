import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const photo = await prisma.galerie.update({
    where: {
      id: Number(id),
    },
    data: {
      titre: body.titre,
      categorie: body.categorie,
      image: body.image,
      ordre: body.ordre,
      actif: body.actif,
    },
  });

  return NextResponse.json(photo);
}

// DELETE
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.galerie.delete({
    where: {
      id: Number(id),
    },
  });

  return NextResponse.json({
    success: true,
  });
}