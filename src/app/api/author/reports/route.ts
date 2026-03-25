import { NextResponse } from "next/server";
import {
  getAllAuthorReports,
  submitAuthorReport,
} from "@/lib/mock-author-report-store";
import type { SubmitReportRequest } from "@/types/author-report";

export async function GET() {
  const reports = getAllAuthorReports();
  return NextResponse.json({ data: reports });
}

export async function POST(request: Request) {
  const body = (await request.json()) as SubmitReportRequest;

  if (!body.targets?.length || !body.reasons?.length || !body.work_id) {
    return NextResponse.json({ message: "参数不完整" }, { status: 400 });
  }

  const results = submitAuthorReport(body);

  if (results.length === 0) {
    return NextResponse.json(
      { data: [], message: "所选用户均已被举报，无需重复提交" },
      { status: 200 }
    );
  }

  return NextResponse.json({
    data: results,
    message: `成功提交 ${results.length} 条举报`,
  });
}
