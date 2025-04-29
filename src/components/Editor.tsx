import React, { useRef } from "react";
import { PictureOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// Define the type for the Editor component
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

// Editor Component (Controlled Component)
const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 将 useMutation 移到组件顶层
  const { mutate: sendImageMessage } = useMutation({
    mutationFn: async (imageUrl: string) => {
      await axios.post("/chats/messages", {
        image: imageUrl,
      });
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
    },
  });

  // 处理图片上传成功
  const handleFileUpload = (url: string) => {
    console.log("上传的图片路径:", url);

    // 将图片URL插入到文本中
    const newValue = url;
    // onChange(newValue);

    // 发送消息到服务器 - 使用组件顶层定义的 mutation
    sendImageMessage(newValue);
  };

  // 处理点击图片图标
  const handlePictureClick = () => {
    // 直接触发文件选择器
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    console.log("点击图片图标");
  };

  // 使用 useMutation 创建上传文件的 mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return axios.post("/upload/frontend", formData, {});
    },
    onSuccess: (response) => {
      if (response.data.success) {
        const httpUrl = response.data.data.file;
        handleFileUpload(httpUrl);
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

    // 改进的文件处理逻辑
    if (Array.isArray(file)) {
      file.forEach((f: File) => {
        formData.append("file", f);
      });
    } else {
      formData.append("file", file);
    }

    console.log("上传文件++++++++++++", file);

    // 使用 mutation 上传文件
    uploadMutation.mutate(formData);

    // 清空文件输入框，以便可以再次选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="editor-container rounded-lg overflow-hidden border border-gray-700 shadow-lg bg-[#1e293b] flex items-center relative">
      <div className="pl-3 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
        <PictureOutlined
          onClick={handlePictureClick}
          style={{ fontSize: "18px" }}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".png,.jpeg,.jpg,.gif"
          style={{ display: "none" }}
        />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-0 bg-transparent text-white outline-none resize-none"
        style={{
          height: "40px",
          lineHeight: "40px",
        }}
      />

      <style>{`
        .editor-container textarea {
          border: none;
          font-size: 1rem;
          color: #e2e8f0;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        
        .editor-container textarea::placeholder {
          color: #a0aec0;
          font-style: italic;
          font-size: 0.875rem;
          line-height: 40px;
        }
      `}</style>
    </div>
  );
};

export default Editor;
