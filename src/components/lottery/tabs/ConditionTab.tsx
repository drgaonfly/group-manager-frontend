import React from "react";
import { Button, Input, Checkbox, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { RequiredChannel, genKey } from "../types";

interface ConditionTabProps {
  requiredChannels: RequiredChannel[];
  setRequiredChannels: (channels: RequiredChannel[]) => void;
  enableRequiredChannels: boolean;
  setEnableRequiredChannels: (enabled: boolean) => void;
  botId: string | null;
}

const ConditionTab: React.FC<ConditionTabProps> = ({
  requiredChannels,
  setRequiredChannels,
  enableRequiredChannels,
  setEnableRequiredChannels,
  botId,
}) => {
  // 使用 useRef 存储每个输入框的防抖定时器
  const verifyTimersRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 组件卸载时清理所有定时器
  React.useEffect(() => {
    return () => {
      verifyTimersRef.current.forEach((timer) => clearTimeout(timer));
      verifyTimersRef.current.clear();
    };
  }, []);

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

        // const updatedChannel = {
        //   ...requiredChannels.find((c) => c.key === key),
        // };

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

  return (
    <div className="py-2">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
        💡 提示：用户需要加入指定的群/频道才能参与抽奖
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
                            const existingTimer = verifyTimersRef.current.get(
                              channel.key,
                            );
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
                            <span className="text-green-500 text-xs">✓</span>
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
  );
};

export default ConditionTab;
