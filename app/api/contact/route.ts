import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

// GET
export async function GET() {
  const contact = await prisma.contact.findFirst();

  return NextResponse.json(contact);
}

// POST
export async function POST(req: Request) {
  const body = await req.json();

  const existe = await prisma.contact.findFirst();

  if (existe) {
    const update = await prisma.contact.update({
      where: {
        id: existe.id,
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

    return NextResponse.json(update);
  }

  const contact = await prisma.contact.create({
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
