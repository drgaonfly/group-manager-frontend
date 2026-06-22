import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import {
  Tag,
  Spin,
  Empty,
  Button,
  Popconfirm,
  message,
  Typography,
  List,
} from "antd";
import {
  UserOutlined,
  StopOutlined,
  SendOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { LotteryContext } from "./index";

const { Text } = Typography;

const STATUS_MAP: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  pending: { label: "待开始", color: "default", dot: "#d9d9d9" },
  ongoing: { label: "进行中", color: "processing", dot: "#1677ff" },
  completed: { label: "已完成", color: "success", dot: "#52c41a" },
};

interface LotteryItem {
  _id: string;
  title: string;
  status: string;
  prizes: { name: string; value: number; quantity: number }[];
  drawMethod: string[];
  fullParticipantsCount?: number;
  scheduledDrawTime?: string;
  drawnAt?: string;
  createdAt: string;
  group?: { title: string; username?: string };
}

interface ParticipantItem {
  _id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  isWinner: boolean;
  prizeName?: string;
  prizeValue?: number | string;
  joinedAt: string;
}

const DRAW_LABEL: Record<string, string> = {
  fullParticipants: "满员",
  scheduledTime: "定时",
};

/* ── 详情抽屉（底部弹出） ────────────────────────────────────── */
const BottomSheet = ({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <>
      {/* 遮罩 */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 200,
        }}
      />
      {/* 面板 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderRadius: "16px 16px 0 0",
          zIndex: 201,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 拖拽把手 */}
        <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: "#e0e0e0",
              display: "inline-block",
            }}
          />
        </div>
        {/* 标题 */}
        <div
          style={{
            padding: "4px 20px 12px",
            fontSize: 16,
            fontWeight: 600,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{title}</span>
          <Button type="text" size="small" onClick={onClose}>
            关闭
          </Button>
        </div>
        <div style={{ overflow: "auto", flex: 1, padding: "12px 0 24px" }}>
          {children}
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════════════ */

const LotteryHistory = () => {
  // botId 未使用但 context 需要解构
  const { botUserId } = useOutletContext<LotteryContext>();

  const [list, setList] = useState<LotteryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailItem, setDetailItem] = useState<LotteryItem | null>(null);
  const [participantsItem, setParticipantsItem] = useState<LotteryItem | null>(
    null,
  );
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [resending, setResending] = useState<string | null>(null);

  const loadList = () => {
    if (!botUserId) return;
    setLoading(true);
    axios
      .get("/lotteries/public/creator", { params: { botUserId } })
      .then((res) => setList(res.data?.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadList();
  }, [botUserId]);

  const openParticipants = async (item: LotteryItem) => {
    setParticipantsItem(item);
    setParticipantsLoading(true);
    setParticipants([]);
    try {
      const res = await axios.get(`/lotteries/public/${item._id}/participants`);
      setParticipants(res.data?.data || []);
    } catch {
      setParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleCancel = async (lotteryId: string) => {
    setCancelling(lotteryId);
    try {
      await axios.post("/lotteries/public/cancel", { lotteryId });
      message.success("抽奖已取消");
      loadList();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "取消失败");
    } finally {
      setCancelling(null);
    }
  };

  const handleResend = async (lotteryId: string) => {
    setResending(lotteryId);
    try {
      await axios.post("/lotteries/public/resend", { lotteryId });
      message.success("通知已重新发送");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "发送失败");
    } finally {
      setResending(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!list.length) {
    return <Empty description="暂无抽奖记录" style={{ paddingTop: 60 }} />;
  }

  return (
    <>
      {/* 列表 */}
      <div style={{ paddingBottom: 16 }}>
        {list.map((item) => {
          const st = STATUS_MAP[item.status] ?? {
            label: item.status,
            color: "default",
            dot: "#ccc",
          };
          return (
            <div
              key={item._id}
              style={{
                background: "#fff",
                marginBottom: 8,
                padding: "14px 16px",
              }}
            >
              {/* 标题行 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1a1a1a",
                    flex: 1,
                    lineHeight: 1.4,
                  }}
                >
                  🎟️ {item.title}
                </span>
                <Tag color={st.color} style={{ flexShrink: 0, marginTop: 2 }}>
                  {st.label}
                </Tag>
              </div>

              {/* 奖品 tags */}
              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                }}
              >
                {item.prizes.map((p, i) => (
                  <Tag key={i} color="gold" style={{ margin: 0, fontSize: 12 }}>
                    <GiftOutlined style={{ marginRight: 3 }} />
                    {p.name} ×{p.quantity}
                  </Tag>
                ))}
              </div>

              {/* 元信息行 */}
              <div
                style={{
                  fontSize: 12,
                  color: "#999",
                  marginBottom: 10,
                  lineHeight: 1.8,
                }}
              >
                <span style={{ marginRight: 10 }}>
                  开奖：
                  {item.drawMethod.map((m) => DRAW_LABEL[m] ?? m).join("+")}
                  {item.drawMethod.includes("fullParticipants") &&
                    item.fullParticipantsCount && (
                      <span>（{item.fullParticipantsCount}人）</span>
                    )}
                </span>
                {item.drawnAt && (
                  <span style={{ color: "#faad14" }}>
                    <TrophyOutlined style={{ marginRight: 3 }} />
                    {dayjs(item.drawnAt).format("MM-DD HH:mm")} 开奖
                  </span>
                )}
                {!item.drawnAt && (
                  <span>
                    <ClockCircleOutlined style={{ marginRight: 3 }} />
                    {dayjs(item.createdAt).format("MM-DD HH:mm")}
                  </span>
                )}
              </div>

              {/* 操作按钮 */}
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  borderTop: "1px solid #f5f5f5",
                  paddingTop: 10,
                }}
              >
                <Button
                  type="text"
                  size="small"
                  style={{ flex: 1, color: "#555", fontSize: 13 }}
                  onClick={() => setDetailItem(item)}
                >
                  详情
                </Button>
                <Button
                  type="text"
                  size="small"
                  icon={<UserOutlined />}
                  style={{ flex: 1, color: "#555", fontSize: 13 }}
                  onClick={() => openParticipants(item)}
                >
                  参与者
                </Button>
                {item.status === "ongoing" && (
                  <>
                    <Button
                      type="text"
                      size="small"
                      icon={<SendOutlined />}
                      style={{ flex: 1, color: "#1677ff", fontSize: 13 }}
                      loading={resending === item._id}
                      onClick={() => handleResend(item._id)}
                    >
                      再发
                    </Button>
                    <Popconfirm
                      title="确定取消这个抽奖吗？"
                      description="取消后无法恢复"
                      onConfirm={() => handleCancel(item._id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<StopOutlined />}
                        style={{ flex: 1, fontSize: 13 }}
                        loading={cancelling === item._id}
                      >
                        取消
                      </Button>
                    </Popconfirm>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 详情 BottomSheet */}
      <BottomSheet
        open={!!detailItem}
        title="抽奖详情"
        onClose={() => setDetailItem(null)}
      >
        {detailItem && (
          <div style={{ padding: "0 20px" }}>
            {[
              { label: "标题", value: detailItem.title },
              {
                label: "状态",
                value: (
                  <Tag color={STATUS_MAP[detailItem.status]?.color}>
                    {STATUS_MAP[detailItem.status]?.label}
                  </Tag>
                ),
              },
              {
                label: "开奖方式",
                value: detailItem.drawMethod
                  .map((m) => DRAW_LABEL[m] ?? m)
                  .join(" + "),
              },
              detailItem.drawMethod.includes("fullParticipants") && {
                label: "满员人数",
                value: `${detailItem.fullParticipantsCount} 人`,
              },
              detailItem.scheduledDrawTime && {
                label: "定时开奖",
                value: dayjs(detailItem.scheduledDrawTime).format(
                  "MM-DD HH:mm",
                ),
              },
              {
                label: "奖品",
                value: (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {detailItem.prizes.map((p, i) => (
                      <Tag key={i} color="blue">
                        {p.name} ×{p.quantity}（{p.value}积分）
                      </Tag>
                    ))}
                  </div>
                ),
              },
              {
                label: "创建时间",
                value: dayjs(detailItem.createdAt).format("YYYY-MM-DD HH:mm"),
              },
              detailItem.drawnAt && {
                label: "开奖时间",
                value: dayjs(detailItem.drawnAt).format("YYYY-MM-DD HH:mm"),
              },
            ]
              .filter(Boolean)
              .map((row: any, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    padding: "10px 0",
                    borderBottom: "1px solid #f5f5f5",
                    gap: 12,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{ flexShrink: 0, width: 72, fontSize: 13 }}
                  >
                    {row.label}
                  </Text>
                  <div style={{ flex: 1, fontSize: 14 }}>{row.value}</div>
                </div>
              ))}
          </div>
        )}
      </BottomSheet>

      {/* 参与者 BottomSheet */}
      <BottomSheet
        open={!!participantsItem}
        title={`参与者 — ${participantsItem?.title ?? ""}`}
        onClose={() => {
          setParticipantsItem(null);
          setParticipants([]);
        }}
      >
        {participantsLoading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : !participants.length ? (
          <Empty description="暂无参与者" style={{ paddingTop: 20 }} />
        ) : (
          <List
            dataSource={participants}
            size="small"
            style={{ padding: "0 16px" }}
            renderItem={(p, idx) => {
              const name = p.firstName || p.username || `用户${p.telegramId}`;
              return (
                <List.Item style={{ padding: "10px 0" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      gap: 10,
                    }}
                  >
                    {/* 序号 */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: p.isWinner ? "#fffbe6" : "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        color: p.isWinner ? "#faad14" : "#999",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>
                        {name}
                        {p.username && (
                          <Text
                            type="secondary"
                            style={{ fontSize: 12, marginLeft: 6 }}
                          >
                            @{p.username}
                          </Text>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#aaa" }}>
                        {dayjs(p.joinedAt).format("MM-DD HH:mm")}
                      </div>
                    </div>
                    {p.isWinner ? (
                      <Tag color="gold" style={{ flexShrink: 0 }}>
                        🏆 {p.prizeName}
                        {p.prizeValue ? ` · ${p.prizeValue}积分` : ""}
                      </Tag>
                    ) : (
                      <Tag
                        color="default"
                        style={{ flexShrink: 0, color: "#bbb" }}
                      >
                        未中奖
                      </Tag>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </BottomSheet>
    </>
  );
};

export default LotteryHistory;
