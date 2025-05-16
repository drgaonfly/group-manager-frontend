import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
// import { useTranslation } from 'react-i18next';

const { Text } = Typography;
const { Option } = Select;

function Home() {
  // const { t } = useTranslation();
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [totalItems, setTotalItems] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState("1"); // 添加活动标签页状态

  // 生成过去7天的日期选项
  useEffect(() => {
    const options: DateOption[] = [];

    // 添加"今天"选项
    options.push({
      value: "today",
      label: `今天`,
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
  }, []);

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
        },
      });
      setIsLoading(false);
      setTotalItems(response.data.total || 0);
      return response.data;
    },
  });

  const transactions = transactionData.data || [];

  // 获取汇总数据
  const { data: summaryData } = useQuery<SummaryData>({
    queryKey: ["summary", dateFilter],
    queryFn: async () => {
      setIsLoading(true);
      const response = await axios.get("/transactions/f/summary", {
        params: { dateFilter },
      });
      setIsLoading(false);
      return response.data.data;
    },
  });

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
        params: { dateFilter },
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
      title: "时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "操作人",
      dataIndex: "botUser",
      key: "botUser",
      render: (botUser) => `${botUser.firstName} ${botUser.lastName}`,
    },
    {
      title: "回复人",
      dataIndex: "group",
      key: "group",
      render: (group) => group.name,
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
              <p>没有数据</p>
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
              <p>没有数据</p>
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
            title="总入款"
            value={summaryData?.totalDeposit || 0}
            precision={2}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="费率"
            value={summaryData?.feeRate || 0}
            precision={2}
            suffix="%"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="USD汇率"
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
              title="应下发"
              value={summaryData?.expectedWithdraw || 0}
              precision={2}
            />
            <Text type="secondary">
              {summaryData
                ? (summaryData.expectedWithdraw / summaryData.usdtRate).toFixed(
                    2,
                  )
                : 0}{" "}
              USD
            </Text>
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="总下发"
              value={summaryData?.totalWithdraw || 0}
              precision={2}
            />
            <Text type="secondary">
              {summaryData
                ? (summaryData.totalWithdraw / summaryData.usdtRate).toFixed(2)
                : 0}{" "}
              USD
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
          入款 ({depositTransactions.length}笔)
        </span>
      ),
      children: <DepositContent />,
    },
    {
      key: "2",
      label: (
        <span>
          <SendOutlined />
          下发 ({withdrawTransactions.length}笔)
        </span>
      ),
      children: <WithdrawContent />,
    },
    {
      key: "3",
      label: (
        <span>
          <CalculatorOutlined />
          总计
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
    <Spin spinning={isLoading} tip="加载中..." size="large">
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
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadExcel}
              >
                下载Excel数据
              </Button>
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
                  showTotal={(total) => `共 ${total} 条记录`}
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
