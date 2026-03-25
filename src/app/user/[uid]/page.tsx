"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Popover,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getReportsByUid,
  processReport,
  revokeReport,
} from "@/services/report-service";
import { DetailDrawer } from "@/components/ban-dashboard/detail-drawer";
import { ActionConfirmModal } from "@/components/ban-dashboard/action-confirm-modal";
import type { DeviceInfo, ReportAction, ReportRecord } from "@/types/report";

const { Title, Text } = Typography;

function formatDuration(minutes: number) {
  return `${minutes.toLocaleString("zh-CN")} 分钟`;
}

function formatCurrency(amount: number) {
  return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

const deviceTypeLabel = { phone: "手机", tablet: "平板", pc: "PC" } as const;
const deviceTypeIcon = { phone: <MobileOutlined />, tablet: <TabletOutlined />, pc: <LaptopOutlined /> } as const;
const deviceTypeColor = { phone: "blue", tablet: "orange", pc: "green" } as const;

function ReporterPopoverContent({ record }: { record: ReportRecord }) {
  return (
    <Flex vertical gap={8} style={{ maxWidth: 360, maxHeight: 300, overflow: "auto" }}>
      {record.reporters.map((r) => (
        <div key={r.id} style={{ padding: "6px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" }}>
          <Flex justify="space-between" align="center">
            <Text strong style={{ fontSize: 13 }}>{r.name}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{formatDateTime(r.reportedAt)}</Text>
          </Flex>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.reportReason}</Text>
        </div>
      ))}
    </Flex>
  );
}

function DevicePopoverContent({ devices }: { devices: DeviceInfo[] }) {
  return (
    <Flex vertical gap={8} style={{ maxWidth: 380, maxHeight: 320, overflow: "auto" }}>
      {devices.map((d) => (
        <div key={d.deviceId} style={{ padding: "6px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" }}>
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={6}>
              {deviceTypeIcon[d.deviceType]}
              <Text strong style={{ fontSize: 13 }}>{d.deviceName}</Text>
            </Flex>
            <Tag color={deviceTypeColor[d.deviceType]}>{deviceTypeLabel[d.deviceType]}</Tag>
          </Flex>
          <Text type="secondary" style={{ fontSize: 12 }}>最后活跃：{formatDateTime(d.lastActiveAt)}</Text>
        </div>
      ))}
    </Flex>
  );
}

export default function UserDetailPage() {
  const params = useParams<{ uid: string }>();
  const router = useRouter();
  const uid = params.uid;

  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [messageApi, contextHolder] = message.useMessage();
  const fetchedRef = useRef(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRecord, setDrawerRecord] = useState<ReportRecord | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<ReportAction>("process");
  const [modalTargetId, setModalTargetId] = useState<string>("");
  const [modalLoading, setModalLoading] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await getReportsByUid(uid);
      setRecords(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    void loadRecords();
  }, [loadRecords]);

  const nickname = records[0]?.nickname ?? "-";

  const stats = useMemo(() => {
    const processedRecords = records.filter((r) => r.status === "processed");
    const maxBanCount = processedRecords.length > 0
      ? Math.max(...processedRecords.map((r) => r.banCount ?? 0))
      : 0;
    return {
      workCount: new Set(records.map((r) => r.workId)).size,
      totalReporters: records.reduce((n, r) => n + r.reporters.length, 0),
      maxDeviceCount: records.length > 0 ? Math.max(...records.map((r) => r.monthlyDeviceCount)) : 0,
      pendingCount: records.filter((r) => r.status === "pending").length,
      processedCount: processedRecords.length,
      banCount: maxBanCount,
    };
  }, [records]);

  const openConfirmModal = (id: string, action: ReportAction) => {
    setModalTargetId(id);
    setModalAction(action);
    setModalOpen(true);
  };

  const handleModalConfirm = useCallback(
    async (remark: string) => {
      setModalLoading(true);
      try {
        const updated =
          modalAction === "process"
            ? await processReport(modalTargetId, remark)
            : await revokeReport(modalTargetId, remark);
        setRecords((cur) => cur.map((r) => (r.id === modalTargetId ? updated : r)));
        await messageApi.success(modalAction === "process" ? "处理成功" : "撤销成功");
      } catch (e) {
        await messageApi.error(e instanceof Error ? e.message : "操作失败");
      } finally {
        setModalLoading(false);
        setModalOpen(false);
      }
    },
    [modalTargetId, modalAction, messageApi]
  );

  const columns = useMemo<ColumnsType<ReportRecord>>(
    () => [
      { title: "作品 ID", dataIndex: "workId", width: 120 },
      { title: "作品名称", dataIndex: "workName", width: 160 },
      {
        title: "举报人", key: "reporters", width: 100, align: "center" as const,
        render: (_: unknown, record: ReportRecord) => (
          <Popover
            title={`举报人（${record.reporters.length}）`}
            content={<ReporterPopoverContent record={record} />}
            trigger="click"
            placement="bottomLeft"
          >
            <Button type="link" size="small" icon={<TeamOutlined />} onClick={(e) => e.stopPropagation()}>
              {record.reporters.length} 人
            </Button>
          </Popover>
        ),
      },
      {
        title: "作品历史阅读", dataIndex: "totalReadMinutes", width: 130,
        render: (v: number) => formatDuration(v),
        sorter: (a, b) => a.totalReadMinutes - b.totalReadMinutes,
      },
      {
        title: "作品当月阅读", dataIndex: "monthlyReadMinutes", width: 130,
        render: (v: number) => formatDuration(v),
        sorter: (a, b) => a.monthlyReadMinutes - b.monthlyReadMinutes,
      },
      {
        title: "用户历史付费", dataIndex: "totalPaidAmount", width: 120,
        render: (v: number) => formatCurrency(v),
        sorter: (a, b) => a.totalPaidAmount - b.totalPaidAmount,
      },
      {
        title: "用户近月付费", dataIndex: "recentPaidAmount", width: 120,
        render: (v: number) => formatCurrency(v),
        sorter: (a, b) => a.recentPaidAmount - b.recentPaidAmount,
      },
      {
        title: "当月设备数", key: "devices", width: 110, align: "center" as const,
        sorter: (a, b) => a.monthlyDeviceCount - b.monthlyDeviceCount,
        render: (_: unknown, record: ReportRecord) =>
          record.devices?.length ? (
            <Popover
              title={`登录设备（${record.devices.length}）`}
              content={<DevicePopoverContent devices={record.devices} />}
              trigger="click"
              placement="bottomLeft"
            >
              <Button type="link" size="small" icon={<LaptopOutlined />} onClick={(e) => e.stopPropagation()}>
                {record.monthlyDeviceCount} 台
              </Button>
            </Popover>
          ) : (
            `${record.monthlyDeviceCount} 台`
          ),
      },
      {
        title: "状态", dataIndex: "status", width: 100,
        render: (v: ReportRecord["status"]) =>
          v === "processed" ? <Tag color="success">已处理</Tag> : <Tag color="processing">待处理</Tag>,
      },
      {
        title: "封号时长", key: "banDays", width: 130,
        render: (_: unknown, record: ReportRecord) =>
          record.banDays != null && record.banCount != null
            ? <Text>{record.banDays}天<Text type="secondary">（第{record.banCount}次）</Text></Text>
            : <Text type="secondary">-</Text>,
      },
      { title: "更新时间", dataIndex: "updatedAt", width: 170, render: (v: string) => formatDateTime(v) },
      {
        title: "操作", key: "action", width: 160, fixed: "right" as const,
        render: (_: unknown, record: ReportRecord) => {
          const canProcess = record.status !== "processed";
          const canRevoke = record.status === "processed";
          return (
            <Flex gap={8}>
              <Button type="primary" size="small" disabled={!canProcess}
                onClick={(e) => { e.stopPropagation(); openConfirmModal(record.id, "process"); }}>处理</Button>
              <Button danger size="small" disabled={!canRevoke}
                onClick={(e) => { e.stopPropagation(); openConfirmModal(record.id, "revoke"); }}>撤销</Button>
            </Flex>
          );
        },
      },
    ],
    []
  );

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f5f7fa", minHeight: "100vh" }}>
      {contextHolder}

      <Flex vertical gap={16}>
        <Flex align="center" gap={12}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/")}>返回</Button>
          <Breadcrumb items={[{ title: <Link href="/">首页</Link> }, { title: "用户详情" }, { title: uid }]} />
        </Flex>

        {error && <Alert type="error" showIcon message={error} />}

        <Card>
          <Descriptions title={<Title level={4} style={{ margin: 0 }}>用户信息</Title>} column={4}>
            <Descriptions.Item label="用户 UID"><Text copyable>{uid}</Text></Descriptions.Item>
            <Descriptions.Item label="用户昵称">{nickname}</Descriptions.Item>
            <Descriptions.Item label="被举报作品数">{stats.workCount}</Descriptions.Item>
            <Descriptions.Item label="总举报人数">{stats.totalReporters}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card><Statistic title="待处理" value={stats.pendingCount} /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="已处理" value={stats.processedCount} /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="累计封号次数" value={stats.banCount} suffix="次" /></Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card><Statistic title="最高当月设备数" value={stats.maxDeviceCount} suffix="台" /></Card>
          </Col>
        </Row>

        <Card title="被举报记录" extra={<Text type="secondary">点击行查看单条详情</Text>}>
          <Table<ReportRecord>
            rowKey="id"
            columns={columns}
            dataSource={records}
            scroll={{ x: 1800 }}
            pagination={false}
            onRow={(record) => ({
              onClick: () => { setDrawerRecord(record); setDrawerOpen(true); },
              style: { cursor: "pointer" },
            })}
          />
        </Card>
      </Flex>

      <ActionConfirmModal
        open={modalOpen}
        action={modalAction}
        targetCount={1}
        loading={modalLoading}
        onConfirm={(remark) => void handleModalConfirm(remark)}
        onCancel={() => setModalOpen(false)}
      />

      <DetailDrawer open={drawerOpen} record={drawerRecord} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
