import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionFromRequest,
  isSuperAdmin,
} from "@/lib/admin-auth";
import { hashPassword } from "@/lib/password";
import { logAudit } from "@/lib/audit";

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

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  if (admin.role === "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Le super administrateur ne peut pas être modifié." },
      { status: 403 }
    );
  }

  const data: {
    prenom?: string;
    nom?: string;
    actif?: boolean;
    passwordHash?: string;
  } = {};

  if (typeof body.prenom === "string" && body.prenom.trim()) {
    data.prenom = body.prenom.trim();
  }
  if (typeof body.nom === "string" && body.nom.trim()) {
    data.nom = body.nom.trim();
  }
  if (typeof body.actif === "boolean") {
    data.actif = body.actif;
  }
  if (typeof body.password === "string" && body.password.length >= 6) {
    data.passwordHash = await hashPassword(body.password);
  }

  const updated = await prisma.admin.update({
    where: { id: adminId },
    data,
    select: {
      id: true,
      prenom: true,
      nom: true,
      identifiant: true,
      role: true,
      actif: true,
      createdAt: true,
    },
  });

  await logAudit(req, session, {
    action: "UPDATE",
    entity: "admin",
    entityId: updated.id,
    details: `Mise à jour de ${updated.prenom} ${updated.nom}`,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const adminId = Number(id);

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  if (admin.role === "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Impossible de supprimer le super administrateur." },
      { status: 403 }
    );
  }

  await prisma.admin.delete({ where: { id: adminId } });

  await logAudit(req, session, {
    action: "DELETE",
    entity: "admin",
    entityId: adminId,
    details: `Suppression de ${admin.prenom} ${admin.nom} (${admin.identifiant})`,
  });

  return NextResponse.json({ success: true });
}
