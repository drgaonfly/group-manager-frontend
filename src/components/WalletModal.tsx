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
      isTokenPocket?: boolean;
      isTrust?: boolean;
      isTronLink?: boolean;
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
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        console.log('MetaMask is installed');
        try {
          // 请求用户授权连接钱包
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          console.log('MetaMask Provider:', window.ethereum.isMetaMask);
          console.log('MetaMask Accounts:', accounts);
          
          // 创建 Web3 实例
          const web3 = new Web3(window.ethereum);
          console.log('Web3 instance created');
          
          // 获取当前连接的账户和链ID
          const connectedAccounts = await web3.eth.getAccounts();
          const chainId = await web3.eth.getChainId();
          console.log('MetaMask Connected accounts:', connectedAccounts);
          console.log('MetaMask Chain ID:', chainId);
          
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

  // 添加连接 TokenPocket 的函数
  const connectTokenPocket = async () => {
    console.log('ConnectTokenPocket function called');
    try {
      // 检查是否存在 TokenPocket
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isTokenPocket) {
        console.log('TokenPocket is installed');
        try {
          // 请求用户授权连接钱包
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          console.log('TokenPocket Provider:', window.ethereum.isTokenPocket);
          console.log('TokenPocket Accounts:', accounts);
          
          // 创建 Web3 实例
          const web3 = new Web3(window.ethereum);
          console.log('Web3 instance created');
          
          // 获取当前连接的账户和链ID
          const connectedAccounts = await web3.eth.getAccounts();
          const chainId = await web3.eth.getChainId();
          console.log('TokenPocket Connected accounts:', connectedAccounts);
          console.log('TokenPocket Chain ID:', chainId);
          
          onClose(); // 关闭弹窗
        } catch (error) {
          console.error('User rejected connection:', error);
        }
      } else {
        console.log('TokenPocket is not installed');
        window.open('https://www.tokenpocket.pro/en/download/app', '_blank');
      }
    } catch (error) {
      console.error('Error connecting to TokenPocket:', error);
    }
  };

  // 添加连接 Trust Wallet 的函数
  const connectTrustWallet = async () => {
    console.log('ConnectTrustWallet function called');
    try {
      // 检查是否存在 Trust Wallet
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isTrust) {
        console.log('Trust Wallet is installed');
        try {
          // 请求用户授权连接钱包
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          console.log('Trust Wallet Provider:', window.ethereum.isTrust);
          console.log('Trust Wallet Accounts:', accounts);
          
          // 创建 Web3 实例
          const web3 = new Web3(window.ethereum);
          console.log('Web3 instance created');
          
          // 获取当前连接的账户和链ID
          const connectedAccounts = await web3.eth.getAccounts();
          const chainId = await web3.eth.getChainId();
          console.log('Trust Wallet Connected accounts:', connectedAccounts);
          console.log('Trust Wallet Chain ID:', chainId);
          
          onClose(); // 关闭弹窗
        } catch (error) {
          console.error('User rejected connection:', error);
        }
      } else {
        console.log('Trust Wallet is not installed');
        window.open('https://trustwallet.com/fr/download', '_blank');
      }
    } catch (error) {
      console.error('Error connecting to Trust Wallet:', error);
    }
  };

  // 添加连接 TronLink 的函数
  const connectTronLink = async () => {
    console.log('ConnectTronLink function called');
    try {
      // 检查是否存在 TronLink
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isTronLink) {
        console.log('TronLink is installed');
        try {
          // 请求用户授权连接钱包
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          console.log('TronLink Provider:', window.ethereum.isTronLink);
          console.log('TronLink Accounts:', accounts);
          
          // 创建 Web3 实例
          const web3 = new Web3(window.ethereum);
          console.log('Web3 instance created');
          
          // 获取当前连接的账户和链ID
          const connectedAccounts = await web3.eth.getAccounts();
          const chainId = await web3.eth.getChainId();
          console.log('TronLink Connected accounts:', connectedAccounts);
          console.log('TronLink Chain ID:', chainId);
          
          onClose(); // 关闭弹窗
        } catch (error) {
          console.error('User rejected connection:', error);
        }
      } else {
        console.log('TronLink is not installed');
        window.open('https://www.tronlink.org/dlDetails/', '_blank');
      }
    } catch (error) {
      console.error('Error connecting to TronLink:', error);
    }
  };

  // 修改处理钱包选择的函数
  const handleWalletSelect = (wallet: { name: string; path: string }) => {
    console.log('Selected wallet:', wallet.name);
    if (wallet.name === 'MetaMask') {
      console.log('Attempting to connect to MetaMask');
      connectMetaMask();
    } else if (wallet.name === 'TokenPocket') {
      console.log('Attempting to connect to TokenPocket');
      connectTokenPocket();
    } else if (wallet.name === 'Trust Wallet') {
      console.log('Attempting to connect to Trust Wallet');
      connectTrustWallet();
    } else if (wallet.name === 'TronLink') {
      console.log('Attempting to connect to TronLink');
      connectTronLink();
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