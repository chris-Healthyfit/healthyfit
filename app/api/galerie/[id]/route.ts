import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auditMutation } from "@/lib/api-audit";

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

  await auditMutation(req, {
    action: "UPDATE",
    entity: "galerie",
    entityId: photo.id,
    details: photo.titre,
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

  await auditMutation(req, {
    action: "DELETE",
    entity: "galerie",
    entityId: Number(id),
  });

  return NextResponse.json({
    success: true,
  });
}