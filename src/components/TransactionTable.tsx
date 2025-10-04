import { Table, Card } from "antd";
import { InboxOutlined, SendOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Transaction } from "../props/props";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

interface TransactionTableProps {
  transactions: Transaction[];
  type: "deposit" | "withdraw";
  loading?: boolean; // 新增loading属性
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  type,
  loading = false, // 默认为false
}) => {
  const { t } = useTranslation();

  // 定义表格列
  const columns: ColumnsType<Transaction> = [
    {
      title: t("time"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => dayjs(value).format("HH:mm:ss"),
    },
    {
      title: t("amount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: Transaction) =>
        record.usdt_amount
          ? `${record.usdt_amount} u (${amount})`
          : `${amount}`,
    },
    // 费率
    {
      title: t("home.feeRate"),
      dataIndex: "fee_rate",
      key: "fee_rate",
      render: (feeRate: string) => `${feeRate}%`,
    },
    // 汇率
    {
      title: t("exchangeRate"),
      dataIndex: "exchange_rate",
      key: "exchange_rate",
      render: (exchange_rate: number) => exchange_rate.toFixed(2),
    },
    // 实际金额
    {
      title: t("actual_amount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: Transaction) => {
        return amount * (1 - record.fee_rate / 100);
      },
    },
    // USDT
    {
      title: t("usdt_amount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: Transaction) => {
        return (
          (amount * (1 - record.fee_rate / 100)) /
          record.exchange_rate
        ).toFixed(2);
      },
    },
    {
      title: t("operator"),
      dataIndex: "botUser",
      key: "botUser",
      render: (user) =>
        user.userName
          ? `@${user.userName}`
          : `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    },
  ];

  const EmptyIcon = type === "deposit" ? InboxOutlined : SendOutlined;

  return (
    <Card bordered={false} className="mt-4">
      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        pagination={false}
        loading={loading} // 使用loading属性控制表格加载状态
        locale={{
          emptyText: (
            <div className="py-8 text-center">
              <EmptyIcon
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
};

export default TransactionTable;
