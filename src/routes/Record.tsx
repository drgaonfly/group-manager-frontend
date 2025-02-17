import { useTranslation } from 'react-i18next';

function Record() {
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
            <span className="text-white ml-4">{t('record.back')}</span>
          </div>
        </div>
  
        {/* 采矿记录 */}
        <div className="flex flex-col items-center justify-center h-screen mb-5 pt-16">
          <h2 className="text-center mb-4">{t('record.myMiningPool')}</h2>
          <div className="flex flex-col items-center justify-center text-gray-400">
            <img src="/nors-BR_U97rM.png" alt={t('miningpool.noDataAlt')} className="w-24 h-24 mb-4 object-contain" />
            <span>{t('miningpool.noData')}</span>
          </div>
        </div>
      </div>
    );
  }
  
  export default Record; 