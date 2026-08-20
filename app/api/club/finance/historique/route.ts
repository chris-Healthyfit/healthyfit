import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canViewFinances } from "@/lib/club-access";
import { getPeriodRange, type FinancePeriod } from "@/lib/finance/periods";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") ?? "month") as FinancePeriod;
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);
  const { start, end } = getPeriodRange(period);

  const entries = await prisma.accountingEntry.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json(entries);
}
