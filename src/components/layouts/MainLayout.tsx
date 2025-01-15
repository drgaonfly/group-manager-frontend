import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WalletModal from '../WalletModal';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 z-50 px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm">繁體中文</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">ETH</span>
            <button 
              className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm"
              onClick={() => setIsWalletModalOpen(true)}
            >
              连接钱包
            </button>
          </div>
        </div>
      </div>

      {/* 钱包选择弹窗 */}
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* 占位符 */}
      <div className="h-14"></div>

      {/* 主要内容区域 */}
      <div className="p-4 pb-20">
        {children}
      </div>
      
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4">
        <div className="flex justify-between">
          <div 
            className="text-center cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div>
              <img 
                src={location.pathname === '/' ? '/home1.png' : '/home.png'}
                alt="home" 
                className="w-8 h-8"
              />
            </div>
            <span className={`text-xs ${location.pathname === '/' ? 'text-[#f0b90b]' : ''}`}>
              首页
            </span>
          </div>
          <div 
            className="text-center cursor-pointer" 
            onClick={() => navigate('/mining-pool')}
          >
            <div>
              <img 
                src={location.pathname === '/mining-pool' ? '/pool1.png' : '/pool.png'}
                alt="mining" 
                className="w-8 h-8"
              />
            </div>
            <span className={`text-xs ${location.pathname === '/mining-pool' ? 'text-[#f0b90b]' : ''}`}>
              矿池
            </span>
          </div>
          <div 
            className="text-center cursor-pointer" 
            onClick={() => navigate('/service')}
          >
            <div>
              <img 
                src={location.pathname === '/service' ? '/serve1.png' : '/serve.png'}
                alt="service" 
                className="w-8 h-8"
              />
            </div>
            <span className={`text-xs ${location.pathname === '/service' ? 'text-[#f0b90b]' : ''}`}>
              服务
            </span>
          </div>
          <div 
            className="text-center cursor-pointer" 
            onClick={() => navigate('/invite')}
          >
            <div>
              <img 
                src={location.pathname === '/invite' ? '/invite1.png' : '/invite.png'}
                alt="invite" 
                className="w-8 h-8"
              />
            </div>
            <span className={`text-xs ${location.pathname === '/invite' ? 'text-[#f0b90b]' : ''}`}>
              邀请
            </span>
          </div>
          <div 
            className="text-center cursor-pointer" 
            onClick={() => navigate('/user')}
          >
            <div>
              <img 
                src={location.pathname === '/user' ? '/user1.png' : '/user.png'}
                alt="user" 
                className="w-8 h-8"
              />
            </div>
            <span className={`text-xs ${location.pathname === '/user' ? 'text-[#f0b90b]' : ''}`}>
              我的
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLayout; 