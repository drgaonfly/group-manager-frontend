import {
  useMemo,
  useImperativeHandle,
  forwardRef,
  useId,
  useEffect,
  useRef,
  useState,
} from "react";
import { Space, Tag, Button, Modal, Input, Popover } from "antd";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  LinkOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  SmileOutlined,
} from "@ant-design/icons";

// 所有可用变量
const ALL_VARIABLES = [
  { key: "{member}", label: "带链接成员名", desc: "带链接的群成员名字" },
  { key: "{userId}", label: "用户ID", desc: "用户的 Telegram ID" },
  { key: "{nickname}", label: "用户昵称", desc: "用户的昵称/名字" },
  { key: "{userName}", label: "用户名", desc: "用户的 @username" },
  { key: "{userBalance}", label: "用户积分", desc: "用户的积分余额" },
  {
    key: "{userBalanceRanking}",
    label: "用户积分排名",
    desc: "显示当前用户在本群的积分排名数字",
  },
  {
    key: "{userBalanceRankingList}",
    label: "用户积分榜单",
    desc: "显示本群积分排名前10的用户列表",
  },
  { key: "{currentRank}", label: "当前称号", desc: "用户当前积分对应的称号" },
  { key: "{groupTitle}", label: "群名称", desc: "当前群组的名称" },
  { key: "{currentTime}", label: "当前时间", desc: "消息发送时的时间" },
  { key: "{currentBot}", label: "当前机器人", desc: "当前机器人的昵称" },
];

// 变量类型
export type VariableType =
  | "member"
  | "userId"
  | "nickname"
  | "userName"
  | "userBalance"
  | "userBalanceRanking"
  | "userBalanceRankingList"
  | "currentRank"
  | "groupTitle"
  | "currentTime"
  | "currentBot";

// 预设变量组合
export const VARIABLE_PRESETS = {
  all: [
    "member",
    "userId",
    "nickname",
    "userName",
    "userBalance",
    "userBalanceRanking",
    "userBalanceRankingList",
    "currentRank",
    "groupTitle",
    "currentTime",
    "currentBot",
  ] as VariableType[],
  groupOnly: ["groupTitle", "currentTime", "currentBot"] as VariableType[],
  withUser: [
    "member",
    "userId",
    "nickname",
    "userName",
    "userBalance",
    "userBalanceRanking",
    "userBalanceRankingList",
    "currentRank",
    "groupTitle",
    "currentTime",
    "currentBot",
  ] as VariableType[],
  lottery: [
    "lotteryTitle",
    "goodsList",
    "joinCondition",
    "openCondition",
    "joinNum",
    "nickname",
    "userId",
    "userName",
    "member",
  ] as VariableType[],
};

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number;
  variables?:
    | VariableType[]
    | keyof typeof VARIABLE_PRESETS
    | { key: string; label: string }[];
  showVariables?: boolean;
  title?: string;
}

export interface RichTextEditorRef {
  getEditor: () => any;
  insertText: (text: string) => void;
  getTelegramHtml: () => string;
}

export const convertToTelegramHtml = (html: string): string => {
  if (!html) return "";
  let text = html
    .replace(/<strong>/g, "<b>")
    .replace(/<\/strong>/g, "</b>")
    .replace(/<em>/g, "<i>")
    .replace(/<\/em>/g, "</i>")
    .replace(/<s>/g, "<s>")
    .replace(/<\/s>/g, "</s>")
    .replace(/<pre>/g, "<pre>")
    .replace(/<\/pre>/g, "</pre>")
    // 提取 href，忽略 target/rel 等多余属性，输出 Telegram 认识的 <a href="...">
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>/gi, '<a href="$1">')
    .replace(/<\/a>/g, "</a>")
    .replace(/<blockquote>/g, "")
    .replace(/<\/blockquote>/g, "\n")
    .replace(/<ol>/g, "")
    .replace(/<\/ol>/g, "")
    .replace(/<ul>/g, "")
    .replace(/<\/ul>/g, "")
    .replace(/<li>/g, "• ")
    .replace(/<\/li>/g, "\n")
    .replace(/<p><\/p>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<p>/g, "")
    .replace(/<\/p>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/^\s+/, "");
  text = text.replace(/^\n+/, "").replace(/\n+$/, "");
  return text;
};

export const fromTelegramHtml = (html: string): string => {
  if (!html) return "";
  const text = html
    .replace(/<b>/g, "<strong>")
    .replace(/<\/b>/g, "</strong>")
    .replace(/<i>/g, "<em>")
    .replace(/<\/i>/g, "</em>")
    .replace(/<u>/g, "<u>")
    .replace(/<\/u>/g, "</u>")
    .replace(/<s>/g, "<s>")
    .replace(/<\/s>/g, "</s>")
    .replace(/<pre>/g, "<pre>")
    .replace(/<\/pre>/g, "</pre>")
    .replace(/\n/g, "</p><p>")
    .replace(/^(?!<p>)/, "<p>")
    .replace(/(?<!<\/p>)$/, "</p>");
  return text;
};

export const toQuillHtml = (text: string): string => {
  if (!text) return "<p></p>";
  if (text.startsWith("<")) {
    return fromTelegramHtml(text);
  }
  const lines = text.split("\n");
  return lines.map((line) => `<p>${line || ""}</p>`).join("");
};

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      value = "",
      onChange,
      height = 200,
      variables = "all",
      showVariables = true,
      title,
    },
    ref,
  ) => {
    const editorId = useId().replace(/:/g, "");
    const isInternalChangeRef = useRef(false);

    // 链接编辑 Modal 状态
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    // Emoji picker 显示状态
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

    const editor = useEditor({
      extensions: [
        StarterKit,
        Link.configure({ openOnClick: false }).extend({ inclusive: false }),
        TextStyle,
      ],
      content: toQuillHtml(value),
      onUpdate: ({ editor }) => {
        isInternalChangeRef.current = true;
        const html = editor.getHTML();
        const text = convertToTelegramHtml(html);
        onChange?.(text);
        setTimeout(() => {
          isInternalChangeRef.current = false;
        }, 0);
      },
      editorProps: {
        attributes: {
          style: `min-height: ${height}px; padding: 12px;`,
        },
      },
    });

    useEffect(() => {
      if (editor && !isInternalChangeRef.current) {
        editor.commands.setContent(toQuillHtml(value));
      }
    }, [value, editor]);

    // 打开链接 Modal，回显当前光标处已有的链接
    const openLinkModal = () => {
      const existing = editor?.getAttributes("link").href ?? "";
      setLinkUrl(existing);
      setLinkModalOpen(true);
    };

    const confirmLink = () => {
      if (!editor) return;
      if (linkUrl.trim()) {
        editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
      } else {
        editor.chain().focus().unsetLink().run();
      }
      setLinkModalOpen(false);
    };

    const removeLink = () => {
      editor?.chain().focus().unsetLink().run();
      setLinkModalOpen(false);
    };

    // 插入 emoji
    const onEmojiClick = (emojiData: EmojiClickData) => {
      if (editor) {
        editor.chain().focus().insertContent(emojiData.emoji).run();
      }
      setEmojiPickerOpen(false);
    };

    const displayVariables = useMemo(() => {
      if (typeof variables === "string") {
        const varKeys = VARIABLE_PRESETS[variables];
        return ALL_VARIABLES.filter((v) => {
          const key = v.key.replace(/[{}]/g, "") as VariableType;
          return varKeys.includes(key);
        });
      } else if (
        Array.isArray(variables) &&
        variables.length > 0 &&
        typeof variables[0] === "object" &&
        "label" in variables[0]
      ) {
        return (variables as { key: string; label: string }[]).map((v) => ({
          key: v.key,
          label: v.label,
          desc: v.label,
        }));
      } else if (Array.isArray(variables)) {
        const varKeys = variables as VariableType[];
        return ALL_VARIABLES.filter((v) => {
          const key = v.key.replace(/[{}]/g, "") as VariableType;
          return varKeys.includes(key);
        });
      }
      return ALL_VARIABLES;
    }, [variables]);

    const insertVariable = (variable: string) => {
      if (editor) {
        editor.chain().focus().insertContent(variable).run();
      }
    };

    useImperativeHandle(ref, () => ({
      getEditor: () => editor,
      insertText: (text: string) => insertVariable(text),
      getTelegramHtml: () => convertToTelegramHtml(value),
    }));

    return (
      <div>
        {title && (
          <div style={{ marginBottom: 12, fontWeight: 500 }}>{title}</div>
        )}
        {showVariables && displayVariables.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <span style={{ marginRight: 8, color: "#666", fontSize: 12 }}>
              插入变量：
            </span>
            <Space wrap size={[4, 4]}>
              {displayVariables.map((v) => (
                <Tag
                  key={v.key}
                  color="blue"
                  style={{ cursor: "pointer" }}
                  onClick={() => insertVariable(v.key)}
                  title={v.desc}
                >
                  {v.label}
                </Tag>
              ))}
            </Space>
          </div>
        )}
        <div
          id={editorId}
          style={{ background: "#fff", borderRadius: 4, marginBottom: 16 }}
        >
          <div
            style={{
              marginBottom: 8,
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: 8,
            }}
          >
            <Space size={4}>
              <Button
                size="small"
                icon={<BoldOutlined />}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                type={editor?.isActive("bold") ? "primary" : "default"}
              />
              <Button
                size="small"
                icon={<ItalicOutlined />}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                type={editor?.isActive("italic") ? "primary" : "default"}
              />
              <Button
                size="small"
                icon={<UnderlineOutlined />}
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                type={editor?.isActive("strike") ? "primary" : "default"}
              />
              {/* 链接按钮：点击打开自定义 Modal */}
              <Button
                size="small"
                icon={<LinkOutlined />}
                onClick={openLinkModal}
                type={editor?.isActive("link") ? "primary" : "default"}
              />
              <Button
                size="small"
                icon={<UnorderedListOutlined />}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                type={editor?.isActive("bulletList") ? "primary" : "default"}
              />
              <Button
                size="small"
                icon={<OrderedListOutlined />}
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
                type={editor?.isActive("orderedList") ? "primary" : "default"}
              />
              {/* Emoji 按钮 */}
              <Popover
                open={emojiPickerOpen}
                onOpenChange={setEmojiPickerOpen}
                trigger="click"
                placement="bottomLeft"
                overlayInnerStyle={{ padding: 0 }}
                content={
                  <EmojiPicker
                    theme={Theme.LIGHT}
                    onEmojiClick={onEmojiClick}
                    width={320}
                    height={400}
                  />
                }
              >
                <Button size="small" icon={<SmileOutlined />} />
              </Popover>
            </Space>
          </div>
          <EditorContent editor={editor} />
          <style>{`
            #${editorId} .ProseMirror {
              min-height: ${height}px;
              border: 1px solid #d9d9d9;
              border-radius: 4px;
              padding: 12px;
            }
            #${editorId} .ProseMirror:focus {
              border-color: #40a9ff;
              outline: none;
            }
            #${editorId} .ProseMirror p.is-editor-empty:first-child::before {
              content: attr(data-placeholder);
              float: left;
              color: #999;
              pointer-events: none;
              height: 0;
            }
            #${editorId} .ProseMirror a {
              color: #1677ff;
              text-decoration: underline;
              cursor: pointer;
            }
          `}</style>
        </div>

        {/* 链接编辑 Modal */}
        <Modal
          title="插入 / 编辑链接"
          open={linkModalOpen}
          onOk={confirmLink}
          onCancel={() => setLinkModalOpen(false)}
          okText="确定"
          cancelText="取消"
          footer={[
            <Button key="remove" danger onClick={removeLink}>
              移除链接
            </Button>,
            <Button key="cancel" onClick={() => setLinkModalOpen(false)}>
              取消
            </Button>,
            <Button key="ok" type="primary" onClick={confirmLink}>
              确定
            </Button>,
          ]}
          width={480}
        >
          <Input
            placeholder="请输入链接地址，例如 https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onPressEnter={confirmLink}
            autoFocus
            style={{ marginTop: 8 }}
          />
        </Modal>
      </div>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
