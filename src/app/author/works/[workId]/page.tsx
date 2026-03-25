"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Flex,
  Segmented,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  AlertOutlined,
  BookOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Key } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { AuthorReportStatus, LeaderboardUser } from "@/types/author-report";
import { getLeaderboard, submitReports } from "@/services/author-report-service";
import { ReportModal } from "@/components/author/report-modal";

const { Title, Text } = Typography;

const statusTagMap: Record<AuthorReportStatus, { color: string; text: string }> = {
  pending: { color: "processing", text: "待处理" },
  processing: { color: "warning", text: "处理中" },
  banned: { color: "success", text: "已封号" },
  rejected: { color: "error", text: "已驳回" },
};

type TimeRangeMode = "month" | "all";

export default function LeaderboardPage() {
  const params = useParams<{ workId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const workId = params.workId;
  const platform = searchParams.get("platform") ?? "橙光";

  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [workName, setWorkName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [messageApi, contextHolder] = message.useMessage();
  const fetchedRef = useRef(false);

  const [timeMode, setTimeMode] = useState<TimeRangeMode>("month");
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs().subtract(1, "month"));
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargets, setModalTargets] = useState<LeaderboardUser[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const getMonthParam = useCallback(() => {
    if (timeMode === "all") return undefined;
    return selectedMonth.format("YYYY-MM");
  }, [timeMode, selectedMonth]);

  const loadData = useCallback(async (wId: string, month?: string) => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await getLeaderboard(wId, month);
      setUsers(result.users);
      setWorkName(result.workName);
      if (result.availableMonths.length > 0) {
        setAvailableMonths(result.availableMonths);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    void loadData(workId, getMonthParam());
  }, [workId, loadData, getMonthParam]);

  const handleSearch = () => {
    fetchedRef.current = false;
    void loadData(workId, getMonthParam());
  };

  const openReportModal = (targets: LeaderboardUser[]) => {
    const reportable = targets.filter((t) => !t.reportStatus);
    if (reportable.length === 0) {
      void messageApi.warning("所选用户均已被举报");
      return;
    }
    setModalTargets(reportable);
    setModalOpen(true);
  };

  const handleReportConfirm = useCallback(
    async (reasons: string[], description?: string) => {
      setModalLoading(true);
      try {
        const results = await submitReports({
          work_id: workId,
          work_name: workName,
          targets: modalTargets.map((t) => ({
            uid: t.uid,
            nickname: t.nickname,
            read_hours: t.readHours,
          })),
          reasons,
          description,
        });
        await messageApi.success(`成功提交 ${results.length} 条举报`);

        setUsers((prev) =>
          prev.map((u) => {
            const matched = results.find((r) => r.targetUid === u.uid);
            return matched
              ? { ...u, reportStatus: "pending" as const, reportId: matched.id }
              : u;
          })
        );
        setSelectedRowKeys([]);
      } catch (e) {
        await messageApi.error(e instanceof Error ? e.message : "提交失败");
      } finally {
        setModalLoading(false);
        setModalOpen(false);
      }
    },
    [workId, workName, modalTargets, messageApi]
  );

  const selectedUsers = useMemo(
    () => users.filter((u) => selectedRowKeys.includes(u.uid)),
    [users, selectedRowKeys]
  );
  const reportableCount = selectedUsers.filter((u) => !u.reportStatus).length;

  const disableMonth = useCallback(
    (current: Dayjs) => {
      const formatted = current.format("YYYY-MM");
      return !availableMonths.includes(formatted);
    },
    [availableMonths]
  );

  const columns = useMemo<ColumnsType<LeaderboardUser>>(
    () => [
      { title: "用户昵称", dataIndex: "nickname", width: 160 },
      { title: "用户 UID", dataIndex: "uid", width: 130 },
      {
        title: "阅读时长",
        dataIndex: "readHours",
        width: 120,
        render: (v: number) => `${v.toFixed(2)}h`,
        sorter: (a, b) => a.readHours - b.readHours,
        defaultSortOrder: "descend",
      },
      {
        title: "移动端阅读时长",
        dataIndex: "mobileReadHours",
        width: 140,
        render: (v: number) => `${v.toFixed(2)}h`,
        sorter: (a, b) => a.mobileReadHours - b.mobileReadHours,
      },
      {
        title: "PC 阅读时长",
        dataIndex: "pcReadHours",
        width: 120,
        render: (v: number) => `${v.toFixed(2)}h`,
        sorter: (a, b) => a.pcReadHours - b.pcReadHours,
      },
      {
        title: "用户排名",
        dataIndex: "rank",
        width: 90,
        align: "center",
      },
      {
        title: "操作",
        key: "action",
        width: 150,
        align: "center",
        fixed: "right",
        render: (_, record) => {
          if (!record.reportStatus) {
            return (
              <Button
                size="small"
                icon={<AlertOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  openReportModal([record]);
                }}
                style={{
                  color: "#f60",
                  borderColor: "#f60",
                }}
              >
                举报
              </Button>
            );
          }
          const info = statusTagMap[record.reportStatus];
          return (
            <Flex align="center" justify="center" gap={4}>
              <Tag color={info.color} style={{ margin: 0 }}>{info.text}</Tag>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/author/reports");
                }}
                style={{ padding: "0 4px" }}
              >
                查看进度
              </Button>
            </Flex>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router]
  );

  if (loading && users.length === 0) {
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
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={12}>
            <Title level={3} style={{ margin: 0 }}>
              举报共享号
            </Title>
            <Tag
              icon={<BookOutlined />}
              color="orange"
              style={{ fontSize: 14, padding: "2px 12px" }}
            >
              {workName || workId} | {platform}
            </Tag>
          </Flex>
          <Link href="/author/reports">
            <Button type="link">我的举报记录</Button>
          </Link>
        </Flex>

        <Card>
          <Flex gap={16} align="center" wrap>
            <Flex align="center" gap={8}>
              <Text>时间范围：</Text>
              <Segmented
                value={timeMode}
                onChange={(val) => setTimeMode(val as TimeRangeMode)}
                options={[
                  { label: "全部", value: "all" },
                  { label: "按月", value: "month" },
                ]}
              />
              {timeMode === "month" && (
                <DatePicker
                  picker="month"
                  value={selectedMonth}
                  onChange={(val) => val && setSelectedMonth(val)}
                  disabledDate={disableMonth}
                  allowClear={false}
                  style={{ width: 160 }}
                />
              )}
              {timeMode === "month" && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  每月1日更新上个月数据
                </Text>
              )}
            </Flex>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              style={{ background: "#f60" }}
            >
              查询
            </Button>
          </Flex>
        </Card>

        {error && <Alert type="error" showIcon message={error} />}

        <Card
          title={
            <Flex align="center" gap={8}>
              <Text strong>查询结果</Text>
              {workName && <Tag>{workName}</Tag>}
              {timeMode === "month" && (
                <Tag color="orange">{selectedMonth.format("YYYY年MM月")}</Tag>
              )}
            </Flex>
          }
          extra={
            <Text type="secondary">显示 {users.length} 项结果</Text>
          }
        >
          {selectedRowKeys.length > 0 && (
            <Flex
              gap={12}
              align="center"
              style={{
                marginBottom: 12,
                padding: "8px 16px",
                background: "#fff7e6",
                borderRadius: 6,
                border: "1px solid #ffd591",
              }}
            >
              <Text>
                已选择 <Text strong>{selectedRowKeys.length}</Text> 人
                {reportableCount < selectedRowKeys.length && (
                  <Text type="secondary">
                    （其中 {selectedRowKeys.length - reportableCount} 人已举报，将自动跳过）
                  </Text>
                )}
              </Text>
              <Button
                size="small"
                icon={<AlertOutlined />}
                disabled={reportableCount === 0}
                onClick={() => openReportModal(selectedUsers)}
                style={{
                  color: reportableCount > 0 ? "#f60" : undefined,
                  borderColor: reportableCount > 0 ? "#f60" : undefined,
                }}
              >
                批量举报（{reportableCount}）
              </Button>
              <Button
                size="small"
                onClick={() => setSelectedRowKeys([])}
              >
                取消选择
              </Button>
            </Flex>
          )}

          <Table<LeaderboardUser>
            rowKey="uid"
            columns={columns}
            dataSource={users}
            loading={loading}
            pagination={false}
            scroll={{ x: 1000 }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
              fixed: true,
            }}
          />
        </Card>
      </Flex>

      <ReportModal
        open={modalOpen}
        loading={modalLoading}
        targets={modalTargets}
        onConfirm={(reasons, desc) => void handleReportConfirm(reasons, desc)}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
