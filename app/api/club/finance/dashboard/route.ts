import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canViewFinances } from "@/lib/club-access";
import { getFinanceDashboard, getChartData, getRentabiliteTable } from "@/lib/finance/aggregates";
import { getPilotageFinancier } from "@/lib/finance/pilotage";
import { getUpcomingCharges } from "@/lib/finance/charges";
import { getFitCostBreakdown } from "@/lib/finance/fit-cost";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get("period") ?? "month") as "today" | "week" | "month" | "year";

  const [dashboard, charts, rentabilite, echeances, fitCost, pilotage] = await Promise.all([
    getFinanceDashboard(),
    getChartData(period),
    getRentabiliteTable(period),
    getUpcomingCharges(14),
    getFitCostBreakdown(),
    getPilotageFinancier(),
  ]);

  return NextResponse.json({
    dashboard,
    charts,
    rentabilite,
    echeances,
    fitCost,
    pilotage,
  });
}
