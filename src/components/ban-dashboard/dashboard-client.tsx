"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Input,
  Layout,
  Row,
  Select,
  Statistic,
  Typography,
  message,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import type { Key } from "react";
import {
  processReport,
  revokeReport,
  getReportRecords,
  batchProcessReports,
  batchRevokeReports,
} from "@/services/report-service";
import { ReportTable } from "@/components/ban-dashboard/report-table";
import { ActionConfirmModal } from "@/components/ban-dashboard/action-confirm-modal";
import { DetailDrawer } from "@/components/ban-dashboard/detail-drawer";
import type { ReportAction, ReportFilters, ReportRecord } from "@/types/report";
import * as XLSX from "xlsx";

const { Content, Header } = Layout;
const { Title, Text } = Typography;

const defaultFilters: ReportFilters = { keyword: "", status: "all" };

export function DashboardClient() {
  const [records, setRecords] = useState<ReportRecord[]>([]);
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string>();
  const [error, setError] = useState<string>();
  const [messageApi, contextHolder] = message.useMessage();

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<ReportAction>("process");
  const [modalTargetIds, setModalTargetIds] = useState<string[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRecord, setDrawerRecord] = useState<ReportRecord | null>(null);

  const loadRecords = useCallback(async (f: ReportFilters) => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await getReportRecords(f);
      setRecords(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords(defaultFilters);
  }, [loadRecords]);

  const metrics = useMemo(() => {
    const pendingCount = records.filter((r) => r.status === "pending").length;
    return {
      total: records.length,
      pendingCount,
      processedCount: records.length - pendingCount,
      totalReporters: records.reduce((n, r) => n + r.reporters.length, 0),
    };
  }, [records]);

  const handleSearch = async () => {
    await loadRecords(filters);
    setSelectedRowKeys([]);
  };

  const handleReset = async () => {
    setFilters(defaultFilters);
    await loadRecords(defaultFilters);
    setSelectedRowKeys([]);
  };

  const openConfirmModal = (ids: string[], action: ReportAction) => {
    setModalTargetIds(ids);
    setModalAction(action);
    setModalOpen(true);
  };

  const handleModalConfirm = useCallback(
    async (remark: string) => {
      setModalLoading(true);
      try {
        const isBatch = modalTargetIds.length > 1;
        const isSingle = modalTargetIds.length === 1;

        if (isBatch) {
          const updatedList =
            modalAction === "process"
              ? await batchProcessReports(modalTargetIds, remark)
              : await batchRevokeReports(modalTargetIds, remark);

          const updatedMap = new Map(updatedList.map((r) => [r.id, r]));
          setRecords((cur) =>
            cur.map((r) => updatedMap.get(r.id) ?? r)
          );
          setSelectedRowKeys([]);
          await messageApi.success(
            `批量${modalAction === "process" ? "处理" : "撤销"}成功，共 ${updatedList.length} 条`
          );
        } else if (isSingle) {
          const id = modalTargetIds[0];
          const updated =
            modalAction === "process"
              ? await processReport(id, remark)
              : await revokeReport(id, remark);
          setRecords((cur) => cur.map((r) => (r.id === id ? updated : r)));
          await messageApi.success(
            modalAction === "process" ? "处理成功" : "撤销成功"
          );
        }
      } catch (e) {
        await messageApi.error(e instanceof Error ? e.message : "操作失败");
      } finally {
        setModalLoading(false);
        setModalOpen(false);
      }
    },
    [modalTargetIds, modalAction, messageApi]
  );

  const handleSingleProcess = useCallback(
    (id: string) => {
      setActionLoadingId(id);
      openConfirmModal([id], "process");
      setActionLoadingId(undefined);
    },
    []
  );

  const handleSingleRevoke = useCallback(
    (id: string) => {
      setActionLoadingId(id);
      openConfirmModal([id], "revoke");
      setActionLoadingId(undefined);
    },
    []
  );

  const handleRowClick = useCallback((record: ReportRecord) => {
    setDrawerRecord(record);
    setDrawerOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    if (records.length === 0) {
      void messageApi.warning("没有可导出的数据");
      return;
    }

    const rows = records.map((r) => ({
      "用户 UID": r.uid,
      "用户昵称": r.nickname,
      "作品 ID": r.workId,
      "作品名称": r.workName,
      "举报人数": r.reporters.length,
      "历史阅读时长（分钟）": r.totalReadMinutes,
      "当月阅读时长（分钟）": r.monthlyReadMinutes,
      "历史付费（元）": r.totalPaidAmount,
      "近一个月付费（元）": r.recentPaidAmount,
      "当月设备数": r.monthlyDeviceCount,
      "状态": r.status === "processed" ? "已处理" : "待处理",
      "备注": r.remark ?? "",
      "操作人": r.operator ?? "",
      "更新时间": r.updatedAt,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "封号记录");

    const now = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `封号记录_${now}.xlsx`);

    void messageApi.success("导出成功");
  }, [records, messageApi]);

  const selectedCount = selectedRowKeys.length;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {contextHolder}
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          background: "#0f172a",
          paddingInline: 24,
        }}
      >
        <div>
          <Title level={3} style={{ color: "#fff", margin: 0 }}>共享号封号后台</Title>
          <Text style={{ color: "rgba(255,255,255,0.75)" }}>面向运营处理的举报审核与封号决策台</Text>
        </div>
      </Header>
      <Content style={{ padding: 24 }}>
        <Flex vertical gap={16}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card><Statistic title="当前记录数" value={metrics.total} /></Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card><Statistic title="待处理" value={metrics.pendingCount} /></Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card><Statistic title="已处理" value={metrics.processedCount} /></Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card><Statistic title="总举报人数" value={metrics.totalReporters} /></Card>
            </Col>
          </Row>

          <Card>
            <Flex wrap gap={12} justify="space-between">
              <Flex wrap gap={12}>
                <Input
                  allowClear
                  placeholder="搜索 UID / 昵称 / 作品 ID / 作品名"
                  style={{ width: 320 }}
                  value={filters.keyword}
                  onChange={(e) => setFilters((c) => ({ ...c, keyword: e.target.value }))}
                  onPressEnter={() => void handleSearch()}
                />
                <Select
                  style={{ width: 180 }}
                  value={filters.status}
                  options={[
                    { label: "全部状态", value: "all" },
                    { label: "待处理", value: "pending" },
                    { label: "已处理", value: "processed" },
                  ]}
                  onChange={(v) => setFilters((c) => ({ ...c, status: v }))}
                />
                <Button type="primary" onClick={() => void handleSearch()}>查询</Button>
                <Button onClick={() => void handleReset()}>重置</Button>
              </Flex>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出 Excel
              </Button>
            </Flex>
          </Card>

          {error && <Alert type="error" showIcon message={error} />}

          {selectedCount > 0 && (
            <Card size="small">
              <Flex align="center" gap={16}>
                <Text>已选择 <Text strong>{selectedCount}</Text> 条记录</Text>
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    openConfirmModal(selectedRowKeys.map(String), "process")
                  }
                >
                  批量处理
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() =>
                    openConfirmModal(selectedRowKeys.map(String), "revoke")
                  }
                >
                  批量撤销
                </Button>
                <Button
                  size="small"
                  onClick={() => setSelectedRowKeys([])}
                >
                  取消选择
                </Button>
              </Flex>
            </Card>
          )}

          <Card
            title="封号处理列表"
            extra={<Text type="secondary">点击行查看详情，支持多选批量操作</Text>}
          >
            <ReportTable
              records={records}
              loading={loading}
              actionLoadingId={actionLoadingId}
              selectedRowKeys={selectedRowKeys}
              onSelectionChange={setSelectedRowKeys}
              onProcess={handleSingleProcess}
              onRevoke={handleSingleRevoke}
              onRowClick={handleRowClick}
            />
          </Card>
        </Flex>
      </Content>

      <ActionConfirmModal
        open={modalOpen}
        action={modalAction}
        targetCount={modalTargetIds.length}
        loading={modalLoading}
        onConfirm={(remark) => void handleModalConfirm(remark)}
        onCancel={() => setModalOpen(false)}
      />

      <DetailDrawer
        open={drawerOpen}
        record={drawerRecord}
        onClose={() => setDrawerOpen(false)}
      />
    </Layout>
  );
}
