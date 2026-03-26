"use client";

import { useState } from "react";
import { Input, Modal, Typography } from "antd";
import type { ReportAction } from "@/types/report";

const { Text } = Typography;

interface ActionConfirmModalProps {
  open: boolean;
  action: ReportAction;
  targetCount: number;
  loading: boolean;
  onConfirm: (remark: string) => void;
  onCancel: () => void;
}

const actionLabels: Record<ReportAction, string> = {
  process: "处理",
  revoke: "撤销",
  reject: "驳回",
};

export function ActionConfirmModal({
  open,
  action,
  targetCount,
  loading,
  onConfirm,
  onCancel,
}: ActionConfirmModalProps) {
  const [remark, setRemark] = useState("");
  const label = actionLabels[action];
  const isProcess = action === "process";
  const isReject = action === "reject";
  const remarkRequired = isProcess || isReject;

  const handleOk = () => {
    if (remarkRequired && !remark.trim()) return;
    onConfirm(remark.trim());
  };

  return (
    <Modal
      open={open}
      title={`确认${label}`}
      okText={`确认${label}`}
      cancelText="取消"
      okButtonProps={{
        danger: !isProcess,
        loading,
        disabled: remarkRequired && !remark.trim(),
        ...(isReject ? { style: { backgroundColor: "#faad14", borderColor: "#faad14" } } : {}),
      }}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
    >
      <div style={{ marginBottom: 16 }}>
        <Text>
          即将对 <Text strong>{targetCount}</Text> 条记录执行
          <Text strong type={isProcess ? "success" : isReject ? "warning" : "danger"}>{` ${label} `}</Text>
          操作，是否继续？
        </Text>
      </div>
      <div>
        <Text style={{ display: "block", marginBottom: 8 }}>
          {isProcess ? "封号原因 / 备注（必填）" : isReject ? "驳回理由（必填）" : "撤销备注（选填）"}
        </Text>
        <Input.TextArea
          rows={3}
          maxLength={200}
          showCount
          placeholder={isProcess ? "请填写封号原因，例如：多端同时在线证据充分" : isReject ? "请填写驳回理由，例如：证据不足，用户行为正常" : "选填，可说明撤销理由"}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          onPressEnter={(e) => {
            if (e.ctrlKey || e.metaKey) handleOk();
          }}
        />
      </div>
    </Modal>
  );
}
