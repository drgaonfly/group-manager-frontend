import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Tag, Space } from "antd";

// Quill 编辑器配�?
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "bullet",
  "link",
];

interface ReactQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variables?: { key: string; label: string }[];
  style?: React.CSSProperties;
  minHeight?: number;
}

export const ReactQuillEditor: React.FC<ReactQuillEditorProps> = ({
  value,
  onChange,
  placeholder = "请输入内容?",
  variables = [],
  style,
  minHeight = 120,
}) => {
  const quillRef = React.useRef<ReactQuill>(null);

  const insertVariable = (variableKey: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      if (range) {
        quill.insertText(range.index, variableKey);
        quill.setSelection(range.index + variableKey.length, 0);
      } else {
        // 如果没有选区，追加到末尾
        const length = quill.getLength();
        quill.insertText(length - 1, variableKey);
        quill.setSelection(length - 1 + variableKey.length, 0);
      }
    }
  };

  return (
    <div>
      {variables.length > 0 && (
        <div className="mb-2">
          <Space wrap size={[4, 4]}>
            {variables.map((v) => (
              <Tag
                key={v.key}
                color="blue"
                style={{ cursor: "pointer" }}
                onClick={() => insertVariable(v.key)}
              >
                {v.label}
              </Tag>
            ))}
          </Space>
        </div>
      )}
      <div className="rich-text-editor">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={quillModules}
          formats={quillFormats}
          placeholder={placeholder}
          style={{ minHeight, ...style } as React.CSSProperties}
        />
      </div>
    </div>
  );
};

// 将纯文本转换为HTML格式，用于ReactQuill初始�?
export const convertTextToHtml = (text: string): string => {
  if (!text) return "";

  // 如果已经是HTML格式，直接返�?
  if (text.includes("<p>") || text.includes("<br>") || text.includes("<div>")) {
    return text;
  }

  // 将每个换行符转换�?br>标签，保留所有行
  const htmlContent = text.split("\n").join("<br>");

  return `<p>${htmlContent}</p>`;
};

export default ReactQuillEditor;
