import { NextResponse } from "next/server";
import { getLeaderboard, getWorkById, getAvailableMonths, getLatestMonth } from "@/lib/mock-author-report-store";

interface Params {
  params: Promise<{ workId: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { workId } = await params;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? undefined;

  const work = getWorkById(workId);
  const users = getLeaderboard(workId, month);

  return NextResponse.json({
    data: users,
    work_name: work?.name ?? "未知作品",
    available_months: getAvailableMonths(),
    latest_month: getLatestMonth(),
    current_month: month ?? "all",
  });
}
