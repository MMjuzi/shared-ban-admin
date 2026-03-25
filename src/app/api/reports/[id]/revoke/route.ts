import { NextResponse } from "next/server";
import { updateMockReportStatus } from "@/lib/mock-report-store";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    remark?: string;
    operator?: string;
  };

  const record = updateMockReportStatus(id, "pending", body.remark, body.operator);

  if (!record) {
    return NextResponse.json({ message: "记录不存在" }, { status: 404 });
  }

  return NextResponse.json({ data: record, message: "撤销成功" });
}
