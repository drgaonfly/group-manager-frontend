import { Table, Card } from "antd";
import { InboxOutlined, SendOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Transaction } from "../props/props";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

interface TransactionTableProps {
  transactions: Transaction[];
  type: "deposit" | "withdraw";
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  type,
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
        record.group.unit === "USD"
          ? `${Number(amount) / Number(record.group.exchange_rate)}u` +
            `(${Number(amount)})`
          : `${amount}`,
    },
    {
      title: t("operator"),
      dataIndex: "botUser",
      key: "botUser",
      render: (botUser) => `${botUser.firstName} ${botUser.lastName}`,
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
