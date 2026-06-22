import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Button,
  InputNumber,
  Select,
  Result,
  Tag,
  Typography,
  Alert,
  Spin,
  Upload,
  message,
} from "antd";
import {
  RedEnvelopeOutlined,
  RightOutlined,
  PlusOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import type { RedPacketContext } from "./index";

const { Text } = Typography;

interface GroupItem {
  _id: string;
  id: number;
  title: string;
  username?: string;
}

/* ── 分节标题 ─────────────────────────────────────────────────── */
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: "#cf1322",
      padding: "14px 16px 6px",
      background: "#f5f7fa",
    }}
  >
    {children}
  </div>
);

/* ── 行内字段行 ───────────────────────────────────────────────── */
const FieldRow = ({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div
    style={{
      padding: "12px 16px",
      background: "#fff",
      borderBottom: "1px solid #f0f0f0",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: hint ? 6 : 0,
        gap: 4,
      }}
    >
      {required && <span style={{ color: "#ff4d4f" }}>*</span>}
      <span style={{ fontSize: 14, color: "#333", fontWeight: 500 }}>
        {label}
      </span>
      {hint && (
        <span style={{ fontSize: 12, color: "#aaa", marginLeft: 4 }}>
          {hint}
        </span>
      )}
    </div>
    {hint ? (
      <div style={{ marginTop: 6 }}>{children}</div>
    ) : (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        {children}
      </div>
    )}
  </div>
);

const RedPacketCreate = () => {
  const { botId, botUserId } = useOutletContext<RedPacketContext>();

  const [form] = Form.useForm();
  const [step, setStep] = useState<"selectGroup" | "form">("selectGroup");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);

  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [totalSlots, setTotalSlots] = useState<number>(5);
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);

  const bombOptions = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({ label: `${i}`, value: i })),
    [],
  );

  const slotOptions = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        label: `${i + 1} 份`,
        value: i + 1,
      })),
    [],
  );

  useEffect(() => {
    setGroupsLoading(true);
    axios
      .get("/red-packets/public/groups", { params: { botId, botUserId } })
      .then((res) => setGroups(res.data?.data || []))
      .catch(() => setGroups([]))
      .finally(() => setGroupsLoading(false));
  }, [botId, botUserId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if ((values.bombNumbers?.length ?? 0) >= values.totalSlots) {
        setError("炸弹数字数量不能大于等于总份数");
        return;
      }

      setError("");
      setSubmitting(true);

      await axios.post("/red-packets/public", {
        botId,
        botUserId,
        groupId: selectedGroup!._id,
        totalPoints: values.totalPoints,
        totalSlots: values.totalSlots,
        bombNumbers: values.bombNumbers || [],
        bombMultiplier: values.bombMultiplier ?? 1.2,
        expireMinutes: values.expireMinutes ?? 30,
        backgroundUrl: backgroundUrl || undefined,
      });

      setSuccess(true);

      const tg = (window as any).Telegram?.WebApp;
      if (tg) tg.close();
    } catch (err: any) {
      if (err?.errorFields) return;
      setError(err?.response?.data?.message || "发送失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    form.resetFields();
    setTotalPoints(0);
    setTotalSlots(5);
    setBackgroundUrl("");
    setImageFileList([]);
    setError("");
    setSuccess(false);
    setSelectedGroup(null);
    setStep("selectGroup");
  };

  /* ── 成功页 ──────────────────────────────────────────────────── */
  if (success) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#fff1f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <CheckCircleOutlined style={{ fontSize: 40, color: "#cf1322" }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          🧧 红包已发出！
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
          群成员可点击红包消息领取
        </div>
        <Button
          type="primary"
          danger
          icon={<RedEnvelopeOutlined />}
          onClick={resetAll}
          size="large"
        >
          再发一个
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
          选择要发红包的群组
        </div>

        {groupsLoading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 60 }}
          >
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
                    background: "#fff1f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginRight: 12,
                    fontSize: 18,
                  }}
                >
                  🧧
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

  /* ── 第二步：填写红包参数 ─────────────────────────────────────── */

  /* 当前群组面包屑 */
  const GroupBreadcrumb = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        background: "#fff9f0",
        borderBottom: "1px solid #ffe0b2",
        fontSize: 13,
        color: "#cf1322",
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

  return (
    <div style={{ paddingBottom: 80 }}>
      <GroupBreadcrumb />

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

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          totalSlots: 5,
          bombMultiplier: 1.2,
          expireMinutes: 30,
        }}
        onValuesChange={(changed) => {
          if ("totalPoints" in changed)
            setTotalPoints(changed.totalPoints ?? 0);
          if ("totalSlots" in changed) setTotalSlots(changed.totalSlots ?? 1);
        }}
      >
        <SectionTitle>💰 红包设置</SectionTitle>

        <FieldRow label="总积分" required>
          <Form.Item
            name="totalPoints"
            noStyle
            rules={[
              { required: true, message: "请输入积分" },
              { type: "number", min: 1, message: "至少 1 积分" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="输入要发出的总积分"
              min={1}
              precision={0}
              size="large"
            />
          </Form.Item>
        </FieldRow>

        <FieldRow label="红包份数" required>
          <Form.Item
            name="totalSlots"
            noStyle
            rules={[{ required: true, message: "请选择份数" }]}
          >
            <Select
              options={slotOptions}
              style={{ width: "100%" }}
              size="large"
            />
          </Form.Item>
        </FieldRow>

        {/* 小计提示 */}
        {totalPoints > 0 && totalSlots > 0 && (
          <div
            style={{
              padding: "10px 16px",
              background: "#fffbe6",
              borderBottom: "1px solid #ffe58f",
              fontSize: 13,
              color: "#874d00",
            }}
          >
            共 <strong>{totalSlots}</strong> 份，随机金额，总计{" "}
            <strong>{totalPoints}</strong> 积分
          </div>
        )}

        <SectionTitle>💣 炸弹设置（可选）</SectionTitle>

        <FieldRow label="炸弹数字" hint="金额末位等于所选数字即踩雷">
          <Form.Item name="bombNumbers" noStyle>
            <Select
              mode="multiple"
              placeholder="留空则无炸弹"
              options={bombOptions}
              style={{ width: "100%" }}
              size="large"
              tagRender={(props) => (
                <Tag
                  color="red"
                  closable={props.closable}
                  onClose={props.onClose}
                  style={{ marginRight: 4 }}
                >
                  💣 {props.value}
                </Tag>
              )}
            />
          </Form.Item>
        </FieldRow>

        <FieldRow label="惩罚倍率" hint="踩雷扣款 = 领取金额 × 倍率">
          <Form.Item
            name="bombMultiplier"
            noStyle
            rules={[{ required: true, message: "请输入倍率" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              max={5}
              step={0.1}
              precision={1}
              size="large"
            />
          </Form.Item>
        </FieldRow>

        <SectionTitle>⚙️ 其他设置</SectionTitle>

        {/* 背景图上传 */}
        <div
          style={{
            padding: "12px 16px",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#333",
              marginBottom: 10,
            }}
          >
            背景图
            <Text
              type="secondary"
              style={{ fontSize: 12, marginLeft: 6, fontWeight: 400 }}
            >
              可选
            </Text>
          </div>
          <Upload
            listType="picture-card"
            maxCount={1}
            accept="image/*"
            fileList={imageFileList}
            customRequest={async ({ file, onSuccess, onError }) => {
              setImageUploading(true);
              const formData = new FormData();
              formData.append("file", file as File);
              try {
                const res = await axios.post("/upload/public", formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });
                const url = res.data?.data?.url;
                if (!url) throw new Error("未获取到图片地址");
                setBackgroundUrl(url);
                onSuccess?.(res.data);
                message.success("上传成功");
              } catch (e: any) {
                onError?.(e);
                message.error("上传失败，请重试");
              } finally {
                setImageUploading(false);
              }
            }}
            onChange={({ fileList }) => setImageFileList(fileList)}
            onRemove={() => {
              setBackgroundUrl("");
              setImageFileList([]);
              return true;
            }}
            style={{ width: "100%" }}
          >
            {imageFileList.length === 0 && (
              <div>
                {imageUploading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8, fontSize: 12 }}>上传背景图</div>
              </div>
            )}
          </Upload>
        </div>

        <FieldRow label="有效期" required>
          <Form.Item
            name="expireMinutes"
            noStyle
            rules={[{ required: true, message: "请选择有效期" }]}
          >
            <Select
              options={[
                { label: "5 分钟", value: 5 },
                { label: "10 分钟", value: 10 },
                { label: "30 分钟", value: 30 },
                { label: "1 小时", value: 60 },
                { label: "24 小时", value: 1440 },
              ]}
              style={{ width: "100%" }}
              size="large"
            />
          </Form.Item>
        </FieldRow>
      </Form>

      {/* 固定底部按钮 */}
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
          danger
          block
          size="large"
          loading={submitting}
          onClick={handleSubmit}
          icon={<RedEnvelopeOutlined />}
          style={{ height: 48, fontSize: 16, borderRadius: 8 }}
        >
          发出红包
        </Button>
      </div>
    </div>
  );
};

export default RedPacketCreate;
