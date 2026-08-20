import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { auditMutation } from "@/lib/api-audit";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    await auditMutation(req, {
      action: "CREATE",
      entity: "upload",
      details: file.name,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur lors de l'upload." },
      { status: 500 }
    );
  }
}