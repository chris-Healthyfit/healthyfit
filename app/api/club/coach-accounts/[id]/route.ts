import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, isSuperAdmin } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/password";
import { auditMutation } from "@/lib/api-audit";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const adminId = Number(id);
  const body = await req.json();
  const password = typeof body.password === "string" ? body.password : "";

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Mot de passe requis (6 caractères minimum)." },
      { status: 400 }
    );
  }

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin || admin.role !== "COACH") {
    return NextResponse.json({ error: "Compte coach introuvable." }, { status: 404 });
  }

  const updated = await prisma.admin.update({
    where: { id: adminId },
    data: {
      passwordHash: await hashPassword(password),
      actif: true,
    },
    select: { id: true, identifiant: true, actif: true },
  });

  await auditMutation(req, {
    action: "UPDATE",
    entity: "coach_account",
    entityId: updated.id,
    details: `Mot de passe réinitialisé (${updated.identifiant})`,
  });

  return NextResponse.json(updated);
}
