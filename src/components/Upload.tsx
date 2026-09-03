import React, { useRef } from "react";
import { PictureOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { message } from "antd";

// 定义上传组件的属性类�?
interface UploadProps {
  onUploadSuccess: (imageUrl: string) => void;
  icon?: React.ReactNode;
  className?: string;
}

// 上传组件
const Upload: React.FC<UploadProps> = ({
  onUploadSuccess,
  icon = <PictureOutlined style={{ fontSize: "18px" }} />,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理点击图标
  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 使用 useMutation 创建上传文件�?mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const hide = message.loading(
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>,
        0,
      );
      try {
        const response = await axios.post("/upload/frontend", formData, {});
        hide();
        return response.data;
      } catch (error) {
        hide();
        throw error;
      }
    },
    onSuccess: (response) => {
      if (response.success) {
        const httpUrl = response.data.file;
        onUploadSuccess(httpUrl);
      } else {
        console.error("上传失败");
      }
    },
    onError: (error) => {
      console.error("上传异常", error);
    },
  });

  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();

    // 文件处理逻辑
    if (Array.isArray(file)) {
      file.forEach((f: File) => {
        formData.append("file", f);
      });
    } else {
      formData.append("file", file);
    }

    // 使用 mutation 上传文件
    uploadMutation.mutate(formData);

    // 清空文件输入框，以便可以再次选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`cursor-pointer ${className}`}>
      <div
        className="text-gray-400 hover:text-gray-300 transition-colors"
        onClick={handleIconClick}
      >
        {icon}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".png,.jpeg,.jpg,.gif"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default Upload;
