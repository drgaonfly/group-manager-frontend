import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import { useChatStore } from "../store/chatStore";
import { useUser } from "../lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import { DeleteOutlined } from "@ant-design/icons";

import Editor from "../components/Editor";

interface Message {
  _id: string;
  id: string;
  message: string;
  isRead: boolean;
  sender?: unknown;
  createdAt?: Date;
  isSoftDeleted?: boolean;
}

interface ChatProps {
  isModal?: boolean; // 添加属性以区分是否在模态框中
}

// eslint-disable-next-line no-empty-pattern
function Chat({}: ChatProps) {
  const { t } = useTranslation();
  const { data: user } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const chatMessages = useChatStore((state) => state.messages);
  const queryClient = useQueryClient();
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);

  const { data: chats = [], refetch } = useQuery<Message[]>({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const response = await axios.get("/chats/messages");
      return response.data.data;
    },
    enabled: !!user,
  });

  const { mutate: sendMessage, isPending: loading } = useMutation({
    mutationFn: async () => {
      await axios.post("/chats/messages", {
        message: newMessage,
      });
    },
    onSuccess: () => {
      setNewMessage(""); // 清空消息输入框
      refetch();
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    },
  });

  // 添加软删除消息的mutation
  const { mutate: softDeleteMessage } = useMutation({
    mutationFn: async (messageId: string) => {
      await axios.post("/chats/customer-soft-delete", {
        ids: [messageId],
      });
    },
    onSuccess: () => {
      toast.success(t("chat.deleteSuccess"));
      refetch();
      setDeletingMessage(null);
    },
    onError: (error) => {
      console.error("Failed to delete message:", error);
      toast.error(t("chat.deleteFailed"));
      setDeletingMessage(null);
    },
  });

  useEffect(() => {
    if (chatMessages.length > 0) {
      const newMessage = chatMessages[chatMessages.length - 1];
      const messageObj: Message = {
        _id: Date.now().toString(),
        id: Date.now().toString(),
        message: newMessage,
        isRead: false,
        sender: "customer", // 确保设置正确的发送者
      };
      queryClient.setQueryData<Message[]>(["chat-messages"], (old = []) => [
        ...old,
        messageObj,
      ]);
    }
  }, [chatMessages, queryClient]);

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chats
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
                  <ReactQuill
                    value={chat.message}
                    readOnly={true}
                    theme="bubble"
                    modules={{
                      toolbar: false,
                    }}
                    className="quill-message"
                  />
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
                      onClick={() => handleDeleteMessage(chat._id || chat.id)}
                      className="text-gray-500"
                      title={t("chat.delete")}
                    >
                      <DeleteOutlined
                        spin={deletingMessage === (chat._id || chat.id)}
                        style={{ fontSize: "16px" }}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="p-6 border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm w-full">
        <div className="max-w-4xl mx-auto">
          <Editor
            value={newMessage}
            onChange={setNewMessage}
            placeholder={t("chat.placeholder")}
          />

          <button
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            className="mt-4 float-right w-1/4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {loading ? t("chat.sending") : t("chat.send")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
