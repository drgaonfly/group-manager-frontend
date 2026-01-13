import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Checkbox,
  Select,
  Button,
  Card,
  Space,
  message,
  Result,
  Tabs,
  Tag,
} from "antd";
import { PlusOutlined, DeleteOutlined, GiftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;

interface Prize {
  key: string;
  name: string;
  type: "points" | "custom";
  value: number | string;
  quantity: number;
}

const genKey = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// 通知变量
const LOTTERY_VARIABLES = [
  { key: "{lotteryTitle}", label: "抽奖标题" },
  { key: "{goodsList}", label: "奖品内容" },
  { key: "{joinCondition}", label: "参与条件" },
  { key: "{openCondition}", label: "开奖条件" },
  { key: "{joinNum}", label: "已参与人数" },
];

const DRAW_RESULT_VARIABLES = [
  { key: "{lotteryTitle}", label: "抽奖标题" },
  { key: "{joinNum}", label: "参与人数" },
  { key: "{eligibleNum}", label: "达标人数" },
  { key: "{winnerList}", label: "中奖名单" },
  { key: "{openTime}", label: "开奖时间" },
];

const LotteryCreate = () => {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get("botId");

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [prizes, setPrizes] = useState<Prize[]>([
    { key: genKey(), name: "", type: "points", value: 100, quantity: 1 },
  ]);
  const [drawMethod, setDrawMethod] = useState<string[]>(["fullParticipants"]);
  const [notifyContent, setNotifyContent] = useState("");
  const [joinSuccessContent, setJoinSuccessContent] = useState("");
  const [drawResultContent, setDrawResultContent] = useState("");

  // 添加奖品
  const addPrize = () => {
    setPrizes([
      ...prizes,
      { key: genKey(), name: "", type: "points", value: 100, quantity: 1 },
    ]);
  };

  // 删除奖品
  const removePrize = (key: string) => {
    if (prizes.length <= 1) {
      message.warning("至少需要一个奖品");
      return;
    }
    setPrizes(prizes.filter((p) => p.key !== key));
  };

  // 更新奖品
  const updatePrize = (key: string, field: string, value: any) => {
    setPrizes(
      prizes.map((p) => {
        if (p.key !== key) return p;
        if (field === "type") {
          return { ...p, type: value, value: value === "points" ? 100 : "" };
        }
        return { ...p, [field]: value };
      }),
    );
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 验证群组链接
      if (!values.groupLink?.trim()) {
        message.error("请输入群组/频道链接");
        setActiveTab("basic");
        return;
      }

      // 验证奖品
      const validPrizes = prizes.filter((p) => p.name && p.value);
      if (validPrizes.length === 0) {
        message.error("请添加至少一个有效奖品");
        setActiveTab("prizes");
        return;
      }

      // 验证开奖方式
      if (drawMethod.length === 0) {
        message.error("请选择开奖方式");
        setActiveTab("draw");
        return;
      }

      setSubmitting(true);

      // 提交时验证群组并创建抽奖
      const data = {
        botId,
        groupLink: values.groupLink.trim(),
        title: values.title,
        keywords: values.keywords || ["抽奖"],
        messageCountStartTime: values.messageCountStartTime?.toISOString(),
        requiredMessageCount: values.requiredMessageCount || 10,
        drawMethod,
        fullParticipantsCount: values.fullParticipantsCount || 10,
        scheduledDrawTime: values.scheduledDrawTime?.toISOString(),
        prizes: validPrizes.map(({ name, type, value, quantity }) => ({
          name,
          type,
          value,
          quantity,
        })),
        notifyContent,
        joinSuccessContent,
        drawResultContent,
      };

      await axios.post("/lotteries/public", data);
      setSuccess(true);
      message.success("抽奖活动创建成功！");
    } catch (err: any) {
      if (err?.errorFields) {
        message.error("请填写必填项");
        return;
      }
      message.error(err?.response?.data?.message || "创建失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Result
          status="success"
          title="抽奖活动创建成功！"
          subTitle="用户可以在群里发送关键词参与抽奖了"
          extra={
            <Button
              type="primary"
              onClick={() => {
                // 尝试关闭窗口，如果失败则刷新页面
                window.close();
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              }}
            >
              关闭页面
            </Button>
          }
        />
      </div>
    );
  }

  if (!botId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Result
          status="error"
          title="参数错误"
          subTitle="请从机器人私聊中点击链接进入此页面"
        />
      </div>
    );
  }

  const tabItems = [
    {
      key: "basic",
      label: "基础信息",
      children: (
        <div className="py-4">
          <Form.Item
            name="groupLink"
            label="群组/频道链接"
            rules={[{ required: true, message: "请输入群组/频道链接" }]}
            tooltip="支持格式：@username、https://t.me/username、t.me/username"
          >
            <Input placeholder="如：@mygroup 或 https://t.me/mygroup" />
          </Form.Item>

          <Form.Item
            name="title"
            label="活动标题"
            rules={[{ required: true, message: "请输入活动标题" }]}
          >
            <Input placeholder="如：新年抽奖活动" />
          </Form.Item>

          <Form.Item
            name="keywords"
            label="触发关键词"
            tooltip="用户发送这些关键词即可参与抽奖"
          >
            <Select
              mode="tags"
              placeholder="输入后回车添加"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="messageCountStartTime"
            label="发言统计开始时间"
            rules={[{ required: true, message: "请选择开始时间" }]}
            tooltip="从这个时间开始统计用户发言数量"
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="requiredMessageCount"
            label="所需发言数"
            tooltip="用户需要发言达到这个数量才有资格中奖"
          >
            <InputNumber min={1} addonAfter="条" style={{ width: "100%" }} />
          </Form.Item>
        </div>
      ),
    },
    {
      key: "draw",
      label: "开奖方式",
      children: (
        <div className="py-4">
          <Form.Item label="开奖条件">
            <Checkbox.Group
              value={drawMethod}
              onChange={(v) => setDrawMethod(v as string[])}
            >
              <Space direction="vertical">
                <Checkbox value="fullParticipants">满人开奖</Checkbox>
                <Checkbox value="scheduledTime">定时开奖</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>

          {drawMethod.includes("fullParticipants") && (
            <Form.Item name="fullParticipantsCount" label="满人人数">
              <InputNumber min={1} addonAfter="人" style={{ width: "100%" }} />
            </Form.Item>
          )}

          {drawMethod.includes("scheduledTime") && (
            <Form.Item
              name="scheduledDrawTime"
              label="开奖时间"
              rules={[
                {
                  required: drawMethod.includes("scheduledTime"),
                  message: "请选择开奖时间",
                },
              ]}
            >
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
          )}
        </div>
      ),
    },
    {
      key: "notify",
      label: "通知内容",
      children: (
        <div className="py-4">
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <div>
              <div className="mb-2 font-medium">抽奖通知：</div>
              <div className="mb-2">
                <Space wrap size={[4, 4]}>
                  {LOTTERY_VARIABLES.map((v) => (
                    <Tag
                      key={v.key}
                      color="blue"
                      style={{ cursor: "pointer" }}
                      onClick={() => setNotifyContent(notifyContent + v.key)}
                    >
                      {v.label}
                    </Tag>
                  ))}
                </Space>
              </div>
              <TextArea
                rows={6}
                value={notifyContent}
                onChange={(e) => setNotifyContent(e.target.value)}
                placeholder="抽奖活动通知内容"
              />
            </div>
            <div>
              <div className="mb-2 font-medium">成功参与通知：</div>
              <div className="mb-2">
                <Space wrap size={[4, 4]}>
                  {LOTTERY_VARIABLES.map((v) => (
                    <Tag
                      key={v.key}
                      color="blue"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setJoinSuccessContent(joinSuccessContent + v.key)
                      }
                    >
                      {v.label}
                    </Tag>
                  ))}
                </Space>
              </div>
              <TextArea
                rows={4}
                value={joinSuccessContent}
                onChange={(e) => setJoinSuccessContent(e.target.value)}
                placeholder="用户成功参与后的通知内容"
              />
            </div>
            <div>
              <div className="mb-2 font-medium">开奖通知：</div>
              <div className="mb-2">
                <Space wrap size={[4, 4]}>
                  {DRAW_RESULT_VARIABLES.map((v) => (
                    <Tag
                      key={v.key}
                      color="blue"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setDrawResultContent(drawResultContent + v.key)
                      }
                    >
                      {v.label}
                    </Tag>
                  ))}
                </Space>
              </div>
              <TextArea
                rows={6}
                value={drawResultContent}
                onChange={(e) => setDrawResultContent(e.target.value)}
                placeholder="开奖结果通知内容"
              />
            </div>
          </Space>
        </div>
      ),
    },
    {
      key: "prizes",
      label: "奖品设置",
      children: (
        <div className="py-4">
          {prizes.map((prize, idx) => (
            <Card
              key={prize.key}
              size="small"
              className="mb-3"
              title={`奖品 ${idx + 1}`}
              extra={
                prizes.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removePrize(prize.key)}
                  />
                )
              }
            >
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="奖品名称"
                  value={prize.name}
                  onChange={(e) =>
                    updatePrize(prize.key, "name", e.target.value)
                  }
                />
                <div className="flex gap-2">
                  <Select
                    value={prize.type}
                    onChange={(v) => updatePrize(prize.key, "type", v)}
                    style={{ width: 100, flexShrink: 0 }}
                  >
                    <Select.Option value="points">积分</Select.Option>
                    <Select.Option value="custom">自定义</Select.Option>
                  </Select>
                  <InputNumber
                    placeholder="积分数量"
                    min={1}
                    value={
                      prize.type === "points"
                        ? (prize.value as number)
                        : undefined
                    }
                    onChange={(v) => updatePrize(prize.key, "value", v || 0)}
                    style={{
                      flex: 1,
                      display: prize.type === "points" ? "block" : "none",
                    }}
                  />
                  <Input
                    placeholder="奖品内容"
                    value={
                      prize.type === "custom" ? String(prize.value || "") : ""
                    }
                    onChange={(e) =>
                      updatePrize(prize.key, "value", e.target.value)
                    }
                    style={{
                      flex: 1,
                      display: prize.type === "custom" ? "block" : "none",
                    }}
                  />
                  <InputNumber
                    placeholder="份数"
                    min={1}
                    value={prize.quantity}
                    onChange={(v) => updatePrize(prize.key, "quantity", v || 1)}
                    addonAfter="份"
                    style={{ width: 100, flexShrink: 0 }}
                  />
                </div>
              </div>
            </Card>
          ))}
          <Button
            type="dashed"
            onClick={addPrize}
            block
            icon={<PlusOutlined />}
          >
            添加奖品
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center mb-4">
            <GiftOutlined style={{ fontSize: 40, color: "#1890ff" }} />
            <h1 className="text-xl font-bold mt-3">创建群抽奖</h1>
            <p className="text-gray-500 mt-1 text-sm">填写信息后点击创建按钮</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              keywords: ["抽奖"],
              requiredMessageCount: 10,
              fullParticipantsCount: 10,
              messageCountStartTime: dayjs(),
            }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              centered
            />

            <div className="mt-4">
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitting}
                block
                size="large"
              >
                创建抽奖活动
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LotteryCreate;
