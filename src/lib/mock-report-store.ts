import {
  type RawActionLog,
  type RawDeviceInfo,
  type RawReportRecord,
  type ReportAction,
  type ReportStatus,
} from "@/types/report";

let logIdCounter = 100;

function nextLogId() {
  return `log-${++logIdCounter}`;
}

// --- 封号时长递增规则 ---
// 第1次=3天，第2次=7天，之后每次+7天（14,21,28...）
export function calcBanDays(banCount: number): number {
  if (banCount <= 0) return 0;
  if (banCount === 1) return 3;
  return banCount * 7;
}

function calcBanExpiresAt(processedAt: string, banDays: number): string {
  const d = new Date(processedAt);
  d.setDate(d.getDate() + banDays);
  return d.toISOString();
}

// --- 设备 mock 数据生成 ---
const phoneModels = ["iPhone 15 Pro", "iPhone 14", "iPhone 13 mini", "Pixel 8 Pro", "小米 14", "OPPO Find X7", "vivo X100", "华为 Mate 60", "三星 S24", "Redmi K70"];
const tabletModels = ["iPad Pro 12.9", "iPad Air", "iPad mini", "华为 MatePad", "小米平板 6"];
const pcModels = ["Windows PC", "MacBook Pro", "MacBook Air", "Windows 笔记本", "iMac", "ThinkPad X1"];

function seededDevices(reportId: string, count: number): RawDeviceInfo[] {
  let seed = 0;
  for (let i = 0; i < reportId.length; i++) seed = ((seed << 5) - seed + reportId.charCodeAt(i)) | 0;
  const rng = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed & 0x7fffffff) / 2147483647; };

  const devices: RawDeviceInfo[] = [];
  for (let i = 0; i < count; i++) {
    const r = rng();
    let type: "phone" | "tablet" | "pc";
    let name: string;
    if (r < 0.55) {
      type = "phone";
      name = phoneModels[Math.floor(rng() * phoneModels.length)];
    } else if (r < 0.75) {
      type = "tablet";
      name = tabletModels[Math.floor(rng() * tabletModels.length)];
    } else {
      type = "pc";
      name = pcModels[Math.floor(rng() * pcModels.length)];
    }
    const hoursAgo = Math.floor(rng() * 72);
    const lastActive = new Date(Date.now() - hoursAgo * 3600_000).toISOString();

    devices.push({
      device_id: `dev-${reportId.slice(-4)}-${i + 1}`,
      device_name: name,
      device_type: type,
      last_active_at: lastActive,
    });
  }
  return devices;
}

const initialReports: RawReportRecord[] = [
  {
    id: "report-1001",
    user_uid: "32891045",
    user_nickname: "晚风听雨",
    content_id: "work-7781",
    content_title: "深夜回响",
    reporters: [
      { reporter_id: "u-9021", reporter_name: "墨色星河", reason: "同一账号在多设备频繁切换阅读", reported_at: "2026-03-21T10:20:00+08:00" },
      { reporter_id: "u-8142", reporter_name: "橙子拿铁", reason: "疑似共享号低价外借", reported_at: "2026-03-22T18:45:00+08:00" },
      { reporter_id: "u-7788", reporter_name: "浅夏", reason: "设备指纹异常", reported_at: "2026-03-23T09:12:00+08:00" },
    ],
    history_read_seconds: 483200, month_read_seconds: 52800,
    history_paid_fen: 158000, recent_paid_fen: 9800,
    month_device_count: 7, status: "pending",
    updated_at: "2026-03-24T10:10:00+08:00",
  },
  {
    id: "report-1002",
    user_uid: "55671209",
    user_nickname: "白露未晞",
    content_id: "work-4402",
    content_title: "无尽海风",
    reporters: [
      { reporter_id: "u-6311", reporter_name: "山野来信", reason: "凌晨多端同时在线", reported_at: "2026-03-20T22:35:00+08:00" },
      { reporter_id: "u-1006", reporter_name: "风铃木", reason: "账号疑似被多人共用", reported_at: "2026-03-22T08:15:00+08:00" },
    ],
    history_read_seconds: 239400, month_read_seconds: 31200,
    history_paid_fen: 76000, recent_paid_fen: 4200,
    month_device_count: 5, status: "processed",
    updated_at: "2026-03-23T17:00:00+08:00", processed_at: "2026-03-23T16:30:00+08:00",
    remark: "多端同时在线证据充分，确认封号", operator: "张运营",
    ban_count: 1, ban_days: 3, ban_expires_at: "2026-03-26T16:30:00+08:00",
  },
  {
    id: "report-1003",
    user_uid: "99347821",
    user_nickname: "月下寻光",
    content_id: "work-9923",
    content_title: "荒野终章",
    reporters: [
      { reporter_id: "u-4097", reporter_name: "青柠气泡", reason: "同作品阅读时长增长异常", reported_at: "2026-03-24T09:55:00+08:00" },
    ],
    history_read_seconds: 125000, month_read_seconds: 84100,
    history_paid_fen: 22800, recent_paid_fen: 18000,
    month_device_count: 4, status: "pending",
    updated_at: "2026-03-24T11:25:00+08:00",
  },
  {
    id: "report-1004",
    user_uid: "18453276",
    user_nickname: "长街灯火",
    content_id: "work-3108",
    content_title: "霜夜列车",
    reporters: [
      { reporter_id: "u-5120", reporter_name: "南枝", reason: "同账号在异地设备快速切换", reported_at: "2026-03-18T21:10:00+08:00" },
      { reporter_id: "u-5121", reporter_name: "初禾", reason: "疑似租借账号给他人阅读", reported_at: "2026-03-19T08:30:00+08:00" },
    ],
    history_read_seconds: 566700, month_read_seconds: 73400,
    history_paid_fen: 188600, recent_paid_fen: 13600,
    month_device_count: 8, status: "pending",
    updated_at: "2026-03-24T08:40:00+08:00",
  },
  {
    id: "report-1005",
    user_uid: "72004318",
    user_nickname: "星野千寻",
    content_id: "work-5560",
    content_title: "逆光之城",
    reporters: [
      { reporter_id: "u-2451", reporter_name: "拾一", reason: "连续多天出现设备数异常", reported_at: "2026-03-17T15:12:00+08:00" },
    ],
    history_read_seconds: 194500, month_read_seconds: 46200,
    history_paid_fen: 54300, recent_paid_fen: 9700,
    month_device_count: 6, status: "processed",
    updated_at: "2026-03-22T13:06:00+08:00", processed_at: "2026-03-22T12:48:00+08:00",
    remark: "设备数连续 5 天超阈值，封号处理", operator: "李运营",
    ban_count: 2, ban_days: 7, ban_expires_at: "2026-03-29T12:48:00+08:00",
  },
  {
    id: "report-1006",
    user_uid: "44190872",
    user_nickname: "松间照",
    content_id: "work-1183",
    content_title: "孤岛邮差",
    reporters: [
      { reporter_id: "u-7610", reporter_name: "栀子白", reason: "当月阅读时长异常偏高", reported_at: "2026-03-23T11:36:00+08:00" },
      { reporter_id: "u-7611", reporter_name: "云深处", reason: "怀疑共享号集中刷时长", reported_at: "2026-03-23T12:16:00+08:00" },
      { reporter_id: "u-7612", reporter_name: "听潮", reason: "设备数与付费水平明显不匹配", reported_at: "2026-03-23T14:05:00+08:00" },
    ],
    history_read_seconds: 318800, month_read_seconds: 102300,
    history_paid_fen: 46200, recent_paid_fen: 2100,
    month_device_count: 9, status: "pending",
    updated_at: "2026-03-24T09:18:00+08:00",
  },
  {
    id: "report-1007",
    user_uid: "88543120",
    user_nickname: "见山",
    content_id: "work-8904",
    content_title: "旧时微光",
    reporters: [
      { reporter_id: "u-6120", reporter_name: "半盏秋", reason: "多个举报人反馈账号被多人轮流使用", reported_at: "2026-03-21T16:40:00+08:00" },
      { reporter_id: "u-6121", reporter_name: "木槿", reason: "阅读设备来源异常分散", reported_at: "2026-03-22T09:24:00+08:00" },
    ],
    history_read_seconds: 274900, month_read_seconds: 58700,
    history_paid_fen: 93400, recent_paid_fen: 8500,
    month_device_count: 7, status: "processed",
    updated_at: "2026-03-23T20:15:00+08:00", processed_at: "2026-03-23T19:40:00+08:00",
    remark: "设备来源异常分散，确认共享行为", operator: "张运营",
    ban_count: 1, ban_days: 3, ban_expires_at: "2026-03-26T19:40:00+08:00",
  },
  {
    id: "report-1008",
    user_uid: "60018392",
    user_nickname: "小半夏",
    content_id: "work-2049",
    content_title: "沉眠森林",
    reporters: [
      { reporter_id: "u-3312", reporter_name: "苏叶", reason: "多设备反复登录同一作品", reported_at: "2026-03-19T19:50:00+08:00" },
    ],
    history_read_seconds: 88000, month_read_seconds: 22800,
    history_paid_fen: 12500, recent_paid_fen: 3200,
    month_device_count: 3, status: "pending",
    updated_at: "2026-03-24T07:50:00+08:00",
  },
  {
    id: "report-1009",
    user_uid: "91762054",
    user_nickname: "鹿鸣溪",
    content_id: "work-6742",
    content_title: "云端彼岸",
    reporters: [
      { reporter_id: "u-8450", reporter_name: "西洲", reason: "当月设备数量异常升高", reported_at: "2026-03-20T10:05:00+08:00" },
      { reporter_id: "u-8451", reporter_name: "洛川", reason: "疑似对外共享账号", reported_at: "2026-03-21T13:55:00+08:00" },
      { reporter_id: "u-8452", reporter_name: "阿芜", reason: "历史付费与使用规模不匹配", reported_at: "2026-03-22T09:45:00+08:00" },
      { reporter_id: "u-8453", reporter_name: "南歌", reason: "同一时段阅读来源异常", reported_at: "2026-03-22T18:10:00+08:00" },
    ],
    history_read_seconds: 612000, month_read_seconds: 120400,
    history_paid_fen: 70200, recent_paid_fen: 2800,
    month_device_count: 10, status: "pending",
    updated_at: "2026-03-24T10:52:00+08:00",
  },
  {
    id: "report-1010",
    user_uid: "30567184",
    user_nickname: "雾里青",
    content_id: "work-4615",
    content_title: "风起长河",
    reporters: [
      { reporter_id: "u-2157", reporter_name: "繁星", reason: "作品付费后短时间内多端访问", reported_at: "2026-03-18T14:25:00+08:00" },
      { reporter_id: "u-2158", reporter_name: "江月", reason: "怀疑共享号组织化使用", reported_at: "2026-03-18T18:35:00+08:00" },
    ],
    history_read_seconds: 455100, month_read_seconds: 40500,
    history_paid_fen: 136000, recent_paid_fen: 6000,
    month_device_count: 6, status: "processed",
    updated_at: "2026-03-22T16:18:00+08:00", processed_at: "2026-03-22T15:58:00+08:00",
    remark: "组织化共享嫌疑，多端付费后立即分发", operator: "王运营",
    ban_count: 3, ban_days: 14, ban_expires_at: "2026-04-05T15:58:00+08:00",
  },
  {
    id: "report-1011",
    user_uid: "12870943",
    user_nickname: "秋池",
    content_id: "work-7788",
    content_title: "纸上回廊",
    reporters: [
      { reporter_id: "u-9051", reporter_name: "白榆", reason: "夜间多端切换频率过高", reported_at: "2026-03-24T01:12:00+08:00" },
    ],
    history_read_seconds: 143200, month_read_seconds: 69200,
    history_paid_fen: 35000, recent_paid_fen: 12800,
    month_device_count: 5, status: "pending",
    updated_at: "2026-03-24T11:02:00+08:00",
  },
  {
    id: "report-1012",
    user_uid: "66251840",
    user_nickname: "千山雪",
    content_id: "work-3126",
    content_title: "春日信札",
    reporters: [
      { reporter_id: "u-5520", reporter_name: "阿遥", reason: "举报账号在短期内登录设备过多", reported_at: "2026-03-19T09:00:00+08:00" },
      { reporter_id: "u-5521", reporter_name: "莓莓", reason: "同一部作品被多人举报", reported_at: "2026-03-20T11:22:00+08:00" },
    ],
    history_read_seconds: 205500, month_read_seconds: 37300,
    history_paid_fen: 41200, recent_paid_fen: 1900,
    month_device_count: 8, status: "pending",
    updated_at: "2026-03-23T22:10:00+08:00",
  },
  {
    id: "report-1013",
    user_uid: "47392168",
    user_nickname: "向晚",
    content_id: "work-9981",
    content_title: "彼时花开",
    reporters: [
      { reporter_id: "u-7060", reporter_name: "清禾", reason: "长时间阅读但近月付费极低", reported_at: "2026-03-21T07:45:00+08:00" },
    ],
    history_read_seconds: 392700, month_read_seconds: 28000,
    history_paid_fen: 26900, recent_paid_fen: 600,
    month_device_count: 6, status: "processed",
    updated_at: "2026-03-22T10:44:00+08:00", processed_at: "2026-03-22T09:50:00+08:00",
    remark: "付费极低但阅读量极高，确认共享嫌疑", operator: "李运营",
    ban_count: 1, ban_days: 3, ban_expires_at: "2026-03-25T09:50:00+08:00",
  },
  {
    id: "report-1014",
    user_uid: "79016425",
    user_nickname: "北秋",
    content_id: "work-4271",
    content_title: "潮声未眠",
    reporters: [
      { reporter_id: "u-6631", reporter_name: "折枝", reason: "疑似账号多人拼单阅读", reported_at: "2026-03-23T17:05:00+08:00" },
      { reporter_id: "u-6632", reporter_name: "夏木", reason: "设备数量持续超阈值", reported_at: "2026-03-23T18:40:00+08:00" },
      { reporter_id: "u-6633", reporter_name: "寻舟", reason: "作品阅读峰值异常集中", reported_at: "2026-03-24T08:20:00+08:00" },
    ],
    history_read_seconds: 509600, month_read_seconds: 94400,
    history_paid_fen: 118500, recent_paid_fen: 4100,
    month_device_count: 9, status: "pending",
    updated_at: "2026-03-24T10:30:00+08:00",
  },
  {
    id: "report-1015",
    user_uid: "25061439",
    user_nickname: "知微",
    content_id: "work-1520",
    content_title: "山海归途",
    reporters: [
      { reporter_id: "u-3871", reporter_name: "一川", reason: "多人反馈共享阅读行为", reported_at: "2026-03-20T20:30:00+08:00" },
      { reporter_id: "u-3872", reporter_name: "简宁", reason: "账号在不同设备类型同时活跃", reported_at: "2026-03-21T09:18:00+08:00" },
    ],
    history_read_seconds: 332900, month_read_seconds: 51400,
    history_paid_fen: 83600, recent_paid_fen: 7200,
    month_device_count: 7, status: "processed",
    updated_at: "2026-03-23T15:26:00+08:00", processed_at: "2026-03-23T14:40:00+08:00",
    remark: "不同设备类型同时活跃，判定共享", operator: "张运营",
    ban_count: 2, ban_days: 7, ban_expires_at: "2026-03-30T14:40:00+08:00",
  },
  {
    id: "report-1016",
    user_uid: "10248763",
    user_nickname: "临渊",
    content_id: "work-8817",
    content_title: "灯塔守望者",
    reporters: [
      { reporter_id: "u-1101", reporter_name: "琉璃", reason: "同一IP多账号交替阅读", reported_at: "2026-03-22T14:20:00+08:00" },
      { reporter_id: "u-1102", reporter_name: "晓枫", reason: "凌晨3点仍有多设备在线", reported_at: "2026-03-23T03:18:00+08:00" },
      { reporter_id: "u-1103", reporter_name: "云归", reason: "阅读行为模式与正常用户差异大", reported_at: "2026-03-23T10:45:00+08:00" },
      { reporter_id: "u-1104", reporter_name: "星辰", reason: "该账号疑似在群里售卖共享资格", reported_at: "2026-03-23T16:30:00+08:00" },
      { reporter_id: "u-1105", reporter_name: "白鸽", reason: "不同城市同时在线阅读", reported_at: "2026-03-24T08:05:00+08:00" },
    ],
    history_read_seconds: 892000, month_read_seconds: 198000,
    history_paid_fen: 268000, recent_paid_fen: 1500,
    month_device_count: 14, status: "pending",
    updated_at: "2026-03-24T11:30:00+08:00",
  },
  {
    id: "report-1017",
    user_uid: "83917204",
    user_nickname: "青瓷",
    content_id: "work-2233",
    content_title: "月色深处",
    reporters: [
      { reporter_id: "u-2201", reporter_name: "安然", reason: "当月新增设备数量暴涨", reported_at: "2026-03-24T07:30:00+08:00" },
    ],
    history_read_seconds: 45600, month_read_seconds: 38200,
    history_paid_fen: 8800, recent_paid_fen: 8800,
    month_device_count: 2, status: "pending",
    updated_at: "2026-03-24T09:00:00+08:00",
  },
  {
    id: "report-1018",
    user_uid: "56230198",
    user_nickname: "行止",
    content_id: "work-6109",
    content_title: "银河铁道之夜",
    reporters: [
      { reporter_id: "u-3301", reporter_name: "花楹", reason: "多个设备同时段阅读进度不同步", reported_at: "2026-03-19T20:15:00+08:00" },
      { reporter_id: "u-3302", reporter_name: "竹风", reason: "购买后立即出现多设备访问", reported_at: "2026-03-20T10:40:00+08:00" },
    ],
    history_read_seconds: 720000, month_read_seconds: 86400,
    history_paid_fen: 356000, recent_paid_fen: 28000,
    month_device_count: 11, status: "processed",
    updated_at: "2026-03-23T11:20:00+08:00", processed_at: "2026-03-23T11:05:00+08:00",
    remark: "高付费用户但设备数异常，确认共享后封号", operator: "王运营",
    ban_count: 1, ban_days: 3, ban_expires_at: "2026-03-26T11:05:00+08:00",
  },
  {
    id: "report-1019",
    user_uid: "41078356",
    user_nickname: "落笔成霜",
    content_id: "work-5547",
    content_title: "断崖书简",
    reporters: [
      { reporter_id: "u-4401", reporter_name: "楚辞", reason: "该用户曾被封号后解封，再次出现异常", reported_at: "2026-03-22T09:00:00+08:00" },
      { reporter_id: "u-4402", reporter_name: "明月", reason: "解封后设备数立刻回升至封号前水平", reported_at: "2026-03-23T14:20:00+08:00" },
      { reporter_id: "u-4403", reporter_name: "长安", reason: "阅读时长增长曲线不自然", reported_at: "2026-03-24T06:50:00+08:00" },
    ],
    history_read_seconds: 410000, month_read_seconds: 112000,
    history_paid_fen: 92000, recent_paid_fen: 5600,
    month_device_count: 8, status: "pending",
    updated_at: "2026-03-24T10:15:00+08:00",
  },
  {
    id: "report-1020",
    user_uid: "67845321",
    user_nickname: "无名氏",
    content_id: "work-3340",
    content_title: "迷雾边境",
    reporters: [
      { reporter_id: "u-5501", reporter_name: "澄心", reason: "单作品当月阅读时长超300小时", reported_at: "2026-03-21T18:00:00+08:00" },
    ],
    history_read_seconds: 1080000, month_read_seconds: 540000,
    history_paid_fen: 15000, recent_paid_fen: 500,
    month_device_count: 12, status: "pending",
    updated_at: "2026-03-24T08:00:00+08:00",
  },
  {
    id: "report-1021",
    user_uid: "29384756",
    user_nickname: "远山如黛",
    content_id: "work-7762",
    content_title: "故人来信",
    reporters: [
      { reporter_id: "u-6601", reporter_name: "念安", reason: "设备指纹重复率极高", reported_at: "2026-03-20T11:30:00+08:00" },
      { reporter_id: "u-6602", reporter_name: "逐光", reason: "同一WiFi下多设备登录", reported_at: "2026-03-21T15:42:00+08:00" },
    ],
    history_read_seconds: 267000, month_read_seconds: 48900,
    history_paid_fen: 62000, recent_paid_fen: 3800,
    month_device_count: 6, status: "processed",
    updated_at: "2026-03-22T18:30:00+08:00", processed_at: "2026-03-22T18:10:00+08:00",
    remark: "设备指纹高度重复，判定为模拟器刷量", operator: "李运营",
    ban_count: 1, ban_days: 3, ban_expires_at: "2026-03-25T18:10:00+08:00",
  },
  {
    id: "report-1022",
    user_uid: "95160482",
    user_nickname: "慕白",
    content_id: "work-1198",
    content_title: "黎明前的星",
    reporters: [
      { reporter_id: "u-7701", reporter_name: "清欢", reason: "每天固定时间段多设备轮流上线", reported_at: "2026-03-23T08:20:00+08:00" },
      { reporter_id: "u-7702", reporter_name: "拂柳", reason: "阅读时长与设备切换频率不匹配", reported_at: "2026-03-23T19:15:00+08:00" },
      { reporter_id: "u-7703", reporter_name: "霜降", reason: "疑似自动脚本控制多设备", reported_at: "2026-03-24T02:40:00+08:00" },
      { reporter_id: "u-7704", reporter_name: "子衿", reason: "账号登录地理位置跨越多省", reported_at: "2026-03-24T09:30:00+08:00" },
    ],
    history_read_seconds: 580000, month_read_seconds: 152000,
    history_paid_fen: 45000, recent_paid_fen: 1200,
    month_device_count: 13, status: "pending",
    updated_at: "2026-03-24T11:45:00+08:00",
  },
  {
    id: "report-1023",
    user_uid: "38471920",
    user_nickname: "时雨",
    content_id: "work-8845",
    content_title: "桃源旧梦",
    reporters: [
      { reporter_id: "u-8801", reporter_name: "素衣", reason: "历史付费极高但近月几乎为零", reported_at: "2026-03-18T16:50:00+08:00" },
    ],
    history_read_seconds: 198000, month_read_seconds: 15600,
    history_paid_fen: 420000, recent_paid_fen: 0,
    month_device_count: 4, status: "processed",
    updated_at: "2026-03-21T09:30:00+08:00", processed_at: "2026-03-21T09:15:00+08:00",
    remark: "高付费用户近月停止付费但持续使用，核实后为本人行为，误判撤销", operator: "王运营",
    ban_count: 1, ban_days: 3, ban_expires_at: "2026-03-24T09:15:00+08:00",
  },
  {
    id: "report-1024",
    user_uid: "74629183",
    user_nickname: "踏雪寻梅",
    content_id: "work-9201",
    content_title: "午后三点半",
    reporters: [
      { reporter_id: "u-9901", reporter_name: "鹿角", reason: "新注册账号短期内设备数暴增", reported_at: "2026-03-23T13:10:00+08:00" },
      { reporter_id: "u-9902", reporter_name: "予星", reason: "注册不到一周设备数达15台", reported_at: "2026-03-24T07:25:00+08:00" },
    ],
    history_read_seconds: 36000, month_read_seconds: 36000,
    history_paid_fen: 9900, recent_paid_fen: 9900,
    month_device_count: 15, status: "pending",
    updated_at: "2026-03-24T10:00:00+08:00",
  },
  {
    id: "report-1025",
    user_uid: "52817463",
    user_nickname: "执念",
    content_id: "work-4478",
    content_title: "城与夜色",
    reporters: [
      { reporter_id: "u-1201", reporter_name: "余温", reason: "多端同时在线且阅读章节不同", reported_at: "2026-03-22T21:05:00+08:00" },
      { reporter_id: "u-1202", reporter_name: "梦泽", reason: "同一小时内切换5个不同设备", reported_at: "2026-03-23T00:18:00+08:00" },
    ],
    history_read_seconds: 345600, month_read_seconds: 72000,
    history_paid_fen: 108000, recent_paid_fen: 8200,
    month_device_count: 9, status: "processed",
    updated_at: "2026-03-23T14:00:00+08:00", processed_at: "2026-03-23T13:45:00+08:00",
    remark: "1小时内切换5设备，行为模式明显异常", operator: "张运营",
    ban_count: 4, ban_days: 21, ban_expires_at: "2026-04-13T13:45:00+08:00",
  },
  {
    id: "report-1026",
    user_uid: "86304172",
    user_nickname: "浮生若梦",
    content_id: "work-5583",
    content_title: "星辰大海",
    reporters: [
      { reporter_id: "u-1301", reporter_name: "初见", reason: "疑似二手平台出售阅读权限", reported_at: "2026-03-20T19:30:00+08:00" },
      { reporter_id: "u-1302", reporter_name: "千寻", reason: "在社交群中发现共享截图", reported_at: "2026-03-21T08:45:00+08:00" },
      { reporter_id: "u-1303", reporter_name: "织梦", reason: "转发的阅读截图中UID一致", reported_at: "2026-03-21T22:10:00+08:00" },
      { reporter_id: "u-1304", reporter_name: "归零", reason: "二手平台商品页截图举证", reported_at: "2026-03-22T10:05:00+08:00" },
      { reporter_id: "u-1305", reporter_name: "暮色", reason: "买家反馈确认此号为共享号", reported_at: "2026-03-22T16:38:00+08:00" },
      { reporter_id: "u-1306", reporter_name: "枕书", reason: "平台交易记录截图", reported_at: "2026-03-23T09:20:00+08:00" },
    ],
    history_read_seconds: 960000, month_read_seconds: 240000,
    history_paid_fen: 198000, recent_paid_fen: 3200,
    month_device_count: 18, status: "pending",
    updated_at: "2026-03-24T11:50:00+08:00",
  },
  {
    id: "report-1027",
    user_uid: "19573048",
    user_nickname: "且听风吟",
    content_id: "work-6690",
    content_title: "旧日时光机",
    reporters: [
      { reporter_id: "u-1401", reporter_name: "微澜", reason: "阅读进度在多设备间来回跳跃", reported_at: "2026-03-24T06:15:00+08:00" },
    ],
    history_read_seconds: 72000, month_read_seconds: 18000,
    history_paid_fen: 32000, recent_paid_fen: 16000,
    month_device_count: 3, status: "pending",
    updated_at: "2026-03-24T09:40:00+08:00",
  },
  {
    id: "report-1028",
    user_uid: "63401287",
    user_nickname: "夜未央",
    content_id: "work-7734",
    content_title: "末日邮局",
    reporters: [
      { reporter_id: "u-1501", reporter_name: "锦书", reason: "付费VIP但设备数远超个人正常范围", reported_at: "2026-03-21T12:00:00+08:00" },
      { reporter_id: "u-1502", reporter_name: "清辞", reason: "VIP到期前设备数激增疑似分享", reported_at: "2026-03-22T17:30:00+08:00" },
      { reporter_id: "u-1503", reporter_name: "望舒", reason: "多设备同时消费不同章节", reported_at: "2026-03-23T20:10:00+08:00" },
    ],
    history_read_seconds: 486000, month_read_seconds: 108000,
    history_paid_fen: 520000, recent_paid_fen: 52000,
    month_device_count: 11, status: "processed",
    updated_at: "2026-03-24T08:20:00+08:00", processed_at: "2026-03-24T08:05:00+08:00",
    remark: "高付费VIP用户，VIP到期前设备暴增，确认分享行为", operator: "李运营",
    ban_count: 2, ban_days: 7, ban_expires_at: "2026-03-31T08:05:00+08:00",
  },
  {
    id: "report-1029",
    user_uid: "40821936",
    user_nickname: "画楼西",
    content_id: "work-2215",
    content_title: "等风的人",
    reporters: [
      { reporter_id: "u-1601", reporter_name: "墨染", reason: "同一作品阅读总时长超过实际发布时长", reported_at: "2026-03-23T15:40:00+08:00" },
      { reporter_id: "u-1602", reporter_name: "落英", reason: "阅读时长计算不合理，疑似多人同时看", reported_at: "2026-03-24T10:20:00+08:00" },
    ],
    history_read_seconds: 288000, month_read_seconds: 144000,
    history_paid_fen: 66000, recent_paid_fen: 6600,
    month_device_count: 7, status: "pending",
    updated_at: "2026-03-24T12:00:00+08:00",
  },
  {
    id: "report-1030",
    user_uid: "77654321",
    user_nickname: "拾光者",
    content_id: "work-3398",
    content_title: "海边的卡夫卡",
    reporters: [
      { reporter_id: "u-1701", reporter_name: "时序", reason: "账号在海外IP和国内IP间频繁切换", reported_at: "2026-03-19T23:00:00+08:00" },
      { reporter_id: "u-1702", reporter_name: "听雪", reason: "跨时区设备同时活跃", reported_at: "2026-03-20T14:30:00+08:00" },
      { reporter_id: "u-1703", reporter_name: "朝歌", reason: "海外IP阅读量远超国内", reported_at: "2026-03-21T19:15:00+08:00" },
    ],
    history_read_seconds: 540000, month_read_seconds: 96000,
    history_paid_fen: 145000, recent_paid_fen: 11000,
    month_device_count: 10, status: "processed",
    updated_at: "2026-03-23T10:00:00+08:00", processed_at: "2026-03-23T09:45:00+08:00",
    remark: "海外+国内IP同时活跃，跨时区共享确认", operator: "王运营",
    ban_count: 1, ban_days: 3, ban_expires_at: "2026-03-26T09:45:00+08:00",
  },
];

// Auto-populate devices for every record
for (const r of initialReports) {
  r.devices = seededDevices(r.id, r.month_device_count);
}

const reports = structuredClone(initialReports);

const actionLogs: RawActionLog[] = [
  { id: "log-1", report_id: "report-1002", action: "process", operator: "张运营", remark: "多端同时在线证据充分，确认封号", created_at: "2026-03-23T16:30:00+08:00" },
  { id: "log-2", report_id: "report-1005", action: "process", operator: "李运营", remark: "设备数连续 5 天超阈值，封号处理", created_at: "2026-03-22T12:48:00+08:00" },
  { id: "log-3", report_id: "report-1007", action: "process", operator: "张运营", remark: "设备来源异常分散，确认共享行为", created_at: "2026-03-23T19:40:00+08:00" },
  { id: "log-4", report_id: "report-1010", action: "process", operator: "王运营", remark: "组织化共享嫌疑，多端付费后立即分发", created_at: "2026-03-22T15:58:00+08:00" },
  { id: "log-5", report_id: "report-1013", action: "process", operator: "李运营", remark: "付费极低但阅读量极高，确认共享嫌疑", created_at: "2026-03-22T09:50:00+08:00" },
  { id: "log-6", report_id: "report-1015", action: "process", operator: "张运营", remark: "不同设备类型同时活跃，判定共享", created_at: "2026-03-23T14:40:00+08:00" },
  { id: "log-7", report_id: "report-1018", action: "process", operator: "王运营", remark: "高付费用户但设备数异常，确认共享后封号", created_at: "2026-03-23T11:05:00+08:00" },
  { id: "log-8", report_id: "report-1021", action: "process", operator: "李运营", remark: "设备指纹高度重复，判定为模拟器刷量", created_at: "2026-03-22T18:10:00+08:00" },
  { id: "log-9", report_id: "report-1023", action: "process", operator: "王运营", remark: "高付费用户近月停止付费但持续使用，核实后为本人行为，误判撤销", created_at: "2026-03-21T09:15:00+08:00" },
  { id: "log-10", report_id: "report-1025", action: "process", operator: "张运营", remark: "1小时内切换5设备，行为模式明显异常", created_at: "2026-03-23T13:45:00+08:00" },
  { id: "log-11", report_id: "report-1028", action: "process", operator: "李运营", remark: "高付费VIP用户，VIP到期前设备暴增，确认分享行为", created_at: "2026-03-24T08:05:00+08:00" },
  { id: "log-12", report_id: "report-1030", action: "process", operator: "王运营", remark: "海外+国内IP同时活跃，跨时区共享确认", created_at: "2026-03-23T09:45:00+08:00" },
];

export function getMockReports() {
  return structuredClone(reports);
}

export function getMockActionLogs(reportId: string) {
  return structuredClone(
    actionLogs
      .filter((l) => l.report_id === reportId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  );
}

export function getUserBanCount(uid: string): number {
  return reports.filter((r) => r.user_uid === uid && r.status === "processed").length;
}

export function updateMockReportStatus(
  id: string,
  status: ReportStatus,
  remark?: string,
  operator?: string,
) {
  const report = reports.find((item) => item.id === id);
  if (!report) return null;

  report.status = status;
  report.updated_at = new Date().toISOString();
  report.processed_at = (status === "processed" || status === "rejected") ? new Date().toISOString() : undefined;
  report.remark = remark ?? report.remark;
  report.operator = operator ?? report.operator;

  if (status === "processed") {
    const count = getUserBanCount(report.user_uid);
    report.ban_count = count;
    report.ban_days = calcBanDays(count);
    report.ban_expires_at = calcBanExpiresAt(report.processed_at!, report.ban_days);
  } else {
    report.ban_count = undefined;
    report.ban_days = undefined;
    report.ban_expires_at = undefined;
  }

  const actionMap: Record<ReportStatus, ReportAction> = {
    processed: "process",
    rejected: "reject",
    pending: "revoke",
  };

  actionLogs.push({
    id: nextLogId(),
    report_id: id,
    action: actionMap[status],
    operator: operator ?? "未知",
    remark: remark ?? "",
    created_at: new Date().toISOString(),
  });

  return structuredClone(report);
}

export function getMockReportsByUid(uid: string) {
  return structuredClone(reports.filter((r) => r.user_uid === uid));
}

export function batchUpdateStatus(
  ids: string[],
  action: ReportAction,
  remark?: string,
  operator?: string,
) {
  const statusMap: Record<ReportAction, ReportStatus> = {
    process: "processed",
    reject: "rejected",
    revoke: "pending",
  };
  const status: ReportStatus = statusMap[action];
  const results: RawReportRecord[] = [];

  for (const id of ids) {
    const updated = updateMockReportStatus(id, status, remark, operator);
    if (updated) results.push(updated);
  }

  return results;
}
