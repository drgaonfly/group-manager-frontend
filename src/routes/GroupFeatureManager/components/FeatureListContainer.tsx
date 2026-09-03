import React from 'react';
import { Button, Table } from 'antd';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface FeatureListContainerProps<T> {
  title?: React.ReactNode;
  /** 列表数据 */
  data: T[];
  /** 加载状态 */
  loading: boolean;
  /** Table 列定义 */
  columns: ColumnsType<T>;
  /** 新建按钮文字，默认 "新建" */
  createButtonText?: string;
  /** 点击新建按钮回调 */
  onCreateClick: () => void;
  /** 表格 rowKey，默认 '_id' */
  rowKey?: string;
  /** 额外的头部元素（如 Alert 提示） */
  headerExtra?: React.ReactNode;
  /** 分页配置，false 则不显示 */
  pagination?: false | TablePaginationConfig;
  /** 滚动配置 */
  scroll?: TableProps<T>['scroll'];
  /** 移动端卡片渲染函数 */
  renderMobileCard?: (record: T) => React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

function FeatureListContainer<T extends object>(props: FeatureListContainerProps<T>): JSX.Element {
  const {
    title,
    data,
    loading,
    columns,
    createButtonText = '新建',
    onCreateClick,
    rowKey = '_id',
    headerExtra,
    pagination,
    scroll,
    renderMobileCard,
  } = props;

  return (
    <>
      {headerExtra && <div className="mb-3">{headerExtra}</div>}

      <div className="flex justify-between items-center mb-3">
        <div className="text-base sm:text-lg font-semibold">{title}</div>

        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateClick}>
          {createButtonText}
        </Button>
      </div>

      {/* 移动端卡片视图 */}
      <div className="sm:hidden">
        {data.map((record: any) => (
          <div
            key={record[rowKey] || record._id}
            className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm"
          >
            {/* 子组件需要通过自定义渲染来处理移动端卡片内容 */}
            {typeof renderMobileCard === 'function' ? (
              renderMobileCard(record)
            ) : (
              <div className="text-gray-500">暂无移动端视图</div>
            )}
          </div>
        ))}
        {data.length === 0 && <div className="text-center py-10 text-gray-400">暂无数据</div>}
      </div>

      {/* 桌面端表格视图 */}
      <div className="hidden sm:block">
        <Table<T>
          rowKey={rowKey}
          dataSource={data}
          columns={columns}
          loading={loading}
          size="small"
          pagination={
            pagination === false
              ? false
              : { pageSize: 10, ...pagination, simple: window.innerWidth < 768 }
          }
          scroll={scroll}
        />
      </div>
    </>
  );
}

export default FeatureListContainer;
