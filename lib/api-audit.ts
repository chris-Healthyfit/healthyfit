import { getSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import type { AuditAction } from "@prisma/client";

type AuditMutation = {
  action: AuditAction;
  entity?: string;
  entityId?: number;
  details?: string;
};

export async function auditMutation(req: Request, data: AuditMutation) {
  const session = await getSessionFromRequest(req);
  await logAudit(req, session, data);
  return session;
}
