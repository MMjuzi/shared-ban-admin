import {
  type ActionLog,
  type ActionLogListResponse,
  type BatchActionResponse,
  type RawActionLog,
  type RawReportRecord,
  type ReportActionResponse,
  type ReportFilters,
  type ReportListResponse,
  type ReportRecord,
} from "@/types/report";

const API_BASE = process.env.NEXT_PUBLIC_REPORT_API_BASE_URL ?? "";
const DEFAULT_OPERATOR = "运营人员";

function buildApiUrl(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export function normalizeReportRecord(raw: RawReportRecord): ReportRecord {
  return {
    id: raw.id,
    uid: raw.user_uid,
    nickname: raw.user_nickname,
    workId: raw.content_id,
    workName: raw.content_title,
    reporters: raw.reporters.map((r) => ({
      id: r.reporter_id,
      name: r.reporter_name,
      reportReason: r.reason,
      reportedAt: r.reported_at,
    })),
    totalReadMinutes: Math.round(raw.history_read_seconds / 60),
    monthlyReadMinutes: Math.round(raw.month_read_seconds / 60),
    totalPaidAmount: Number((raw.history_paid_fen / 100).toFixed(2)),
    recentPaidAmount: Number((raw.recent_paid_fen / 100).toFixed(2)),
    monthlyDeviceCount: raw.month_device_count,
    devices: raw.devices?.map((d) => ({
      deviceId: d.device_id,
      deviceName: d.device_name,
      deviceType: d.device_type,
      lastActiveAt: d.last_active_at,
    })),
    status: raw.status,
    updatedAt: raw.updated_at,
    processedAt: raw.processed_at,
    remark: raw.remark,
    operator: raw.operator,
    banCount: raw.ban_count,
    banDays: raw.ban_days,
    banExpiresAt: raw.ban_expires_at,
  };
}

export function normalizeActionLog(raw: RawActionLog): ActionLog {
  return {
    id: raw.id,
    reportId: raw.report_id,
    action: raw.action,
    operator: raw.operator,
    remark: raw.remark,
    createdAt: raw.created_at,
  };
}

function buildQueryString(filters?: ReportFilters) {
  const params = new URLSearchParams();
  if (filters?.keyword) params.set("keyword", filters.keyword);
  if (filters?.status && filters.status !== "all") params.set("status", filters.status);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
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

export async function getReportRecords(filters?: ReportFilters) {
  const data = await requestJson<ReportListResponse>(
    `/api/reports${buildQueryString(filters)}`
  );
  return data.data.map(normalizeReportRecord);
}

async function updateReport(
  id: string,
  action: "process" | "revoke" | "reject",
  remark?: string,
): Promise<ReportRecord> {
  const data = await requestJson<ReportActionResponse>(
    `/api/reports/${id}/${action}`,
    {
      method: "POST",
      body: JSON.stringify({ remark, operator: DEFAULT_OPERATOR }),
    }
  );
  return normalizeReportRecord(data.data);
}

export function processReport(id: string, remark?: string) {
  return updateReport(id, "process", remark);
}

export function revokeReport(id: string, remark?: string) {
  return updateReport(id, "revoke", remark);
}

export function rejectReport(id: string, remark?: string) {
  return updateReport(id, "reject", remark);
}

export async function getActionLogs(reportId: string): Promise<ActionLog[]> {
  const data = await requestJson<ActionLogListResponse>(
    `/api/reports/${reportId}/logs`
  );
  return data.data.map(normalizeActionLog);
}

export async function getReportsByUid(uid: string): Promise<ReportRecord[]> {
  const data = await requestJson<ReportListResponse>(
    `/api/users/${uid}/reports`
  );
  return data.data.map(normalizeReportRecord);
}

export async function batchProcessReports(ids: string[], remark?: string) {
  const data = await requestJson<BatchActionResponse>("/api/reports/batch", {
    method: "POST",
    body: JSON.stringify({ ids, action: "process", remark: remark ?? "", operator: DEFAULT_OPERATOR }),
  });
  return data.data.map(normalizeReportRecord);
}

export async function batchRevokeReports(ids: string[], remark?: string) {
  const data = await requestJson<BatchActionResponse>("/api/reports/batch", {
    method: "POST",
    body: JSON.stringify({ ids, action: "revoke", remark: remark ?? "", operator: DEFAULT_OPERATOR }),
  });
  return data.data.map(normalizeReportRecord);
}

export async function batchRejectReports(ids: string[], remark?: string) {
  const data = await requestJson<BatchActionResponse>("/api/reports/batch", {
    method: "POST",
    body: JSON.stringify({ ids, action: "reject", remark: remark ?? "", operator: DEFAULT_OPERATOR }),
  });
  return data.data.map(normalizeReportRecord);
}
