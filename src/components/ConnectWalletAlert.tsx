import { useEffect } from 'react';

interface ConnectWalletAlertProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

function ConnectWalletAlert({ isOpen, onClose, message }: ConnectWalletAlertProps) {

  useEffect(() => {
    if (isOpen) {
      // 2.5秒后自动关闭
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      // 清理定时器
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1e2633] w-[60%] max-w-xs rounded-lg p-4">
        <div className="text-center text-gray-300">
          {message}
        </div>
      </div>
    </div>
  );
}

export default ConnectWalletAlert; 