import { useState, useEffect } from 'react';
// import WalletModal from './WalletModal';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import i18next from 'i18next';
import { useQuery } from '@tanstack/react-query';
import Rates from '../components/Rates';
import Rate from '../components/Rate';

// 定义 FAQ 项目的接口
interface FAQItem {
  title: string;
  content: string;
  lang: string;
}

// 修改接口类型定义以匹配实际数据格式
interface MiningData {
  totalOutput: number;      // 总产量
  validNodes: number;       // 有效节点
  participants: number;     // 参与人数
  userEarnings: number;    // 用户收益
  createdAt: string;
  updatedAt: string;
  _id: string;
  __v: number;
}

// 更新 Notice 接口以匹配实际数据结构
interface Notice {
  _id: string;
  id: string;
  title: string;
  content: string;
  type: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// 定义接口数据类型
interface MiningOutput {
  id: string;
  address: string;
  amount: string;
  createdAt: string;
  usdtNumber: number;
}

// 添加合作平台接口类型
interface Partnership {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
}

// 添加监管机构接口类型
interface RegulationAgency {
  id: string;
  name: string;
  logoUrl: string;
}

function Home() {
  const { t } = useTranslation();
  // const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // // 首次加载时显示钱包模块框
  // useEffect(() => {
  //   setIsWalletModalOpen(true);
  // }, []); // 空依赖数组确保只在首次渲染时执行

  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  // const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [currentLang, setCurrentLang] = useState(i18next.language);

  // 修改采矿数据状态，不设置初始值
  const [miningData, setMiningData] = useState<MiningData | null>(null);

  // Replace FAQ fetch with useQuery
  const { data: faqData } = useQuery({
    queryKey: ['faq', currentLang],
    queryFn: async () => {
      const response = await axiosInstance.get('/questions');
      const items = response.data.data || [];
      return items.filter((item: FAQItem) => item.lang === currentLang);
    }
  });

  // Replace mining data fetch with useQuery
  const { data: miningDataQuery } = useQuery({
    queryKey: ['miningData'],
    queryFn: async () => {
      const response = await axiosInstance.get('/mining-data');
      return response.data.data[0];
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // 获取通知数据，明确指定返回类型为 Notice[]
  const { data: notices } = useQuery<Notice[]>({
    queryKey: ['notices', currentLang],
    queryFn: async () => {
      const response = await axiosInstance.get('/notices');
      return response.data.data || [];
    }
  });

  // 获取挖矿产出数据
  const { data: miningOutputs } = useQuery<MiningOutput[]>({
    queryKey: ['mining-outputs'],
    queryFn: async () => {
      const response = await axiosInstance.get('/mining-outputs/random');
      return response.data.data || [];
    }
  });
  
  // 获取合作平台数据
  const { data: partnerships } = useQuery<Partnership[]>({
    queryKey: ['partnerships'],
    queryFn: async () => {
      const response = await axiosInstance.get('/partnerships');
      return response.data.data || [];
    }
  });

  // 获取监管机构数据
  const { data: regulationAgencies } = useQuery<RegulationAgency[]>({
    queryKey: ['regulation-agencies'],
    queryFn: async () => {
      const response = await axiosInstance.get('/regulation-agencies');
      return response.data.data || [];
    }
  });

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng);
    };
    
    i18next.on('languageChanged', handleLanguageChange);
    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // 常见问题模块切换展开/收起状态
  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  useEffect(() => {
    if (miningDataQuery) {
      setMiningData(miningDataQuery);
    }
  }, [miningDataQuery]);

  return (
    <div>
      {/* 钱包选择弹窗 */}
      {/* <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      /> */}

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

      {/* 通知 */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 overflow-hidden relative">
        <div className="flex items-center relative">
          <span className="text-yellow-500 mr-2 shrink-0">🔔</span>
          <div className="overflow-hidden absolute left-12 right-4">
            <div className="flex items-center whitespace-nowrap animate-marquee">
              {notices?.map((notice: Notice, index: number) => (
                <span 
                  key={notice._id} 
                  className="inline-block animate-[marquee_15s_linear_infinite]"
                  style={{ marginRight: index < notices.length - 1 ? '2rem' : '0' }}
                >
                  {notice.content}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 收益展示模块 */}
      <div className="mb-6 bg-[#1a1f2e] rounded-lg p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              0.0000 <span className="text-gray-400">ETH</span>
            </span>
          </div>
          <button className="bg-[#EAB308] text-white px-6 py-2 rounded-lg">
            {t('home.join')}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-4">
          <div>
            <div className="text-gray-400 text-xs mb-1">{t('home.profitPool')}</div>
            <div className="font-medium text-xs">
              11359.55 ETH
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">{t('home.playerIncome')}</div>
            <div className="font-medium text-green-500 text-xs">
              963.61 %
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">{t('home.ethExchange')}</div>
            <div className="font-medium text-xs">
              3893.9 USDT C
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-400 text-xs mb-2">{t('home.walletBalance')}:</div>
            <div className="flex items-center justify-between bg-[#151923] rounded-lg px-4 py-2">
              <span className="text-sm">0.00 USDT</span>
              <button className="text-gray-400 bg-[#1F2937] rounded-full p-1 hover:bg-[#374151]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-2">{t('home.stakingAPY')}:</div>
            <div className="flex items-center justify-between bg-[#151923] rounded-lg px-4 py-2">
              <span className="text-sm bg-[#6366f1] text-white px-4 py-1 rounded-lg">963.61 %</span>
              <button className="text-gray-400 bg-[#1F2937] rounded-full p-1 hover:bg-[#374151]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 流动性采矿数据 */}
      <h3 className="text-center mb-2 text-xl">{t('LiquidityMiningData')}</h3>
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <div className="space-y-4">
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t('totalProduction')}</span>
            <span>{miningData?.totalOutput} USDT</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t('effectiveNodes')}</span>
            <span>{miningData?.validNodes}</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t('participantNumber')}</span>
            <span>{miningData?.participants}</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t('userIncome')}</span>
            <span>{miningData?.userEarnings} USDT</span>
          </div>
        </div>
      </div>



      {/* VIP会员区域 */}
      <h3 className="text-center text-xl mb-2">{t('vipMiningPool')}</h3>
      <div className="bg-gradient-to-r from-[#1a1f2e] to-[#181e2b] p-4 py-2 rounded-lg mb-4 border border-[#2c3645]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-yellow-500 text-lg font-medium">{t('vipMiningActivity')}</span>
            <p className="text-sm text-gray-400 mt-2">
              {t('vipMiningDescription')}
            </p>
          </div>
          <img src="/vcbg-BW6JVUa-.png" alt="mining" className="w-24 h-24 object-contain" />
        </div>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        {/* 数量输入区域 */}
        <div className="mb-4 border-b border-[#2c3645]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400">{t('amount')}</span>
            <input 
              type="text" 
              className="w-1/2 ml-auto bg-gray-800 rounded p-3 text-white focus:outline-none text-sm text-right"
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
        <h3 className="text-center text-xl">{t('home.LiquidityMiningOutput')}</h3>
        {/* 标题行 */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">{t('home.address')}</span>
          <span className="text-gray-400">{t('home.amount')}</span>
        </div>
        <div className="h-[360px] overflow-hidden relative">
          {/* 数据滚动容器 */}
          <div 
            className="animate-scroll-y absolute w-full"
            style={{ 
              willChange: 'transform',
              transform: 'translate3d(0, 0, 0)'
            }}
          >
            {/* 渲染数据 */}
            <div className="space-y-0.5">
              {miningOutputs?.map((item) => (
                <div 
                  key={item.id}
                  className="flex justify-between items-center bg-gray-800 p-3"
                >
                  <span className="text-gray-400">
                    {item.address.slice(0, 8)}...{item.address.slice(-8)}
                  </span>
                  <span>{item.usdtNumber}USDT</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 两个模 块*/}
      <Rates />

      {/* 常见问题 */}
      <div className="mb-6">
        <h3 className="text-xl mb-3 text-center">{t('home.faq')}</h3>
        <div className="space-y-3">
          {Array.isArray(faqData) && faqData.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleItem(index)}
              >
                <span>{item.title}</span>
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
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
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
          {regulationAgencies?.map((agency) => (
            <div 
              key={agency.id} 
              className="bg-[#c5d1df] rounded-lg p-4 aspect-video"
            >
              <img 
                src={agency.logoUrl} 
                alt={agency.name} 
                className="w-full h-full object-contain" 
              />
            </div>
          ))}
        </div>
      </div>

      {/* 合作平台 */}
      <div className="mb-10">
        <h3 className="text-xl mb-2 text-center">{t('serves.cooperativePlatform')}</h3>
        <div className="grid grid-cols-2 gap-6 bg-gray-800 p-4 rounded-lg">
          {partnerships?.map((partner) => (
            <div key={partner.id} className="flex items-center space-x-3">
              <a 
                href={partner.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center space-x-3"
              >
                <img src={partner.logoUrl} alt={partner.name} className="w-8 h-8" />
                <span className="text-base text-[#656a6e] font-bold">{partner.name}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home;
