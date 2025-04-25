import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Chat from "../routes/Chat";

interface ChatModalProps {
  onClose: () => void;
}

function ChatModal({ onClose }: ChatModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // 点击模态框外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // 按ESC键关闭
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden relative"
      >
        <div className="h-full">
          <Chat isModal={true} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ChatModal;
