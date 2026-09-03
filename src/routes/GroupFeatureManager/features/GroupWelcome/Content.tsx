import React, { useState, useEffect } from "react";
import { Button, message, Tag, Descriptions, Alert } from "antd";
import { EditOutlined, SmileOutlined } from "@ant-design/icons";
import { request } from "../../../../services/api";
import GroupWelcomeForm from "./Form";

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

/**
 * GroupWelcome is a single-config-per-group pattern (not a list),
 * so it keeps its own minimal state management instead of useFeatureList.
 */
const GroupWelcomeGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const fetchConfig = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await request("/group-welcomes", {
        method: "GET",
        params: { botId: bot._id, groupId: group._id, current: 1, pageSize: 1 },
      });
      setConfig(res?.data?.[0] ?? null);
    } catch {
      message.error("获取群欢迎配置失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchConfig();
  }, [open, bot?._id, group?._id]);

  return (
    <>
      <Alert
        message="群欢迎"
        description="新成员加入群组时，Bot 将自动发送欢迎消息。支持富文本、媒体文件和阅后即焚。"
        type="info"
        showIcon
        icon={<SmileOutlined />}
        closable
        style={{ marginBottom: 16 }}
      />
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button
          type="primary"
          icon={<EditOutlined />}
          loading={loading}
          onClick={() => setFormOpen(true)}
        >
          {config ? "修改配置" : "新建配置"}
        </Button>
      </div>

      {config ? (
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="欢迎消息">
            {config.contents?.length ? (
              <div dangerouslySetInnerHTML={{ __html: config.contents[0] }} />
            ) : (
              <span style={{ color: "#bbb" }}>默认消息</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="媒体">
            {config.medias?.length ? (
              <Tag color="blue">{config.medias.length} 个</Tag>
            ) : (
              "-"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="阅后即焚">
            {config.deleteAfterSeconds > 0 ? (
              `${config.deleteAfterSeconds}秒`
            ) : (
              <span style={{ color: "#bbb" }}>关闭</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="置顶新成员">
            <Tag color={config.pinNewMember ? "green" : "default"}>
              {config.pinNewMember ? "开启" : "关闭"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ textAlign: "center", color: "#999", padding: "32px 0" }}>
          该群组暂未配置群欢迎，点击「新建配置」开始设置
        </div>
      )}

      <GroupWelcomeForm
        open={formOpen}
        onCancel={(v) => {
          if (!v) setFormOpen(false);
        }}
        botId={bot?._id}
        currentRow={config ?? undefined}
        fixedGroupId={group?._id}
        onSuccess={() => {
          setFormOpen(false);
          fetchConfig();
        }}
      />
    </>
  );
};

export default GroupWelcomeGroupContent;
