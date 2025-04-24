import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import { useChatStore } from "../store/chatStore";
import { useUser } from "../lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";

import Editor from "../components/Editor";

interface Message {
  id: string;
  message: string;
  isRead: boolean;
  sender?: unknown;
  createdAt?: Date;
}

function Chat() {
  const { t } = useTranslation();
  const { data: user } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const chatMessages = useChatStore((state) => state.messages);
  const queryClient = useQueryClient();

  const { data: messages = [], refetch } = useQuery<Message[]>({
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
      setNewMessage("");
      refetch();
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    },
  });

  useEffect(() => {
    if (chatMessages.length > 0) {
      const newMessage = chatMessages[chatMessages.length - 1];
      const messageObj: Message = {
        id: Date.now().toString(),
        message: newMessage,
        isRead: false,
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

  if (!user) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 px-4">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center animate-fadeIn">
          <h2 className="text-2xl font-bold text-white mb-3">
            {t("chat.loginRequired") || "Login Required"}
          </h2>
          <p className="text-gray-300 mb-6">
            {t("Please connect wallet and login first")}
          </p>
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl w-full"
            onClick={() => (window.location.href = "/login")}
          >
            {t("chat.connectWallet") || "Connect Wallet"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start ${
              message.sender === "customer" ? "flex-row-reverse" : "flex-row"
            } gap-3`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-medium text-xl">
              {message.sender === "customer" ? "Y" : "S"}
            </div>
            <div className="flex flex-col max-w-[70%]">
              <span className="text-xs text-gray-400 mb-1">
                {message.sender === "customer"
                  ? t("chat.you")
                  : t("chat.support")}
              </span>
              <div
                className={` rounded-lg ${
                  message.sender === "customer"
                    ? "bg-[#95EC69] text-black"
                    : "bg-gray-700 text-white"
                }`}
              >
                <ReactQuill
                  value={message.message}
                  readOnly={true}
                  theme="bubble"
                  modules={{
                    toolbar: false,
                  }}
                  className="quill-message"
                />
              </div>

              <span className="text-xs text-gray-500 mt-1">
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm bottom-16 w-full mt-100">
        <div className="max-w-4xl mx-auto">
          <Editor
            value={newMessage}
            onChange={setNewMessage}
            placeholder={t("chat.placeholder")}
          />

          <button
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            className="mt-4 float-right w-1/4  bg-gradient-to-r from-blue-500 to-blue-600 text-white  rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {loading ? t("chat.sending") : t("chat.send")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
