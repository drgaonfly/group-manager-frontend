import { useState, useEffect } from "react";
import axios from "axios";
import {
  List,
  Tag,
  Avatar,
  Rate,
  Spin,
  Empty,
  Input,
  Button,
  Drawer,
  Image,
  Space,
  Typography,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  StarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;

interface Teacher {
  _id: string;
  display_name: string;
  address: string;
  brief: string;
  contactLink: string;
  isAvailable: boolean;
  images: string[];
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
  reviewer?: { userName?: string; firstName?: string; lastName?: string };
  createdAt: string;
}

function TeacherCard({
  teacher,
  onClick,
}: {
  teacher: Teacher;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-white rounded-xl p-4 mb-3 shadow-sm active:bg-gray-50"
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* 头像 */}
        <Avatar
          size={56}
          src={teacher.images?.[0]}
          icon={<UserOutlined />}
          className="flex-shrink-0"
        />

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-base truncate">
              {teacher.display_name}
            </span>
            <Tag
              color={teacher.isAvailable ? "green" : "default"}
              style={{ fontSize: 11, padding: "0 4px", lineHeight: "18px" }}
            >
              {teacher.isAvailable ? "可约" : "休息"}
            </Tag>
          </div>

          {teacher.averageRating !== undefined && teacher.averageRating > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <Rate
                disabled
                allowHalf
                value={teacher.averageRating}
                style={{ fontSize: 12 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                ({teacher.evaluationCount})
              </Text>
            </div>
          )}

          {teacher.address && (
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <EnvironmentOutlined style={{ fontSize: 12 }} />
              <span className="truncate">{teacher.address}</span>
            </div>
          )}
        </div>
      </div>

      {teacher.brief && (
        <Paragraph
          ellipsis={{ rows: 2 }}
          className="mt-2 mb-0 text-gray-500 text-sm"
        >
          {teacher.brief}
        </Paragraph>
      )}
    </div>
  );
}

function TeacherDetail({
  teacher,
  open,
  onClose,
}: {
  teacher: Teacher | null;
  open: boolean;
  onClose: () => void;
}) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evalLoading, setEvalLoading] = useState(false);

  useEffect(() => {
    if (!teacher || !open) return;
    setEvalLoading(true);
    axios
      .get("/teachers/public/evaluations", {
        params: { teacherId: teacher._id },
      })
      .then((res) => setEvaluations(res.data?.data || []))
      .catch(() => setEvaluations([]))
      .finally(() => setEvalLoading(false));
  }, [teacher?._id, open]);

  if (!teacher) return null;

  const avgRating = (e: Evaluation) =>
    (e.avatar_rating +
      e.appearance_rating +
      e.body_rating +
      e.service_rating +
      e.attitude_rating +
      e.circumstance_rating) /
    6;

  return (
    <Drawer
      title={teacher.display_name}
      placement="bottom"
      height="90vh"
      open={open}
      onClose={onClose}
      styles={{ body: { padding: "12px 16px", overflowY: "auto" } }}
    >
      {/* 图片轮播 */}
      {teacher.images?.length > 0 && (
        <div className="mb-4">
          <Image.PreviewGroup>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {teacher.images.map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  width={100}
                  height={100}
                  style={{ objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                />
              ))}
            </div>
          </Image.PreviewGroup>
        </div>
      )}

      {/* 基本信息 */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag color={teacher.isAvailable ? "green" : "default"}>
            {teacher.isAvailable ? "🟢 可约" : "🔴 休息中"}
          </Tag>
          {teacher.averageRating !== undefined && teacher.averageRating > 0 && (
            <span className="text-sm text-gray-500">
              <StarOutlined style={{ color: "#faad14" }} />{" "}
              {teacher.averageRating.toFixed(1)} ({teacher.evaluationCount}条)
            </span>
          )}
        </div>

        {teacher.address && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1.5">
            <EnvironmentOutlined />
            <span>{teacher.address}</span>
          </div>
        )}

        {teacher.contactLink && (
          <a
            href={teacher.contactLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-500"
          >
            <PhoneOutlined />
            <span>联系老师</span>
          </a>
        )}
      </div>

      {teacher.brief && (
        <div className="mb-4">
          <div className="font-medium text-sm text-gray-500 mb-1">简介</div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {teacher.brief}
          </div>
        </div>
      )}

      {/* 评价列表 */}
      <div>
        <div className="font-medium text-sm text-gray-500 mb-2">
          车评 ({evaluations.length})
        </div>
        {evalLoading ? (
          <div className="text-center py-6">
            <Spin />
          </div>
        ) : evaluations.length === 0 ? (
          <Empty description="暂无评价" imageStyle={{ height: 40 }} />
        ) : (
          <Space direction="vertical" className="w-full">
            {evaluations.map((e) => {
              const reviewer = e.isReportedAnoymously
                ? "匿名"
                : e.reviewer?.userName
                  ? `@${e.reviewer.userName}`
                  : [e.reviewer?.firstName, e.reviewer?.lastName]
                      .filter(Boolean)
                      .join(" ") || "匿名";

              return (
                <div key={e._id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{reviewer}</span>
                    <Rate
                      disabled
                      allowHalf
                      value={avgRating(e)}
                      style={{ fontSize: 12 }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-xs text-gray-500 mb-2">
                    <span>人照 {e.avatar_rating * 2}</span>
                    <span>颜值 {e.appearance_rating * 2}</span>
                    <span>身材 {e.body_rating * 2}</span>
                    <span>服务 {e.service_rating * 2}</span>
                    <span>态度 {e.attitude_rating * 2}</span>
                    <span>环境 {e.circumstance_rating * 2}</span>
                  </div>
                  {e.process_desc && (
                    <Paragraph
                      ellipsis={{ rows: 3, expandable: true }}
                      className="mb-0 text-sm text-gray-600"
                    >
                      {e.process_desc}
                    </Paragraph>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(e.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
              );
            })}
          </Space>
        )}
      </div>
    </Drawer>
  );
}

// ── 主组件 ─────────────────────────────────────────────────────────
const TeacherList = ({
  botId,
  botUserId: _botUserId,
}: {
  botId: string;
  botUserId: string;
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");

  const fetchTeachers = (q?: string) => {
    setLoading(true);
    axios
      .get("/teachers/public/list", {
        params: { botId, period, search: q ?? search },
      })
      .then((res) => setTeachers(res.data?.data || []))
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeachers();
  }, [botId, period]);

  const PERIOD_OPTIONS = [
    { label: "本月", value: "month" },
    { label: "本季度", value: "quarter" },
    { label: "本年", value: "year" },
  ] as const;

  return (
    <div>
      {/* 顶部 */}
      <div className="bg-white px-4 pt-4 pb-2 sticky top-0 z-10">
        <div className="flex gap-2 mb-3">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`flex-1 py-1 rounded-full text-sm transition-colors ${
                period === opt.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="搜索花名或地点"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={() => fetchTeachers(search)}
          suffix={
            search ? (
              <Button
                type="link"
                size="small"
                style={{ padding: 0 }}
                onClick={() => {
                  setSearch("");
                  fetchTeachers("");
                }}
              >
                清除
              </Button>
            ) : null
          }
          allowClear={false}
        />
      </div>

      {/* 列表 */}
      <div className="px-4 pt-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spin />
          </div>
        ) : teachers.length === 0 ? (
          <Empty description="暂无老师" className="py-16" />
        ) : (
          <List
            dataSource={teachers}
            renderItem={(t) => (
              <List.Item style={{ padding: 0, border: "none" }}>
                <TeacherCard
                  teacher={t}
                  onClick={() => setSelectedTeacher(t)}
                />
              </List.Item>
            )}
          />
        )}
      </div>

      <TeacherDetail
        teacher={selectedTeacher}
        open={!!selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
      />
    </div>
  );
};

export default TeacherList;
