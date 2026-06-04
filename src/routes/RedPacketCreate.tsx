import { useState, useMemo } from "react";
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
} from "antd";
import { RedEnvelopeOutlined } from "@ant-design/icons";

const { Text } = Typography;

const RedPacketCreate = () => {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get("botId");
  const botUserId = searchParams.get("botUserId");
  const groupId = searchParams.get("groupId");

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // 用普通 state 跟踪表单值，避免 useWatch 的重渲问题
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [totalSlots, setTotalSlots] = useState<number>(5);

  // 炸弹数字选项：0~9，对应金额末位小数
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
        groupId,
        totalPoints: values.totalPoints,
        totalSlots: values.totalSlots,
        bombNumbers: values.bombNumbers || [],
        bombMultiplier: values.bombMultiplier ?? 1.2,
        expireMinutes: values.expireMinutes ?? 30,
      });

      setSuccess(true);

      // 关闭 Mini App（消息已由 backend 直接发到群里）
      const tg = (window as any).Telegram?.WebApp;
      if (tg) tg.close();
    } catch (err: any) {
      if (err?.errorFields) return; // antd 表单校验错误，已有提示
      setError(err?.response?.data?.message || "发送失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (!botId || !botUserId || !groupId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Result
          status="error"
          title="参数错误"
          subTitle="请在群内通过 /redpacket 命令打开此页面"
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
          subTitle="群成员可以点击红包消息领取"
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
              }}
            >
              再发一个
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <div className="text-center mb-6">
            <RedEnvelopeOutlined style={{ fontSize: 48, color: "#cf1322" }} />
            <h1 className="text-xl font-bold mt-3">发红包</h1>
            <Text type="secondary">积分红包 · 踩雷有惊喜</Text>
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
              if ("totalSlots" in changed) {
                setTotalSlots(changed.totalSlots ?? 1);
              }
            }}
          >
            {/* 总积分 */}
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

            {/* 份数 */}
            <Form.Item
              label="红包份数"
              name="totalSlots"
              rules={[{ required: true, message: "请选择份数" }]}
            >
              <Select options={slotOptions} />
            </Form.Item>

            {/* 每份预览 */}
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

            {/* 炸弹数字 */}
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

            {/* 炸弹倍率 */}
            <Form.Item
              label={
                <Space size={4}>
                  <span>惩罚倍率</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    踩雷扣款 = 每份积分 × 倍率
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

            {/* 过期时间 */}
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
