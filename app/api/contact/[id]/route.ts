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

  const contact = await prisma.contact.update({
    where: {
      id: Number(id),
    },
    data: {
      nom: body.nom,
      adresse: body.adresse,
      telephone: body.telephone,
      email: body.email,
      horaires: body.horaires,
      facebook: body.facebook,
      googleMaps: body.googleMaps,
      introduction: body.introduction,
    },
  });

  return NextResponse.json(contact);
}