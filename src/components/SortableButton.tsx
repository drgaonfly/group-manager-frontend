import React from "react";
import { Tooltip } from "antd";
import { EditOutlined, CloseOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { InlineMenuItem, MenuItemType } from "./InlineMenuEditor";
import { styleColorMap } from "./SortableRow";

const typeIconMap: Record<MenuItemType, string> = {
  url: "🔗",
  callback: "💬",
  copy_text: "📋",
};

interface SortableButtonProps {
  item: InlineMenuItem;
  showStyle: boolean;
  onEdit: (item: InlineMenuItem) => void;
  onDelete: (id: string) => void;
}

const SortableButton: React.FC<SortableButtonProps> = ({
  item,
  showStyle,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `btn-${item._id}`,
    data: { type: "button", item },
  });

  const useStyle = showStyle && (item.type || "url") === "url";
  const colors = useStyle
    ? styleColorMap[item.style || "primary"]
    : { bg: "#f5f5f5", border: "#d9d9d9", text: "#595959" };
  const typeIcon = typeIconMap[item.type || "url"];
  const tooltipContent =
    item.type === "url"
      ? item.url
      : item.type === "callback"
        ? `callback: ${item.callback}`
        : item.type === "copy_text"
          ? `复制: ${item.copy_text}`
          : item.url;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        border: `1px solid ${colors.border}`,
        borderRadius: 4,
        background: isDragging ? "#e6f4ff" : colors.bg,
        color: colors.text,
        fontSize: 13,
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
      }}
      // 整个按钮卡片都可拖拽
      {...attributes}
      {...listeners}
    >
      <span style={{ fontSize: 11, opacity: 0.8 }}>{typeIcon}</span>
      <Tooltip title={tooltipContent} placement="top">
        <span
          style={{
            maxWidth: 100,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
          // 阻止冒泡，避免触发拖拽
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onEdit(item)}
        >
          {item.name || "(未命名)"}
        </span>
      </Tooltip>
      <EditOutlined
        style={{ fontSize: 11, opacity: 0.5, cursor: "pointer" }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onEdit(item)}
      />
      <CloseOutlined
        style={{
          fontSize: 10,
          opacity: 0.5,
          cursor: "pointer",
          color: "#ff4d4f",
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(item._id)}
      />
    </div>
  );
};

export default SortableButton;
