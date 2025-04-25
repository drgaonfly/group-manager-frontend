import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Define the type for the Editor component
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

// Editor Component (Controlled Component)
const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder }) => {
  // Define modules and formats within the component
  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic", "underline"],
      ["link", "image"],
      [{ align: [] }],
      ["clean"], // Add clean button
    ],
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  return (
    <div className="editor-container rounded-lg overflow-hidden border border-gray-600 shadow-lg">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: "#1e293b",
          color: "white",
          borderRadius: "0.5rem",
        }}
      />
      <style>{`
        .editor-container .ql-toolbar {
          background-color: #2d3748;
          border-bottom: 1px solid #4a5568;
          border-top: none;
          border-left: none;
          border-right: none;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
        }
        
        .editor-container .ql-container {
          border: none;
          font-size: 1rem;
          min-height: 100px;
        }
        
        .editor-container .ql-editor {
          min-height: 100px;
          max-height: 200px;
          overflow-y: auto;
          color: #e2e8f0;
        }
        
        .editor-container .ql-editor.ql-blank::before {
          color: #a0aec0;
          font-style: italic;
        }
        
        .editor-container .ql-snow .ql-stroke {
          stroke: #a0aec0;
        }
        
        .editor-container .ql-snow .ql-fill {
          fill: #a0aec0;
        }
        
        .editor-container .ql-snow .ql-picker {
          color: #a0aec0;
        }
        
        .editor-container .ql-snow .ql-picker-options {
          background-color: #2d3748;
          border-color: #4a5568;
        }
        
        .editor-container .ql-snow .ql-tooltip {
          background-color: #2d3748;
          border-color: #4a5568;
          color: #e2e8f0;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
        }
        
        .editor-container .ql-snow .ql-tooltip input[type=text] {
          background-color: #1a202c;
          border-color: #4a5568;
          color: #e2e8f0;
        }
        
        .editor-container .ql-snow.ql-toolbar button:hover,
        .editor-container .ql-snow .ql-toolbar button:hover,
        .editor-container .ql-snow.ql-toolbar button.ql-active,
        .editor-container .ql-snow .ql-toolbar button.ql-active {
          background-color: #4a5568;
        }
      `}</style>
    </div>
  );
};

export default Editor;
