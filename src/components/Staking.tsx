import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../lib/api';

interface StakingProps {
  isOpen: boolean;
  onClose: () => void;
}

function Staking({ isOpen, onClose }: StakingProps) {
  const [amount, setAmount] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // 用户信息查询
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    retry: 1,
  });

  // 处理动画状态
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000); // 增加退出动画时间
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // 处理质押提交
  const handleStake = () => {
    console.log('Staking amount:', amount);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-1000 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 背景遮罩 - 使用渐进式模糊效果 */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isOpen ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
          backdropFilter: isOpen ? 'blur(5px)' : 'blur(0px)'
        }}
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-[#1a1f2e] rounded-t-3xl transform will-change-transform"
        style={{
          transform: `translateY(${isOpen ? '0%' : '100%'}) scale(${isOpen ? '1' : '0.95'})`,
          opacity: isOpen ? '1' : '0',
          transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
          minHeight: '280px',
          padding: '24px 16px',
        }}
      >
        {/* 头部装饰条 */}
        <div 
          className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-gray-600/50 transition-all duration-1000"
          style={{
            transform: `translate(-50%, ${isOpen ? '0' : '100%'})`,
            opacity: isOpen ? 0.5 : 0
          }}
        />

        {/* 头部 */}
        <div 
          className="flex justify-between items-center mb-6 mt-4 transition-all duration-1000 delay-200"
          style={{
            transform: `translateY(${isOpen ? '0' : '20px'})`,
            opacity: isOpen ? 1 : 0
          }}
        >
          <h3 className="text-xl font-semibold text-white">质押 USDT</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div 
          className="space-y-4"
          style={{
            transition: 'all 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
            transform: `translateY(${isOpen ? '0' : '40px'})`,
            opacity: isOpen ? 1 : 0,
            transitionDelay: '300ms'
          }}
        >
          {/* 余额显示 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">钱包余额</span>
            <span className="text-white">
              {isLoading ? (
                <span className="text-gray-400">加载中...</span>
              ) : (
                `${userProfile?.user?.usdtBalance?.toFixed(2) || '0.00'} USDT`
              )}
            </span>
          </div>

          {/* 输入金额 */}
          <div className="bg-[#151923] rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">质押数量</span>
              <button className="text-[#6366f1] text-sm transition-colors hover:text-[#5355d1] bg-[#6366f1]/10 px-2 py-1 rounded">最大</button>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                value={amount}
                onChange={handleInputChange}
                className="w-full bg-transparent text-2xl text-white outline-none"
                placeholder="0.00"
              />
              <span className="text-white ml-2">USDT</span>
            </div>
          </div>

          {/* 确认按钮 */}
          <button
            onClick={handleStake}
            className="w-full bg-[#6366f1] text-white font-bold py-4 rounded-lg transform transition-all duration-300 hover:bg-[#5355d1] hover:shadow-lg active:scale-[0.98]"
          >
            确认质押
          </button>
        </div>
      </div>
    </div>
  );
}

export default Staking;
