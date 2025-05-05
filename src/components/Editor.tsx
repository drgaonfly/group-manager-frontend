import React from "react";
import Upload from "./Upload";

// Define the type for the Editor component
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSendImage: (imageUrl: string) => void;
}

// Editor Component (Controlled Component)
const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  placeholder,
  onSendImage,
}) => {
  return (
    <div className="editor-container rounded-lg overflow-hidden border border-gray-700 shadow-lg bg-[#1e293b] flex items-center relative">
      <div className="pl-3">
        <Upload onUploadSuccess={onSendImage} />
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
