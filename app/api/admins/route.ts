import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionFromRequest,
  isSuperAdmin,
} from "@/lib/admin-auth";
import { hashPassword } from "@/lib/password";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

function normalizeIdentifiant(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
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

  return NextResponse.json(admins);
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const prenom = typeof body.prenom === "string" ? body.prenom.trim() : "";
  const nom = typeof body.nom === "string" ? body.nom.trim() : "";
  const identifiant = normalizeIdentifiant(
    typeof body.identifiant === "string" ? body.identifiant : ""
  );
  const password = typeof body.password === "string" ? body.password : "";

  if (!prenom || !nom || !identifiant || password.length < 6) {
    return NextResponse.json(
      {
        error:
          "Prénom, nom, identifiant et mot de passe (6 caractères min.) requis.",
      },
      { status: 400 }
    );
  }

  const exists = await prisma.admin.findUnique({ where: { identifiant } });
  if (exists) {
    return NextResponse.json(
      { error: "Cet identifiant existe déjà." },
      { status: 409 }
    );
  }

  const admin = await prisma.admin.create({
    data: {
      prenom,
      nom,
      identifiant,
      passwordHash: await hashPassword(password),
      role: "ADMIN",
    },
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
    action: "CREATE",
    entity: "admin",
    entityId: admin.id,
    details: `Création de ${prenom} ${nom} (${identifiant})`,
  });

  return NextResponse.json(admin, { status: 201 });
}
