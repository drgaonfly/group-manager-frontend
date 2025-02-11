
// 添加 Web3 导入
import Web3 from 'web3';

// 为 window.ethereum 添加类型声明
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (eventName: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

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

  // 添加连接 MetaMask 的函数
  const connectMetaMask = async () => {
    console.log('ConnectMetaMask function called');
    try {
      // 检查是否存在 MetaMask
      if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed');
        try {
          // 请求用户授权连接钱包
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          console.log('Accounts:', accounts);
          
          // 创建 Web3 实例
          const web3 = new Web3(window.ethereum);
          console.log('Web3 instance created');
          
          // 获取当前连接的账户
          const connectedAccounts = await web3.eth.getAccounts();
          console.log('Connected accounts:', connectedAccounts);
          
          onClose(); // 关闭弹窗
        } catch (error) {
          console.error('User rejected connection:', error);
        }
      } else {
        console.log('MetaMask is not installed');
        window.open('https://metamask.io/download/', '_blank');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  // 修改处理钱包选择的函数
  const handleWalletSelect = (wallet: { name: string; path: string }) => {
    console.log('Selected wallet:', wallet.name);
    if (wallet.name === 'MetaMask') {
      console.log('Attempting to connect to MetaMask');
      connectMetaMask();
    } else {
      window.open(wallet.path, '_blank');
      onClose();
    }
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
            onClick={() => handleWalletSelect(wallet)}
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