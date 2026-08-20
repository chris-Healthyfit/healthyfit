import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  getLoginRedirect,
  getSessionCookieOptions,
} from "@/lib/admin-auth";
import { verifyPassword } from "@/lib/password";
import { ensureSuperAdmins } from "@/lib/ensure-super-admin";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifiant = body.identifiant;
    const password = body.password;
    const context = body.context as "admin" | "club" | undefined;

    if (
      typeof identifiant !== "string" ||
      typeof password !== "string" ||
      !identifiant.trim() ||
      !password
    ) {
      return NextResponse.json(
        { success: false, error: "Identifiant et mot de passe requis." },
        { status: 400 }
      );
    }

    await ensureSuperAdmins();

    const admin = await prisma.admin.findUnique({
      where: { identifiant: identifiant.trim().toLowerCase() },
      include: { coach: { select: { id: true, prenom: true, nom: true } } },
    });

    if (!admin || !admin.actif) {
      return NextResponse.json(
        { success: false, error: "Identifiant ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    if (context === "club" && admin.role === "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ce compte est pour l'administration du site uniquement. Utilisez le portail admin, ou connectez-vous avec un compte coach (identifiant créé dans Comptes coachs).",
        },
        { status: 403 }
      );
    }

    if (context === "admin" && admin.role === "COACH") {
      return NextResponse.json(
        {
          success: false,
          error: "Accès réservé. Utilisez le portail club (5 clics sur « Le Club »).",
        },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Identifiant ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const session = {
      adminId: admin.id,
      role: admin.role,
      prenom: admin.prenom,
      nom: admin.nom,
      identifiant: admin.identifiant,
      coachId: admin.coachId,
    };

    const token = await createSessionToken(session);
    const response = NextResponse.json({
      success: true,
      redirect: getLoginRedirect(session, context),
      admin: {
        prenom: admin.prenom,
        nom: admin.nom,
        role: admin.role,
        coachId: admin.coachId,
        coachLabel: admin.coach
          ? `${admin.coach.prenom} ${admin.coach.nom}`
          : null,
      },
    });

    response.cookies.set("admin", token, getSessionCookieOptions());

    await logAudit(req, session, {
      action: "LOGIN",
      entity: "admin",
      entityId: admin.id,
      details: `${admin.prenom} ${admin.nom} (${admin.identifiant})`,
    });

    return response;
  } catch (error) {
    console.error("[Login]", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Erreur serveur. Arrête le serveur (Ctrl+C), lance « npx prisma generate » puis « npm run dev ».",
      },
      { status: 500 }
    );
  }
}
