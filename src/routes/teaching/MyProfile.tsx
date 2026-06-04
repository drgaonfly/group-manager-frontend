import { useState, useEffect } from "react";
import axios from "axios";
import {
  List,
  Rate,
  Tag,
  Avatar,
  Spin,
  Empty,
  Button,
  Tabs,
  Typography,
  Badge,
} from "antd";
import { UserOutlined, StarOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

interface TeacherProfile {
  _id: string;
  display_name: string;
  contactLink: string;
  address: string;
  brief: string;
  isAvailable: boolean;
  images: string[];
  status: string;
  averageRating?: number;
  evaluationCount?: number;
}

interface Evaluation {
  _id: string;
  avatar_rating: number;
  appearance_rating: number;
  body_rating: number;
  service_rating: number;
  attitude_rating: number;
  circumstance_rating: number;
  process_desc: string;
  isReportedAnoymously: boolean;
  status: string;
  remark?: string;
  teacher?: { display_name: string; images?: string[] };
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "待审核", color: "processing" },
  approved: { label: "已通过", color: "success" },
  rejected: { label: "已拒绝", color: "error" },
};

const MyProfile = ({
  botId,
  botUserId,
}: {
  botId: string;
  botUserId: string;
}) => {
  const [myTeacher, setMyTeacher] = useState<TeacherProfile | null>(null);
  const [myReviews, setMyReviews] = useState<Evaluation[]>([]);
  const [receivedReviews, setReceivedReviews] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    // 并发请求：我的老师资料 + 我写的车评
    setLoading(true);
    Promise.all([
      axios
        .get("/teachers/public/me", { params: { botId, botUserId } })
        .then((r) => r.data?.data ?? null)
        .catch(() => null),
      axios
        .get("/evaluations/public/my-reviews", { params: { botId, botUserId } })
        .then((r) => r.data?.data ?? [])
        .catch(() => []),
    ])
      .then(([teacher, reviews]) => {
        setMyTeacher(teacher);
        setMyReviews(reviews);
      })
      .finally(() => setLoading(false));
  }, [botId, botUserId]);

  // 如果有老师身份，加载收到的评价
  useEffect(() => {
    if (!myTeacher?._id) return;
    setReviewsLoading(true);
    axios
      .get("/teachers/public/evaluations", {
        params: { teacherId: myTeacher._id, status: "approved" },
      })
      .then((r) => setReceivedReviews(r.data?.data ?? []))
      .catch(() => setReceivedReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [myTeacher?._id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spin />
      </div>
    );
  }

  const avgRating = (e: Evaluation) =>
    (e.avatar_rating +
      e.appearance_rating +
      e.body_rating +
      e.service_rating +
      e.attitude_rating +
      e.circumstance_rating) /
    6;

  return (
    <div className="px-4 py-4">
      {/* 老师身份卡片 */}
      {myTeacher ? (
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex gap-3 items-start">
            <Avatar
              size={56}
              src={myTeacher.images?.[0]}
              icon={<UserOutlined />}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-base">
                  {myTeacher.display_name}
                </span>
                <Tag
                  color={STATUS_MAP[myTeacher.status]?.color ?? "default"}
                  style={{ fontSize: 11 }}
                >
                  {STATUS_MAP[myTeacher.status]?.label ?? myTeacher.status}
                </Tag>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Tag
                  color={myTeacher.isAvailable ? "green" : "default"}
                  style={{ marginRight: 0, fontSize: 11 }}
                >
                  {myTeacher.isAvailable ? "🟢 可约" : "🔴 休息"}
                </Tag>
                {myTeacher.averageRating !== undefined &&
                  myTeacher.averageRating > 0 && (
                    <span>
                      <StarOutlined style={{ color: "#faad14" }} />{" "}
                      {myTeacher.averageRating.toFixed(1)} (
                      {myTeacher.evaluationCount})
                    </span>
                  )}
              </div>
              {myTeacher.address && (
                <div className="text-sm text-gray-400 mt-1">
                  📍 {myTeacher.address}
                </div>
              )}
            </div>
          </div>
          {myTeacher.brief && (
            <Paragraph
              ellipsis={{ rows: 2, expandable: true }}
              className="mt-2 mb-0 text-sm text-gray-500"
            >
              {myTeacher.brief}
            </Paragraph>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 rounded-xl p-4 mb-4 text-center">
          <div className="text-gray-500 text-sm mb-2">你还不是认证老师</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            前往「入驻」Tab 提交申请
          </Text>
        </div>
      )}

      {/* 评价记录 Tabs */}
      <Tabs
        defaultActiveKey="my-reviews"
        centered
        items={[
          {
            key: "my-reviews",
            label: `我写的 (${myReviews.length})`,
            children: (
              <ReviewList
                items={myReviews}
                type="written"
                avgRating={avgRating}
              />
            ),
          },
          ...(myTeacher
            ? [
                {
                  key: "received",
                  label: (
                    <Badge
                      count={receivedReviews.length}
                      overflowCount={99}
                      offset={[8, 0]}
                    >
                      收到的
                    </Badge>
                  ),
                  children: reviewsLoading ? (
                    <div className="flex justify-center py-8">
                      <Spin />
                    </div>
                  ) : (
                    <ReviewList
                      items={receivedReviews}
                      type="received"
                      avgRating={avgRating}
                    />
                  ),
                },
              ]
            : []),
        ]}
      />
    </div>
  );
};

function ReviewList({
  items,
  type,
  avgRating,
}: {
  items: Evaluation[];
  type: "written" | "received";
  avgRating: (e: Evaluation) => number;
}) {
  if (items.length === 0) {
    return (
      <Empty
        description={type === "written" ? "还没写过车评" : "还没有收到车评"}
        imageStyle={{ height: 40 }}
        className="py-8"
      />
    );
  }

  return (
    <List
      dataSource={items}
      renderItem={(e) => {
        const st = STATUS_MAP[e.status] ?? {
          label: e.status,
          color: "default",
        };
        const subjectName =
          type === "written"
            ? (e.teacher?.display_name ?? "老师")
            : e.isReportedAnoymously
              ? "匿名用户"
              : "用户";

        return (
          <List.Item style={{ padding: "12px 0", border: "none" }}>
            <div className="w-full bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {type === "written" && e.teacher?.images?.[0] && (
                    <Avatar size={24} src={e.teacher.images[0]} />
                  )}
                  <span className="text-sm font-medium">{subjectName}</span>
                  <Badge
                    status={st.color as any}
                    text={<span style={{ fontSize: 11 }}>{st.label}</span>}
                  />
                </div>
                <Rate
                  disabled
                  allowHalf
                  value={avgRating(e)}
                  style={{ fontSize: 12 }}
                />
              </div>

              <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-xs text-gray-400 mb-2">
                <span>人照 {e.avatar_rating * 2}</span>
                <span>颜值 {e.appearance_rating * 2}</span>
                <span>身材 {e.body_rating * 2}</span>
                <span>服务 {e.service_rating * 2}</span>
                <span>态度 {e.attitude_rating * 2}</span>
                <span>环境 {e.circumstance_rating * 2}</span>
              </div>

              <Paragraph
                ellipsis={{ rows: 2, expandable: true }}
                className="mb-0 text-sm text-gray-600"
              >
                {e.process_desc}
              </Paragraph>

              {e.remark && e.status !== "approved" && (
                <div className="mt-1.5 text-xs text-orange-500">
                  备注：{e.remark}
                </div>
              )}

              <div className="text-xs text-gray-400 mt-1">
                {new Date(e.createdAt).toLocaleDateString("zh-CN")}
              </div>
            </div>
          </List.Item>
        );
      }}
    />
  );
}

export default MyProfile;
