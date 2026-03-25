import { NextResponse } from "next/server";
import { getMockReportsByUid } from "@/lib/mock-report-store";

interface Params {
  params: Promise<{ uid: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { uid } = await params;
  const reports = getMockReportsByUid(uid);
  return NextResponse.json({ data: reports });
}
