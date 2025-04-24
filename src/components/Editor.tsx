import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Define the type for the Editor component
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

// Define the Quill module type (you can extend this with more precise types if needed)
interface EditorModules {
  toolbar: (string | object)[];
}

// Editor Component (Controlled Component)
const Editor: React.FC<EditorProps> & {
  modules: EditorModules;
  formats: string[];
} = ({ value, onChange, placeholder }) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={Editor.modules} // Access static property
      formats={Editor.formats} // Access static property
      placeholder={placeholder}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        color: "black",
        borderRadius: "10px",
      }}
    />
  );
};

// Define the Quill modules
Editor.modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    ["link", "image"],
    [{ align: [] }],
    ["clean"], // Add clean button
  ],
};

// Define the Quill formats
Editor.formats = [
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

export default Editor;
