import React from "react";
import { Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { UploadProps } from "antd/lib/upload/interface";
import { UploadFile } from "antd/lib/upload/interface";
import { UploadRequestOption } from "rc-upload/lib/interface";

interface MyUploadProps {
  onFileUpload: (url: string) => void;
  accept?: string;
  defaultFileList?: UploadFile[];
  multiple?: boolean;
}

interface UploadResponse {
  success: boolean;
  data: {
    file: string;
  };
}

const MyUpload: React.FC<MyUploadProps> = ({
  onFileUpload,
  accept,
  defaultFileList,
  multiple,
}) => {
  // 定义默认的accept值
  const defaultAccept = ".png,.jpeg,.jpg,.gif";

  const customRequest = async (options: UploadRequestOption) => {
    const { onSuccess, onError, file } = options;
    const formData = new FormData();

    if (Array.isArray(file)) {
      file.forEach((f) => {
        formData.append("file", f);
      });
    } else {
      formData.append("file", file);
    }

    try {
      // 使用fetch替代@umijs/max的request
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      const responseData: UploadResponse = await response.json();

      if (responseData.success) {
        message.success("上传成功");
        if (onSuccess) {
          onSuccess(responseData);
        }
        const httpUrl = responseData.data.file;
        onFileUpload(httpUrl);
      } else {
        message.error("上传失败");
        if (onError) {
          onError(new Error("上传失败"));
        }
      }
    } catch {
      message.error("上传异常");
      if (onError) {
        onError(new Error("上传异常"));
      }
    }
  };

  const props: UploadProps = {
    name: "file",
    multiple: multiple,
    customRequest,
    showUploadList: true,
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  // 创建一个简单的文本对象用于显示上传提示
  const uploadText = {
    text: "点击或拖拽文件到此区域上传",
    hint: "支持单个或批量上传",
  };

  return (
    <Upload.Dragger
      {...props}
      listType="picture"
      showUploadList={{ showRemoveIcon: true }}
      multiple={multiple}
      accept={accept || defaultAccept}
      maxCount={multiple ? undefined : 1}
      defaultFileList={defaultFileList}
      style={{ width: 328 }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">{uploadText.text}</p>
      <p className="ant-upload-hint">{uploadText.hint}</p>
    </Upload.Dragger>
  );
};

export default MyUpload;
