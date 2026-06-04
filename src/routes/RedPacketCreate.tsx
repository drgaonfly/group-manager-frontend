import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Button,
  Card,
  InputNumber,
  Select,
  Result,
  Divider,
  Space,
  Tag,
  Typography,
  Alert,
  List,
  Spin,
} from "antd";
import { RedEnvelopeOutlined, RightOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface GroupItem {
  _id: string;
  id: number;
  title: string;
  username?: string;
}

const RedPacketCreate = () => {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get("botId");
  const botUserId = searchParams.get("botUserId");

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // 选群阶段
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);

  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [totalSlots, setTotalSlots] = useState<number>(5);

  // 炸弹数字选项：0~9 对应金额末位小数
  const bombOptions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        label: `${i}`,
        value: i,
      })),
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

  // 加载群列表
  useEffect(() => {
    if (!botId || !botUserId) return;
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

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Result
          status="success"
          title="🧧 红包已发出！"
          subTitle={`已发送到「${selectedGroup?.title}」，群成员可以点击红包消息领取`}
          extra={
            <Button
              type="primary"
              icon={<RedEnvelopeOutlined />}
              onClick={() => {
                form.resetFields();
                setTotalPoints(0);
                setTotalSlots(5);
                setError("");
                setSuccess(false);
                setSelectedGroup(null);
              }}
            >
              再发一个
            </Button>
          }
        />
      </div>
    );
  }

  // ── 第一步：选群 ──────────────────────────────────────────────
  if (!selectedGroup) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center mb-6">
              <RedEnvelopeOutlined style={{ fontSize: 40, color: "#cf1322" }} />
              <h1 className="text-xl font-bold mt-3">发红包</h1>
              <Text type="secondary">选择要发红包的群</Text>
            </div>

            {groupsLoading ? (
              <div className="text-center py-8">
                <Spin />
              </div>
            ) : groups.length === 0 ? (
              <Result
                status="warning"
                title="暂无可用群组"
                subTitle="你还没有加入该机器人管辖的任何群"
              />
            ) : (
              <List
                dataSource={groups}
                renderItem={(g) => (
                  <List.Item
                    onClick={() => setSelectedGroup(g)}
                    style={{ cursor: "pointer" }}
                    extra={<RightOutlined style={{ color: "#999" }} />}
                  >
                    <List.Item.Meta
                      title={g.title}
                      description={g.username ? `@${g.username}` : undefined}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      </div>
    );
  }

  // ── 第二步：填写红包参数 ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <div className="text-center mb-4">
            <RedEnvelopeOutlined style={{ fontSize: 40, color: "#cf1322" }} />
            <h1 className="text-xl font-bold mt-3">发红包</h1>
            <div className="mt-1">
              <Tag
                color="red"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedGroup(null)}
              >
                {selectedGroup.title} ✕
              </Tag>
            </div>
          </div>

          {error && (
            <Alert type="error" message={error} className="mb-4" showIcon />
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
              if ("totalSlots" in changed)
                setTotalSlots(changed.totalSlots ?? 1);
            }}
          >
            <Form.Item
              label="红包总积分"
              name="totalPoints"
              rules={[
                { required: true, message: "请输入积分数量" },
                { type: "number", min: 1, message: "至少 1 积分" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="输入要发出的总积分"
                min={1}
                precision={0}
              />
            </Form.Item>

            <Form.Item
              label="红包份数"
              name="totalSlots"
              rules={[{ required: true, message: "请选择份数" }]}
            >
              <Select options={slotOptions} />
            </Form.Item>

            {totalPoints > 0 && totalSlots > 0 && (
              <div className="mb-4 p-3 bg-orange-50 rounded-lg text-sm">
                <Space>
                  <span>
                    共 <strong>{totalSlots}</strong> 份，随机金额
                  </span>
                  <Text type="secondary">（总额 {totalPoints} 积分）</Text>
                </Space>
              </div>
            )}

            <Form.Item
              label={
                <Space size={4}>
                  <span>💣 炸弹数字</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    金额末位小数等于这些数字即踩雷（0~9）
                  </Text>
                </Space>
              }
              name="bombNumbers"
            >
              <Select
                mode="multiple"
                placeholder="选择炸弹数字（留空则无炸弹）"
                options={bombOptions}
                tagRender={(props) => (
                  <Tag
                    color="red"
                    closable={props.closable}
                    onClose={props.onClose}
                  >
                    💣 {props.value}
                  </Tag>
                )}
              />
            </Form.Item>

            <Form.Item
              label={
                <Space size={4}>
                  <span>惩罚倍率</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    踩雷扣款 = 领取金额 × 倍率
                  </Text>
                </Space>
              }
              name="bombMultiplier"
              rules={[{ required: true, message: "请输入倍率" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                max={5}
                step={0.1}
                precision={1}
              />
            </Form.Item>

            <Divider />

            <Form.Item
              label="红包有效期"
              name="expireMinutes"
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
              />
            </Form.Item>

            <Button
              type="primary"
              danger
              block
              size="large"
              loading={submitting}
              onClick={handleSubmit}
              icon={<RedEnvelopeOutlined />}
            >
              发出红包
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default RedPacketCreate;
