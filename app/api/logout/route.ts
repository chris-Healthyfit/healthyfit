import { NextResponse } from "next/server";
import {
  getSessionCookieOptions,
  getSessionFromRequest,
} from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  const response = NextResponse.json({ success: true });

  response.cookies.set("admin", "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });

  if (session) {
    await logAudit(req, session, {
      action: "LOGOUT",
      entity: "admin",
      entityId: session.adminId,
      details: `${session.prenom} ${session.nom} (${session.identifiant})`,
    });
  }

  return response;
}
