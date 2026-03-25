export type AuthorReportStatus = "pending" | "processing" | "banned" | "rejected";

export const REPORT_REASONS = [
  "阅读时长异常偏高",
  "疑似多人共用账号",
  "设备数量异常",
  "付费与使用不匹配",
  "其他",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export interface LeaderboardUser {
  uid: string;
  nickname: string;
  readHours: number;
  mobileReadHours: number;
  pcReadHours: number;
  rank: number;
  reportStatus?: AuthorReportStatus;
  reportId?: string;
}

export interface RawLeaderboardUser {
  uid: string;
  nickname: string;
  read_hours: number;
  mobile_read_hours: number;
  pc_read_hours: number;
  rank: number;
  report_status?: AuthorReportStatus;
  report_id?: string;
}

export interface AuthorReportRecord {
  id: string;
  authorId: string;
  authorName: string;
  workId: string;
  workName: string;
  targetUid: string;
  targetNickname: string;
  readHours: number;
  reasons: string[];
  description?: string;
  status: AuthorReportStatus;
  result?: string;
  banDays?: number;
  createdAt: string;
  processedAt?: string;
}

export interface RawAuthorReportRecord {
  id: string;
  author_id: string;
  author_name: string;
  work_id: string;
  work_name: string;
  target_uid: string;
  target_nickname: string;
  read_hours: number;
  reasons: string[];
  description?: string;
  status: AuthorReportStatus;
  result?: string;
  ban_days?: number;
  created_at: string;
  processed_at?: string;
}

export interface SubmitReportRequest {
  work_id: string;
  work_name: string;
  targets: { uid: string; nickname: string; read_hours: number }[];
  reasons: string[];
  description?: string;
}

export interface LeaderboardResponse {
  data: RawLeaderboardUser[];
  work_name: string;
  available_months: string[];
  latest_month: string;
  current_month: string;
}

export interface AuthorReportListResponse {
  data: RawAuthorReportRecord[];
}

export interface SubmitReportResponse {
  data: RawAuthorReportRecord[];
  message: string;
}
