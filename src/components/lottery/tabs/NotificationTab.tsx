import React from "react";
import { Input, InputNumber, Button, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import ReactQuillEditor, { convertTextToHtml } from "../../ReactQuillEditor";
import {
  NotifyButton,
  genKey,
  LOTTERY_VARIABLES,
  DRAW_RESULT_VARIABLES,
  MediaUpload,
} from "../types";

interface NotificationTabProps {
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
}

const NotificationTab: React.FC<NotificationTabProps> = ({
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
}) => {
  // 转换内容为HTML格式
  const htmlNotifyContent = React.useMemo(
    () => convertTextToHtml(notifyContent),
    [notifyContent],
  );
  const htmlJoinSuccessContent = React.useMemo(
    () => convertTextToHtml(joinSuccessContent),
    [joinSuccessContent],
  );
  const htmlDrawResultContent = React.useMemo(
    () => convertTextToHtml(drawResultContent),
    [drawResultContent],
  );

  // 处理内容变化时的转换
  const handleNotifyContentChange = (value: string) => {
    setNotifyContent(value);
  };

  const handleJoinSuccessContentChange = (value: string) => {
    setJoinSuccessContent(value);
  };

  const handleDrawResultContentChange = (value: string) => {
    setDrawResultContent(value);
  };
  return (
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

        <NotificationSection
          title="抽奖通知"
          content={htmlNotifyContent}
          setContent={handleNotifyContentChange}
          buttons={notifyButtons}
          setButtons={setNotifyButtons}
          variables={LOTTERY_VARIABLES}
        />

        <NotificationSection
          title="成功参与通知"
          content={htmlJoinSuccessContent}
          setContent={handleJoinSuccessContentChange}
          buttons={joinSuccessButtons}
          setButtons={setJoinSuccessButtons}
          variables={LOTTERY_VARIABLES}
        />

        <NotificationSection
          title="开奖通知"
          content={htmlDrawResultContent}
          setContent={handleDrawResultContentChange}
          buttons={drawResultButtons}
          setButtons={setDrawResultButtons}
          variables={DRAW_RESULT_VARIABLES}
        />
      </Space>
    </div>
  );
};

// 通用的通知配置组件
interface NotificationSectionProps {
  title: string;
  content: string;
  setContent: (content: string) => void;
  buttons: NotifyButton[];
  setButtons: (buttons: NotifyButton[]) => void;
  variables: { key: string; label: string }[];
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
  title,
  content,
  setContent,
  buttons,
  setButtons,
  variables,
}) => {
  const addButton = () =>
    setButtons([...buttons, { key: genKey(), name: "", url: "", row: 1 }]);

  const removeButton = (key: string) =>
    setButtons(buttons.filter((b) => b.key !== key));

  const updateButton = (key: string, field: string, value: any) => {
    setButtons(
      buttons.map((b) => (b.key === key ? { ...b, [field]: value } : b)),
    );
  };

  return (
    <div>
      <div className="mb-2 font-medium">{title}：</div>
      <ReactQuillEditor
        value={content}
        onChange={setContent}
        variables={variables}
        placeholder={`${title}内容`}
        minHeight={title === "开奖通知" ? 140 : 120}
      />

      {/* 按钮配置 */}
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-600">按钮配置：</span>
          <Button size="small" icon={<PlusOutlined />} onClick={addButton}>
            添加按钮
          </Button>
        </div>
        {buttons.map((btn) => (
          <div key={btn.key} className="flex gap-2 mb-2 items-center">
            <Input
              placeholder="按钮名称"
              value={btn.name}
              onChange={(e) => updateButton(btn.key, "name", e.target.value)}
              style={{ width: "100px" }}
              size="small"
            />
            <Input
              placeholder="链接"
              value={btn.url}
              onChange={(e) => updateButton(btn.key, "url", e.target.value)}
              style={{ flex: 1 } as React.CSSProperties}
              size="small"
            />
            <InputNumber
              placeholder="行"
              value={btn.row}
              onChange={(value) => updateButton(btn.key, "row", value || 1)}
              min={1}
              max={10}
              style={{ width: "60px" }}
              size="small"
            />
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeButton(btn.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationTab;
