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

  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin || admin.role !== "COACH") {
    return NextResponse.json({ error: "Compte coach introuvable." }, { status: 404 });
  }

  const data: {
    passwordHash?: string;
    actif?: boolean;
    coachId?: number;
    prenom?: string;
    nom?: string;
  } = {};

  if (typeof body.password === "string" && body.password.length >= 6) {
    data.passwordHash = await hashPassword(body.password);
    data.actif = true;
  }

  if (Number.isInteger(body.coachId) && body.coachId > 0) {
    const coach = await prisma.coach.findUnique({
      where: { id: body.coachId },
    });
    if (!coach) {
      return NextResponse.json({ error: "Coach introuvable." }, { status: 404 });
    }
    const other = await prisma.admin.findUnique({
      where: { coachId: body.coachId },
    });
    if (other && other.id !== adminId) {
      return NextResponse.json(
        { error: `Ce coach est déjà lié au compte « ${other.identifiant} ».` },
        { status: 409 }
      );
    }
    data.coachId = body.coachId;
    data.prenom = coach.prenom;
    data.nom = coach.nom;
  }

  if (typeof body.actif === "boolean") {
    data.actif = body.actif;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucune modification." }, { status: 400 });
  }

  const updated = await prisma.admin.update({
    where: { id: adminId },
    data,
    select: { id: true, identifiant: true, actif: true, coachId: true },
  });

  await auditMutation(req, {
    action: "UPDATE",
    entity: "coach_account",
    entityId: updated.id,
    details: `Compte ${updated.identifiant} mis à jour`,
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
  if (!admin || admin.role !== "COACH") {
    return NextResponse.json(
      { error: "Seuls les comptes coach peuvent être supprimés ici." },
      { status: 404 }
    );
  }

  await prisma.admin.delete({ where: { id: adminId } });

  await auditMutation(req, {
    action: "DELETE",
    entity: "coach_account",
    entityId: adminId,
    details: admin.identifiant,
  });

  return NextResponse.json({ success: true });
}
