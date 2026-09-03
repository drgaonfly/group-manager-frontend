import React from "react";
import { Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { UploadProps } from "antd/lib/upload/interface";
import { UploadFile } from "antd/lib/upload/interface";
import { request } from "../services/api";
import { useIntl } from "../hooks/useIntl";

interface MyUploadProps {
  onFileUpload: (url: string) => void;
  accept?: string;
  url?: string;
  onRemove?: (file: UploadFile) => boolean;
  multiple?: boolean;
  maxCount?: number;
  fileList?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
}

const MyUpload: React.FC<MyUploadProps> = ({
  onFileUpload,
  accept,
  url = "/upload",
  onRemove,
  multiple,
  maxCount,
  fileList,
  onChange,
}) => {
  const intl = useIntl();
  const defaultAccept = "*";

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append("file", file as Blob);

    try {
      const response = await request<{ success: boolean; data: any }>(url, {
        method: "POST",
        data: formData,
        requestType: "form",
      });

      if (response.success) {
        if (onSuccess) {
          onSuccess(response);
        }
        onFileUpload(response.data.file);
      } else {
        message.error(
          intl.formatMessage({
            id: "upload_failed",
            defaultMessage: "Upload failed",
          }),
        );
        if (onError) {
          onError(new Error("Upload failed"));
        }
      }
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: "upload_exception",
          defaultMessage: "Upload exception",
        }),
      );
      if (onError) {
        onError(new Error("Upload exception"));
      }
    }
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    // 删除操作由 onRemove 直接处理，这里跳过避免把旧列表写回去
    if (info.file.status === "removed") return;

    if (info.file.status === "done") {
      message.success(`${info.file.name}`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name}`);
    }

    if (onChange) {
      onChange(info.fileList);
    }
  };

  const handleRemove = (file: UploadFile) => {
    if (onChange && fileList) {
      onChange(fileList.filter((f) => f.uid !== file.uid));
    }
    return onRemove ? onRemove(file) : true;
  };

  return (
    <Upload.Dragger
      name="file"
      multiple={multiple ?? false}
      customRequest={customRequest}
      showUploadList={{ showRemoveIcon: true }}
      listType="picture"
      accept={accept || defaultAccept}
      maxCount={maxCount}
      fileList={fileList}
      style={{ width: 328 }}
      onRemove={handleRemove}
      onChange={handleChange}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        {intl.formatMessage({
          id: "upload_text",
          defaultMessage: "Click or drag file to this area to upload",
        })}
      </p>
    </Upload.Dragger>
  );
};

export default MyUpload;
