import React from "react";
import { Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";

interface MediaUploadProps {
  value?: string;
  mediaType?: "image" | "video";
  onChange?: (url: string, type: "image" | "video") => void;
  onRemove?: () => void;
  action?: string;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  value,
  mediaType,
  onChange,
  onRemove,
  action = "/api/upload/f",
}) => {
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);

  // 当外部value变化时，更新fileList
  React.useEffect(() => {
    if (value) {
      setFileList([
        {
          uid: "-1",
          name: "media",
          status: "done",
          url: value,
          thumbUrl: mediaType === "image" ? value : undefined,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [value, mediaType]);

  const handleChange: UploadProps["onChange"] = (info) => {
    console.log("MediaUpload onChange:", info);
    console.log("File status:", info.file.status);

    // 更新fileList以显示上传进度
    setFileList(info.fileList);

    if (info.file.status === "done") {
      console.log("Upload response:", info.file.response);
      const url = info.file.response?.data?.signedURL;
      console.log("Extracted URL:", url);

      if (!url) {
        message.error("上传失败：未获取到文件URL");
        console.error("Response structure:", info.file.response);
        setFileList([]);
        return;
      }

      // 从文件类型判断媒体类型
      const type = info.file.type?.startsWith("video/") ? "video" : "image";
      console.log("File type:", info.file.type, "-> Media type:", type);

      message.success(`上传成功 (${type})`);
      onChange?.(url, type);
    } else if (info.file.status === "error") {
      console.error("Upload error:", info.file.error, info.file.response);
      message.error("上传失败");
      setFileList([]);
    } else if (info.file.status === "removed") {
      setFileList([]);
      onRemove?.();
    }
  };

  const handleRemove = () => {
    setFileList([]);
    onRemove?.();
    return true;
  };

  return (
    <div>
      <Upload
        action={action}
        listType="picture-card"
        maxCount={1}
        accept="image/*,video/*"
        fileList={fileList}
        onChange={handleChange}
        onRemove={handleRemove}
      >
        {fileList.length === 0 && (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        )}
      </Upload>
      {value && mediaType && (
        <div className="text-xs text-gray-500 mt-2">
          当前媒体类型：{mediaType === "image" ? "图片" : "视频"}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
