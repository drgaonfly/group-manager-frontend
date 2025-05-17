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
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [totalItems, setTotalItems] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState("1");
  const [type, setType] = useState<"deposit" | "withdraw">("deposit");

  const group_id = query ? Number(query) : undefined;

  // 获取交易数据
  const { data: transactionData = { data: [], total: 0 } } = useQuery({
    queryKey: ["transactions", dateFilter, pagination, type],
    queryFn: async () => {
      setIsLoading(true);
      const response = await axios.get("/transactions/f/all", {
        params: {
          dateFilter,
          current: pagination.current,
          pageSize: pagination.pageSize,
          groupId: group_id,
          type: type,
        },
      });
      setIsLoading(false);
      setTotalItems(response.data.total || 0);
      return response.data;
    },
  });

  const transactions = transactionData.data || [];

  // console.log("transactionsData", transactionData);

  // 获取汇总数据
  const { data: summaryData } = useQuery({
    queryKey: ["summary", dateFilter],
    queryFn: async () => {
      setIsLoading(true);
      const response = await axios.get("/transactions/f/summary", {
        params: { dateFilter, groupId: group_id },
      });
      setIsLoading(false);
      return response.data.data;
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
      setIsLoading(false);
    } catch (error) {
      console.error("导出Excel失败", error);
      setIsLoading(false);
    }
  };

  // 处理分页变化
  const handleTableChange = (page: number, pageSize?: number) => {
    setPagination({
      current: page,
      pageSize: pageSize || pagination.pageSize,
    });
  };

  // 定义标签页
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span>
          <InboxOutlined />
          {t("deposit")} (
          {type === "deposit"
            ? transactions.length
            : transactionData.type_total}
          {t("transactions")})
        </span>
      ),
      children: <TransactionTable transactions={transactions} type="deposit" />,
    },
    {
      key: "2",
      label: (
        <span>
          <SendOutlined />
          {t("withdraw")} (
          {type === "withdraw"
            ? transactions.length
            : transactionData.type_total}
          {t("transactions")})
        </span>
      ),
      children: (
        <TransactionTable transactions={transactions} type="withdraw" />
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin spinning={isLoading} tip={t("loading")} size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 flex justify-center items-center min-h-screen">
      <div style={{ maxWidth: "1200px", width: "100%" }}>
        {/* 使用抽象出的工具栏组件 */}
        <ToolBar
          dateFilter={dateFilter}
          onDateFilterChange={(value) => {
            setIsLoading(true);
            setDateFilter(value);
          }}
          onDownloadExcel={downloadExcel}
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
