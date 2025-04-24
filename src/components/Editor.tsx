import React, { useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import "emoji-mart/css/emoji-mart.css";
import "@nutrify/quill-emoji-mart-picker/emoji.quill.css";

import { NimblePicker } from "emoji-mart";
import data from "emoji-mart/data/apple.json";

import { Popover, Button } from "antd"; // 使用 antd 控制显示

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder }) => {
  const quillRef = useRef<ReactQuill>(null);
  const [emojiVisible, setEmojiVisible] = useState(false);

  const insertEmoji = (emoji: any) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true);
      editor.insertText(range.index, emoji.native);
      editor.setSelection(range.index + emoji.native.length);
      setEmojiVisible(false); // 选择完关闭
    }
  };

  const modules = {
    toolbar: {
      container: [["link", "image", "video"]],
    },
  };

  const formats = ["link", "image", "video"];

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <Popover
          content={
            <NimblePicker
              set="apple"
              data={data}
              onClick={(emoji: any) => insertEmoji(emoji)}
            />
          }
          trigger="click"
          open={emojiVisible}
          onOpenChange={setEmojiVisible}
        >
          <Button>😀</Button>
        </Popover>
      </div>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          color: "black",
          borderRadius: "10px",
        }}
      />
    </div>
  );
};

export default Editor;
