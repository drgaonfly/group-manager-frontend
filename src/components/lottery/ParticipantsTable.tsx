import { Table, Tag, Select, message } from "antd";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import axios from "axios";

interface Participant {
  _id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  messageCount: number;
  joinedAt: string;
  isWinner: boolean;
  prizeIndex?: number;
  prizeName?: string;
  prizeValue?: string | number;
}

interface Prize {
  name: string;
  type: string;
  value: number | string;
  quantity: number;
}

interface ParticipantsTableProps {
  participants: Participant[];
  loading?: boolean;
  lotteryId: string;
  prizes: Prize[];
  onFixedWinnerChange?: () => void;
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  participants,
  loading = false,
  lotteryId,
  prizes,
  onFixedWinnerChange,
}) => {
  const [settingFixed, setSettingFixed] = useState<string | null>(null);

  const handleSetFixedWinner = async (
    participantId: string,
    prizeIndex: number | null,
  ) => {
    setSettingFixed(participantId);
    try {
      await axios.post("/lotteries/public/set-fixed-winner", {
        lotteryId,
        participantId,
        prizeIndex,
      });
      message.success(prizeIndex !== null ? "已设置为内定中奖" : "已取消内定");
      onFixedWinnerChange?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "设置失败");
    } finally {
      setSettingFixed(null);
    }
  };

  const columns = [
    {
      title: "用户",
      dataIndex: "username",
      key: "username",
      render: (_: string, record: Participant) => (
        <div>
          <div>{record.firstName || record.username || "未知用户"}</div>
          {record.username && (
            <div className="text-xs text-gray-400">@{record.username}</div>
          )}
        </div>
      ),
    },
    {
      title: "参与时间",
      dataIndex: "joinedAt",
      key: "joinedAt",
      width: 120,
      render: (text: string) => dayjs(text).format("MM-DD HH:mm"),
    },
    {
      title: "状态",
      key: "status",
      width: 80,
      render: (_: any, record: Participant) => (
        <Tag color={record.isWinner ? "gold" : "default"}>
          {record.isWinner ? "中奖" : "参与"}
        </Tag>
      ),
    },
    {
      title: "内定",
      key: "fixed",
      width: 180,
      render: (_: any, record: Participant) => {
        const isFixed = record.prizeIndex !== undefined;
        return (
          <div className="flex items-center gap-2">
            {isFixed ? (
              <>
                <StarFilled style={{ color: "#faad14" }} />
                <Select
                  size="small"
                  value={record.prizeIndex}
                  onChange={(v) => handleSetFixedWinner(record._id, v)}
                  loading={settingFixed === record._id}
                  style={{ width: 120 }}
                  options={[
                    { label: "取消内定", value: null },
                    ...prizes.map((p, i) => ({
                      label: p.name,
                      value: i,
                    })),
                  ]}
                />
              </>
            ) : (
              <Select
                size="small"
                placeholder="设为内定"
                onChange={(v) => handleSetFixedWinner(record._id, v)}
                loading={settingFixed === record._id}
                style={{ width: 120 }}
                suffixIcon={<StarOutlined />}
                options={prizes.map((p, i) => ({
                  label: p.name,
                  value: i,
                }))}
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={participants}
      columns={columns}
      loading={loading}
      rowKey="_id"
      pagination={{ pageSize: 10 }}
      size="small"
    />
  );
};

export default ParticipantsTable;
