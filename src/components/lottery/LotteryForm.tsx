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
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import {
  Prize,
  GroupLink,
  RequiredChannel,
  NotifyButton,
  genKey,
  LOTTERY_VARIABLES,
  DRAW_RESULT_VARIABLES,
  MediaUpload,
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
  fullParticipantsCount: number;
  setFullParticipantsCount: (count: number) => void;
  notifyContent: string;
  setNotifyContent: (content: string) => void;
  notifyButtons: NotifyButton[];
  setNotifyButtons: (buttons: NotifyButton[]) => void;
  joinSuccessContent: string;
  setJoinSuccessContent: (content: string) => void;
  joinSuccessButtons: NotifyButton[];
  setJoinSuccessButtons: (buttons: NotifyButton[]) => void;
  drawResultContent: string;
  setDrawResultContent: (content: string) => void;
  drawResultButtons: NotifyButton[];
  setDrawResultButtons: (buttons: NotifyButton[]) => void;
  media: string;
  setMedia: (media: string) => void;
  mediaType: "image" | "video" | undefined;
  setMediaType: (type: "image" | "video" | undefined) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  botId: string | null;
  enableRequiredChannels: boolean;
  setEnableRequiredChannels: (enabled: boolean) => void;
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
  fullParticipantsCount,
  setFullParticipantsCount,
  notifyContent,
  setNotifyContent,
  notifyButtons,
  setNotifyButtons,
  joinSuccessContent,
  setJoinSuccessContent,
  joinSuccessButtons,
  setJoinSuccessButtons,
  drawResultContent,
  setDrawResultContent,
  drawResultButtons,
  setDrawResultButtons,
  media,
  setMedia,
  mediaType,
  setMediaType,
  activeTab,
  setActiveTab,
  onSubmit,
  submitting,
  botId,
  enableRequiredChannels,
  setEnableRequiredChannels,
}) => {
  const [botGroups, setBotGroups] = React.useState<
    { _id: string; title: string; username?: string }[]
  >([]);
  const [loadingGroups, setLoadingGroups] = React.useState(false);

  // 使用 useRef 存储每个输入框的防抖定时器
  const verifyTimersRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 组件卸载时清理所有定时器
  React.useEffect(() => {
    return () => {
      verifyTimersRef.current.forEach((timer) => clearTimeout(timer));
      verifyTimersRef.current.clear();
    };
  }, []);

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
        const { title, id, type } = response.data.data;

        // 如果是频道类型，清除发言数要求并警告用户
        const updatedChannel = {
          ...requiredChannels.find((c) => c.key === key),
        };
        if (type === "channel") {
          updatedChannel.requiredMessageCount = undefined;
          message.warning(`频道不支持发言数统计，已自动清除发言数要求`);
        }

        setRequiredChannels(
          requiredChannels.map((c) =>
            c.key === key
              ? {
                  ...c,
                  verifying: false,
                  title,
                  chatId: id,
                  type,
                  error: undefined,
                  requiredMessageCount: updatedChannel.requiredMessageCount,
                }
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
        </div>
      )}

      {activeTab === "condition" && (
        <div className="py-2">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
            💡
            提示：必须选择"必须加入指定群/频道"，每个频道可以单独设置发言数要求
          </div>

          <div className="mb-4">
            <Checkbox
              checked={enableRequiredChannels}
              onChange={(e) => {
                const checked = e.target.checked;
                setEnableRequiredChannels(checked);
                if (!checked) {
                  setRequiredChannels([]);
                }
              }}
            >
              <span className="font-medium">必须加入指定群/频道</span>
            </Checkbox>
            {enableRequiredChannels && (
              <div className="mt-2 ml-6">
                <div className="text-gray-500 text-xs mb-2">
                  用户需要加入这些群/频道才能参与抽奖
                </div>
                {requiredChannels.length > 0 ? (
                  <>
                    {requiredChannels.map((channel, index) => (
                      <div
                        key={channel.key}
                        className="border border-gray-200 rounded p-3 mb-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            value={channel.link}
                            onChange={(e) => {
                              const newChannels = [...requiredChannels];
                              newChannels[index].link = e.target.value;
                              newChannels[index].verifying = false;
                              newChannels[index].error = undefined;
                              newChannels[index].title = undefined;
                              newChannels[index].chatId = undefined;
                              setRequiredChannels(newChannels);

                              // 自动验证（防抖）
                              const link = e.target.value.trim();
                              if (link) {
                                // 清除该输入框之前的定时器
                                const existingTimer =
                                  verifyTimersRef.current.get(channel.key);
                                if (existingTimer) {
                                  clearTimeout(existingTimer);
                                }

                                // 设置新的定时器，500ms后自动验证
                                const timer = setTimeout(() => {
                                  verifyRequiredChannel(channel.key, link);
                                  verifyTimersRef.current.delete(channel.key);
                                }, 500);

                                verifyTimersRef.current.set(channel.key, timer);
                              }
                            }}
                            placeholder="输入群/频道链接或用户名"
                            style={{ flex: 1 }}
                            suffix={
                              channel.verifying ? (
                                <span className="text-blue-500 text-xs">
                                  验证中...
                                </span>
                              ) : channel.chatId ? (
                                <span className="text-green-500 text-xs">
                                  ✓
                                </span>
                              ) : null
                            }
                          />
                          <Button
                            danger
                            size="small"
                            onClick={() => removeRequiredChannel(channel.key)}
                          >
                            删除
                          </Button>
                        </div>

                        {/* 发言数设置 - 只对群组显示 */}
                        {channel.chatId &&
                          channel.type !== "channel" &&
                          !channel.error && (
                            <div className="flex items-center gap-2 ml-0">
                              <span className="text-sm text-gray-600 whitespace-nowrap">
                                发言数要求：
                              </span>
                              <InputNumber
                                value={channel.requiredMessageCount}
                                onChange={(value) => {
                                  const newChannels = [...requiredChannels];
                                  newChannels[index].requiredMessageCount =
                                    value ?? undefined;
                                  setRequiredChannels(newChannels);
                                }}
                                min={0}
                                placeholder="留空不限制"
                                style={{ width: 120 }}
                                size="small"
                              />
                              <span className="text-xs text-gray-500">
                                条（可选，不填则不限制该群的发言数）
                              </span>
                            </div>
                          )}

                        {/* 频道提示 */}
                        {channel.type === "channel" && !channel.error && (
                          <div className="text-xs text-orange-600 ml-0">
                            📢 频道不支持发言数统计
                          </div>
                        )}

                        {channel.title && (
                          <div className="text-sm text-green-600 mt-1">
                            ✓ {channel.title}
                          </div>
                        )}
                        {channel.error && (
                          <div className="text-sm text-red-500 mt-1">
                            ✗ {channel.error}
                          </div>
                        )}
                      </div>
                    ))}
                    {requiredChannels.some((c) => c.error) && (
                      <div className="text-red-500 text-xs mb-2">
                        {requiredChannels.find((c) => c.error)?.error}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400 text-sm mb-2">
                    暂无群/频道，请先添加
                  </div>
                )}
                <Button
                  type="dashed"
                  onClick={addRequiredChannel}
                  icon={<PlusOutlined />}
                  size="small"
                >
                  添加群/频道
                </Button>
              </div>
            )}
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
            <Form.Item label="满人人数">
              <InputNumber
                value={fullParticipantsCount}
                onChange={(value) => setFullParticipantsCount(value || 10)}
                min={1}
                addonAfter="人"
                style={{ width: "100%" }}
              />
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
            {/* 媒体上传 */}
            <div>
              <div className="mb-2 font-medium">媒体文件（可选）：</div>
              <div className="text-xs text-gray-500 mb-2">
                上传图片或视频，将作为所有通知的媒体内容，文本将作为caption显示
              </div>
              <MediaUpload
                value={media}
                mediaType={mediaType}
                onChange={(url, type) => {
                  setMedia(url);
                  setMediaType(type);
                }}
                onRemove={() => {
                  setMedia("");
                  setMediaType(undefined);
                }}
              />
            </div>

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

              {/* 抽奖通知按钮配置 */}
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">按钮配置：</span>
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      setNotifyButtons([
                        ...notifyButtons,
                        { key: genKey(), name: "", url: "", row: 1 },
                      ])
                    }
                  >
                    添加按钮
                  </Button>
                </div>
                {notifyButtons.map((btn, index) => (
                  <div key={btn.key} className="flex gap-2 mb-2 items-center">
                    <Input
                      placeholder="按钮名称"
                      value={btn.name}
                      onChange={(e) => {
                        const newButtons = [...notifyButtons];
                        newButtons[index].name = e.target.value;
                        setNotifyButtons(newButtons);
                      }}
                      style={{ width: 100 }}
                      size="small"
                    />
                    <Input
                      placeholder="链接"
                      value={btn.url}
                      onChange={(e) => {
                        const newButtons = [...notifyButtons];
                        newButtons[index].url = e.target.value;
                        setNotifyButtons(newButtons);
                      }}
                      style={{ flex: 1 }}
                      size="small"
                    />
                    <InputNumber
                      placeholder="行"
                      value={btn.row}
                      onChange={(value) => {
                        const newButtons = [...notifyButtons];
                        newButtons[index].row = value || 1;
                        setNotifyButtons(newButtons);
                      }}
                      min={1}
                      max={10}
                      style={{ width: 60 }}
                      size="small"
                    />
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        setNotifyButtons(
                          notifyButtons.filter((b) => b.key !== btn.key),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
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

              {/* 成功参与通知按钮配置 */}
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">按钮配置：</span>
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      setJoinSuccessButtons([
                        ...joinSuccessButtons,
                        { key: genKey(), name: "", url: "", row: 1 },
                      ])
                    }
                  >
                    添加按钮
                  </Button>
                </div>
                {joinSuccessButtons.map((btn, index) => (
                  <div key={btn.key} className="flex gap-2 mb-2 items-center">
                    <Input
                      placeholder="按钮名称"
                      value={btn.name}
                      onChange={(e) => {
                        const newButtons = [...joinSuccessButtons];
                        newButtons[index].name = e.target.value;
                        setJoinSuccessButtons(newButtons);
                      }}
                      style={{ width: 100 }}
                      size="small"
                    />
                    <Input
                      placeholder="链接"
                      value={btn.url}
                      onChange={(e) => {
                        const newButtons = [...joinSuccessButtons];
                        newButtons[index].url = e.target.value;
                        setJoinSuccessButtons(newButtons);
                      }}
                      style={{ flex: 1 }}
                      size="small"
                    />
                    <InputNumber
                      placeholder="行"
                      value={btn.row}
                      onChange={(value) => {
                        const newButtons = [...joinSuccessButtons];
                        newButtons[index].row = value || 1;
                        setJoinSuccessButtons(newButtons);
                      }}
                      min={1}
                      max={10}
                      style={{ width: 60 }}
                      size="small"
                    />
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        setJoinSuccessButtons(
                          joinSuccessButtons.filter((b) => b.key !== btn.key),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
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

              {/* 开奖通知按钮配置 */}
              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">按钮配置：</span>
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      setDrawResultButtons([
                        ...drawResultButtons,
                        { key: genKey(), name: "", url: "", row: 1 },
                      ])
                    }
                  >
                    添加按钮
                  </Button>
                </div>
                {drawResultButtons.map((btn, index) => (
                  <div key={btn.key} className="flex gap-2 mb-2 items-center">
                    <Input
                      placeholder="按钮名称"
                      value={btn.name}
                      onChange={(e) => {
                        const newButtons = [...drawResultButtons];
                        newButtons[index].name = e.target.value;
                        setDrawResultButtons(newButtons);
                      }}
                      style={{ width: 100 }}
                      size="small"
                    />
                    <Input
                      placeholder="链接"
                      value={btn.url}
                      onChange={(e) => {
                        const newButtons = [...drawResultButtons];
                        newButtons[index].url = e.target.value;
                        setDrawResultButtons(newButtons);
                      }}
                      style={{ flex: 1 }}
                      size="small"
                    />
                    <InputNumber
                      placeholder="行"
                      value={btn.row}
                      onChange={(value) => {
                        const newButtons = [...drawResultButtons];
                        newButtons[index].row = value || 1;
                        setDrawResultButtons(newButtons);
                      }}
                      min={1}
                      max={10}
                      style={{ width: 60 }}
                      size="small"
                    />
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        setDrawResultButtons(
                          drawResultButtons.filter((b) => b.key !== btn.key),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
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
