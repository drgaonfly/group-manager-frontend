import React from "react";
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
  message,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import {
  Prize,
  GroupLink,
  RequiredChannel,
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
  requiredChannels: RequiredChannel[];
  setRequiredChannels: (channels: RequiredChannel[]) => void;
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
  botId: string | null;
}

const LotteryForm: React.FC<LotteryFormProps> = ({
  form,
  prizes,
  setPrizes,
  groupLinks,
  setGroupLinks,
  requiredChannels,
  setRequiredChannels,
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
  botId,
}) => {
  const [botGroups, setBotGroups] = React.useState<
    { _id: string; title: string; username?: string }[]
  >([]);
  const [loadingGroups, setLoadingGroups] = React.useState(false);

  // 加载机器人的群组列表
  React.useEffect(() => {
    if (botId) {
      setLoadingGroups(true);
      axios
        .get(`/groups/getByBotId?botId=${botId}`)
        .then((res) => {
          if (res.data.success) {
            setBotGroups(res.data.data || []);
          }
        })
        .catch((err) => {
          console.error("加载群组列表失败:", err);
        })
        .finally(() => {
          setLoadingGroups(false);
        });
    }
  }, [botId]);

  // 群组链接操作
  const addGroupLink = () =>
    setGroupLinks([...groupLinks, { key: genKey(), link: "", mode: "input" }]);
  const removeGroupLink = (key: string) => {
    if (groupLinks.length <= 1) return;
    setGroupLinks(groupLinks.filter((g) => g.key !== key));
  };
  const updateGroupLink = (key: string, link: string) => {
    setGroupLinks(groupLinks.map((g) => (g.key === key ? { ...g, link } : g)));
  };
  const updateGroupLinkMode = (key: string, mode: "input" | "select") => {
    setGroupLinks(
      groupLinks.map((g) => (g.key === key ? { ...g, mode, link: "" } : g)),
    );
  };
  const selectBotGroup = (key: string, groupId: string) => {
    const group = botGroups.find((g) => g._id === groupId);
    if (group) {
      const link = group.username ? `@${group.username}` : "";
      setGroupLinks(
        groupLinks.map((g) =>
          g.key === key ? { ...g, link, selectedGroup: group } : g,
        ),
      );
    }
  };

  // 必须加入的频道操作
  const addRequiredChannel = () =>
    setRequiredChannels([...requiredChannels, { key: genKey(), link: "" }]);
  const removeRequiredChannel = (key: string) => {
    setRequiredChannels(requiredChannels.filter((c) => c.key !== key));
  };
  const updateRequiredChannel = (key: string, link: string) => {
    setRequiredChannels(
      requiredChannels.map((c) => (c.key === key ? { ...c, link } : c)),
    );
  };

  // 验证必须加入的频道
  const verifyRequiredChannel = async (key: string, link: string) => {
    if (!link.trim() || !botId) return;

    // 设置验证中状态
    setRequiredChannels(
      requiredChannels.map((c) =>
        c.key === key
          ? { ...c, verifying: true, error: undefined, title: undefined }
          : c,
      ),
    );

    try {
      const response = await axios.post("/groups/verify-required-channel", {
        link: link.trim(),
        botId,
      });

      if (response.data.success) {
        const { title, id } = response.data.data;
        setRequiredChannels(
          requiredChannels.map((c) =>
            c.key === key
              ? { ...c, verifying: false, title, chatId: id, error: undefined }
              : c,
          ),
        );
        message.success(`验证成功: ${title}`);
      } else {
        setRequiredChannels(
          requiredChannels.map((c) =>
            c.key === key
              ? {
                  ...c,
                  verifying: false,
                  error: response.data.message || "验证失败",
                }
              : c,
          ),
        );
        message.error(response.data.message || "验证失败");
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || "验证失败，请检查链接格式";
      setRequiredChannels(
        requiredChannels.map((c) =>
          c.key === key ? { ...c, verifying: false, error: errorMsg } : c,
        ),
      );
      message.error(errorMsg);
    }
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
    { key: "condition", label: "参与条件" },
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
              <div key={g.key} className="mb-3">
                <div className="flex gap-2 mb-2">
                  <Select
                    value={g.mode || "input"}
                    onChange={(v) => updateGroupLinkMode(g.key, v)}
                    style={{ width: 100 }}
                    size="small"
                  >
                    <Select.Option value="input">手动输入</Select.Option>
                    <Select.Option value="select">选择群组</Select.Option>
                  </Select>
                  {(g.mode || "input") === "input" ? (
                    <Input
                      placeholder={`群组/频道 ${idx + 1}`}
                      value={g.link}
                      onChange={(e) => updateGroupLink(g.key, e.target.value)}
                      style={{ flex: 1 }}
                    />
                  ) : (
                    <Select
                      placeholder="选择群组"
                      value={g.selectedGroup?._id}
                      onChange={(v) => selectBotGroup(g.key, v)}
                      style={{ flex: 1 }}
                      loading={loadingGroups}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={botGroups.map((group) => ({
                        label: group.title,
                        value: group._id,
                      }))}
                    />
                  )}
                  {groupLinks.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeGroupLink(g.key)}
                    />
                  )}
                </div>
                {g.selectedGroup && (
                  <div className="text-sm text-blue-600 ml-1">
                    ✓ {g.selectedGroup.title}
                  </div>
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
        </div>
      )}

      {activeTab === "condition" && (
        <div className="py-2">
          <Form.Item name="requiredMessageCount" label="所需发言数">
            <InputNumber min={1} addonAfter="条" style={{ width: "100%" }} />
          </Form.Item>
          <div className="mb-4">
            <div className="mb-2 font-medium">必须加入的群/频道（可选）</div>
            <div className="text-gray-500 text-xs mb-2">
              用户需要加入这些群/频道才能参与抽奖
            </div>
            {requiredChannels.length > 0 ? (
              <>
                {requiredChannels.map((c, idx) => (
                  <div key={c.key} className="mb-3">
                    <div className="flex gap-2 mb-1">
                      <Input
                        placeholder={`群/频道链接 ${idx + 1}`}
                        value={c.link}
                        onChange={(e) =>
                          updateRequiredChannel(c.key, e.target.value)
                        }
                        onBlur={(e) =>
                          verifyRequiredChannel(c.key, e.target.value)
                        }
                        style={{ flex: 1 }}
                        status={c.error ? "error" : undefined}
                        suffix={
                          c.verifying ? (
                            <Spin size="small" />
                          ) : c.title ? (
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          ) : null
                        }
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeRequiredChannel(c.key)}
                      />
                    </div>
                    {c.title && (
                      <div className="text-sm text-green-600 ml-1">
                        ✓ {c.title}
                      </div>
                    )}
                    {c.error && (
                      <div className="text-sm text-red-500 ml-1">
                        ✗ {c.error}
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : null}
            <Button
              type="dashed"
              onClick={addRequiredChannel}
              block
              icon={<PlusOutlined />}
              size="small"
            >
              添加必须加入的群/频道
            </Button>
          </div>
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
                autoSize={{ minRows: 4, maxRows: 10 }}
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
                autoSize={{ minRows: 3, maxRows: 10 }}
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
                autoSize={{ minRows: 4, maxRows: 10 }}
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
