import React from "react";
import { Button, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { InlineMenuItem, MenuItemStyle } from "./InlineMenuEditor";
import SortableButton from "./SortableButton";

// ─── 样式映射（供 SortableButton 复用）────────────────────
export const styleColorMap: Record<
  MenuItemStyle,
  { bg: string; border: string; text: string }
> = {
  primary: { bg: "#e6f4ff", border: "#91caff", text: "#0958d9" },
  success: { bg: "#f6ffed", border: "#b7eb8f", text: "#389e0d" },
  danger: { bg: "#fff2f0", border: "#ffccc7", text: "#cf1322" },
};

export interface SortableRowProps {
  row: number;
  rowIndex: number;
  totalRows: number;
  buttons: InlineMenuItem[];
  showStyle: boolean;
  onAddButton: (row: number) => void;
  onEditButton: (item: InlineMenuItem) => void;
  onDeleteButton: (id: string) => void;
  onDeleteRow: (row: number) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({
  row,
  rowIndex,
  buttons,
  showStyle,
  onAddButton,
  onEditButton,
  onDeleteButton,
  onDeleteRow,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row,
    data: { type: "row" },
  });

  const containerStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
    paddingBottom: 8,
    paddingTop: 6,
    paddingLeft: 8,
    paddingRight: 8,
    borderBottom: "1px dashed #e8e8e8",
    background: isDragging ? "#f0f7ff" : "transparent",
    borderRadius: isDragging ? 4 : 0,
    // 整行可拖，cursor 提示
    cursor: "grab",
    touchAction: "none",
    userSelect: "none",
  };

  // 按钮的 sortable id 列表（水平排序用）
  const buttonIds = buttons.map((b) => `btn-${b._id}`);

  return (
    <div ref={setNodeRef} style={containerStyle} {...attributes} {...listeners}>
      {/* 行标签 */}
      <span
        style={{
          fontSize: 11,
          color: "#8c8c8c",
          background: "#f0f0f0",
          borderRadius: 3,
          padding: "1px 5px",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        行 {rowIndex + 1}
      </span>

      {/* 该行按钮（水平可排序） */}
      <SortableContext
        items={buttonIds}
        strategy={horizontalListSortingStrategy}
      >
        {buttons.map((item) => (
          <SortableButton
            key={item._id}
            item={item}
            showStyle={showStyle}
            onEdit={onEditButton}
            onDelete={onDeleteButton}
          />
        ))}
      </SortableContext>

      {/* 追加按钮 */}
      <Button
        type="dashed"
        size="small"
        icon={<PlusOutlined />}
        style={{
          height: 26,
          fontSize: 12,
          padding: "0 8px",
          cursor: "pointer",
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onAddButton(row)}
      >
        添加按钮
      </Button>

      {/* 删除整行 */}
      <Tooltip title="删除此行">
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          style={{
            marginLeft: "auto",
            height: 26,
            opacity: 0.6,
            cursor: "pointer",
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDeleteRow(row)}
        />
      </Tooltip>
    </div>
  );
};

export default SortableRow;
