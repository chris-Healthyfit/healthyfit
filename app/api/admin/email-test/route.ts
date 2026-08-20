import { NextResponse } from "next/server";
import { getSessionFromRequest, isSuperAdmin } from "@/lib/admin-auth";
import { envoyerEmailTest, getEmailConfigStatus } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  return NextResponse.json(getEmailConfigStatus());
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { to?: string };
  const to = body.to?.trim() || getEmailConfigStatus().adminEmail;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json(
      { error: "Adresse email invalide." },
      { status: 400 }
    );
  }

  const config = getEmailConfigStatus();
  if (!config.hasApiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "RESEND_API_KEY manquante sur Vercel. Ajoutez-la dans Settings → Environment Variables puis redeploy.",
        config,
      },
      { status: 503 }
    );
  }

  const result = await envoyerEmailTest(to);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error ?? "Erreur Resend",
        config,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Email de test envoyé vers ${to}`,
    config,
  });
}
