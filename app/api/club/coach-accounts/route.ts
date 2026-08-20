import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionFromRequest,
  isSuperAdmin,
} from "@/lib/admin-auth";
import { hashPassword } from "@/lib/password";
import { auditMutation } from "@/lib/api-audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const coachs = await prisma.coach.findMany({
    orderBy: { ordre: "asc" },
    include: {
      compte: {
        select: {
          id: true,
          identifiant: true,
          actif: true,
          prenom: true,
          nom: true,
        },
      },
    },
  });

  const orphelins = await prisma.admin.findMany({
    where: { role: "COACH", coachId: null },
    select: {
      id: true,
      identifiant: true,
      actif: true,
      prenom: true,
      nom: true,
    },
    orderBy: { identifiant: "asc" },
  });

  return NextResponse.json({ coachs, orphelins });
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const coachId = Number(body.coachId);
  const identifiant = String(body.identifiant ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const password = String(body.password ?? "");

  if (!coachId || !identifiant || password.length < 6) {
    return NextResponse.json(
      { error: "Coach, identifiant et mot de passe (6 car. min.) requis." },
      { status: 400 }
    );
  }

  const coach = await prisma.coach.findUnique({ where: { id: coachId } });
  if (!coach) {
    return NextResponse.json({ error: "Coach introuvable." }, { status: 404 });
  }

  const existingCoachAccount = await prisma.admin.findUnique({
    where: { coachId },
  });
  if (existingCoachAccount) {
    return NextResponse.json(
      { error: "Ce coach a déjà un compte." },
      { status: 409 }
    );
  }

  const existingId = await prisma.admin.findUnique({
    where: { identifiant },
  });
  if (existingId) {
    if (
      existingId.role === "COACH" &&
      existingId.coachId == null &&
      coachId
    ) {
      const otherOnCoach = await prisma.admin.findUnique({
        where: { coachId },
      });
      if (otherOnCoach && otherOnCoach.id !== existingId.id) {
        return NextResponse.json(
          {
            error: `Ce coach a déjà le compte « ${otherOnCoach.identifiant} ».`,
          },
          { status: 409 }
        );
      }
      const compte = await prisma.admin.update({
        where: { id: existingId.id },
        data: {
          coachId,
          prenom: coach.prenom,
          nom: coach.nom,
          passwordHash: await hashPassword(password),
          actif: true,
        },
      });
      await auditMutation(req, {
        action: "UPDATE",
        entity: "coach_account",
        entityId: compte.id,
        details: `Rattaché ${identifiant} → ${coach.prenom}`,
      });
      return NextResponse.json(
        {
          id: compte.id,
          identifiant: compte.identifiant,
          coachId,
          rattache: true,
        },
        { status: 200 }
      );
    }

    const hint =
      existingId.role === "SUPER_ADMIN"
        ? " (compte direction — ne pas réutiliser)"
        : existingId.role === "ADMIN"
          ? " (compte administration — choisissez ex: prenom-coach)"
          : existingId.coachId == null
            ? " (compte orphelin — supprimez-le ou rattachez-le ci-dessous)"
            : " (compte coach existant — réinitialisez le mot de passe ci-dessous)";
    return NextResponse.json(
      { error: `Cet identifiant existe déjà${hint}.`, adminId: existingId.id },
      { status: 409 }
    );
  }

  const compte = await prisma.admin.create({
    data: {
      prenom: coach.prenom,
      nom: coach.nom,
      identifiant,
      passwordHash: await hashPassword(password),
      role: "COACH",
      coachId,
    },
  });

  await auditMutation(req, {
    action: "CREATE",
    entity: "coach_account",
    entityId: compte.id,
    details: `${coach.prenom} ${coach.nom} (${identifiant})`,
  });

  return NextResponse.json(
    { id: compte.id, identifiant: compte.identifiant, coachId },
    { status: 201 }
  );
}
