export type ReportStatus = "pending" | "processed";

export type ReportAction = "process" | "revoke";

export type DeviceType = "phone" | "tablet" | "pc";

export interface ReporterInfo {
  id: string;
  name: string;
  reportReason: string;
  reportedAt: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  lastActiveAt: string;
}

export interface ReportRecord {
  id: string;
  uid: string;
  nickname: string;
  workId: string;
  workName: string;
  reporters: ReporterInfo[];
  totalReadMinutes: number;
  monthlyReadMinutes: number;
  totalPaidAmount: number;
  recentPaidAmount: number;
  monthlyDeviceCount: number;
  devices?: DeviceInfo[];
  status: ReportStatus;
  updatedAt: string;
  processedAt?: string;
  remark?: string;
  operator?: string;
  banCount?: number;
  banDays?: number;
  banExpiresAt?: string;
}

export interface ReportFilters {
  keyword?: string;
  status?: ReportStatus | "all";
}

export interface RawDeviceInfo {
  device_id: string;
  device_name: string;
  device_type: DeviceType;
  last_active_at: string;
}

export interface RawReporterInfo {
  reporter_id: string;
  reporter_name: string;
  reason: string;
  reported_at: string;
}

export interface RawReportRecord {
  id: string;
  user_uid: string;
  user_nickname: string;
  content_id: string;
  content_title: string;
  reporters: RawReporterInfo[];
  history_read_seconds: number;
  month_read_seconds: number;
  history_paid_fen: number;
  recent_paid_fen: number;
  month_device_count: number;
  devices?: RawDeviceInfo[];
  status: ReportStatus;
  updated_at: string;
  processed_at?: string;
  remark?: string;
  operator?: string;
  ban_count?: number;
  ban_days?: number;
  ban_expires_at?: string;
}

export interface RawActionLog {
  id: string;
  report_id: string;
  action: ReportAction;
  operator: string;
  remark: string;
  created_at: string;
}

export interface ActionLog {
  id: string;
  reportId: string;
  action: ReportAction;
  operator: string;
  remark: string;
  createdAt: string;
}

export interface ReportListResponse {
  data: RawReportRecord[];
}

export interface ReportActionResponse {
  data: RawReportRecord;
  message: string;
}

export interface ActionLogListResponse {
  data: RawActionLog[];
}

export interface BatchActionRequest {
  ids: string[];
  action: ReportAction;
  remark: string;
  operator: string;
}

export interface BatchActionResponse {
  data: RawReportRecord[];
  message: string;
}
