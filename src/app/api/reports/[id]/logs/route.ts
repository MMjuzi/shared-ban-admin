import { NextResponse } from "next/server";
import { getMockActionLogs } from "@/lib/mock-report-store";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const logs = getMockActionLogs(id);
  return NextResponse.json({ data: logs });
}
