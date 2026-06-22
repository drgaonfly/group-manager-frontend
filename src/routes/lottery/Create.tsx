import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Button,
  Input,
  InputNumber,
  Select,
  Result,
  Spin,
  Switch,
  message,
  Alert,
  DatePicker,
  Typography,
} from "antd";
import {
  GiftOutlined,
  RightOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { LotteryContext } from "./index";

const { TextArea } = Input;
const { Text } = Typography;

interface GroupItem {
  _id: string;
  id: number;
  title: string;
  username?: string;
}

interface Prize {
  name: string;
  value: number;
  quantity: number;
}

const DEFAULT_NOTIFY_CONTENT =
  "🎟️ {lotteryTitle}\n\n🎁 奖品内容:\n{goodsList}\n\n⏰ 开奖方式:\n{openCondition}";

const DEFAULT_JOIN_SUCCESS_CONTENT =
  "🎉 参与成功！\n\n🎟️ 活动：{lotteryTitle}\n\n🎁 奖品：\n{goodsList}\n\n祝您好运！";

const DEFAULT_DRAW_RESULT_CONTENT =
  "🎊 开奖结果公布\n\n🎟️ 活动：{lotteryTitle}\n当前参与人数: {joinNum}人\n\n🏆 中奖名单：\n{winnerList}\n\n⏰ 开奖时间：{openTime}";

/* ── 分节标题 ─────────────────────────────────────────────────── */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: "#1677ff",
      padding: "14px 16px 6px",
      background: "#f5f7fa",
      marginBottom: 0,
    }}
  >
    {children}
  </div>
);

/* ── 行内 label + 控件 行 ─────────────────────────────────────── */
const FieldRow = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "12px 16px",
      background: "#fff",
      borderBottom: "1px solid #f0f0f0",
      gap: 8,
    }}
  >
    <span
      style={{
        flexShrink: 0,
        fontSize: 14,
        color: "#333",
        width: 110,
        lineHeight: "22px",
      }}
    >
      {required && <span style={{ color: "#ff4d4f", marginRight: 2 }}>*</span>}
      {label}
    </span>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

/* ── Switch 行 ────────────────────────────────────────────────── */
const SwitchRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      background: "#fff",
      borderBottom: "1px solid #f0f0f0",
    }}
  >
    <span style={{ fontSize: 14, color: "#333" }}>{label}</span>
    <Switch checked={checked} onChange={onChange} />
  </div>
);

/* ══════════════════════════════════════════════════════════════ */

const TABS = [
  { key: "basic", label: "基础" },
  { key: "draw", label: "开奖" },
  { key: "prizes", label: "奖品" },
  { key: "notify", label: "通知" },
];

const LotteryCreate = () => {
  const { botId, botUserId } = useOutletContext<LotteryContext>();

  const [form] = Form.useForm();
  const [step, setStep] = useState<"selectGroup" | "form">("selectGroup");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);

  const [prizes, setPrizes] = useState<Prize[]>([
    { name: "", value: 0, quantity: 1 },
  ]);
  const [drawMethod, setDrawMethod] = useState<string[]>(["fullParticipants"]);
  const [scheduledDrawTime, setScheduledDrawTime] = useState<any>(null);

  const [notifyContent, setNotifyContent] = useState(DEFAULT_NOTIFY_CONTENT);
  const [notifyPin, setNotifyPin] = useState(false);
  const [joinSuccessContent, setJoinSuccessContent] = useState(
    DEFAULT_JOIN_SUCCESS_CONTENT,
  );
  const [joinSuccessPin, setJoinSuccessPin] = useState(false);
  const [drawResultContent, setDrawResultContent] = useState(
    DEFAULT_DRAW_RESULT_CONTENT,
  );
  const [drawResultPin, setDrawResultPin] = useState(false);

  useEffect(() => {
    setGroupsLoading(true);
    axios
      .get("/lotteries/public/groups", { params: { botId, botUserId } })
      .then((res) => setGroups(res.data?.data || []))
      .catch(() => setGroups([]))
      .finally(() => setGroupsLoading(false));
  }, [botId, botUserId]);

  const addPrize = () =>
    setPrizes([...prizes, { name: "", value: 0, quantity: 1 }]);

  const removePrize = (idx: number) =>
    setPrizes(prizes.filter((_, i) => i !== idx));

  const updatePrize = (idx: number, field: keyof Prize, val: any) => {
    const next = [...prizes];
    next[idx] = { ...next[idx], [field]: val };
    setPrizes(next);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const validPrizes = prizes.filter((p) => p.name?.trim());
      if (!validPrizes.length) {
        message.error("请至少添加一个奖品名称");
        return setActiveTab("prizes");
      }
      if (!drawMethod.length) {
        message.error("请选择开奖方式");
        return setActiveTab("draw");
      }
      if (drawMethod.includes("scheduledTime") && !scheduledDrawTime) {
        message.error("请选择定时开奖时间");
        return setActiveTab("draw");
      }

      setError("");
      setSubmitting(true);

      const postData: any = {
        botId,
        botUserId,
        groupId: selectedGroup!._id,
        title: values.title,
        keywords: values.keywords || ["抽奖"],
        joinCostPoints: values.joinCostPoints ?? 0,
        drawMethod,
        prizes: validPrizes,
        notifyContent,
        notifyPin,
        joinSuccessContent,
        joinSuccessPin,
        drawResultContent,
        drawResultPin,
      };
      if (drawMethod.includes("fullParticipants"))
        postData.fullParticipantsCount = values.fullParticipantsCount ?? 10;
      if (drawMethod.includes("scheduledTime") && scheduledDrawTime)
        postData.scheduledDrawTime = scheduledDrawTime.toISOString();

      await axios.post("/lotteries/public", postData);
      setSuccess(true);
    } catch (err: any) {
      if (err?.errorFields) return;
      setError(err?.response?.data?.message || "创建失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    form.resetFields();
    setPrizes([{ name: "", value: 0, quantity: 1 }]);
    setDrawMethod(["fullParticipants"]);
    setScheduledDrawTime(null);
    setNotifyContent(DEFAULT_NOTIFY_CONTENT);
    setJoinSuccessContent(DEFAULT_JOIN_SUCCESS_CONTENT);
    setDrawResultContent(DEFAULT_DRAW_RESULT_CONTENT);
    setError("");
    setSuccess(false);
    setSelectedGroup(null);
    setStep("selectGroup");
    setActiveTab("basic");
  };

  /* ── 成功页 ──────────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#f6ffed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <CheckCircleOutlined style={{ fontSize: 40, color: "#52c41a" }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          抽奖活动已创建！
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#888",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          已发送到「{selectedGroup?.title}」
          <br />
          群成员可点击通知参与抽奖
        </div>
        <Button type="primary" icon={<GiftOutlined />} onClick={resetAll}>
          再创建一个
        </Button>
      </div>
    );
  }

  /* ── 第一步：选群 ─────────────────────────────────────────────── */
  if (step === "selectGroup") {
    return (
      <div style={{ paddingBottom: 24 }}>
        <div
          style={{
            textAlign: "center",
            padding: "24px 16px 12px",
            color: "#888",
            fontSize: 13,
          }}
        >
          选择要发起抽奖的群组
        </div>

        {groupsLoading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : groups.length === 0 ? (
          <Result
            status="warning"
            title="暂无可用群组"
            subTitle="你还没有加入该机器人管辖的任何群"
          />
        ) : (
          <div style={{ background: "#fff" }}>
            {groups.map((g, idx) => (
              <div
                key={g._id}
                onClick={() => {
                  setSelectedGroup(g);
                  setStep("form");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom:
                    idx < groups.length - 1 ? "1px solid #f0f0f0" : "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#e6f4ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginRight: 12,
                    fontSize: 18,
                  }}
                >
                  💬
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#1a1a1a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {g.title}
                  </div>
                  {g.username && (
                    <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                      @{g.username}
                    </div>
                  )}
                </div>
                <RightOutlined style={{ color: "#ccc", fontSize: 12 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── 第二步：填表 ─────────────────────────────────────────────── */

  /* tab 切换器 — 固定在 header 下方 */
  const TabBar = () => (
    <div
      style={{
        display: "flex",
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        position: "sticky",
        top: 52, // header 高度
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
            color: activeTab === t.key ? "#1677ff" : "#666",
            borderBottom:
              activeTab === t.key
                ? "2px solid #1677ff"
                : "2px solid transparent",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  /* 当前群组面包屑 */
  const GroupBreadcrumb = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        background: "#f0f7ff",
        borderBottom: "1px solid #d6e8ff",
        fontSize: 13,
        color: "#1677ff",
        cursor: "pointer",
      }}
      onClick={() => {
        setSelectedGroup(null);
        setStep("selectGroup");
      }}
    >
      <LeftOutlined style={{ fontSize: 11, marginRight: 6 }} />
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {selectedGroup!.title}
      </span>
      <span style={{ color: "#999", fontSize: 12 }}>切换</span>
    </div>
  );

  /* ── 各 tab 内容 ─────────────────────────────────────────────── */
  const renderBasic = () => (
    <>
      <SectionTitle>活动信息</SectionTitle>
      <Form form={form} layout="vertical" style={{ background: "#fff" }}>
        <div
          style={{ padding: "12px 16px 0", borderBottom: "1px solid #f0f0f0" }}
        >
          <Form.Item
            name="title"
            label={
              <span style={{ fontSize: 14, fontWeight: 500 }}>活动标题</span>
            }
            rules={[{ required: true, message: "请输入活动标题" }]}
            style={{ marginBottom: 12 }}
          >
            <TextArea
              rows={2}
              placeholder="如：新年抽奖活动"
              style={{ fontSize: 15 }}
            />
          </Form.Item>
        </div>

        <div
          style={{ padding: "12px 16px 0", borderBottom: "1px solid #f0f0f0" }}
        >
          <Form.Item
            name="keywords"
            label={
              <span style={{ fontSize: 14, fontWeight: 500 }}>触发关键词</span>
            }
            style={{ marginBottom: 12 }}
          >
            <Select
              mode="tags"
              placeholder="输入后回车，默认：抽奖"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>

        <div style={{ padding: "12px 16px 0" }}>
          <Form.Item
            name="joinCostPoints"
            label={
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                参与消耗积分
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
                  0 = 免费
                </Text>
              </span>
            }
            style={{ marginBottom: 12 }}
          >
            <InputNumber
              min={0}
              precision={0}
              style={{ width: "100%", fontSize: 15 }}
              placeholder="0"
            />
          </Form.Item>
        </div>
      </Form>
    </>
  );

  const renderDraw = () => (
    <>
      <SectionTitle>开奖方式</SectionTitle>
      <FieldRow label="开奖方式" required>
        <Select
          mode="multiple"
          value={drawMethod}
          onChange={setDrawMethod}
          options={[
            { label: "满员开奖", value: "fullParticipants" },
            { label: "定时开奖", value: "scheduledTime" },
          ]}
          style={{ width: "100%" }}
          placeholder="请选择"
        />
      </FieldRow>

      {drawMethod.includes("fullParticipants") && (
        <Form form={form}>
          <FieldRow label="满员人数" required>
            <Form.Item
              name="fullParticipantsCount"
              noStyle
              rules={[{ required: true, message: "请输入" }]}
            >
              <InputNumber
                min={2}
                precision={0}
                style={{ width: "100%" }}
                placeholder="10"
              />
            </Form.Item>
          </FieldRow>
        </Form>
      )}

      {drawMethod.includes("scheduledTime") && (
        <FieldRow label="开奖时间" required>
          <DatePicker
            showTime
            style={{ width: "100%" }}
            value={scheduledDrawTime}
            onChange={setScheduledDrawTime}
            disabledDate={(d) => d && d.isBefore(dayjs(), "day")}
            placeholder="选择日期和时间"
          />
        </FieldRow>
      )}
    </>
  );

  const renderPrizes = () => (
    <>
      <SectionTitle>奖品列表</SectionTitle>
      {prizes.map((p, idx) => (
        <div
          key={idx}
          style={{
            background: "#fff",
            marginBottom: 8,
            borderTop: idx === 0 ? "none" : "8px solid #f5f5f5",
          }}
        >
          {/* 奖品标题行 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>
              奖品 {idx + 1}
            </span>
            {prizes.length > 1 && (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => removePrize(idx)}
              />
            )}
          </div>
          {/* 奖品名称 */}
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Input
              placeholder="奖品名称，如：一等奖"
              value={p.name}
              onChange={(e) => updatePrize(idx, "name", e.target.value)}
              style={{ fontSize: 15 }}
            />
          </div>
          {/* 积分 + 数量 两列 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                padding: "10px 16px",
                borderRight: "1px solid #f0f0f0",
              }}
            >
              <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                积分奖励
              </div>
              <InputNumber
                value={p.value}
                min={0}
                precision={0}
                onChange={(v) => updatePrize(idx, "value", v ?? 0)}
                style={{ width: "100%" }}
                placeholder="0"
                suffix="积分"
              />
            </div>
            <div style={{ padding: "10px 16px" }}>
              <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>
                名额
              </div>
              <InputNumber
                value={p.quantity}
                min={1}
                precision={0}
                onChange={(v) => updatePrize(idx, "quantity", v ?? 1)}
                style={{ width: "100%" }}
                placeholder="1"
                suffix="名"
              />
            </div>
          </div>
        </div>
      ))}
      <div style={{ padding: "12px 16px", background: "#fff" }}>
        <Button
          type="dashed"
          onClick={addPrize}
          block
          icon={<PlusOutlined />}
          style={{ height: 44 }}
        >
          添加奖品
        </Button>
      </div>
    </>
  );

  const renderNotify = () => (
    <>
      <SectionTitle>抽奖通知</SectionTitle>
      <div
        style={{
          padding: "12px 16px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <TextArea
          rows={5}
          value={notifyContent}
          onChange={(e) => setNotifyContent(e.target.value)}
          style={{ fontSize: 13 }}
        />
      </div>
      <SwitchRow label="置顶通知" checked={notifyPin} onChange={setNotifyPin} />

      <SectionTitle>参与成功通知</SectionTitle>
      <div
        style={{
          padding: "12px 16px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <TextArea
          rows={5}
          value={joinSuccessContent}
          onChange={(e) => setJoinSuccessContent(e.target.value)}
          style={{ fontSize: 13 }}
        />
      </div>
      <SwitchRow
        label="置顶参与成功通知"
        checked={joinSuccessPin}
        onChange={setJoinSuccessPin}
      />

      <SectionTitle>开奖结果通知</SectionTitle>
      <div
        style={{
          padding: "12px 16px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <TextArea
          rows={5}
          value={drawResultContent}
          onChange={(e) => setDrawResultContent(e.target.value)}
          style={{ fontSize: 13 }}
        />
      </div>
      <SwitchRow
        label="置顶开奖结果"
        checked={drawResultPin}
        onChange={setDrawResultPin}
      />

      <div
        style={{
          padding: "12px 16px",
          background: "#fafafa",
          fontSize: 12,
          color: "#aaa",
          lineHeight: 1.8,
        }}
      >
        可用变量：{"{lotteryTitle}"} · {"{goodsList}"} · {"{joinNum}"} ·{" "}
        {"{winnerList}"} · {"{openTime}"}
      </div>
    </>
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      <GroupBreadcrumb />
      <TabBar />

      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          closable
          onClose={() => setError("")}
          style={{ margin: "8px 16px" }}
        />
      )}

      {/* tab 内容区 */}
      <div style={{ display: activeTab === "basic" ? "block" : "none" }}>
        {renderBasic()}
      </div>
      <div style={{ display: activeTab === "draw" ? "block" : "none" }}>
        {renderDraw()}
      </div>
      <div style={{ display: activeTab === "prizes" ? "block" : "none" }}>
        {renderPrizes()}
      </div>
      <div style={{ display: activeTab === "notify" ? "block" : "none" }}>
        {renderNotify()}
      </div>

      {/* 底部固定提交按钮 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px 16px",
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          zIndex: 100,
        }}
      >
        <Button
          type="primary"
          block
          size="large"
          loading={submitting}
          onClick={handleSubmit}
          icon={<GiftOutlined />}
          style={{ height: 48, fontSize: 16, borderRadius: 8 }}
        >
          发起抽奖
        </Button>
      </div>
    </div>
  );
};

export default LotteryCreate;
