"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Flex,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthorReportRecord, AuthorReportStatus } from "@/types/author-report";
import { getMyReports } from "@/services/author-report-service";

const { Title, Text } = Typography;

const statusTagMap: Record<AuthorReportStatus, { color: string; text: string }> = {
  pending: { color: "processing", text: "待处理" },
  processing: { color: "warning", text: "处理中" },
  banned: { color: "success", text: "已封号" },
  rejected: { color: "error", text: "已驳回" },
};

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

export default function AuthorReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<AuthorReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const fetchedRef = useRef(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await getMyReports();
      setReports(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    void loadData();
  }, [loadData]);

  const columns: ColumnsType<AuthorReportRecord> = [
    {
      title: "举报时间",
      dataIndex: "createdAt",
      width: 170,
      render: (v: string) => formatDateTime(v),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    { title: "作品名称", dataIndex: "workName", width: 140 },
    {
      title: "被举报用户",
      key: "target",
      width: 200,
      render: (_, record) => (
        <Flex vertical>
          <Text strong>{record.targetNickname}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            UID: {record.targetUid}
          </Text>
        </Flex>
      ),
    },
    {
      title: "阅读时长",
      dataIndex: "readHours",
      width: 100,
      render: (v: number) => `${v.toFixed(2)}h`,
    },
    {
      title: "举报原因",
      dataIndex: "reasons",
      width: 240,
      render: (reasons: string[]) => (
        <Flex wrap gap={4}>
          {reasons.map((r) => (
            <Tag key={r} style={{ fontSize: 12 }}>{r}</Tag>
          ))}
        </Flex>
      ),
    },
    {
      title: "处理状态",
      dataIndex: "status",
      width: 100,
      align: "center",
      filters: [
        { text: "待处理", value: "pending" },
        { text: "处理中", value: "processing" },
        { text: "已封号", value: "banned" },
        { text: "已驳回", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: AuthorReportStatus) => {
        const info = statusTagMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: "处理结果",
      dataIndex: "result",
      width: 200,
      render: (v?: string) =>
        v ? <Text>{v}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "处理时间",
      dataIndex: "processedAt",
      width: 170,
      render: (v?: string) => formatDateTime(v),
    },
  ];

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "100vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f5f7fa", minHeight: "100vh" }}>
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={12}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
            >
              返回
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              我的举报记录
            </Title>
          </Flex>
          <Link href="/author/works/work-7781">
            <Button type="link">返回阅读榜单</Button>
          </Link>
        </Flex>

        {error && <Alert type="error" showIcon message={error} />}

        <Card>
          <Table<AuthorReportRecord>
            rowKey="id"
            columns={columns}
            dataSource={reports}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 1300 }}
            expandable={{
              expandedRowRender: (record) => (
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="作品">
                    {record.workName}（{record.workId}）
                  </Descriptions.Item>
                  <Descriptions.Item label="阅读时长">
                    {record.readHours.toFixed(2)}h
                  </Descriptions.Item>
                  <Descriptions.Item label="举报原因" span={2}>
                    {record.reasons.join("、")}
                  </Descriptions.Item>
                  {record.description && (
                    <Descriptions.Item label="补充说明" span={2}>
                      {record.description}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="处理状态">
                    <Tag color={statusTagMap[record.status].color}>
                      {statusTagMap[record.status].text}
                    </Tag>
                  </Descriptions.Item>
                  {record.result && (
                    <Descriptions.Item label="处理结果">
                      {record.result}
                    </Descriptions.Item>
                  )}
                  {record.banDays != null && (
                    <Descriptions.Item label="封号时长">
                      {record.banDays} 天
                    </Descriptions.Item>
                  )}
                  {record.processedAt && (
                    <Descriptions.Item label="处理时间">
                      {formatDateTime(record.processedAt)}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              ),
              rowExpandable: () => true,
            }}
          />
        </Card>
      </Flex>
    </div>
  );
}
