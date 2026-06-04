import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Tabs,
  List,
  Tag,
  Typography,
  Result,
  Spin,
  Badge,
  Empty,
  Button,
} from "antd";
import {
  RedEnvelopeOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  LeftOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ── 状态映射 ──────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "进行中", color: "processing" },
  completed: { label: "已领完", color: "success" },
  expired: { label: "已过期", color: "default" },
  cancelled: { label: "已取消", color: "error" },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── 我发出的红包 ──────────────────────────────────────────────────
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

function SentList({ botId, botUserId }: { botId: string; botUserId: string }) {
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin />
      </div>
    );
  }

  if (!list.length) {
    return <Empty description="暂无发出记录" className="py-12" />;
  }

  return (
    <List
      dataSource={list}
      pagination={
        total > pageSize
          ? {
              current: page,
              pageSize,
              total,
              size: "small",
              onChange: setPage,
            }
          : false
      }
      renderItem={(item) => {
        const st = STATUS_MAP[item.status] ?? {
          label: item.status,
          color: "default",
        };
        return (
          <List.Item className="px-0">
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-base">
                  🧧 {item.totalPoints} 积分 · {item.totalSlots} 份
                </span>
                <Badge status={st.color as any} text={st.label} />
              </div>

              <div className="text-sm text-gray-500 space-y-0.5">
                {item.group && <div>群：{item.group.title}</div>}
                <div>
                  已领：{item.claimedCount}/{item.totalSlots}
                </div>
                {item.bombNumbers && item.bombNumbers.length > 0 && (
                  <div>
                    💣 炸弹数字：
                    {item.bombNumbers.map((n) => (
                      <Tag key={n} color="red" style={{ marginLeft: 2 }}>
                        {n}
                      </Tag>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <ClockCircleOutlined />
                  {formatTime(item.createdAt)}
                </div>
              </div>
            </div>
          </List.Item>
        );
      }}
    />
  );
}

// ── 我领取的红包 ──────────────────────────────────────────────────
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

function ClaimedList({
  botId,
  botUserId,
}: {
  botId: string;
  botUserId: string;
}) {
  const [list, setList] = useState<ClaimedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin />
      </div>
    );
  }

  if (!list.length) {
    return <Empty description="暂无领取记录" className="py-12" />;
  }

  return (
    <List
      dataSource={list}
      pagination={
        total > pageSize
          ? {
              current: page,
              pageSize,
              total,
              size: "small",
              onChange: setPage,
            }
          : false
      }
      renderItem={(item) => {
        const isWin = item.pointsDelta > 0;
        const rp = item.redPacket;
        const creatorName = rp?.creator
          ? rp.creator.userName
            ? `@${rp.creator.userName}`
            : [rp.creator.firstName, rp.creator.lastName]
                .filter(Boolean)
                .join(" ")
          : "未知";

        return (
          <List.Item className="px-0">
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-base">
                  {item.isBomb ? "💣 踩雷" : "🧧 抢到红包"}
                </span>
                <Text
                  strong
                  style={{ color: isWin ? "#52c41a" : "#ff4d4f", fontSize: 16 }}
                >
                  {isWin ? "+" : ""}
                  {item.pointsDelta.toFixed(2)} 积分
                </Text>
              </div>

              <div className="text-sm text-gray-500 space-y-0.5">
                {rp?.group && <div>群：{rp.group.title}</div>}
                <div>发包人：{creatorName}</div>
                <div>
                  分得数字：{item.assignedNumber}
                  {item.isBomb && (
                    <Tag color="red" style={{ marginLeft: 6 }}>
                      炸弹
                    </Tag>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  余额：{item.pointsBefore.toFixed(2)} →{" "}
                  {item.pointsAfter.toFixed(2)}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <ClockCircleOutlined />
                  {formatTime(item.createdAt)}
                </div>
              </div>
            </div>
          </List.Item>
        );
      }}
    />
  );
}

// ── 主页面 ────────────────────────────────────────────────────────
const RedPacketHistory = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const botId = searchParams.get("botId");
  const botUserId = searchParams.get("botUserId");

  if (!botId || !botUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Result
          status="error"
          title="参数错误"
          subTitle="请通过机器人主菜单打开此页面"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <Button
          type="link"
          icon={<LeftOutlined />}
          size="small"
          onClick={() =>
            navigate(`/redpacket/create?botId=${botId}&botUserId=${botUserId}`)
          }
        >
          返回
        </Button>
        <span className="font-bold text-base">红包记录</span>
        <div style={{ width: 60 }} />
      </div>

      <div className="py-4 px-4 max-w-md mx-auto">
        <Card>
          <Tabs
            defaultActiveKey="sent"
            centered
            items={[
              {
                key: "sent",
                label: (
                  <span>
                    <GiftOutlined /> 我发出的
                  </span>
                ),
                children: <SentList botId={botId} botUserId={botUserId} />,
              },
              {
                key: "claimed",
                label: (
                  <span>
                    <RedEnvelopeOutlined /> 我领取的
                  </span>
                ),
                children: <ClaimedList botId={botId} botUserId={botUserId} />,
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default RedPacketHistory;
