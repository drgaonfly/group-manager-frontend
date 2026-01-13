import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Checkbox,
  Select,
  Button,
  Space,
  Tag,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Prize,
  GroupLink,
  genKey,
  LOTTERY_VARIABLES,
  DRAW_RESULT_VARIABLES,
} from "./types";

const { TextArea } = Input;

interface LotteryFormProps {
  form: any;
  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
  groupLinks: GroupLink[];
  setGroupLinks: (links: GroupLink[]) => void;
  drawMethod: string[];
  setDrawMethod: (methods: string[]) => void;
  notifyContent: string;
  setNotifyContent: (content: string) => void;
  joinSuccessContent: string;
  setJoinSuccessContent: (content: string) => void;
  drawResultContent: string;
  setDrawResultContent: (content: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const LotteryForm: React.FC<LotteryFormProps> = ({
  form,
  prizes,
  setPrizes,
  groupLinks,
  setGroupLinks,
  drawMethod,
  setDrawMethod,
  notifyContent,
  setNotifyContent,
  joinSuccessContent,
  setJoinSuccessContent,
  drawResultContent,
  setDrawResultContent,
  activeTab,
  setActiveTab,
  onSubmit,
  submitting,
}) => {
  // 群组链接操作
  const addGroupLink = () =>
    setGroupLinks([...groupLinks, { key: genKey(), link: "" }]);
  const removeGroupLink = (key: string) => {
    if (groupLinks.length <= 1) return;
    setGroupLinks(groupLinks.filter((g) => g.key !== key));
  };
  const updateGroupLink = (key: string, link: string) => {
    setGroupLinks(groupLinks.map((g) => (g.key === key ? { ...g, link } : g)));
  };

  // 奖品操作
  const addPrize = () =>
    setPrizes([
      ...prizes,
      { key: genKey(), name: "", type: "custom", value: "", quantity: 1 },
    ]);
  const removePrize = (key: string) => {
    if (prizes.length <= 1) return;
    setPrizes(prizes.filter((p) => p.key !== key));
  };
  const updatePrize = (key: string, field: string, value: any) => {
    setPrizes(
      prizes.map((p) => (p.key === key ? { ...p, [field]: value } : p)),
    );
  };

  const tabs = [
    { key: "basic", label: "基础信息" },
    { key: "draw", label: "开奖方式" },
    { key: "notify", label: "通知内容" },
    { key: "prizes", label: "奖品设置" },
  ];

  return (
    <Form form={form} layout="vertical">
      <div className="flex justify-center gap-2 mb-4">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            type={activeTab === tab.key ? "primary" : "default"}
            size="small"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "basic" && (
        <div className="py-2">
          <div className="mb-4">
            <div className="mb-2 font-medium">群组/频道链接</div>
            <div className="text-gray-500 text-xs mb-2">
              支持：@username、https://t.me/username
            </div>
            {groupLinks.map((g, idx) => (
              <div key={g.key} className="flex gap-2 mb-2">
                <Input
                  placeholder={`群组/频道 ${idx + 1}`}
                  value={g.link}
                  onChange={(e) => updateGroupLink(g.key, e.target.value)}
                  style={{ flex: 1 }}
                />
                {groupLinks.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeGroupLink(g.key)}
                  />
                )}
              </div>
            ))}
            <Button
              type="dashed"
              onClick={addGroupLink}
              block
              icon={<PlusOutlined />}
              size="small"
            >
              添加群组/频道
            </Button>
          </div>
          <Form.Item
            name="title"
            label="活动标题"
            rules={[{ required: true, message: "请输入活动标题" }]}
          >
            <Input placeholder="如：新年抽奖活动" />
          </Form.Item>
          <Form.Item name="keywords" label="触发关键词">
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
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="requiredMessageCount" label="所需发言数">
            <InputNumber min={1} addonAfter="条" style={{ width: "100%" }} />
          </Form.Item>
        </div>
      )}

      {activeTab === "draw" && (
        <div className="py-2">
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
              rules={[{ required: true, message: "请选择开奖时间" }]}
            >
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
          )}
        </div>
      )}

      {activeTab === "notify" && (
        <div className="py-2">
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
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
                rows={4}
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
                rows={3}
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
                rows={4}
                value={drawResultContent}
                onChange={(e) => setDrawResultContent(e.target.value)}
                placeholder="开奖结果通知内容"
              />
            </div>
          </Space>
        </div>
      )}

      {activeTab === "prizes" && (
        <div className="py-2">
          {prizes.map((prize) => (
            <div key={prize.key} className="flex gap-2 mb-3 items-center">
              <Input
                placeholder="奖品名称"
                value={prize.name}
                onChange={(e) => updatePrize(prize.key, "name", e.target.value)}
                style={{ width: 80 }}
              />
              <Input
                placeholder="奖品内容"
                value={String(prize.value || "")}
                onChange={(e) =>
                  updatePrize(prize.key, "value", e.target.value)
                }
                style={{ flex: 1 }}
              />
              <span className="text-gray-500">x</span>
              <InputNumber
                min={1}
                value={prize.quantity}
                onChange={(v) => updatePrize(prize.key, "quantity", v || 1)}
                style={{ width: 60 }}
              />
              {prizes.length > 1 && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removePrize(prize.key)}
                />
              )}
            </div>
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
      )}

      <div className="mt-4">
        <Button
          type="primary"
          onClick={onSubmit}
          loading={submitting}
          block
          size="large"
        >
          创建抽奖活动
        </Button>
      </div>
    </Form>
  );
};

export default LotteryForm;
