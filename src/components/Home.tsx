import { useState, useEffect } from 'react';
import WalletModal from './WalletModal';
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // 首次加载时显示钱包模块框
  useEffect(() => {
    setIsWalletModalOpen(true);
  }, []); // 空依赖数组确保只在首次渲染时执行

  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  // 常见问题模块切换展开/收起状态
  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: t('inviteQuestion'),
      answer: t('inviteAnswer')
    },
    {
      question: t('withdrawQuestion'),
      answer: t('withdrawAnswer')
    },
    {
      question: t('assetSafe'),
      answer: t('assetSafeAnswer')
    },
    {
      question: t('profitCalculation'),
      answer: t('profitCalculationAnswer')
    },
    {
      question: t('howToJoinMining'),
      answer: t('howToJoinMiningAnswer')
    }
  ];
  return (
    <div>
      {/* 钱包选择弹窗 */}
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* DeFi 标题部分 */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">DeFi</h1>
            <h2 className="text-xl mb-4">{t('LiquidityMiningPool')}</h2>
            <p className="text-gray-400">{t('joinNode')}</p>
          </div>
          <div className="relative">
            <img 
              src="/wkcy-DXzGYALG.png" 
              alt="Mining" 
              className="w-28 h-28"
            />
          </div>
        </div>
      </div>

      {/* 提醒框 */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 overflow-hidden relative">
        <div className="flex items-center relative">
          <span className="text-yellow-500 mr-2 shrink-0">🔔</span>
          <div className="overflow-hidden absolute left-12 right-4">
            <div className="flex items-center whitespace-nowrap animate-marquee">
              <span className="inline-block animate-[marquee_15s_linear_infinite]">{t('welcomeToJoinVIPMiningPool')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 数据统计 */}
      <div className="mb-6">
        <h3 className="text-center mb-4">{t('LiquidityMiningData')}</h3>
        <div className="space-y-4">
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t('totalProduction')}</span>
            <span>21653896.6236 USDT</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t('effectiveNodes')}</span>
            <span>41007</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t('participantNumber')}</span>
            <span>5134409</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t('userIncome')}</span>
            <span>410235.3072 USDT</span>
          </div>
        </div>
      </div>

      {/* VIP会员区域 */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-center text-xl mb-4">{t('vipMiningPool')}</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-yellow-500">{t('vipMiningActivity')}</span>
          <img src="/vcbg-BW6JVUa-.png" alt="mining" className="w-16 h-16" />
        </div>
        <p className="text-sm text-gray-400 mb-6">
          {t('vipMiningDescription')}
        </p>

        {/* 数量输入区域 */}
        <div className="mb-4 border-b border-[#2c3645]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400">{t('amount')}</span>
            <input 
              type="text" 
              className="w-1/2 ml-auto bg-gray-800 rounded p-3 text-white focus:outline-none text-sm"
              placeholder={t('enterStakingAmount')}
            />
          </div>
        </div>

        {/* 预计收入 */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{t('estimatedIncome')}</span>
            <span className="text-white">0.00 USDT</span>
          </div>
        </div>

        {/* 收益率 */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="text-green-500 text-xl">0%</span>
            <span className="text-gray-400 ml-2">USDT</span>
          </div>
          <p className="text-sm text-gray-400">
            {t('vipDoubleIncome')}
          </p>
        </div>

        {/* 加入按钮 */}
        <button className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold">
          {t('joinVipMining')}
        </button>
      </div>

      {/* 流动性采矿产出 */}
      <div className="mb-6">
        <h3 className="text-center text-xl mb-4">{t('home.LiquidityMiningOutput')}</h3>
        {/* 标题行 */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">{t('home.address')}</span>
          <span className="text-gray-400">{t('home.amount')}</span>
        </div>
        <div className="h-[360px] overflow-hidden relative">
          {/* 数据 */}
          <div className="animate-scroll-y">
            <div className="space-y-0.5">
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">T9ZLRkzh...BIMNFAKe</span>
                <span>155.76USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">0eFyCHsG...xP0WkbJZ</span>
                <span>2207.82USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">TQdDEigh...V86onSfR</span>
                <span>170.91USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">TamOJDBM...FtPcknzZ</span>
                <span>4346.67USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">T98CA34B...YzEQ12LJ</span>
                <span>808.80USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">TyvidHOY...jp74TqcP</span>
                <span>72.25USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">TjWoaB2P...FObTxsCN</span>
                <span>927.99USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">TsMxNLgo...AfcFU5TX</span>
                <span>738.59USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">0xcdxw9e...WhMuxm2</span>
                <span>223.95USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">TamOJDBM...FtPcknzZ</span>
                <span>4346.67USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">T98CA34B...YzEQ12LJ</span>
                <span>808.80USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">TyvidHOY...jp74TqcP</span>
                <span>72.25USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">TjWoaB2P...FObTxsCN</span>
                <span>927.99USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">TsMxNLgo...AfcFU5TX</span>
                <span>738.59USDT</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 p-3">
                <span className="text-gray-400">0xcdxw9e...WhMuxm2</span>
                <span>223.95USDT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="mb-6">
        <h3 className="text-xl mb-4 text-center">{t('home.faq')}</h3>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleItem(index)}
              >
                <span>{item.question}</span>
                <svg 
                  className={`w-4 h-4 text-gray-400 transform transition-transform duration-300 ${
                    expandedItems.includes(index) ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {expandedItems.includes(index) && (
                <div className="px-4 pb-4 text-gray-400">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 监管机构 */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-2">
          <h3 className="text-xl">{t('home.regulatoryAuthorities')}</h3>
        </div>
        <p className="text-center text-sm text-gray-400 mb-4">{t('home.globalRegulation')}</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#c5d1df] rounded-lg p-4 aspect-video">
            <img src="/下载.png" alt="Binance" className="w-full h-full object-contain" />
          </div>
          <div className="bg-[#c5d1df] rounded-lg p-4 aspect-video">
            <img src="/jg2-BuDQ9klk.png" alt="Binance" className="w-full h-full object-contain" />
          </div>
          <div className="bg-[#c5d1df] rounded-lg p-4 aspect-video">
            <img src="/Ak8LRfDH.png" alt="Binance" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* 合作平台 */}
      <div className="mb-10">
        <h3 className="text-xl mb-2 text-center">{t('home.cooperativePlatform')}</h3>
        <div className="grid grid-cols-2 gap-6 bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <img src="/hz1-GhDYdp3B.png" alt="Binance" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Binance</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz2-YHl_SqFU.png" alt="LBank" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">LBank</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz3-CeJ0Klg9.png" alt="Keaken" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Keaken</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz4-B2n-FwQS.png" alt="Gate.io" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Gate.io</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz5-70KQLU_G.png" alt="Okex" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Okex</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz6-DtnYgGg4.png" alt="Bitfinex" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Bitfinex</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;
