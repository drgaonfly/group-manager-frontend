import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import { request, queryList, updateItem, removeItem } from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UseFeatureListOptions {
  /** API 路径，如 '/reply-rules' */
  apiPath: string;
  /** 机器人 ID（必须） */
  botId: string | undefined;
  /** 群组 ID（传入时自动作为过滤条件） */
  groupId?: string | undefined;
  /**
   * 触发加载的依赖开关。
   * 默认为 true（立即加载），GroupContent 场景下传入 `open` 控制按需加载。
   */
  enabled?: boolean;
  /**
   * 删除时的请求方式：
   * - 'batch'  → removeItem(apiPath, { ids: [id] })       (默认)
   * - 'single' → request(`${apiPath}/${id}`, { method: 'DELETE' })
   */
  deleteMode?: "batch" | "single";
  /** 状态切换所用的字段名，默认 'isOnline' */
  statusField?: string;
}

export interface UseFeatureListReturn<T> {
  data: T[];
  loading: boolean;
  formOpen: boolean;
  editingRecord: T | null;
  fetchData: () => Promise<void>;
  openCreate: () => void;
  openEdit: (record: T) => void;
  closeForm: () => void;
  handleDelete: (id: string) => Promise<void>;
  handleStatusChange: (record: T, value: boolean) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 通用列表状态管理 Hook，封装数据获取、CRUD 状态、表单弹窗开关逻辑。
 *
 * @example
 * ```tsx
 * // 机器人级（不传 groupId）
 * const state = useFeatureList<ReplyRuleRecord>({
 *   apiPath: '/reply-rules',
 *   botId: currentRow?._id,
 * });
 *
 * // 群组上下文（传入 groupId + enabled）
 * const state = useFeatureList<ReplyRuleRecord>({
 *   apiPath: '/reply-rules',
 *   botId: bot?._id,
 *   groupId: group?._id,
 *   enabled: open,
 * });
 * ```
 */
function useFeatureList<T extends { _id: string }>(
  options: UseFeatureListOptions,
): UseFeatureListReturn<T> {
  const {
    apiPath,
    botId,
    groupId,
    enabled = true,
    deleteMode = "batch",
    statusField = "isOnline",
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<T | null>(null);

  // ── 数据加载 ────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {

    if (!botId || !enabled) return;

    setLoading(true);
    try {
      const params: Record<string, any> = {
        current: 1,
        pageSize: 10,
        botId,
      };
      // 仅在 groupId 存在时附加，确保机器人级请求不带 groupId
      if (groupId) {
        params.groupId = groupId;
      }

      const res = await queryList(apiPath, params);

      if (res?.data) {
        setData(res.data as T[]);
      }
    } catch(error: any) {
      message.error(error?.response?.data?.message ?? "获取列表失败");
    } finally {
      setLoading(false);
    }
  }, [apiPath, botId, groupId, enabled]);

  // enabled 从 false→true 时自动触发一次加载
  const prevEnabled = useRef(enabled);
  useEffect(() => {
    if (!prevEnabled.current && enabled) {
      fetchData();
    }
    prevEnabled.current = enabled;
  }, [enabled, fetchData]);

  // 初始加载（enabled 一开始就是 true 时）
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId, groupId, apiPath]);

  // ── 表单弹窗控制 ─────────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((record: T) => {
    setEditingRecord(record);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingRecord(null);
  }, []);

  // ── 删除 ────────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        if (deleteMode === "single") {
          await request(`${apiPath}/${id}`, { method: "DELETE" });
        } else {
          await removeItem(apiPath, { ids: [id] });
        }
        message.success("删除成功");
        await fetchData();
      } catch (e: any) {
        message.error(e?.response?.data?.message ?? "删除失败");
      }
    },
    [apiPath, deleteMode, fetchData],
  );

  // ── 状态切换 ─────────────────────────────────────────────────────────────────

  const handleStatusChange = useCallback(
    async (record: T, value: boolean) => {
      try {
        // 构建URL，如果有botId则添加查询参数
        const url = botId
          ? `${apiPath}/${record._id}?botId=${botId}`
          : `${apiPath}/${record._id}`;

        await updateItem(url, { [statusField]: value });
        message.success("状态更新成功");
        await fetchData();
      } catch (e: any) {
        message.error(e?.response?.data?.message ?? "更新失败");
      }
    },
    [apiPath, statusField, fetchData, botId],
  );

  return {
    data,
    loading,
    formOpen,
    editingRecord,
    fetchData,
    openCreate,
    openEdit,
    closeForm,
    handleDelete,
    handleStatusChange,
  };
}

export default useFeatureList;
