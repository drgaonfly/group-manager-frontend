import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Transaction, SummaryData, DateOption } from "../props/props";
import {
  Table,
  Select,
  Button,
  Spin,
  Card,
  Statistic,
  Row,
  Col,
  Divider,
  Typography,
  Pagination,
  Tabs,
} from "antd";
import {
  DownloadOutlined,
  InboxOutlined,
  SendOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { TabsProps } from "antd";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

const { Text } = Typography;
const { Option } = Select;

function Home() {
  const { t } = useTranslation();
  // 从URL参数中获取c并提取数字部分
  const { c } = useParams();
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [totalItems, setTotalItems] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState("1");

  const group_id = c ? Number(c.replace("c=", "")) : undefined;

  // 生成过去7天的日期选项
  useEffect(() => {
    const options: DateOption[] = [];

    // 添加"今天"选项
    options.push({
      value: "today",
      label: t("today"),
    });

    // 添加过去6天的选项
    for (let i = 1; i <= 6; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const month = date.getMonth() + 1;
      const day = date.getDate();

      options.push({
        value: `day-${i}`,
        label: `0${month}-${day}`,
      });
    }

    setDateOptions(options);
  }, [t]);

  // 获取交易数据
  const { data: transactionData = { data: [], total: 0 } } = useQuery({
    queryKey: ["transactions", dateFilter, pagination],
    queryFn: async () => {
      setIsLoading(true);
      const response = await axios.get("/transactions/f/all", {
        params: {
          dateFilter,
          current: pagination.current,
          pageSize: pagination.pageSize,
          c: group_id,
        },
      });
      setIsLoading(false);
      setTotalItems(response.data.total || 0);
      return response.data;
    },
  });

  const transactions = transactionData.data || [];

  console.log(transactionData);

  // 获取汇总数据
  const { data: summaryData } = useQuery<SummaryData>({
    queryKey: ["summary", dateFilter],
    queryFn: async () => {
      setIsLoading(true);
      const response = await axios.get("/transactions/f/summary", {
        params: { dateFilter, c: group_id },
      });
      setIsLoading(false);
      return response.data.data;
    },
  });

  console.log(summaryData);

  // 筛选入款和下发交易
  const depositTransactions = transactions.filter(
    (t: Transaction) => t.type === "deposit",
  );
  const withdrawTransactions = transactions.filter(
    (t: Transaction) => t.type === "withdraw",
  );

  // 下载Excel数据
  const downloadExcel = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/transactions/f/export", {
        params: { dateFilter, c: group_id },
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

  // 定义表格列
  const columns: ColumnsType<Transaction> = [
    {
      title: t("amount"),
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: t("operator"),
      dataIndex: "botUser",
      key: "botUser",
      render: (botUser) => `${botUser.firstName} ${botUser.lastName}`,
    },
  ];

  // 处理分页变化
  const handleTableChange = (page: number, pageSize?: number) => {
    setPagination({
      current: page,
      pageSize: pageSize || pagination.pageSize,
    });
  };

  // 入款内容
  const DepositContent = () => (
    <Card bordered={false} className="mt-4">
      <Table
        columns={columns}
        dataSource={depositTransactions}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: (
            <div className="py-8 text-center">
              <InboxOutlined
                style={{ fontSize: 48 }}
                className="text-gray-300 mb-3"
              />
              <p>{t("home.noData")}</p>
            </div>
          ),
        }}
      />
    </Card>
  );

  // 下发内容
  const WithdrawContent = () => (
    <Card bordered={false} className="mt-4">
      <Table
        columns={columns}
        dataSource={withdrawTransactions}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: (
            <div className="py-8 text-center">
              <SendOutlined
                style={{ fontSize: 48 }}
                className="text-gray-300 mb-3"
              />
              <p>{t("home.noData")}</p>
            </div>
          ),
        }}
      />
    </Card>
  );

  // 总计内容
  const SummaryContent = () => (
    <Card bordered={false} className="mt-4">
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title={t("home.totalDeposit")}
            value={summaryData?.totalDeposit || 0}
            precision={2}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={t("home.feeRate")}
            value={summaryData?.feeRate || 0}
            precision={2}
            suffix="%"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={t("home.usdtRate")}
            value={summaryData?.usdtRate || 0}
            precision={2}
          />
        </Col>
      </Row>
      <Divider />
      <Row gutter={16}>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title={t("home.expectedWithdraw")}
              value={summaryData?.expectedWithdraw || 0}
              precision={2}
              prefix="$"
            />
            <Text type="secondary">
              {/* {summaryData
                ? (Number(summaryData.expectedWithdraw) / Number(summaryData.usdtRate)).toFixed(
                    2,
                  )
                : 0}{" "}
              USD */}
            </Text>
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title={t("home.totalWithdraw")}
              value={summaryData?.totalWithdraw || 0}
              precision={2}
              prefix="$"
            />
            <Text type="secondary">
              {/* {summaryData
                ? (summaryData.totalWithdraw / summaryData.usdtRate).toFixed(2)
                : 0}{" "}
              USD */}
            </Text>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  // 定义标签页
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span>
          <InboxOutlined />
          {t("deposit")} ({depositTransactions.length}
          {t("transactions")})
        </span>
      ),
      children: <DepositContent />,
    },
    {
      key: "2",
      label: (
        <span>
          <SendOutlined />
          {t("withdraw")} ({withdrawTransactions.length}
          {t("transactions")})
        </span>
      ),
      children: <WithdrawContent />,
    },
    {
      key: "3",
      label: (
        <span>
          <CalculatorOutlined />
          {t("summary")}
        </span>
      ),
      children: <SummaryContent />,
    },
  ];

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  return (
    <Spin spinning={isLoading} tip={t("loading")} size="large">
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div style={{ maxWidth: "1200px", width: "100%" }}>
          {/* 顶部工具栏 */}
          <Row justify="space-between" align="middle" className="mb-6">
            <Col>
              <Select
                style={{ width: 200 }}
                value={dateFilter}
                onChange={(value) => {
                  setIsLoading(true);
                  setDateFilter(value);
                }}
              >
                {dateOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Row gutter={16} align="middle">
                <Col>
                  <LanguageSwitcher />
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={downloadExcel}
                  >
                    {t("downloadExcel")}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* 使用Tabs组件替换原来的Card组件 */}
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
    </Spin>
  );
}

export default Home;
