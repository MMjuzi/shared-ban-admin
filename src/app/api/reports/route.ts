import { NextResponse } from "next/server";
import { getMockReports } from "@/lib/mock-report-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword")?.trim().toLowerCase() ?? "";
  const status = searchParams.get("status");

  const reports = getMockReports().filter((item) => {
    const matchesKeyword =
      !keyword ||
      item.user_uid.toLowerCase().includes(keyword) ||
      item.user_nickname.toLowerCase().includes(keyword) ||
      item.content_id.toLowerCase().includes(keyword) ||
      item.content_title.toLowerCase().includes(keyword);

    const matchesStatus = !status || item.status === status;
    return matchesKeyword && matchesStatus;
  });

  return NextResponse.json({ data: reports });
}
