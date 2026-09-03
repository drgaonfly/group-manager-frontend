import React from 'react';
import { Modal } from 'antd';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface GroupContextFormProps {
  /** 弹窗显示状态 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 弹窗标题 */
  title: string;
  /** 固定的群组 ID（来自群组上下文场景，传入时 Form 内部应隐藏 GroupSelect） */
  fixedGroupId?: string;
  /** 弹窗宽度 */
  width?: number | string;
  /** Form 内容 */
  children: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 统一的 Form 弹窗包装器，感知群组上下文（`fixedGroupId`）。
 *
 * 具体 Form 组件通过 `children` 注入，`fixedGroupId` 由父层向下透传至
 * Form 组件，决定是否渲染 GroupSelect 选择器。
 */
const GroupContextForm: React.FC<GroupContextFormProps> = ({
  open,
  onClose,
  title,
  width = 800,
  children,
}) => {
  return (
    <Modal title={title} open={open} onCancel={onClose} footer={null} width={width} destroyOnClose>
      {children}
    </Modal>
  );
};

export default GroupContextForm;
