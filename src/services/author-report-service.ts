import type {
  AuthorReportListResponse,
  AuthorReportRecord,
  LeaderboardResponse,
  LeaderboardUser,
  RawAuthorReportRecord,
  RawLeaderboardUser,
  SubmitReportRequest,
  SubmitReportResponse,
} from "@/types/author-report";

const API_BASE = process.env.NEXT_PUBLIC_REPORT_API_BASE_URL ?? "";

function buildApiUrl(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(buildApiUrl(path), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`请求失败: ${res.status}`);
  return res.json() as Promise<T>;
}

function normalizeLeaderboardUser(raw: RawLeaderboardUser): LeaderboardUser {
  return {
    uid: raw.uid,
    nickname: raw.nickname,
    readHours: raw.read_hours,
    mobileReadHours: raw.mobile_read_hours,
    pcReadHours: raw.pc_read_hours,
    rank: raw.rank,
    reportStatus: raw.report_status,
    reportId: raw.report_id,
  };
}

function normalizeAuthorReport(raw: RawAuthorReportRecord): AuthorReportRecord {
  return {
    id: raw.id,
    authorId: raw.author_id,
    authorName: raw.author_name,
    workId: raw.work_id,
    workName: raw.work_name,
    targetUid: raw.target_uid,
    targetNickname: raw.target_nickname,
    readHours: raw.read_hours,
    reasons: raw.reasons,
    description: raw.description,
    status: raw.status,
    result: raw.result,
    banDays: raw.ban_days,
    createdAt: raw.created_at,
    processedAt: raw.processed_at,
  };
}

export async function getLeaderboard(workId: string, month?: string) {
  const params = month ? `?month=${encodeURIComponent(month)}` : "";
  const data = await requestJson<LeaderboardResponse>(
    `/api/author/works/${workId}/leaderboard${params}`
  );
  return {
    users: data.data.map(normalizeLeaderboardUser),
    workName: data.work_name,
    availableMonths: data.available_months,
    latestMonth: data.latest_month,
    currentMonth: data.current_month,
  };
}

export async function getMyReports(): Promise<AuthorReportRecord[]> {
  const data = await requestJson<AuthorReportListResponse>(
    "/api/author/reports"
  );
  return data.data.map(normalizeAuthorReport);
}

export async function submitReports(
  req: SubmitReportRequest
): Promise<AuthorReportRecord[]> {
  const data = await requestJson<SubmitReportResponse>(
    "/api/author/reports",
    { method: "POST", body: JSON.stringify(req) }
  );
  return data.data.map(normalizeAuthorReport);
}
