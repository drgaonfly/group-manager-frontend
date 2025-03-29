import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId, useConnect } from 'wagmi';
import { useLogin, LoginCredentials } from '../../lib/auth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { User } from '../../lib/api';
import { getInviteCode, clearInviteCode } from '../../utils/invite';

// USDT合约地址配置
const USDT_CONTRACT_ADDRESSES = {
  1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // ETH Mainnet USDT
  56: '0x55d398326f99059fF775485246999027B3197955', // BSC USDT
} as const;

interface MainLayoutProps {
  children: React.ReactNode;
}

// 定义错误响应类型
interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function MainLayout({ children }: MainLayoutProps) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  
  const { address, isConnected, connector: activeConnector } = useAccount();
  const { connect, connectors } = useConnect();

  // 在页面加载时自动重连上次的钱包
  useEffect(() => {
    const lastConnector = localStorage.getItem('lastConnector');
    
    // 如果有上次连接的钱包且当前未连接，则自动重连
    if (lastConnector && !isConnected) {
      const connector = connectors.find(c => c.id === lastConnector);
      if (connector) {
        connect({ connector });
      }
    }
  }, []);

  // 保存当前连接的钱包信息
  useEffect(() => {
    if (isConnected && activeConnector) {
      localStorage.setItem('lastConnector', activeConnector.id);
    } else if (!isConnected) {
      // 断开连接时清除相关token
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('initialLoginDone');
      toast.success(t('Toast.DisconnectedWallet'));
    }
  }, [isConnected, activeConnector, t]);

  const chainId = useChainId();
  
  // 修改为获取USDT余额
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: chainId,
    token: chainId ? USDT_CONTRACT_ADDRESSES[chainId as keyof typeof USDT_CONTRACT_ADDRESSES] : undefined
  });

  const queryClient = useQueryClient();
  const { mutate: login } = useLogin();

  // 处理登录逻辑的函数
  const handleLogin = useCallback(() => {
    if (!isConnected || !address) {
      return;
    }

    // // 检查是否是支持的网络
    // const isSupportedNetwork = chainId === 1 || chainId === 56;
    // if (!isSupportedNetwork) {
    //   localStorage.removeItem('token');
    //   localStorage.removeItem('refreshToken');
    //   queryClient.setQueryData(['authenticated-user'], null);
    //   toast.error(t('Toast.UnsupportedNetwork'));
    //   return;
    // }

    // // 如果已经有token，不需要重新登录
    // if (localStorage.getItem('token')) {
    //   return;
    // }

    console.log('Wallet Connected!');
    console.log('Wallet Address:', address);
    console.log('Current Chain ID:', chainId);
    
    // if (balanceLoading) {
    //   console.log('USDT Balance is loading...');
    //   return;
    // }

    console.log('USDT Balance:', balance?.formatted, 'USDT');
    
    const inviteCode = getInviteCode();
    console.log('邀请码:', inviteCode); 
    
    const loginData: LoginCredentials = {
      address: address,
      network: chainId === 1 ? 'ETH' : 'BSC',
      usdtBalance: Number(balance?.formatted || '0'),
      ...(inviteCode && { inviteCode: inviteCode })
    };

    login(
      loginData,
      {
        onSuccess: (data: User | null) => {
          if (data) {
            navigate('/');
            toast.success(t('Toast.LoginSuccessful'));
            queryClient.invalidateQueries({ queryKey: ['authenticated-user'] });
            clearInviteCode();
            // 使用一个标志来控制是否需要刷新
            // const needsRefresh = !localStorage.getItem('initialLoginDone');
            // if (needsRefresh) {
            //   localStorage.setItem('initialLoginDone', 'true');
            //   window.location.reload();
            // }
          } else {
            navigate('/');
          }
        },
        onError: (error: unknown) => {
          const errorResponse = error as ErrorResponse;
          const errorMessage =
            errorResponse.response?.data?.message ||
            'An error occurred while creating the order';
          toast.error(errorMessage);
        },
      }
    );
  }, [isConnected, address, chainId, balanceLoading, balance, login, navigate, t, queryClient]);

  // 监听网络切换
  const [previousChainId, setPreviousChainId] = useState<number | undefined>(chainId);
  useEffect(() => {
    if (previousChainId && chainId !== previousChainId && localStorage.getItem('token')) {
      console.log('检测到网络切换:', previousChainId, '->', chainId);
      console.log('当前网络类型:', chainId === 1 ? 'ETH主网' : chainId === 56 ? 'BSC主网' : '未知网络');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('initialLoginDone');
      queryClient.setQueryData(['authenticated-user'], null);
      toast.success(t('Toast.NetworkChanged'));
      // 触发重新登录
      handleLogin();
    }
    setPreviousChainId(chainId);
  }, [chainId, queryClient, t, handleLogin, previousChainId]);

  // 监听钱包连接状态和网络切换
  useEffect(() => {
    const shouldLogin = isConnected && 
      address && 
      !balanceLoading && 
      !localStorage.getItem('token');
    
    if (shouldLogin) {
      handleLogin();
    }
  }, [isConnected, address, chainId, handleLogin, balanceLoading]);

  const languages = [
    {
      code: 'en',
      label: 'English',
      flag: '/flags/1f1fa-1f1f8.png'
    },
    {
      code: 'zh',
      label: '简体中文',
      flag: '/flags/1f1e8-1f1f3.svg'
    },
    {
      code: 'zh-TW',
      label: '繁體中文',
      flag: '/flags/1f1e8-1f1f3.svg'
    },
    {
      code: 'ja',
      label: '日本語',
      flag: '/flags/1f1ef-1f1f5.svg'
    },
    {
      code: 'ko',
      label: '한국어',
      flag: '/flags/1f1f0-1f1f7.svg'
    },
    {
      code: 'it',
      label: 'Italiano',
      flag: '/flags/1f1ee-1f1f9.svg'
    },
    {
      code: 'fr',
      label: 'Français',
      flag: '/flags/1f1eb-1f1f7.svg'
    },
    {
      code: 'pt',
      label: 'Português',
      flag: '/flags/1f1f5-1f1f9.svg'
    },
    {
      code: 'ru',
      label: 'Русский',
      flag: '/flags/1f1f7-1f1fa.svg'
    },
    {
      code: 'ar',
      label: 'العربية',
      flag: '/flags/1f1f8-1f1e6.svg'
    },
    {
      code: 'hi',
      label: 'हिंदी',
      flag: '/flags/1f1ee-1f1f3.svg'
    },
    {
      code: 'bg',
      label: 'Български',
      flag: '/flags/1f1e7-1f1ec.svg'
    },
    {
      code: 'es',
      label: 'Español',
      flag: '/flags/1f1ea-1f1f8.svg'
    },
    {
      code: 'de',
      label: 'Deutsch',
      flag: '/flags/1f1e9-1f1ea.svg'
    }
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setIsLangMenuOpen(false);
  };

  const toggleLangMenu = () => {
    setIsLangMenuOpen(!isLangMenuOpen);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 z-50 px-4 py-3">
        <div className="flex justify-between items-center">
          {/* 语言选择下拉菜单 */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 px-4 py-2 rounded"
              onClick={toggleLangMenu}
            >
              <img
                src={languages.find(lang => lang.code === i18n.language)?.flag}
                alt=""
                className="w-5 h-5 object-contain"
              />
              <span className="ml-2">{languages.find(lang => lang.code === i18n.language)?.label}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 语言下拉菜单 */}
            {isLangMenuOpen && (
              <div className="absolute top-full left-0 mt-1 bg-[#1e2633] rounded shadow-lg grid grid-cols-2 min-w-[305px]">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-700 ${
                      i18n.language === lang.code ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <img src={lang.flag} alt="" className="w-5 h-5 object-contain" />
                    <span className="ml-2">{lang.label}</span>
                    {i18n.language === lang.code && (
                      <span className="ml-auto text-yellow-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <ConnectButton 
              chainStatus="icon"
              showBalance={{
                smallScreen: true,
                largeScreen: true
              }}
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />
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
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div>
              <img
                src={location.pathname === '/' ? '/home1.png' : '/home.png'}
                alt="home"
                className="w-8 h-8"
              />
            </div>
            <span className={`text-xs ${location.pathname === '/' ? 'text-[#f0b90b]' : ''} mt-1`}>
              {t('Home')}
            </span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/mining-pool')}
          >
            <img
              src={location.pathname === '/mining-pool' ? '/pool1.png' : '/pool.png'}
              alt="mining"
              className="w-8 h-8"
            />
            <span className={`text-xs ${location.pathname === '/mining-pool' ? 'text-[#f0b90b]' : ''} mt-1`}>
              {t('miningPool')}
            </span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/service')}
          >
            <div>
              <img
                src={location.pathname === '/service' ? '/serve1.png' : '/serve.png'}
                alt="service"
                className="w-8 h-8"
              />
            </div>
            <span className={`text-xs ${location.pathname === '/service' ? 'text-[#f0b90b]' : ''} mt-1`}>
              {t('service')}
            </span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/invite')}
          >
            <div>
              <img
                src={location.pathname === '/invite' ? '/invite1.png' : '/invite.png'}
                alt="invite"
                className="w-8 h-8"
              />
            </div>
            <span className={`text-xs ${location.pathname === '/invite' ? 'text-[#f0b90b]' : ''} mt-1`}>
              {t('Invite')}
            </span>
          </div>
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => navigate('/user')}
          >
            <div>
              <img
                src={location.pathname === '/user' ? '/user1.png' : '/user.png'}
                alt="user"
                className="w-8 h-8"
              />
            </div>
            <span className={`text-xs ${location.pathname === '/user' ? 'text-[#f0b90b]' : ''} mt-1`}>
              {t('user')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;