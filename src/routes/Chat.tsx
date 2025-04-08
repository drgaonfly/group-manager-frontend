import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";
import axios from "axios";
import toast from "react-hot-toast";
import { useChatStore } from "../store/chatStore";
import { useUser } from "../lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  message: string;
  isRead: boolean;
  sender?: any;
  createdAt?: Date;
}

function Chat() {
  const { t } = useTranslation();
  const { address } = useAccount();
  const { data: user } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const chatMessages = useChatStore((state) => state.messages);
  const queryClient = useQueryClient();
  // Fetch chat messages with React Query
  const { data: messages = [], refetch } = useQuery<Message[]>({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const response = await axios.get("/chats/messages");
      return response.data.data;
    },
    enabled: !!user,
  });

  // Send message mutation
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

  // Update messages when chatStore messages change
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
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">
          {t("Please connect wallet and login first")}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === address ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === address
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              <div className="text-sm opacity-75">
                {/* {message.sender?.slice(0, 6)}...{message.sender?.slice(-4)} */}
              </div>
              <div className="mt-1">{message.message}</div>
              <div className="text-xs opacity-50 mt-1">
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleTimeString()
                  : ""}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("Type a message...")}
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyUp={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("Sending...") : t("Send")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
