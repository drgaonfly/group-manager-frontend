import { useNavigate } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  
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
            <button className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm">
              连接钱包
            </button>
          </div>
        </div>
      </div>

      {/* 占位符 */}
      <div className="h-14"></div>

      {/* 主要内容区域 */}
      <div className="p-4 pb-20">
        {children}
      </div>
      
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4">
        <div className="flex justify-between">
          <div className="text-center cursor-pointer" onClick={() => navigate('/')}>
            <div>🏠</div>
            <span className="text-xs">首页</span>
          </div>
          <div className="text-center cursor-pointer" onClick={() => navigate('/mining-pool')}>
            <div>⛏️</div>
            <span className="text-xs">矿池</span>
          </div>
          <div className="text-center cursor-pointer" onClick={() => navigate('/service')}>
            <div>🔧</div>
            <span className="text-xs">服务</span>
          </div>
          <div className="text-center cursor-pointer" onClick={() => navigate('/invite')}>
            <div>🎮</div>
            <span className="text-xs">邀请</span>
          </div>
          <div className="text-center cursor-pointer" onClick={() => navigate('/profile')}>
            <div>👤</div>
            <span className="text-xs">我的</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLayout; 