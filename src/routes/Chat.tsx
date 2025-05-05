import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import { ChatMessage, useChatStore } from "../store/chatStore";
import { useUser } from "../lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import { DeleteOutlined } from "@ant-design/icons";
import { Image } from "antd";
import { message } from "antd";

import Editor from "../components/Editor";

interface ChatProps {
  isModal?: boolean; // 添加属性以区分是否在模态框中
}

// eslint-disable-next-line no-empty-pattern
function Chat({}: ChatProps) {
  const { t } = useTranslation();
  const { data: user } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const chatMessage = useChatStore((state) => state.message);
  const queryClient = useQueryClient();
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 监听聊天容器滚动到底部
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;

      if (isAtBottom) {
        console.log("已滚动到底部");
        // 这里可以添加到达底部时的处理逻辑
      }
    }
  };

  const { data: chats = [], isLoading: isChatsLoading } = useQuery<
    ChatMessage[]
  >({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const response = await axios.get("/chats/messages");
      return response.data.data;
    },
    enabled: !!user,
  });

  const { mutate: sendMessage, isPending: loading } = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/chats/messages", {
        message: newMessage,
      });
      return response.data.data;
    },
    onSuccess: (newMessageData) => {
      setNewMessage("");
      queryClient.setQueryData<ChatMessage[]>(["chat-messages"], (old = []) => [
        ...old,
        newMessageData,
      ]);
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    },
  });

  const { mutate: sendImageMessage } = useMutation({
    mutationFn: async (imageUrl: string) => {
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
        const response = await axios.post("/chats/messages", {
          image: imageUrl,
        });
        hide();
        return response.data.data;
      } catch (error) {
        hide();
        throw error;
      }
    },
    onSuccess: (newMessageData) => {
      queryClient.setQueryData<ChatMessage[]>(["chat-messages"], (old = []) => [
        ...old,
        newMessageData,
      ]);
    },
    onError: (error) => {
      console.error("Failed to send image message:", error);
      toast.error("Failed to send image message");
    },
  });

  const { mutate: softDeleteMessage } = useMutation({
    mutationFn: async (messageId: string) => {
      await axios.post("/chats/customer-soft-delete", {
        ids: [messageId],
      });
      return messageId;
    },
    onSuccess: (deletedMessageId) => {
      toast.success(t("chat.deleteSuccess"));
      queryClient.setQueryData<ChatMessage[]>(["chat-messages"], (old = []) =>
        old.map((msg) =>
          msg._id === deletedMessageId ? { ...msg, isSoftDeleted: true } : msg,
        ),
      );
      setDeletingMessage(null);
    },
    onError: (error) => {
      console.error("Failed to delete message:", error);
      toast.error(t("chat.deleteFailed"));
      setDeletingMessage(null);
    },
  });

  useEffect(() => {
    console.log("chatMessage", chatMessage);
    if (
      chatMessage &&
      chatMessage.customer?._id === user?._id &&
      chatMessage.sender === "user"
    ) {
      queryClient.setQueryData<ChatMessage[]>(["chat-messages"], (old = []) => [
        ...old,
        chatMessage,
      ]);
    }
  }, [chatMessage, queryClient, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessage, chats]);

  // 添加滚动监听
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleSendMessage = () => {
    if (!user) {
      toast.error(t("Please connect wallet and login first"));
      return;
    }

    if (!newMessage.trim()) {
      return;
    }

    sendMessage();
  };

  // 处理删除消息
  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm(t("chat.confirmDelete"))) {
      setDeletingMessage(messageId);
      softDeleteMessage(messageId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-800 to-gray-900">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isChatsLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          chats
            .filter((chat) => !chat.isSoftDeleted)
            .map((chat) => (
              <div
                key={chat._id || chat.id}
                className={`flex items-start ${
                  chat.sender === "customer" ? "flex-row-reverse" : "flex-row"
                } gap-3 group`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-medium text-xl">
                  {chat.sender === "customer" ? "Y" : "S"}
                </div>
                <div className="flex flex-col max-w-[70%]">
                  <span className="text-xs text-gray-400 mb-1">
                    {chat.sender === "customer"
                      ? t("chat.you")
                      : t("chat.support")}
                  </span>
                  <div
                    className={`rounded-lg ${
                      chat.isSoftDeleted
                        ? "bg-gray-600 text-gray-400 italic"
                        : chat.sender === "customer"
                          ? "bg-[#95EC69] text-black"
                          : "bg-gray-700 text-white"
                    }`}
                  >
                    {chat.message ? (
                      <ReactQuill
                        value={chat.message}
                        readOnly={true}
                        theme="bubble"
                        modules={{
                          toolbar: false,
                        }}
                        className="quill-message"
                      />
                    ) : chat.image ? (
                      <div className="p-2">
                        <Image
                          src={chat.image}
                          alt="聊天图片"
                          style={{ maxWidth: "100%", borderRadius: "4px" }}
                          preview={false}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between mt-1 gap-2">
                    <span className="text-xs text-gray-500">
                      {chat.createdAt
                        ? new Date(chat.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>

                    {/* 只在自己发送的消息下方显示删除图标 */}
                    {chat.sender === "customer" && (
                      <button
                        onClick={() =>
                          handleDeleteMessage(chat._id! || chat.id!)
                        }
                        className="text-gray-500"
                        title={t("chat.delete")}
                      >
                        <DeleteOutlined
                          spin={deletingMessage === (chat._id || chat.id)}
                          style={{ fontSize: "16px" }}
                        />
                      </button>
                    )}

                    {/* 已读/未读状态 */}
                    {chat.sender === "customer" && (
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-xs text-gray-500">
                          {/* {chat.isRead ? "已读" : "未读"} */}
                        </span>
                        <span className="text-green-500 text-xs">
                          {chat.isRead ? "✓✓" : "✓"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-gray-700 bg-gray-800 w-full">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <div className="flex-1">
            <Editor
              value={newMessage}
              onChange={setNewMessage}
              placeholder={t("chat.placeholder")}
              onSendImage={sendImageMessage}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            className="h-10 px-5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md flex-shrink-0"
          >
            {loading ? t("chat.sending") : t("chat.send")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
