"use client";

import { useState } from "react";
import { Flex, Input, Modal, Tag, Typography } from "antd";
import { REPORT_REASONS } from "@/types/author-report";
import type { LeaderboardUser } from "@/types/author-report";

const { Text } = Typography;
const { TextArea } = Input;
const { CheckableTag } = Tag;

interface ReportModalProps {
  open: boolean;
  loading: boolean;
  targets: LeaderboardUser[];
  onConfirm: (reasons: string[], description?: string) => void;
  onCancel: () => void;
}

export function ReportModal({
  open,
  loading,
  targets,
  onConfirm,
  onCancel,
}: ReportModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const toggleReason = (reason: string, checked: boolean) => {
    setSelectedReasons((prev) =>
      checked ? [...prev, reason] : prev.filter((r) => r !== reason)
    );
  };

  const handleOk = () => {
    onConfirm(selectedReasons, description.trim() || undefined);
    setSelectedReasons([]);
    setDescription("");
  };

  const handleCancel = () => {
    onCancel();
    setSelectedReasons([]);
    setDescription("");
  };

  return (
    <Modal
      title="举报共享号"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="提交举报"
      cancelText="取消"
      okButtonProps={{
        loading,
        disabled: selectedReasons.length === 0,
        danger: true,
      }}
      destroyOnHidden
      width={520}
    >
      <Flex vertical gap={16} style={{ marginTop: 12 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            被举报用户
          </Text>
          {targets.length === 1 ? (
            <div
              style={{
                marginTop: 6,
                padding: "8px 12px",
                background: "#fafafa",
                borderRadius: 6,
                border: "1px solid #f0f0f0",
              }}
            >
              <Flex justify="space-between" align="center">
                <Text strong>{targets[0].nickname}</Text>
                <Text type="secondary">UID: {targets[0].uid}</Text>
              </Flex>
              <Text type="secondary" style={{ fontSize: 12 }}>
                阅读时长：{targets[0].readHours.toFixed(2)}h
              </Text>
            </div>
          ) : (
            <div
              style={{
                marginTop: 6,
                padding: "8px 12px",
                background: "#fafafa",
                borderRadius: 6,
                border: "1px solid #f0f0f0",
              }}
            >
              <Text strong>
                已选择 {targets.length} 个用户
              </Text>
              <div style={{ marginTop: 4 }}>
                {targets.map((t) => (
                  <Tag key={t.uid} style={{ marginBottom: 4 }}>
                    {t.nickname}（{t.readHours.toFixed(2)}h）
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            举报原因（至少选一个）
          </Text>
          <Flex wrap gap={8} style={{ marginTop: 6 }}>
            {REPORT_REASONS.map((reason) => (
              <CheckableTag
                key={reason}
                checked={selectedReasons.includes(reason)}
                onChange={(checked) => toggleReason(reason, checked)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 4,
                  border: "1px solid #d9d9d9",
                  fontSize: 13,
                }}
              >
                {reason}
              </CheckableTag>
            ))}
          </Flex>
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            补充说明（选填）
          </Text>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="可补充具体异常情况描述..."
            rows={3}
            maxLength={500}
            showCount
            style={{ marginTop: 6 }}
          />
        </div>
      </Flex>
    </Modal>
  );
}
