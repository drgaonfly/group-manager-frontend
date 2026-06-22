import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { Tag, Spin, Empty, Button, Typography } from "antd";
import {
  RedEnvelopeOutlined,
  GiftOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { RedPacketContext } from "./index";

const { Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "进行中", color: "processing" },
  completed: { label: "已领完", color: "success" },
  expired: { label: "已过期", color: "default" },
  cancelled: { label: "已取消", color: "error" },
};

/* ── BottomSheet ─────────────────────────────────────────────── */
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
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 200,
        }}
      />
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
        <div style={{ overflow: "auto", flex: 1, padding: "0 0 24px" }}>
          {children}
        </div>
      </div>
    </>
  );
};

/* ── tab 切换栏 ──────────────────────────────────────────────── */
const TABS = [
  { key: "sent", label: "我发出的", icon: <GiftOutlined /> },
  { key: "claimed", label: "我领取的", icon: <RedEnvelopeOutlined /> },
];

/* ── 我发出的 ─────────────────────────────────────────────────── */
interface SentItem {
  _id: string;
  totalPoints: number;
  totalSlots: number;
  claimedCount: number;
  status: string;
  group?: { title: string; username?: string };
  bombNumbers?: number[];
  createdAt: string;
  expiredAt: string;
}

const SentList = ({
  botId,
  botUserId,
}: {
  botId: string;
  botUserId: string;
}) => {
  const [list, setList] = useState<SentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setLoading(true);
    axios
      .get("/red-packets/public/sent", {
        params: { botId, botUserId, current: page, pageSize },
      })
      .then((res) => {
        setList(res.data?.data || []);
        setTotal(res.data?.total || 0);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [botId, botUserId, page]);

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  if (!list.length)
    return <Empty description="暂无发出记录" style={{ padding: "48px 0" }} />;

  return (
    <div>
      {list.map((item) => {
        const st = STATUS_MAP[item.status] ?? {
          label: item.status,
          color: "default",
        };
        return (
          <div
            key={item._id}
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f5f5f5",
              background: "#fff",
            }}
          >
            {/* 首行：金额 + 状态 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
                🧧 {item.totalPoints} 积分 · {item.totalSlots} 份
              </span>
              <Tag color={st.color} style={{ margin: 0 }}>
                {st.label}
              </Tag>
            </div>
            {/* 详情行 */}
            <div style={{ fontSize: 13, color: "#888", lineHeight: 1.8 }}>
              {item.group && <div>群：{item.group.title}</div>}
              <div>
                已领：
                <Text strong style={{ color: "#333" }}>
                  {item.claimedCount}
                </Text>
                /{item.totalSlots}
              </div>
              {item.bombNumbers && item.bombNumbers.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 3,
                  }}
                >
                  💣 炸弹：
                  {item.bombNumbers.map((n) => (
                    <Tag
                      key={n}
                      color="red"
                      style={{ margin: 0, fontSize: 11 }}
                    >
                      {n}
                    </Tag>
                  ))}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "#bbb",
                }}
              >
                <ClockCircleOutlined />
                {dayjs(item.createdAt).format("MM-DD HH:mm")}
              </div>
            </div>
          </div>
        );
      })}
      {/* 分页 */}
      {total > pageSize && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "14px 0",
          }}
        >
          <Button
            size="small"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            上一页
          </Button>
          <span style={{ lineHeight: "24px", fontSize: 13, color: "#888" }}>
            {page} / {Math.ceil(total / pageSize)}
          </span>
          <Button
            size="small"
            disabled={page >= Math.ceil(total / pageSize)}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
};

/* ── 我领取的 ─────────────────────────────────────────────────── */
interface ClaimedItem {
  _id: string;
  pointsDelta: number;
  isBomb: boolean;
  assignedNumber: number;
  pointsBefore: number;
  pointsAfter: number;
  createdAt: string;
  redPacket?: {
    totalPoints: number;
    totalSlots: number;
    status: string;
    group?: { title: string };
    creator?: { userName?: string; firstName?: string; lastName?: string };
  };
}

const ClaimedList = ({
  botId,
  botUserId,
}: {
  botId: string;
  botUserId: string;
}) => {
  const [list, setList] = useState<ClaimedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [detailItem, setDetailItem] = useState<ClaimedItem | null>(null);
  const pageSize = 10;

  useEffect(() => {
    setLoading(true);
    axios
      .get("/red-packets/public/claimed", {
        params: { botId, botUserId, current: page, pageSize },
      })
      .then((res) => {
        setList(res.data?.data || []);
        setTotal(res.data?.total || 0);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [botId, botUserId, page]);

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  if (!list.length)
    return <Empty description="暂无领取记录" style={{ padding: "48px 0" }} />;

  return (
    <>
      {list.map((item) => {
        const isWin = item.pointsDelta > 0;
        return (
          <div
            key={item._id}
            onClick={() => setDetailItem(item)}
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f5f5f5",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>
                {item.isBomb ? "💣 踩雷" : "🧧 抢到红包"}
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: isWin ? "#52c41a" : "#ff4d4f",
                }}
              >
                {isWin ? "+" : ""}
                {item.pointsDelta.toFixed(2)}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#aaa",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ClockCircleOutlined />
              {dayjs(item.createdAt).format("MM-DD HH:mm")}
              {item.redPacket?.group && (
                <span style={{ marginLeft: 8 }}>
                  {item.redPacket.group.title}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {total > pageSize && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "14px 0",
          }}
        >
          <Button
            size="small"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            上一页
          </Button>
          <span style={{ lineHeight: "24px", fontSize: 13, color: "#888" }}>
            {page} / {Math.ceil(total / pageSize)}
          </span>
          <Button
            size="small"
            disabled={page >= Math.ceil(total / pageSize)}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
          </Button>
        </div>
      )}

      {/* 领取详情 BottomSheet */}
      <BottomSheet
        open={!!detailItem}
        title={detailItem?.isBomb ? "💣 踩雷详情" : "🧧 领取详情"}
        onClose={() => setDetailItem(null)}
      >
        {detailItem &&
          (() => {
            const rp = detailItem.redPacket;
            const creatorName = rp?.creator
              ? rp.creator.userName
                ? `@${rp.creator.userName}`
                : [rp.creator.firstName, rp.creator.lastName]
                    .filter(Boolean)
                    .join(" ")
              : "未知";
            const rows = [
              {
                label: "结果",
                value: detailItem.isBomb ? (
                  <Tag color="red">💣 踩雷</Tag>
                ) : (
                  <Tag color="green">✅ 安全</Tag>
                ),
              },
              {
                label: "积分变动",
                value: (
                  <span
                    style={{
                      color: detailItem.pointsDelta > 0 ? "#52c41a" : "#ff4d4f",
                      fontWeight: 600,
                    }}
                  >
                    {detailItem.pointsDelta > 0 ? "+" : ""}
                    {detailItem.pointsDelta.toFixed(2)} 积分
                  </span>
                ),
              },
              {
                label: "分得数字",
                value: (
                  <Tag color={detailItem.isBomb ? "red" : "green"}>
                    {detailItem.assignedNumber}
                  </Tag>
                ),
              },
              {
                label: "领取前余额",
                value: `${detailItem.pointsBefore.toFixed(2)} 积分`,
              },
              {
                label: "领取后余额",
                value: `${detailItem.pointsAfter.toFixed(2)} 积分`,
              },
              rp?.group && { label: "群组", value: rp.group.title },
              { label: "发包人", value: creatorName },
              {
                label: "时间",
                value: dayjs(detailItem.createdAt).format("YYYY-MM-DD HH:mm"),
              },
            ].filter(Boolean) as { label: string; value: React.ReactNode }[];

            return (
              <div style={{ padding: "0 20px" }}>
                {rows.map((r, i) => (
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
                      style={{ flexShrink: 0, width: 76, fontSize: 13 }}
                    >
                      {r.label}
                    </Text>
                    <div style={{ flex: 1, fontSize: 14 }}>{r.value}</div>
                  </div>
                ))}
              </div>
            );
          })()}
      </BottomSheet>
    </>
  );
};

/* ══════════════════════════════════════════════════════════════ */

const RedPacketHistory = () => {
  const { botId, botUserId } = useOutletContext<RedPacketContext>();
  const [activeTab, setActiveTab] = useState("sent");

  return (
    <div>
      {/* tab 切换栏 — 固定在 header 下方 */}
      <div
        style={{
          display: "flex",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          position: "sticky",
          top: 52,
          zIndex: 9,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              padding: "11px 0",
              fontSize: 14,
              fontWeight: activeTab === t.key ? 600 : 400,
              color: activeTab === t.key ? "#cf1322" : "#666",
              borderBottom:
                activeTab === t.key
                  ? "2px solid #cf1322"
                  : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* tab 内容 */}
      <div style={{ display: activeTab === "sent" ? "block" : "none" }}>
        <SentList botId={botId} botUserId={botUserId} />
      </div>
      <div style={{ display: activeTab === "claimed" ? "block" : "none" }}>
        <ClaimedList botId={botId} botUserId={botUserId} />
      </div>
    </div>
  );
};

export default RedPacketHistory;
