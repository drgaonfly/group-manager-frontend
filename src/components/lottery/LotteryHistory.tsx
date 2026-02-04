import { useState, useEffect } from "react";
import { List, Tag, Button, Spin, Modal, message, Popconfirm } from "antd";
import {
  CopyOutlined,
  UserOutlined,
  StopOutlined,
  SendOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { LotteryRecord, statusMap } from "./types";
import ParticipantsTable from "./ParticipantsTable";

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
  const [participantsModal, setParticipantsModal] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [resending, setResending] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!botUserId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/lotteries/public/creator?botUserId=${botUserId}`,
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

  const viewParticipants = async (record: LotteryRecord) => {
    setSelectedRecord(record);
    setParticipantsModal(true);
    setLoadingParticipants(true);
    try {
      const res = await axios.get(
        `/lotteries/public/${record._id}/participants`,
      );
      setParticipants(res.data?.data || []);
    } catch (err) {
      console.error("加载参与者失败:", err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleCancel = async (lotteryId: string) => {
    setCancelling(lotteryId);
    try {
      await axios.post(`/lotteries/public/cancel`, { lotteryId });
      message.success("抽奖已取消");
      loadHistory(); // 重新加载列表
    } catch (err: any) {
      message.error(err?.response?.data?.message || "取消失败");
    } finally {
      setCancelling(null);
    }
  };

  const handleResend = async (lotteryId: string) => {
    setResending(lotteryId);
    try {
      await axios.post(`/lotteries/public/resend`, { lotteryId });
      message.success("抽奖通知已重新发送");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "发送失败");
    } finally {
      setResending(null);
    }
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
                  key="participants"
                  type="link"
                  size="small"
                  icon={<UserOutlined />}
                  onClick={() => viewParticipants(item)}
                >
                  参与者
                </Button>,
                <Button
                  key="resend"
                  type="link"
                  size="small"
                  icon={<SendOutlined />}
                  loading={resending === item._id}
                  onClick={() => handleResend(item._id)}
                >
                  再发一次
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
                item.status === "ongoing" && (
                  <Popconfirm
                    key="cancel"
                    title="确定要取消这个抽奖吗？"
                    description="取消后将无法恢复"
                    onConfirm={() => handleCancel(item._id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<StopOutlined />}
                      loading={cancelling === item._id}
                    >
                      取消抽奖
                    </Button>
                  </Popconfirm>
                ),
              ].filter(Boolean)}
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
                    {item.bot?.botName || "未知机器人"}
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
              <span className="text-gray-500">机器人：</span>
              {selectedRecord.bot?.botName || "未知机器人"}
            </div>
            <div>
              <span className="text-gray-500">关键词：</span>
              {selectedRecord.keywords?.join(", ") || "抽奖"}
            </div>
            <div>
              <span className="text-gray-500">开奖方式：</span>
              <div className="mt-1">
                {selectedRecord.drawMethod.includes("fullParticipants") && (
                  <div>满{selectedRecord.fullParticipantsCount}人开奖</div>
                )}
                {selectedRecord.drawMethod.includes("scheduledTime") &&
                  selectedRecord.scheduledDrawTime && (
                    <div>
                      定时开奖:{" "}
                      {dayjs(selectedRecord.scheduledDrawTime).format(
                        "YYYY年MM月DD日 HH:mm",
                      )}
                    </div>
                  )}
              </div>
            </div>
            <div>
              <span className="text-gray-500">奖品：</span>
              <div className="mt-1">
                {selectedRecord.prizes.map((p, i) => (
                  <Tag key={i} color="blue">
                    {p.name} x{p.quantity} ({p.value})
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={`参与者列表 - ${selectedRecord?.title || ""}`}
        open={participantsModal}
        onCancel={() => setParticipantsModal(false)}
        footer={[
          <Button key="close" onClick={() => setParticipantsModal(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedRecord && (
          <ParticipantsTable
            participants={participants}
            loading={loadingParticipants}
            lotteryId={selectedRecord._id}
            prizes={selectedRecord.prizes}
            onFixedWinnerChange={() => viewParticipants(selectedRecord)}
          />
        )}
      </Modal>
    </>
  );
};

export default LotteryHistory;
