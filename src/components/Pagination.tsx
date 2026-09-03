import React from "react";
import { useTranslation } from "react-i18next";

interface PaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: React.ReactNode;
  newestFirst?: boolean;
}

function Pagination<T>({
  items,
  itemsPerPage = 3,
  renderItem,
  className = "",
  emptyMessage = null,
  newestFirst = true,
}: PaginationProps<T>) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = React.useState(1);

  // 处理数据顺序，默认最新的在前�?
  const orderedItems = React.useMemo(() => {
    if (newestFirst) {
      // 创建副本以避免修改原始数�?
      return [...items].reverse();
    }
    return items;
  }, [items, newestFirst]);

  // 计算总页�?
  const totalPages = Math.ceil(orderedItems.length / itemsPerPage);

  // 如果没有数据，显示空状�?
  if (orderedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-400 h-64">
        {emptyMessage || (
          <>
            <img
              src="/nors-BR_U97rM.png"
              alt={t("noData")}
              className="w-28 h-28 mb-4 object-contain opacity-80"
            />
            <span className="text-gray-500">{t("noData")}</span>
          </>
        )}
      </div>
    );
  }

  // 获取当前页的项目
  const currentItems = orderedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 处理页面变化
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className={className}>
      {/* 渲染当前页的项目 */}
      <div className="space-y-3">
        {currentItems.map((item, index) => (
          <React.Fragment key={index}>
            {renderItem(item, (currentPage - 1) * itemsPerPage + index)}
          </React.Fragment>
        ))}
      </div>

      {/* 分页控制 - 只有当总页数大�?时才显示 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-6">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              currentPage === 1
                ? "text-gray-500 bg-gray-800/50 cursor-not-allowed"
                : "text-white bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {t("prevPage")}
          </button>

          <span className="text-gray-300 text-sm">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              currentPage === totalPages
                ? "text-gray-500 bg-gray-800/50 cursor-not-allowed"
                : "text-white bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {t("nextPage")}
          </button>
        </div>
      )}
    </div>
  );
}

export default Pagination;
