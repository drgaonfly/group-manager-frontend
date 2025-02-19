import { useTranslation } from 'react-i18next';

function TeamIncome() {
  const { t } = useTranslation();

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
          <span className="text-white ml-4">{t('team.myTeam')}</span>
        </div>
      </div>

      {/* 收入统计卡片 */}
      <div className="pt-16 px-4">
        <div className="bg-[#25262B] rounded-lg p-6">
          <div className="flex justify-between mb-2">
            <div className="text-center">
              <div className="text-gray-400 mb-2">USDT</div>
              <div className="text-white text-xl mb-2">0</div>
              <div className="text-gray-400 text-sm">{t('team.totalIncome')}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 mb-2">{t('team.memberCount')}</div>
              <div className="text-white text-xl mb-2">0</div>
              <div className="text-gray-400 text-sm">{t('team.memberCount')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 邀请朋友部分 */}
      <div className="px-4 mt-6">
        <div className="bg-[#25262B] rounded-lg p-6">
          <div className="text-white text-lg mb-4">{t('team.inviteFriends')}</div>
          <div className="flex justify-between">
            <button className="text-blue-500">{t('team.dailyRank')}</button>
            <button className="text-blue-500">{t('team.totalRank')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamIncome;
