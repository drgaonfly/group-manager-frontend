import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Spin, Tabs, Row, Col, Divider, Pagination } from "antd";
import {
  InboxOutlined,
  SendOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import type { TabsProps } from "antd";
import { useTranslation } from "react-i18next";
import TransactionTable from "../components/TransactionTable";
import SummaryStats from "../components/SummaryStats";
import ToolBar from "../components/ToolBar";

function Home() {
  const { t } = useTranslation();
  const { query } = useParams();
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [isLoading, setIsLoading] = useState(false); // 用于全局加载状态
  const [tableLoading, setTableLoading] = useState(false); // 新增：仅用于表格加载状态
  // 为每种类型维护单独的分页状态
  const [depositPagination, setDepositPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [withdrawPagination, setWithdrawPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState("1");
  const [type, setType] = useState<"deposit" | "withdraw">("deposit");

  // 获取当前类型的分页状态
  const pagination =
    type === "deposit" ? depositPagination : withdrawPagination;

  const group_id = query ? Number(query) : undefined;

  // 获取交易数据
  const {
    data: transactionData = { data: [], total: 0 },
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["transactions", dateFilter, pagination, type],
    queryFn: async () => {
      setTableLoading(true); // 只设置表格加载状态
      try {
        const response = await axios.get("/transactions/f/all", {
          params: {
            dateFilter,
            current: pagination.current,
            pageSize: pagination.pageSize,
            groupId: group_id,
            type: type,
          },
        });
        setTotalItems(
          type === "deposit"
            ? response.data.deposit_total
            : response.data.withdraw_total,
        );
        return response.data;
      } finally {
        setTableLoading(false); // 请求完成后关闭表格加载状态
      }
    },
  });

  const transactions = transactionData.data || [];

  // 获取汇总数据
  const { data: summaryData, refetch: refetchSummary } = useQuery({
    queryKey: ["summary", dateFilter],
    queryFn: async () => {
      setIsLoading(true); // 汇总数据仍使用全局加载状态
      try {
        const response = await axios.get("/transactions/f/summary", {
          params: { dateFilter, groupId: group_id },
        });
        return response.data.data;
      } finally {
        setIsLoading(false);
      }
    },
  });

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
    if (key === "1") {
      setType("deposit");
    } else if (key === "2") {
      setType("withdraw");
    }
    // 切换Tab时不设置全局loading
  };

  // 下载Excel数据
  const downloadExcel = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/transactions/f/export", {
        params: { dateFilter, groupId: group_id },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `transactions-${dateFilter}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("导出Excel失败", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理分页变化
  const handleTableChange = (page: number, pageSize?: number) => {
    // 根据当前类型更新对应的分页状态
    if (type === "deposit") {
      setDepositPagination({
        current: page,
        pageSize: pageSize || depositPagination.pageSize,
      });
    } else {
      setWithdrawPagination({
        current: page,
        pageSize: pageSize || withdrawPagination.pageSize,
      });
    }
  };

  // 定义标签页
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span>
          <InboxOutlined />
          {t("deposit")} ({transactionData.deposit_total}
          {t("transactions")})
        </span>
      ),
      children: (
        <TransactionTable
          transactions={transactions}
          type="deposit"
          loading={tableLoading}
        />
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <SendOutlined />
          {t("withdraw")} ({transactionData.withdraw_total}
          {t("transactions")})
        </span>
      ),
      children: (
        <TransactionTable
          transactions={transactions}
          type="withdraw"
          loading={tableLoading}
        />
      ),
    },
    {
      key: "3",
      label: (
        <span>
          <CalculatorOutlined />
          {t("summary")}
        </span>
      ),
      children: <SummaryStats summaryData={summaryData} />,
    },
  ];

  // 只有在全局加载状态时才显示全屏加载
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin spinning={isLoading} tip={t("loading")} size="large" />
      </div>
    );
  }

  // 刷新所有数据
  const handleRefresh = () => {
    setTableLoading(true);
    Promise.all([refetchTransactions(), refetchSummary()]).finally(() => {
      setTableLoading(false);
    });
  };

  return (
    <div className="p-6 flex justify-center items-center min-h-screen">
      <div style={{ maxWidth: "1200px", width: "100%" }}>
        {/* 使用抽象出的工具栏组件 */}
        <ToolBar
          dateFilter={dateFilter}
          onDateFilterChange={(value) => {
            setDateFilter(value);
            // 重置分页状态
            setDepositPagination({ current: 1, pageSize: 10 });
            setWithdrawPagination({ current: 1, pageSize: 10 });
          }}
          onDownloadExcel={downloadExcel}
          onRefresh={handleRefresh} // 添加刷新功能
        />

        {/* 使用Tabs组件 */}
        <Tabs
          defaultActiveKey="1"
          activeKey={activeTabKey}
          onChange={handleTabChange}
          items={items}
        />

        {/* 分页控制 - 只在入款和下发标签页显示 */}
        {(activeTabKey === "1" || activeTabKey === "2") && (
          <Row justify="center" className="my-8">
            <Col>
              <Divider />
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={totalItems}
                onChange={handleTableChange}
                showSizeChanger={false}
                showTotal={(total) => t("totalRecords", { total })}
              />
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}

export default Home;
