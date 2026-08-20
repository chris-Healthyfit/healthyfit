import { NextRequest, NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getSessionFromRequest,
  isSuperAdmin,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const filtre = searchParams.get("filtre");
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 200);

  const where =
    filtre === "connexions"
      ? { action: { in: ["LOGIN", "LOGOUT"] as AuditAction[] } }
      : filtre === "modifications"
        ? {
            action: {
              in: ["CREATE", "UPDATE", "DELETE"] as AuditAction[],
            },
          }
        : {};

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      admin: {
        select: { prenom: true, nom: true, identifiant: true },
      },
    },
  });

  return NextResponse.json(logs);
}
