import {
  useMemo,
  useImperativeHandle,
  forwardRef,
  useId,
  useEffect,
  useRef,
} from "react";
import { Space, Tag, Button } from "antd";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  LinkOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
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
  // 所有变量
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
  // 仅群组和时间（用于轮播广告等没有用户上下文的场景）
  groupOnly: ["groupTitle", "currentTime", "currentBot"] as VariableType[],
  // 用户相关（用于关键词回复、群欢迎等有用户上下文的场景）
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
  // 抽奖相关（用于抽奖通知内容编辑）
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
  /** 显示哪些变量，可以传入预设名称、VariableType数组或自定义变量对象数组 */
  variables?:
    | VariableType[]
    | keyof typeof VARIABLE_PRESETS
    | { key: string; label: string }[];
  /** 是否显示变量插入区域 */
  showVariables?: boolean;
  /** 自定义标题 */
  title?: string;
}

export interface RichTextEditorRef {
  getEditor: () => any;
  insertText: (text: string) => void;
  getTelegramHtml: () => string;
}

// 将 TipTap HTML 转换为 Telegram 支持的 HTML
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
    // 链接：保留 Telegram 格式
    .replace(/<a href="([^"]*)"/g, '<a href="$1"')
    .replace(/<\/a>/g, "</a>")
    // blockquote：保留内容并在结束时换行
    .replace(/<blockquote>/g, "")
    .replace(/<\/blockquote>/g, "\n")
    // 有序/无序列表容器
    .replace(/<ol>/g, "")
    .replace(/<\/ol>/g, "")
    .replace(/<ul>/g, "")
    .replace(/<\/ul>/g, "")
    // 列表项
    .replace(/<li>/g, "• ")
    .replace(/<\/li>/g, "\n")
    // 空段落（TipTap 用来表示空行）
    .replace(/<p><\/p>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    // 普通段落：开标签去掉，关标签换行
    .replace(/<p>/g, "")
    .replace(/<\/p>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/^\s+/, "");

  // 移除开头和结尾的换行
  text = text.replace(/^\n+/, "").replace(/\n+$/, "");
  return text;
};

// 将 Telegram HTML 转换为 TipTap HTML
export const fromTelegramHtml = (html: string): string => {
  if (!html) return "";
  const text = html
    // Telegram HTML -> TipTap HTML
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
    // 链接保持不变
    // 换行符转换为段落
    .replace(/\n/g, "</p><p>")
    // 如果不是以段落标签开头，添加开始标签
    .replace(/^(?!<p>)/, "<p>")
    // 如果不是以段落标签结尾，添加结束标签
    .replace(/(?<!<\/p>)$/, "</p>");

  return text;
};

// 将换行符文本转换为 TipTap HTML
export const toQuillHtml = (text: string): string => {
  if (!text) return "<p></p>";
  // 如果输入已经是 HTML 格式，尝试从 Telegram HTML 转换
  if (text.startsWith("<")) {
    return fromTelegramHtml(text);
  }
  const lines = text.split("\n");
  // 保留所有行，包括空行（用于表示空段落）
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

    // TipTap 编辑器
    const editor = useEditor({
      extensions: [StarterKit, Link, TextStyle],
      content: toQuillHtml(value),
      onUpdate: ({ editor }) => {
        isInternalChangeRef.current = true;
        const html = editor.getHTML();
        const text = convertToTelegramHtml(html);
        onChange?.(text);
        // 延迟重置标志，避免 useEffect 立即响应
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

    // 当外部 value 改变时更新编辑器（仅在非内部编辑时）
    useEffect(() => {
      if (editor && !isInternalChangeRef.current) {
        editor.commands.setContent(toQuillHtml(value));
      }
    }, [value, editor]);

    // 解析要显示的变量
    const displayVariables = useMemo(() => {
      // 如果是字符串，使用预设
      if (typeof variables === "string") {
        const varKeys = VARIABLE_PRESETS[variables];
        return ALL_VARIABLES.filter((v) => {
          const key = v.key.replace(/[{}]/g, "") as VariableType;
          return varKeys.includes(key);
        });
      }
      // 如果是数组，检查是否是自定义变量对象
      else if (
        Array.isArray(variables) &&
        variables.length > 0 &&
        typeof variables[0] === "object" &&
        "label" in variables[0]
      ) {
        // 自定义变量对象，直接返回
        return (variables as { key: string; label: string }[]).map((v) => ({
          key: v.key,
          label: v.label,
          desc: v.label, // 使用 label 作为 desc
        }));
      }
      // 如果是 VariableType 数组，使用预设逻辑
      else if (Array.isArray(variables)) {
        const varKeys = variables as VariableType[];
        return ALL_VARIABLES.filter((v) => {
          const key = v.key.replace(/[{}]/g, "") as VariableType;
          return varKeys.includes(key);
        });
      }
      // 默认返回所有变量
      return ALL_VARIABLES;
    }, [variables]);

    // 插入变量到编辑器
    const insertVariable = (variable: string) => {
      if (editor) {
        editor.chain().focus().insertContent(variable).run();
      }
    };

    // 暴露方法给父组件
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
              <Button
                size="small"
                icon={<LinkOutlined />}
                onClick={() => {
                  const url = window.prompt("请输入链接地址:");
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run();
                  }
                }}
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
          `}</style>
        </div>
      </div>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
