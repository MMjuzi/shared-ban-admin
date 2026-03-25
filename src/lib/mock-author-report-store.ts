import type {
  AuthorReportStatus,
  RawAuthorReportRecord,
  RawLeaderboardUser,
} from "@/types/author-report";

// --- 作品数据 ---
interface WorkInfo {
  id: string;
  name: string;
  platform: string;
}

const works: WorkInfo[] = [
  { id: "work-7781", name: "深夜回响", platform: "橙光" },
  { id: "work-4402", name: "无尽海风", platform: "橙光" },
  { id: "work-9923", name: "荒野终章", platform: "番茄" },
  { id: "work-6109", name: "银河铁道之夜", platform: "橙光" },
  { id: "work-5583", name: "星辰大海", platform: "番茄" },
];

export function getWorkList() {
  return works;
}

export function getWorkById(id: string) {
  return works.find((w) => w.id === id);
}

// --- 榜单基础数据（全部历史） ---
interface BaseLeaderboardUser {
  uid: string;
  nickname: string;
  read_hours: number;
  mobile_read_hours: number;
  pc_read_hours: number;
  rank: number;
}

const leaderboards: Record<string, BaseLeaderboardUser[]> = {
  "work-7781": [
    { uid: "74333409", nickname: "镶嵌行凶的句点", read_hours: 80.78, mobile_read_hours: 80.78, pc_read_hours: 0, rank: 1 },
    { uid: "5341949", nickname: "紫韵忆瑰", read_hours: 34.38, mobile_read_hours: 34.38, pc_read_hours: 0, rank: 2 },
    { uid: "55244017", nickname: "hg55244017", read_hours: 23.26, mobile_read_hours: 23.26, pc_read_hours: 0, rank: 3 },
    { uid: "83440333", nickname: "闲鱼爱薯片", read_hours: 19.97, mobile_read_hours: 19.97, pc_read_hours: 0, rank: 4 },
    { uid: "47457215", nickname: "ヾ陌宁、", read_hours: 19.37, mobile_read_hours: 19.37, pc_read_hours: 0, rank: 5 },
    { uid: "28109024", nickname: "南风诗萝", read_hours: 19.09, mobile_read_hours: 19.09, pc_read_hours: 0, rank: 6 },
    { uid: "90485019", nickname: "real_pynn7", read_hours: 18.59, mobile_read_hours: 18.59, pc_read_hours: 0, rank: 7 },
    { uid: "91104103", nickname: "请叫我兔姐", read_hours: 16.82, mobile_read_hours: 16.82, pc_read_hours: 0, rank: 8 },
    { uid: "92107607", nickname: "僮仔仔", read_hours: 14.8, mobile_read_hours: 14.8, pc_read_hours: 0, rank: 9 },
    { uid: "32891045", nickname: "晚风听雨", read_hours: 14.67, mobile_read_hours: 12.17, pc_read_hours: 2.5, rank: 10 },
    { uid: "66820194", nickname: "暮色星辰", read_hours: 13.21, mobile_read_hours: 10.21, pc_read_hours: 3.0, rank: 11 },
    { uid: "50983712", nickname: "云端旅人", read_hours: 12.44, mobile_read_hours: 8.44, pc_read_hours: 4.0, rank: 12 },
    { uid: "43218907", nickname: "青鸟飞鱼", read_hours: 11.88, mobile_read_hours: 11.88, pc_read_hours: 0, rank: 13 },
    { uid: "78543216", nickname: "追光者", read_hours: 10.52, mobile_read_hours: 10.52, pc_read_hours: 0, rank: 14 },
    { uid: "21098765", nickname: "晓风残月", read_hours: 9.73, mobile_read_hours: 6.73, pc_read_hours: 3.0, rank: 15 },
  ],
  "work-4402": [
    { uid: "55671209", nickname: "白露未晞", read_hours: 52.10, mobile_read_hours: 48.10, pc_read_hours: 4.0, rank: 1 },
    { uid: "66820194", nickname: "暮色星辰", read_hours: 28.30, mobile_read_hours: 28.30, pc_read_hours: 0, rank: 2 },
    { uid: "43218907", nickname: "青鸟飞鱼", read_hours: 21.45, mobile_read_hours: 21.45, pc_read_hours: 0, rank: 3 },
    { uid: "78543216", nickname: "追光者", read_hours: 18.90, mobile_read_hours: 15.90, pc_read_hours: 3.0, rank: 4 },
    { uid: "90485019", nickname: "real_pynn7", read_hours: 15.60, mobile_read_hours: 15.60, pc_read_hours: 0, rank: 5 },
    { uid: "83440333", nickname: "闲鱼爱薯片", read_hours: 12.33, mobile_read_hours: 12.33, pc_read_hours: 0, rank: 6 },
    { uid: "21098765", nickname: "晓风残月", read_hours: 10.21, mobile_read_hours: 10.21, pc_read_hours: 0, rank: 7 },
    { uid: "50983712", nickname: "云端旅人", read_hours: 8.77, mobile_read_hours: 5.77, pc_read_hours: 3.0, rank: 8 },
    { uid: "74333409", nickname: "镶嵌行凶的句点", read_hours: 7.50, mobile_read_hours: 7.50, pc_read_hours: 0, rank: 9 },
    { uid: "5341949", nickname: "紫韵忆瑰", read_hours: 6.20, mobile_read_hours: 6.20, pc_read_hours: 0, rank: 10 },
  ],
  "work-9923": [
    { uid: "99347821", nickname: "月下寻光", read_hours: 140.17, mobile_read_hours: 100.17, pc_read_hours: 40.0, rank: 1 },
    { uid: "74333409", nickname: "镶嵌行凶的句点", read_hours: 45.60, mobile_read_hours: 45.60, pc_read_hours: 0, rank: 2 },
    { uid: "83440333", nickname: "闲鱼爱薯片", read_hours: 30.12, mobile_read_hours: 30.12, pc_read_hours: 0, rank: 3 },
    { uid: "66820194", nickname: "暮色星辰", read_hours: 22.80, mobile_read_hours: 18.80, pc_read_hours: 4.0, rank: 4 },
    { uid: "43218907", nickname: "青鸟飞鱼", read_hours: 18.50, mobile_read_hours: 18.50, pc_read_hours: 0, rank: 5 },
    { uid: "50983712", nickname: "云端旅人", read_hours: 14.30, mobile_read_hours: 14.30, pc_read_hours: 0, rank: 6 },
    { uid: "21098765", nickname: "晓风残月", read_hours: 11.60, mobile_read_hours: 8.60, pc_read_hours: 3.0, rank: 7 },
    { uid: "78543216", nickname: "追光者", read_hours: 9.40, mobile_read_hours: 9.40, pc_read_hours: 0, rank: 8 },
  ],
  "work-6109": [
    { uid: "56230198", nickname: "行止", read_hours: 144.00, mobile_read_hours: 120.00, pc_read_hours: 24.0, rank: 1 },
    { uid: "74333409", nickname: "镶嵌行凶的句点", read_hours: 38.20, mobile_read_hours: 38.20, pc_read_hours: 0, rank: 2 },
    { uid: "90485019", nickname: "real_pynn7", read_hours: 25.40, mobile_read_hours: 25.40, pc_read_hours: 0, rank: 3 },
    { uid: "83440333", nickname: "闲鱼爱薯片", read_hours: 20.10, mobile_read_hours: 20.10, pc_read_hours: 0, rank: 4 },
    { uid: "66820194", nickname: "暮色星辰", read_hours: 16.70, mobile_read_hours: 12.70, pc_read_hours: 4.0, rank: 5 },
    { uid: "43218907", nickname: "青鸟飞鱼", read_hours: 13.50, mobile_read_hours: 13.50, pc_read_hours: 0, rank: 6 },
    { uid: "50983712", nickname: "云端旅人", read_hours: 10.80, mobile_read_hours: 7.80, pc_read_hours: 3.0, rank: 7 },
    { uid: "21098765", nickname: "晓风残月", read_hours: 8.20, mobile_read_hours: 8.20, pc_read_hours: 0, rank: 8 },
    { uid: "78543216", nickname: "追光者", read_hours: 6.90, mobile_read_hours: 6.90, pc_read_hours: 0, rank: 9 },
    { uid: "5341949", nickname: "紫韵忆瑰", read_hours: 5.10, mobile_read_hours: 5.10, pc_read_hours: 0, rank: 10 },
  ],
  "work-5583": [
    { uid: "86304172", nickname: "浮生若梦", read_hours: 400.00, mobile_read_hours: 320.00, pc_read_hours: 80.0, rank: 1 },
    { uid: "74333409", nickname: "镶嵌行凶的句点", read_hours: 55.30, mobile_read_hours: 55.30, pc_read_hours: 0, rank: 2 },
    { uid: "83440333", nickname: "闲鱼爱薯片", read_hours: 32.10, mobile_read_hours: 32.10, pc_read_hours: 0, rank: 3 },
    { uid: "66820194", nickname: "暮色星辰", read_hours: 24.60, mobile_read_hours: 20.60, pc_read_hours: 4.0, rank: 4 },
    { uid: "43218907", nickname: "青鸟飞鱼", read_hours: 19.80, mobile_read_hours: 19.80, pc_read_hours: 0, rank: 5 },
    { uid: "90485019", nickname: "real_pynn7", read_hours: 15.20, mobile_read_hours: 15.20, pc_read_hours: 0, rank: 6 },
    { uid: "50983712", nickname: "云端旅人", read_hours: 11.40, mobile_read_hours: 8.40, pc_read_hours: 3.0, rank: 7 },
    { uid: "21098765", nickname: "晓风残月", read_hours: 8.90, mobile_read_hours: 8.90, pc_read_hours: 0, rank: 8 },
  ],
};

function generateMonthlyData(baseList: BaseLeaderboardUser[], month: string): BaseLeaderboardUser[] {
  const seed = month.split("-").reduce((a, b) => a + parseInt(b, 10), 0);
  const ratio = 0.2 + (seed % 10) * 0.05;
  return baseList.map((u, i) => {
    const monthlyTotal = parseFloat((u.read_hours * ratio * (1 - i * 0.02)).toFixed(2));
    const monthlyMobile = parseFloat((u.mobile_read_hours * ratio * (1 - i * 0.02)).toFixed(2));
    const monthlyPc = parseFloat(Math.max(0, monthlyTotal - monthlyMobile).toFixed(2));
    return { ...u, read_hours: monthlyTotal, mobile_read_hours: monthlyMobile, pc_read_hours: monthlyPc };
  });
}

export function getAvailableMonths(): string[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export function getLatestMonth(): string {
  return getAvailableMonths()[0];
}

// --- 作者举报记录 ---
const DEFAULT_AUTHOR_ID = "author-001";
const DEFAULT_AUTHOR_NAME = "当前作者";

let reportIdCounter = 200;
function nextReportId() {
  return `ar-${++reportIdCounter}`;
}

const authorReports: RawAuthorReportRecord[] = [
  {
    id: "ar-101",
    author_id: DEFAULT_AUTHOR_ID,
    author_name: DEFAULT_AUTHOR_NAME,
    work_id: "work-7781",
    work_name: "深夜回响",
    target_uid: "74333409",
    target_nickname: "镶嵌行凶的句点",
    read_hours: 80.78,
    reasons: ["阅读时长异常偏高", "疑似多人共用账号"],
    description: "该用户阅读时长远超第二名一倍以上，且IP来源分散",
    status: "banned",
    result: "确认共享行为，已封号3天",
    ban_days: 3,
    created_at: "2026-03-20T14:30:00+08:00",
    processed_at: "2026-03-21T09:15:00+08:00",
  },
  {
    id: "ar-102",
    author_id: DEFAULT_AUTHOR_ID,
    author_name: DEFAULT_AUTHOR_NAME,
    work_id: "work-7781",
    work_name: "深夜回响",
    target_uid: "32891045",
    target_nickname: "晚风听雨",
    read_hours: 14.67,
    reasons: ["设备数量异常"],
    status: "pending",
    created_at: "2026-03-23T16:20:00+08:00",
  },
  {
    id: "ar-103",
    author_id: DEFAULT_AUTHOR_ID,
    author_name: DEFAULT_AUTHOR_NAME,
    work_id: "work-4402",
    work_name: "无尽海风",
    target_uid: "55671209",
    target_nickname: "白露未晞",
    read_hours: 52.10,
    reasons: ["阅读时长异常偏高", "付费与使用不匹配"],
    description: "阅读时长极高但几乎无付费行为",
    status: "banned",
    result: "多端同时在线证据充分，确认封号",
    ban_days: 3,
    created_at: "2026-03-19T10:00:00+08:00",
    processed_at: "2026-03-23T16:30:00+08:00",
  },
  {
    id: "ar-104",
    author_id: DEFAULT_AUTHOR_ID,
    author_name: DEFAULT_AUTHOR_NAME,
    work_id: "work-9923",
    work_name: "荒野终章",
    target_uid: "99347821",
    target_nickname: "月下寻光",
    read_hours: 140.17,
    reasons: ["阅读时长异常偏高", "疑似多人共用账号", "设备数量异常"],
    description: "单作品阅读140+小时严重异常",
    status: "processing",
    created_at: "2026-03-24T09:00:00+08:00",
  },
  {
    id: "ar-105",
    author_id: DEFAULT_AUTHOR_ID,
    author_name: DEFAULT_AUTHOR_NAME,
    work_id: "work-5583",
    work_name: "星辰大海",
    target_uid: "86304172",
    target_nickname: "浮生若梦",
    read_hours: 400.00,
    reasons: ["阅读时长异常偏高", "疑似多人共用账号", "设备数量异常", "付费与使用不匹配"],
    description: "400小时阅读量极度异常，二手平台有售卖截图",
    status: "pending",
    created_at: "2026-03-24T11:50:00+08:00",
  },
  {
    id: "ar-106",
    author_id: DEFAULT_AUTHOR_ID,
    author_name: DEFAULT_AUTHOR_NAME,
    work_id: "work-6109",
    work_name: "银河铁道之夜",
    target_uid: "56230198",
    target_nickname: "行止",
    read_hours: 144.00,
    reasons: ["阅读时长异常偏高"],
    status: "rejected",
    result: "经核实为用户本人正常使用行为",
    created_at: "2026-03-18T15:30:00+08:00",
    processed_at: "2026-03-20T10:00:00+08:00",
  },
];

// --- 查询函数 ---

export function getLeaderboard(workId: string, month?: string): RawLeaderboardUser[] {
  const baseList = leaderboards[workId];
  if (!baseList) return [];

  const list = month ? generateMonthlyData(baseList, month) : baseList;

  return list.map((u) => {
    const report = authorReports.find(
      (r) =>
        r.work_id === workId &&
        r.target_uid === u.uid &&
        r.author_id === DEFAULT_AUTHOR_ID
    );
    return {
      ...u,
      report_status: report?.status,
      report_id: report?.id,
    };
  });
}

export function getAuthorReports(authorId: string): RawAuthorReportRecord[] {
  return structuredClone(
    authorReports
      .filter((r) => r.author_id === authorId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  );
}

export function getAllAuthorReports(): RawAuthorReportRecord[] {
  return getAuthorReports(DEFAULT_AUTHOR_ID);
}

export function submitAuthorReport(data: {
  work_id: string;
  work_name: string;
  targets: { uid: string; nickname: string; read_hours: number }[];
  reasons: string[];
  description?: string;
}): RawAuthorReportRecord[] {
  const results: RawAuthorReportRecord[] = [];
  for (const target of data.targets) {
    const existing = authorReports.find(
      (r) =>
        r.work_id === data.work_id &&
        r.target_uid === target.uid &&
        r.author_id === DEFAULT_AUTHOR_ID
    );
    if (existing) continue;

    const record: RawAuthorReportRecord = {
      id: nextReportId(),
      author_id: DEFAULT_AUTHOR_ID,
      author_name: DEFAULT_AUTHOR_NAME,
      work_id: data.work_id,
      work_name: data.work_name,
      target_uid: target.uid,
      target_nickname: target.nickname,
      read_hours: target.read_hours,
      reasons: data.reasons,
      description: data.description,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    authorReports.push(record);
    results.push(structuredClone(record));
  }
  return results;
}

export function updateAuthorReportStatus(
  targetUid: string,
  workId: string,
  status: AuthorReportStatus,
  result?: string,
  banDays?: number,
) {
  const report = authorReports.find(
    (r) => r.target_uid === targetUid && r.work_id === workId
  );
  if (!report) return;
  report.status = status;
  report.result = result;
  report.ban_days = banDays;
  if (status === "banned" || status === "rejected") {
    report.processed_at = new Date().toISOString();
  }
}

export { DEFAULT_AUTHOR_ID };
