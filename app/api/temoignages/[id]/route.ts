import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auditMutation } from "@/lib/api-audit";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const temoignage = await prisma.temoignage.update({
      where: {
        id: Number(id),
      },
      data: {
        prenom: body.prenom,
        texte: body.texte,
        image: body.image,
        ordre: body.ordre,
        actif: body.actif,
      },
    });

    await auditMutation(req, {
      action: "UPDATE",
      entity: "temoignage",
      entityId: temoignage.id,
      details: temoignage.prenom,
    });

    return NextResponse.json(temoignage);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    await prisma.temoignage.delete({
      where: {
        id: Number(id),
      },
    });

    await auditMutation(req, {
      action: "DELETE",
      entity: "temoignage",
      entityId: Number(id),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}