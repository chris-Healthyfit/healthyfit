import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminSession } from "@/lib/admin-auth";

type AuditInput = {
  action: AuditAction;
  entity?: string;
  entityId?: number;
  details?: string;
};

export async function logAudit(
  req: Request,
  session: AdminSession | null,
  data: AuditInput
) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: session?.adminId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details?.slice(0, 2000),
        ip:
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          req.headers.get("x-real-ip") ??
          undefined,
        userAgent: req.headers.get("user-agent")?.slice(0, 500) ?? undefined,
      },
    });
  } catch (error) {
    console.error("[Audit]", error);
  }
}
