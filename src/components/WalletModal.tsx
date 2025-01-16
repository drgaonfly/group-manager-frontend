// import { useNavigate } from 'react-router-dom';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function WalletModal({ isOpen, onClose }: WalletModalProps) {
  // const navigate = useNavigate();
  
  if (!isOpen) return null;

  const wallets = [
    {
      name: 'TokenPocket',
      description: 'Connect to your TokenPocket Wallet',
      icon: '/qbtp-Co4B1r61.png',
      path: 'https://www.tokenpocket.pro/en/download/app'
    },
    {
      name: 'MetaMask',
      description: 'Connect to your MetaMask Wallet',
      icon: '/qbhl-Bb4l1Ikz.png',
      path: 'https://metamask.io/download/'
    },
    {
      name: 'Trust Wallet',
      description: 'Connect to your TrustWallet Wallet',
      icon: '/qbtw-CYK5VX4m.png',
      path: 'https://trustwallet.com/fr/download'
    },
    {
      name: 'TronLink',
      description: 'Connect to your TronLink Wallet',
      icon: '/qbtl-Db6zAvSL.png',
      path: 'https://www.tronlink.org/dlDetails/'
    }
  ];

  // 处理背景点击
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 处理钱包选择
  const handleWalletSelect = (path: string) => {
    window.open(path, '_blank');  // 在新标签页中打开外部链接
    onClose();                    // 关闭弹窗
  };

  return (
    <div 
      className="px-4 fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 rounded-lg"
      onClick={handleBackdropClick}  // 添加点击事件
    >
      <div className="bg-[#2d2672] w-full max-w-md mx-4 rounded-lg border border-gray-700">
        {wallets.map((wallet, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-6 cursor-pointer border-b border-white-900"
            onClick={() => handleWalletSelect(wallet.path)}
          >
            <img src={wallet.icon} alt={wallet.name} className="w-12 h-12 mb-2" />
            <div className="text-white font-bold">{wallet.name}</div>
            <div className="text-sm text-gray-400">{wallet.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WalletModal; 