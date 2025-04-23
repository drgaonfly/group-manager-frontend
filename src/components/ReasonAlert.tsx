import { useEffect } from "react";

interface ReasonAlertProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  title?: string;
}

function ReasonAlert({
  isOpen,
  onClose,
  reason,
  title = "拒绝原因",
}: ReasonAlertProps) {
  useEffect(() => {
    if (isOpen) {
      // 点击外部区域关闭弹窗
      const handleOutsideClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("reason-alert-backdrop")) {
          onClose();
        }
      };

      document.addEventListener("click", handleOutsideClick);

      // 清理事件监听
      return () => document.removeEventListener("click", handleOutsideClick);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 reason-alert-backdrop">
      <div className="bg-[#1e2633] w-[80%] max-w-md rounded-lg p-5 shadow-xl animate-fadeIn">
        <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="text-gray-300 max-h-[60vh] overflow-y-auto">
          {reason}
        </div>
      </div>
    </div>
  );
}

export default ReasonAlert;
