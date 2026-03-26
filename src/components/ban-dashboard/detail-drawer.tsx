"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Descriptions,
  Divider,
  Drawer,
  Flex,
  Spin,
  Table,
  Tag,
  Timeline,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ActionLog, DeviceInfo, ReportRecord } from "@/types/report";
import { getActionLogs } from "@/services/report-service";

const { Text } = Typography;

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} 小时 ${m} 分钟` : `${h} 小时`;
}

function formatCurrency(amount: number) {
  return `¥${amount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

const deviceTypeLabel = { phone: "手机", tablet: "平板", pc: "PC" } as const;
const deviceTypeIcon = {
  phone: <MobileOutlined />,
  tablet: <TabletOutlined />,
  pc: <LaptopOutlined />,
} as const;
const deviceTypeColor = { phone: "blue", tablet: "orange", pc: "green" } as const;

const deviceColumns: ColumnsType<DeviceInfo> = [
  {
    title: "设备名称", dataIndex: "deviceName", width: 160,
    render: (name: string, record) => (
      <Flex align="center" gap={6}>
        {deviceTypeIcon[record.deviceType]}
        <Text>{name}</Text>
      </Flex>
    ),
  },
  {
    title: "设备类型", dataIndex: "deviceType", width: 90, align: "center",
    render: (type: DeviceInfo["deviceType"]) => (
      <Tag color={deviceTypeColor[type]}>{deviceTypeLabel[type]}</Tag>
    ),
  },
  {
    title: "最后活跃时间", dataIndex: "lastActiveAt", width: 170,
    render: (v: string) => formatDateTime(v),
  },
];

function DrawerBody({ record }: { record: ReportRecord }) {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const fetchedRef = useRef(false);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await getActionLogs(record.id);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [record.id]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    void fetchLogs();
  }, [fetchLogs]);

  const isProcessed = record.status === "processed";
  const isRejected = record.status === "rejected";

  return (
    <>
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="用户 UID">{record.uid}</Descriptions.Item>
        <Descriptions.Item label="用户昵称">{record.nickname}</Descriptions.Item>
        <Descriptions.Item label="作品 ID">{record.workId}</Descriptions.Item>
        <Descriptions.Item label="作品名称">{record.workName}</Descriptions.Item>
        <Descriptions.Item label="作品历史阅读">{formatDuration(record.totalReadMinutes)}</Descriptions.Item>
        <Descriptions.Item label="作品当月阅读">{formatDuration(record.monthlyReadMinutes)}</Descriptions.Item>
        <Descriptions.Item label="用户历史付费">{formatCurrency(record.totalPaidAmount)}</Descriptions.Item>
        <Descriptions.Item label="用户近月付费">{formatCurrency(record.recentPaidAmount)}</Descriptions.Item>
        <Descriptions.Item label="当月设备数">{record.monthlyDeviceCount} 台</Descriptions.Item>
        <Descriptions.Item label="状态">
          {isProcessed ? <Tag color="success">已处理</Tag>
            : isRejected ? <Tag color="warning">已驳回</Tag>
            : <Tag color="processing">待处理</Tag>}
        </Descriptions.Item>
        {isProcessed && record.banDays != null && (
          <>
            <Descriptions.Item label="封号次数">第 {record.banCount} 次</Descriptions.Item>
            <Descriptions.Item label="封号时长">{record.banDays} 天</Descriptions.Item>
            <Descriptions.Item label="封号到期" span={2}>
              {formatDateTime(record.banExpiresAt)}
            </Descriptions.Item>
          </>
        )}
        {record.remark && (
          <Descriptions.Item label="备注" span={2}>{record.remark}</Descriptions.Item>
        )}
        {record.operator && (
          <Descriptions.Item label="操作人">{record.operator}</Descriptions.Item>
        )}
        {record.processedAt && (
          <Descriptions.Item label="处理时间">{formatDateTime(record.processedAt)}</Descriptions.Item>
        )}
        <Descriptions.Item label="更新时间" span={2}>{formatDateTime(record.updatedAt)}</Descriptions.Item>
      </Descriptions>

      <Divider titlePlacement="left">举报人（{record.reporters.length}）</Divider>

      <Flex vertical gap={8}>
        {record.reporters.map((r) => (
          <div
            key={r.id}
            style={{ padding: "8px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" }}
          >
            <Flex justify="space-between" align="center">
              <Text strong>{r.name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(r.reportedAt)}</Text>
            </Flex>
            <Text type="secondary">{r.reportReason}</Text>
          </div>
        ))}
      </Flex>

      {record.devices && record.devices.length > 0 && (
        <>
          <Divider titlePlacement="left">登录设备（{record.devices.length}）</Divider>
          <Table<DeviceInfo>
            rowKey="deviceId"
            columns={deviceColumns}
            dataSource={record.devices}
            size="small"
            pagination={false}
          />
        </>
      )}

      <Divider titlePlacement="left">操作日志</Divider>

      {logsLoading ? (
        <Flex justify="center" style={{ padding: 24 }}><Spin /></Flex>
      ) : logs.length === 0 ? (
        <Text type="secondary">暂无操作日志</Text>
      ) : (
        <Timeline
          items={logs.map((log) => ({
            color: log.action === "process" ? "green" : log.action === "reject" ? "orange" : "red",
            dot: log.action === "process" ? <CheckCircleOutlined />
              : log.action === "reject" ? <CloseCircleOutlined />
              : <UndoOutlined />,
            children: (
              <div>
                <Flex justify="space-between" align="center">
                  <Text strong>{log.action === "process" ? "处理封号" : log.action === "reject" ? "驳回举报" : "撤销处理"}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(log.createdAt)}</Text>
                </Flex>
                <div><Text type="secondary">操作人：{log.operator}</Text></div>
                {log.remark && <div><Text type="secondary">备注：{log.remark}</Text></div>}
              </div>
            ),
          }))}
        />
      )}
    </>
  );
}

export function DetailDrawer({ open, record, onClose }: DetailDrawerProps) {
  return (
    <Drawer title="记录详情" open={open} onClose={onClose} size="large" destroyOnHidden>
      {record && <DrawerBody record={record} />}
    </Drawer>
  );
}

interface DetailDrawerProps {
  open: boolean;
  record: ReportRecord | null;
  onClose: () => void;
}
