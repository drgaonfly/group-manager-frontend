// ─────────────────────────────────────────────────────────────────────────────
// BotConfigManager — 公共类型定义
// ─────────────────────────────────────────────────────────────────────────────

/** 所有功能数据记录的通用基础字段 */
export interface FeatureBaseRecord {
  _id: string;
  /** 关联机器人（可能是已 populate 的对象，也可能是裸 ID 字符串） */
  bot: any;
  /** 关联群组（可选） */
  group?: any;
  /** 启用 / 禁用状态 */
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 群组上下文的核心 props 组合 */
export interface GroupContext {
  bot: any;
  group?: any;
}

/**
 * 所有功能模块 Form 组件的标准 Props 接口。
 *
 * - 传入 `fixedGroupId`：群组已固定，Form 内不渲染 GroupSelect
 * - 不传 `fixedGroupId`：机器人级视图，Form 内渲染 GroupSelect 供用户选择
 */
export interface StandardFormProps<TRecord = any> {
  /** 弹窗开关 */
  open: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 当前机器人记录（用于新建时关联 bot） */
  currentRow: any;
  /** 编辑时传入现有记录，不传则为新建模式 */
  editingRecord?: TRecord | null;
  /** 操作成功后回调（通常是刷新列表） */
  onSuccess: () => void;
  /** 固定的群组 ID（来自群组上下文场景） */
  fixedGroupId?: string;
}
