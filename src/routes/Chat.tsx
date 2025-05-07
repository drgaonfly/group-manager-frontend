import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast from "react-hot-toast";
import { ChatMessage, useChatStore } from "../store/chatStore";
import { useUser } from "../lib/auth";
import { useMutation } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import { DeleteOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Image, Spin } from "antd";
import { message } from "antd";
import Editor from "../components/Editor";
import { getSocket } from "../hooks/useSocketNotification";
import { useMessageReadStore } from "../store/chatMessageReadStore";

interface ChatProps {
  isModal?: boolean; // 添加属性以区分是否在模态框中
}

// eslint-disable-next-line no-empty-pattern
function Chat({}: ChatProps) {
  const { t } = useTranslation();
  const { data: user } = useUser();
  const [newMessage, setNewMessage] = useState("");
  const chatMessage = useChatStore((state) => state.message);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const socket = getSocket();

  // 添加分页状态
  const [messagePagination, setMessagePagination] = useState({
    current: 1,
    pageSize: 10,
    hasMore: true,
  });
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const messageReadStatus = useMessageReadStore(
    (state) => state.messageReadStatus,
  );

  // 处理消息已读状态
  useEffect(() => {
    if (messageReadStatus?.sender === "customer") {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => ({
          ...msg,
          isRead: msg.sender === "customer" ? true : msg.isRead,
        })),
      );
    }
  }, [messageReadStatus]);

  // 使用 Intersection Observer 监听最后一条消息是否可见
  useEffect(() => {
    if (!user || messages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          socket.emit("mark-read", {
            customerId: user._id,
            sender: "user",
            userId: messages[0]?.user?._id,
          });
          console.log("最后一条消息可见");
        }
      },
      {
        threshold: 0.5, // 当消息有 50% 进入视口时触发
      },
    );

    if (lastMessageRef.current) {
      observer.observe(lastMessageRef.current);
    }

    return () => {
      if (lastMessageRef.current) {
        observer.unobserve(lastMessageRef.current);
      }
    };
  }, [messages, user, socket]);

  // 添加一个防抖标志，避免短时间内多次触发
  const isLoadingRef = useRef(false);

  // 监听聊天容器滚动
  const handleScroll = () => {
    if (!user) return;
    if (messages?.length === 0) return;

    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1;

      if (isAtBottom) {
        // socket.emit("mark-read", {
        //   customerId: user._id,
        //   sender: "user",
        //   userId: messages[0]?.user?._id,
        // });

        console.log("已滚动到底部");
        // 这里可以添加到达底部时的处理逻辑
      }

      // 当滚动到顶部附近时，加载更多消息
      if (
        scrollTop < 100 &&
        !loadingMoreMessages &&
        messagePagination.hasMore &&
        !isLoadingRef.current // 使用 ref 检查加载状态
      ) {
        // 设置加载标志
        isLoadingRef.current = true;

        // 记住当前滚动位置和内容高度
        const scrollPosition = scrollHeight;

        // 加载更多消息
        fetchMessages(messagePagination.current + 1, true).finally(() => {
          // 请求完成后重置加载标志，添加延迟防止短时间内多次触发
          setTimeout(() => {
            isLoadingRef.current = false;
          }, 500);
        });

        // 在消息加载后恢复滚动位置，并保持一定的滚动距离
        setTimeout(() => {
          if (messagesContainerRef.current) {
            // 计算新的滚动位置，保持一定的滚动距离
            const newScrollPosition =
              messagesContainerRef.current.scrollHeight - scrollPosition;
            messagesContainerRef.current.scrollTop = newScrollPosition + 500; // 增加一个偏移量
          }
        }, 300);
      }
    }
  };

  // 格式化日期为YYYY-M-D格式
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份从0开始，要+1
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };

  // 格式化时间为HH:mm:ss格式（不使用toLocaleTimeString）
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // 手动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 添加一个状态来跟踪是否已经到达顶部
  const [reachedTop, setReachedTop] = useState(false);

  // 修改为手动获取消息的函数
  const fetchMessages = async (page = 1, append = false) => {
    if (page === 1) {
      setShouldScrollToBottom(true); // 初始加载时应该滚动到底部
      setReachedTop(false); // 重置到顶部状态
    } else {
      setLoadingMoreMessages(true);
      setShouldScrollToBottom(false); // 加载更多时不应该滚动到底部
    }

    try {
      const response = await axios.get("/chats/messages", {
        params: {
          current: page,
          pageSize: messagePagination.pageSize,
        },
      });

      // 过滤已删除的消息
      const filteredMessages = response.data.data;

      // 检查是否已经到达顶部（没有更多消息）
      if (filteredMessages.length === 0) {
        setReachedTop(true);
        setMessagePagination((prev) => ({
          ...prev,
          hasMore: false,
        }));
        setLoadingMoreMessages(false);
        return;
      }

      // 后端返回的是降序（最新的在前），需要反转为正序（最早的在前）
      const sortedMessages = [...filteredMessages].reverse();

      // 如果是加载更多（向上滚动），则将新消息添加到现有消息的前面
      if (append) {
        setMessages((prevMessages) => [...sortedMessages, ...prevMessages]);
      } else {
        setMessages(sortedMessages);
      }

      // 更新分页信息
      setMessagePagination((prev) => ({
        ...prev,
        current: page,
        hasMore: filteredMessages.length === messagePagination.pageSize,
      }));
    } catch (error) {
      console.error("获取消息失败:", error);
      toast.error("获取消息失败");
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  // 初始加载消息
  useEffect(() => {
    if (user) {
      // 重置分页状态
      setMessagePagination({
        current: 1,
        pageSize: 10,
        hasMore: true,
      });
      fetchMessages(1, false);
    }
  }, [user]);

  // 滚动到底部
  useEffect(() => {
    if (shouldScrollToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldScrollToBottom]);

  // 添加滚动监听
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [messagePagination, loadingMoreMessages]);

  const { mutate: sendMessage, isPending: loading } = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/chats/messages", {
        message: newMessage,
      });
      return response.data.data;
    },
    onSuccess: (newMessageData) => {
      setNewMessage("");
      // 添加新消息到列表末尾
      setMessages((prevMessages) => [...prevMessages, newMessageData]);
      // 发送消息后滚动到底部
      setShouldScrollToBottom(true);
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
      // 添加新消息到列表末尾
      setMessages((prevMessages) => [...prevMessages, newMessageData]);
      // 发送图片后滚动到底部
      setShouldScrollToBottom(true);
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
      // 更新消息列表，将已删除的消息标记为已删除
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
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
      // 添加新消息到列表末尾
      setMessages((prevMessages) => [...prevMessages, chatMessage]);
      // 收到新消息后滚动到底部
      setShouldScrollToBottom(true);
    }
  }, [chatMessage, user?._id]);

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
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
      >
        {/* 添加滚动到底部按钮 */}
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-all duration-200"
          title={t("chat.scrollToBottom")}
        >
          <VerticalAlignBottomOutlined style={{ fontSize: "20px" }} />
        </button>

        {/* 加载更多消息的加载指示器 */}
        {loadingMoreMessages && (
          <div className="flex justify-center py-2">
            <Spin size="small" />
          </div>
        )}

        {/* 显示已经到顶部的提示 */}
        {reachedTop && (
          <div className="flex justify-center py-2 text-gray-400 text-sm">
            {t("chat.noMoreMessages")}
          </div>
        )}

        {messages.map((msg, index) => {
          const isCustomer = msg.sender === "customer";
          const isSoftDeleted = msg.isSoftDeleted;
          const hasImage = msg.image;
          const isLastMessage = index === messages.length - 1;

          if (isSoftDeleted) return null;

          return (
            <div
              key={msg._id || msg.id}
              ref={isLastMessage ? lastMessageRef : null}
              className={`flex items-start ${
                isCustomer ? "flex-row-reverse" : "flex-row"
              } gap-3 group`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-medium text-xl">
                {isCustomer ? "Y" : "S"}
              </div>
              <div className="flex flex-col max-w-[70%]">
                <span className="text-xs text-gray-400 mb-1">
                  {isCustomer ? t("chat.you") : t("chat.support")}
                </span>
                <div
                  className={`rounded-lg ${
                    isSoftDeleted
                      ? "bg-gray-600 text-gray-400 italic"
                      : isCustomer
                        ? "bg-[#95EC69] text-black"
                        : "bg-gray-700 text-white"
                  }`}
                >
                  {msg.message ? (
                    <ReactQuill
                      value={msg.message}
                      readOnly={true}
                      theme="bubble"
                      modules={{
                        toolbar: false,
                      }}
                      className="quill-message"
                    />
                  ) : hasImage ? (
                    <div className="p-2">
                      <Image
                        src={msg.image}
                        alt="聊天图片"
                        style={{ maxWidth: "100%", borderRadius: "4px" }}
                        preview={false}
                      />
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between mt-1 gap-2">
                  <span className="text-xs text-gray-500">
                    {msg.createdAt
                      ? `${formatDate(msg.createdAt.toString())} ${formatTime(msg.createdAt.toString())}`
                      : ""}
                  </span>

                  {/* 只在自己发送的消息下方显示删除图标 */}
                  {isCustomer && (
                    <button
                      onClick={() => handleDeleteMessage(msg._id! || msg.id!)}
                      className="text-gray-500"
                      title={t("chat.delete")}
                    >
                      <DeleteOutlined
                        spin={deletingMessage === (msg._id || msg.id)}
                        style={{ fontSize: "16px" }}
                      />
                    </button>
                  )}

                  {/* 已读/未读状态 */}
                  {isCustomer && (
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-gray-500">
                        {/* {msg.isRead ? "已读" : "未读"} */}
                      </span>
                      <span className="text-green-500 text-xs">
                        {msg.isRead ? "✓✓" : "✓"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
