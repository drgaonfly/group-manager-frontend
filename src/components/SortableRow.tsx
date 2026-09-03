import React from 'react';
import { Button, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { InlineMenuItem, MenuItemStyle, MenuItemType } from './InlineMenuEditor';

// ─── 样式映射 ──────────────────────────────────────────────
export const styleColorMap: Record<MenuItemStyle, { bg: string; border: string; text: string }> = {
  primary: { bg: '#e6f4ff', border: '#91caff', text: '#0958d9' },
  success: { bg: '#f6ffed', border: '#b7eb8f', text: '#389e0d' },
  danger: { bg: '#fff2f0', border: '#ffccc7', text: '#cf1322' },
};

const typeIconMap: Record<MenuItemType, string> = {
  url: '🔗',
  callback: '💬',
  copy_text: '📋',
};

// ─── Props ────────────────────────────────────────────────
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

// ─── 组件 ─────────────────────────────────────────────────
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '1px dashed #e8e8e8',
    background: isDragging ? '#f0f7ff' : 'transparent',
    borderRadius: isDragging ? 4 : 0,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* 拖拽把手 */}
      <span
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          color: '#bfbfbf',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          touchAction: 'none',
          userSelect: 'none',
        }}
        title="拖动排序"
      >
        <HolderOutlined />
      </span>

      {/* 行标签 */}
      <span
        style={{
          fontSize: 11,
          color: '#8c8c8c',
          background: '#f0f0f0',
          borderRadius: 3,
          padding: '1px 5px',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        行 {rowIndex + 1}
      </span>

      {/* 该行按钮 */}
      {buttons.map((item) => {
        const useStyle = showStyle && (item.type || 'url') === 'url';
        const colors = useStyle
          ? styleColorMap[item.style || 'primary']
          : { bg: '#f5f5f5', border: '#d9d9d9', text: '#595959' };
        const typeIcon = typeIconMap[item.type || 'url'];
        const tooltipContent =
          item.type === 'url'
            ? item.url
            : item.type === 'callback'
            ? `callback: ${item.callback}`
            : item.type === 'copy_text'
            ? `复制: ${item.copy_text}`
            : item.url;

        return (
          <div
            key={item._id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
              background: colors.bg,
              color: colors.text,
              fontSize: 13,
            }}
          >
            <span style={{ fontSize: 11, opacity: 0.8 }}>{typeIcon}</span>
            <Tooltip title={tooltipContent} placement="top">
              <span
                style={{
                  maxWidth: 100,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
                onClick={() => onEditButton(item)}
              >
                {item.name || '(未命名)'}
              </span>
            </Tooltip>
            <EditOutlined
              style={{ fontSize: 11, opacity: 0.5, cursor: 'pointer' }}
              onClick={() => onEditButton(item)}
            />
            <CloseOutlined
              style={{ fontSize: 10, opacity: 0.5, cursor: 'pointer', color: '#ff4d4f' }}
              onClick={() => onDeleteButton(item._id)}
            />
          </div>
        );
      })}

      {/* 该行追加按钮 */}
      <Button
        type="dashed"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => onAddButton(row)}
        style={{ height: 26, fontSize: 12, padding: '0 8px' }}
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
          onClick={() => onDeleteRow(row)}
          style={{ marginLeft: 'auto', height: 26, opacity: 0.6 }}
        />
      </Tooltip>
    </div>
  );
};

export default SortableRow;
