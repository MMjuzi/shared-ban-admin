"use client";

import { useMemo } from "react";
import { Button, Flex, Popover, Table, Tag, Typography } from "antd";
import { LaptopOutlined, MobileOutlined, TabletOutlined, TeamOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Key } from "react";
import Link from "next/link";
import type { DeviceInfo, ReportRecord } from "@/types/report";

const { Text } = Typography;

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
        <div
          key={r.id}
          style={{ padding: "6px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" }}
        >
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
        <div
          key={d.deviceId}
          style={{ padding: "6px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" }}
        >
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

interface ReportTableProps {
  records: ReportRecord[];
  loading: boolean;
  actionLoadingId?: string;
  selectedRowKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  onProcess: (id: string) => void;
  onRevoke: (id: string) => void;
  onReject: (id: string) => void;
  onRowClick: (record: ReportRecord) => void;
}

export function ReportTable({
  records,
  loading,
  actionLoadingId,
  selectedRowKeys,
  onSelectionChange,
  onProcess,
  onRevoke,
  onReject,
  onRowClick,
}: ReportTableProps) {
  const columns = useMemo<ColumnsType<ReportRecord>>(
    () => [
      {
        title: "用户 UID", dataIndex: "uid", width: 120, fixed: "left",
        render: (uid: string) => (
          <Link href={`/user/${uid}`} onClick={(e) => e.stopPropagation()}>{uid}</Link>
        ),
      },
      { title: "用户昵称", dataIndex: "nickname", width: 120 },
      { title: "作品 ID", dataIndex: "workId", width: 120 },
      { title: "作品名称", dataIndex: "workName", width: 140 },
      {
        title: "举报人", key: "reporters", width: 100, align: "center",
        render: (_, record) => (
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
        title: "当月设备数", key: "devices", width: 110, align: "center",
        sorter: (a, b) => a.monthlyDeviceCount - b.monthlyDeviceCount,
        render: (_, record) =>
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
          v === "processed" ? <Tag color="success">已处理</Tag>
            : v === "rejected" ? <Tag color="warning">已驳回</Tag>
            : <Tag color="processing">待处理</Tag>,
      },
      {
        title: "封号时长", key: "banDays", width: 130,
        render: (_, record) =>
          record.banDays != null && record.banCount != null
            ? <Text>{record.banDays}天<Text type="secondary">（第{record.banCount}次）</Text></Text>
            : <Text type="secondary">-</Text>,
      },
      { title: "更新时间", dataIndex: "updatedAt", width: 170, render: (v: string) => formatDateTime(v) },
      {
        title: "操作", key: "action", width: 220, fixed: "right",
        render: (_, record) => {
          const busy = actionLoadingId === record.id;
          const isPending = record.status === "pending";
          const isProcessed = record.status === "processed";
          return (
            <Flex gap={8}>
              <Button type="primary" size="small" loading={busy && isPending} disabled={!isPending}
                onClick={(e) => { e.stopPropagation(); onProcess(record.id); }}>处理</Button>
              <Button size="small" loading={busy && isPending} disabled={!isPending}
                style={isPending ? { color: "#faad14", borderColor: "#faad14" } : undefined}
                onClick={(e) => { e.stopPropagation(); onReject(record.id); }}>驳回</Button>
              <Button danger size="small" loading={busy && isProcessed} disabled={!isProcessed}
                onClick={(e) => { e.stopPropagation(); onRevoke(record.id); }}>撤销</Button>
            </Flex>
          );
        },
      },
    ],
    [actionLoadingId, onProcess, onRevoke, onReject]
  );

  return (
    <Table<ReportRecord>
      rowKey="id"
      columns={columns}
      dataSource={records}
      loading={loading}
      scroll={{ x: 2100 }}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      rowSelection={{ selectedRowKeys, onChange: (keys) => onSelectionChange(keys) }}
      onRow={(record) => ({ onClick: () => onRowClick(record), style: { cursor: "pointer" } })}
    />
  );
}
