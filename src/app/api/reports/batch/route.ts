import { NextResponse } from "next/server";
import { batchUpdateStatus } from "@/lib/mock-report-store";
import type { BatchActionRequest } from "@/types/report";

export async function POST(request: Request) {
  const body = (await request.json()) as BatchActionRequest;
  const { ids, action, remark, operator } = body;

  if (!ids?.length || !action) {
    return NextResponse.json({ message: "参数不完整" }, { status: 400 });
  }

  const results = batchUpdateStatus(ids, action, remark, operator);
  const label = action === "process" ? "处理" : "撤销";

  return NextResponse.json({
    data: results,
    message: `批量${label}成功，共 ${results.length} 条`,
  });
}
