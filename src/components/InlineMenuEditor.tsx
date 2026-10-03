import React, { useState } from "react";
import { Button, Modal, Form, Input, Select, Space, Popover } from "antd";
import { PlusOutlined, SmileOutlined } from "@ant-design/icons";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableRow from "./SortableRow";

export type MenuItemType = "url" | "callback" | "copy_text";
export type MenuItemStyle = "primary" | "success" | "danger";

export interface InlineMenuItem {
  _id: string;
  name: string;
  type: MenuItemType;
  url?: string;
  callback?: string;
  copy_text?: string;
  row: number;
  style?: MenuItemStyle;
}

// ─── 按钮配置弹窗 ──────────────────────────────────────────
interface ButtonConfigModalProps {
  open: boolean;
  item: Partial<InlineMenuItem>;
  onOk: (
    values: Pick<
      InlineMenuItem,
      "name" | "type" | "url" | "callback" | "copy_text" | "style"
    >,
  ) => void;
  onCancel: () => void;
  showStyle?: boolean;
}

const TYPE_OPTIONS = [
  { label: "🔗 URL 链接", value: "url", desc: "打开外部链接" },
  { label: "💬 Callback", value: "callback", desc: "点击后弹窗提示" },
  { label: "📋 复制文本", value: "copy_text", desc: "点击后复制指定文本" },
];

const ButtonConfigModal: React.FC<ButtonConfigModalProps> = ({
  open,
  item,
  onOk,
  onCancel,
  showStyle = false,
}) => {
  const [form] = Form.useForm();
  const [currentType, setCurrentType] = useState<MenuItemType>("url");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const nameInputRef = React.useRef<any>(null);
  // Popover 打开时 input 失焦，提前记录光标位置
  const caretPosRef = React.useRef<number>(0);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const current: string = form.getFieldValue("name") ?? "";
    const pos = caretPosRef.current;
    const next = current.slice(0, pos) + emojiData.emoji + current.slice(pos);
    form.setFieldValue("name", next);
    setEmojiPickerOpen(false);
    // 恢复光标到 emoji 末尾
    const newPos = pos + emojiData.emoji.length;
    requestAnimationFrame(() => {
      const el = nameInputRef.current?.input as HTMLInputElement | null;
      if (el) {
        el.focus();
        el.setSelectionRange(newPos, newPos);
      }
    });
  };

  React.useEffect(() => {
    if (open) {
      const type = item.type || "url";
      setCurrentType(type);
      form.setFieldsValue({
        name: item.name || "",
        type,
        url: item.url || "",
        callback: item.callback || "",
        copy_text: item.copy_text || "",
        style: item.style || "primary",
      });
    }
  }, [open, item]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // 处理 @username 转换为 https://t.me/username
      if (values.type === "url" && values.url) {
        const url = values.url.trim();
        if (url.startsWith("@")) {
          values.url = `https://t.me/${url.substring(1)}`;
        }
      }
      onOk(values);
      form.resetFields();
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <Modal
      title={item._id ? "编辑按钮" : "新建按钮"}
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      width={440}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="按钮名称"
          rules={[{ required: true, message: "请输入按钮名称" }]}
        >
          <Input
            ref={nameInputRef}
            placeholder="例如：点击领取"
            autoFocus
            onBlur={(e) => {
              caretPosRef.current = e.target.selectionStart ?? 0;
            }}
            suffix={
              <Popover
                open={emojiPickerOpen}
                onOpenChange={setEmojiPickerOpen}
                trigger="click"
                placement="bottomRight"
                overlayInnerStyle={{ padding: 0 }}
                content={
                  <EmojiPicker
                    theme={Theme.LIGHT}
                    onEmojiClick={onEmojiClick}
                    width={320}
                    height={400}
                  />
                }
              >
                <SmileOutlined
                  style={{ color: "#8c8c8c", cursor: "pointer" }}
                />
              </Popover>
            }
          />
        </Form.Item>

        <Form.Item name="type" label="按钮类型" rules={[{ required: true }]}>
          <Select
            options={TYPE_OPTIONS.map((o) => ({
              label: (
                <span>
                  {o.label}
                  <span
                    style={{ color: "#8c8c8c", fontSize: 12, marginLeft: 6 }}
                  >
                    {o.desc}
                  </span>
                </span>
              ),
              value: o.value,
            }))}
            onChange={(v) => setCurrentType(v as MenuItemType)}
          />
        </Form.Item>

        {currentType === "url" && (
          <Form.Item
            name="url"
            label="链接地址"
            tooltip="支持完整链接（https://...）或 Telegram 用户名（@username）"
            rules={[
              { required: true, message: "请输入链接或用户名" },
              {
                pattern: /^(https?:\/\/.+|@\w+)$/,
                message:
                  "请输入有效链接（https://...）或电报的用户名（@username）",
              },
            ]}
          >
            <Input placeholder="https://t.me/... 或 @username" />
          </Form.Item>
        )}

        {currentType === "callback" && (
          <Form.Item
            name="callback"
            label="弹窗提示文字"
            tooltip="用户点击按钮后，Telegram 会弹窗显示此处填写的文字"
            rules={[{ required: true, message: "请输入弹窗文字" }]}
          >
            <Input.TextArea placeholder="例如：余额不足，请充值" rows={3} />
          </Form.Item>
        )}

        {currentType === "copy_text" && (
          <Form.Item
            name="copy_text"
            label="复制内容"
            tooltip="用户点击后会自动复制此处填写的文本内容到剪贴板"
            rules={[{ required: true, message: "请输入要复制的文本" }]}
          >
            <Input.TextArea placeholder="点击后将复制此内容..." rows={3} />
          </Form.Item>
        )}

        {showStyle && currentType === "url" && (
          <Form.Item name="style" label="按钮样式">
            <Select
              options={[
                { label: "🔵 蓝色", value: "primary" },
                { label: "🟢 绿色", value: "success" },
                { label: "🔴 红色", value: "danger" },
              ]}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

// ─── 主组件 ────────────────────────────────────────────────
interface InlineMenuEditorProps {
  value?: InlineMenuItem[];
  onChange?: (value: InlineMenuItem[]) => void;
  showStyle?: boolean;
}

const InlineMenuEditor: React.FC<InlineMenuEditorProps> = ({
  value = [],
  onChange,
  showStyle = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InlineMenuItem>>({});

  const triggerChange = (next: InlineMenuItem[]) => onChange?.(next);

  // 按 row 分组，升序排列
  const existingRows = Array.from(new Set(value.map((m) => m.row))).sort(
    (a, b) => a - b,
  );
  const [emptyRows, setEmptyRows] = useState<number[]>([]);

  // 同步 rowOrder：新增/删除行时更新
  const allRows = Array.from(new Set([...existingRows, ...emptyRows])).sort(
    (a, b) => a - b,
  );

  // 维护一个稳定的行顺序，仅在行集合变化时同步
  const [orderedRows, setOrderedRows] = useState<number[]>([]);

  React.useEffect(() => {
    setOrderedRows((prev) => {
      const prevSet = new Set(prev);
      const newSet = new Set(allRows);
      // 删除已不存在的行
      const filtered = prev.filter((r) => newSet.has(r));
      // 追加新增的行（保持末尾）
      const added = allRows.filter((r) => !prevSet.has(r));
      return [...filtered, ...added];
    });
  }, [allRows.join(",")]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 长按 150ms 或拖动超过 5px 才激活，避免和点击冲突
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  const buttonsInRow = (row: number) => value.filter((m) => m.row === row);

  // 新建一行（取当前最大行号 +1，创建空行）
  const addRow = () => {
    const nextRow = allRows.length > 0 ? Math.max(...allRows) + 1 : 1;
    setEmptyRows((prev) => [...prev, nextRow]);
  };

  // 在指定行新建按钮
  const addButtonInRow = (row: number) => {
    setEditingItem({ row });
    setModalOpen(true);
  };

  // 编辑按钮
  const editButton = (item: InlineMenuItem) => {
    setEditingItem({ ...item });
    setModalOpen(true);
  };

  // 删除按钮
  const deleteButton = (id: string) => {
    triggerChange(value.filter((m) => m._id !== id));
  };

  // 删除整行
  const deleteRow = (row: number) => {
    triggerChange(value.filter((m) => m.row !== row));
    setEmptyRows((prev) => prev.filter((r) => r !== row));
  };

  // 从 dnd-kit 的 over id 反推目标行号
  // over 可能是行 id（number）或按钮 id（"btn-xxx"）
  const resolveTargetRow = (
    overId: string | number,
    currentValue: InlineMenuItem[],
    currentOrderedRows: number[],
  ): number | null => {
    if (typeof overId === "number") {
      // over 是行容器
      return currentOrderedRows.includes(overId) ? overId : null;
    }
    // over 是按钮（"btn-{_id}"）
    const btnId = String(overId).replace(/^btn-/, "");
    const found = currentValue.find((m) => m._id === btnId);
    return found ? found.row : null;
  };

  // 拖拽结束处理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = (active.data.current as any)?.type;

    // ── 行拖拽：整行重新排序 ──────────────────────────────
    if (activeType === "row") {
      setOrderedRows((prev) => {
        const oldIndex = prev.indexOf(active.id as number);
        const newIndex = prev.indexOf(over.id as number);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const reordered = arrayMove(prev, oldIndex, newIndex);

        const rowMap = new Map<number, number>();
        reordered.forEach((originalRow, idx) => {
          rowMap.set(originalRow, idx + 1);
        });

        triggerChange(
          value.map((m) => ({ ...m, row: rowMap.get(m.row) ?? m.row })),
        );
        setEmptyRows((prev2) => prev2.map((r) => rowMap.get(r) ?? r));
        return reordered.map((_, idx) => idx + 1);
      });
      return;
    }

    // ── 按钮拖拽 ─────────────────────────────────────────
    if (activeType === "button") {
      const activeBtnId = String(active.id).replace(/^btn-/, "");
      const activeItem = value.find((m) => m._id === activeBtnId);
      if (!activeItem) return;

      const targetRow = resolveTargetRow(over.id, value, orderedRows);
      if (targetRow === null) return;

      if (activeItem.row === targetRow) {
        // 同行排序
        const rowButtons = value.filter((m) => m.row === targetRow);
        const overBtnId = String(over.id).replace(/^btn-/, "");
        const oldIdx = rowButtons.findIndex((m) => m._id === activeBtnId);
        const newIdx = rowButtons.findIndex((m) => m._id === overBtnId);
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;

        const reordered = arrayMove(rowButtons, oldIdx, newIdx);
        const otherButtons = value.filter((m) => m.row !== targetRow);
        triggerChange([...otherButtons, ...reordered]);
      } else {
        // 跨行转移：把按钮的 row 改成目标行，然后检查源行是否变空
        const sourceRow = activeItem.row;
        const newValue = value.map((m) =>
          m._id === activeBtnId ? { ...m, row: targetRow } : m,
        );
        const sourceRowEmpty =
          newValue.filter((m) => m.row === sourceRow).length === 0;

        if (sourceRowEmpty) {
          // 源行变空，从 orderedRows 中移除并重新规范化行号
          const nextOrdered = orderedRows.filter((r) => r !== sourceRow);
          const rowMap = new Map<number, number>();
          nextOrdered.forEach((r, idx) => rowMap.set(r, idx + 1));
          triggerChange(
            newValue.map((m) => ({ ...m, row: rowMap.get(m.row) ?? m.row })),
          );
          setEmptyRows((prev) => prev.filter((r) => r !== sourceRow));
          setOrderedRows(nextOrdered.map((_, idx) => idx + 1));
        } else {
          triggerChange(newValue);
        }
      }
    }
  };

  // 弹窗确认
  const handleModalOk = (
    vals: Pick<
      InlineMenuItem,
      "name" | "type" | "url" | "callback" | "copy_text" | "style"
    >,
  ) => {
    const cleaned: Partial<InlineMenuItem> = {
      name: vals.name,
      type: vals.type,
      style: vals.style,
      url: undefined,
      callback: undefined,
      copy_text: undefined,
    };
    switch (vals.type) {
      case "url":
        cleaned.url = vals.url;
        break;
      case "callback":
        cleaned.callback = vals.callback;
        break;
      case "copy_text":
        cleaned.copy_text = vals.copy_text;
        break;
    }

    if (editingItem._id) {
      triggerChange(
        value.map((m) =>
          m._id === editingItem._id ? { ...m, ...cleaned } : m,
        ),
      );
    } else {
      triggerChange([
        ...value,
        {
          _id: Date.now().toString(),
          row: editingItem.row ?? 1,
          ...cleaned,
        } as InlineMenuItem,
      ]);
      setEmptyRows((prev) => prev.filter((r) => r !== editingItem.row));
    }
    setModalOpen(false);
  };

  return (
    <div>
      {/* 行列布局 */}
      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: 6,
          padding: "12px 16px",
          background: "#fafafa",
          marginBottom: 8,
          minHeight: 56,
        }}
      >
        {orderedRows.length === 0 ? (
          <span style={{ color: "#bfbfbf", fontSize: 13 }}>
            暂无按钮，点击「新建一行按钮」开始配置
          </span>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedRows}
              strategy={verticalListSortingStrategy}
            >
              {orderedRows.map((row, idx) => (
                <SortableRow
                  key={row}
                  row={row}
                  rowIndex={idx}
                  totalRows={orderedRows.length}
                  buttons={buttonsInRow(row)}
                  showStyle={showStyle}
                  onAddButton={addButtonInRow}
                  onEditButton={editButton}
                  onDeleteButton={deleteButton}
                  onDeleteRow={deleteRow}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* 新建一行按钮 */}
      <Space>
        <Button icon={<PlusOutlined />} onClick={addRow} size="small">
          新建一行按钮
        </Button>
        {orderedRows.length > 0 && (
          <span style={{ color: "#8c8c8c", fontSize: 12 }}>
            共 {value.length} 个按钮，{orderedRows.length} 行
          </span>
        )}
      </Space>

      {/* 配置弹窗 */}
      <ButtonConfigModal
        open={modalOpen}
        item={editingItem}
        showStyle={showStyle}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
};

export default InlineMenuEditor;
