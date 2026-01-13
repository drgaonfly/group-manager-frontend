import { useState, useEffect } from "react";
import { List, Tag, Button, Spin, Modal } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { LotteryRecord, statusMap } from "./types";

interface LotteryHistoryProps {
  botUserId: string | null;
  onCopy: (record: LotteryRecord) => void;
}

const LotteryHistory: React.FC<LotteryHistoryProps> = ({
  botUserId,
  onCopy,
}) => {
  const [history, setHistory] = useState<LotteryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LotteryRecord | null>(
    null,
  );

  const loadHistory = async () => {
    if (!botUserId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/lotteries/public/history?botUserId=${botUserId}`,
      );
      setHistory(res.data?.data || []);
    } catch (err) {
      console.error("加载历史记录失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [botUserId]);

  const viewDetail = (record: LotteryRecord) => {
    setSelectedRecord(record);
    setDetailModal(true);
  };

  const handleCopy = (record: LotteryRecord) => {
    setDetailModal(false);
    onCopy(record);
  };

  return (
    <>
      <Spin spinning={loading}>
        <List
          dataSource={history}
          locale={{ emptyText: "暂无历史记录" }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="view"
                  type="link"
                  size="small"
                  onClick={() => viewDetail(item)}
                >
                  查看
                </Button>,
                <Button
                  key="copy"
                  type="link"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(item)}
                >
                  复制创建
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    {item.title}{" "}
                    <Tag color={statusMap[item.status]?.color}>
                      {statusMap[item.status]?.text}
                    </Tag>
                  </span>
                }
                description={
                  <span className="text-xs text-gray-500">
                    {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm")} ·{" "}
                    {item.groups.map((g) => g.title).join(", ")}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </Spin>

      <Modal
        title="抽奖详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            关闭
          </Button>,
          <Button
            key="copy"
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => selectedRecord && handleCopy(selectedRecord)}
          >
            复制创建新抽奖
          </Button>,
        ]}
        width={500}
      >
        {selectedRecord && (
          <div className="space-y-3">
            <div>
              <span className="text-gray-500">标题：</span>
              {selectedRecord.title}
            </div>
            <div>
              <span className="text-gray-500">状态：</span>
              <Tag color={statusMap[selectedRecord.status]?.color}>
                {statusMap[selectedRecord.status]?.text}
              </Tag>
            </div>
            <div>
              <span className="text-gray-500">群组：</span>
              {selectedRecord.groups.map((g) => g.title).join(", ")}
            </div>
            <div>
              <span className="text-gray-500">关键词：</span>
              {selectedRecord.keywords?.join(", ") || "抽奖"}
            </div>
            <div>
              <span className="text-gray-500">所需发言数：</span>
              {selectedRecord.requiredMessageCount}条
            </div>
            <div>
              <span className="text-gray-500">开奖方式：</span>
              {selectedRecord.drawMethod.includes("fullParticipants") &&
                `满${selectedRecord.fullParticipantsCount}人 `}
              {selectedRecord.drawMethod.includes("scheduledTime") &&
                selectedRecord.scheduledDrawTime &&
                `定时 ${dayjs(selectedRecord.scheduledDrawTime).format("MM-DD HH:mm")}`}
            </div>
            <div>
              <span className="text-gray-500">奖品：</span>
              <div className="mt-1">
                {selectedRecord.prizes.map((p, i) => (
                  <Tag key={i} color="blue">
                    {p.name} x{p.quantity} (
                    {p.type === "points" ? `${p.value}积分` : p.value})
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default LotteryHistory;
