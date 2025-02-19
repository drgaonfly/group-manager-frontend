
function TeamIncome() {

  return (
    <div className="min-h-screen bg-[#1a1b1e]">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 bg-[#1a1b1e] z-10">
        <div className="flex items-center px-4 py-3">
          <button 
            onClick={() => window.history.back()} 
            className="text-white"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-white ml-4">我的团队</span>
        </div>
      </div>

      {/* 收入统计卡片 */}
      <div className="pt-16 px-4">
        <div className="bg-[#25262B] rounded-lg p-6">
          <div className="flex justify-between mb-2">
            <div className="text-center">
              <div className="text-gray-400 mb-2">USDT</div>
              <div className="text-white text-xl mb-2">0</div>
              <div className="text-gray-400 text-sm">总收入</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 mb-2">成员</div>
              <div className="text-white text-xl mb-2">0</div>
              <div className="text-gray-400 text-sm">成员总数</div>
            </div>
          </div>
        </div>
      </div>

      {/* 邀请朋友部分 */}
      <div className="px-4 mt-6">
        <div className="bg-[#25262B] rounded-lg p-6">
          <div className="text-white text-lg mb-4">邀请朋友</div>
          <div className="flex justify-between">
            <button className="text-blue-500">日榜</button>
            <button className="text-blue-500">总榜单</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamIncome;
