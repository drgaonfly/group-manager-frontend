import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { storage } from '../../lib/utils';
import axios from 'axios';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId } from 'wagmi';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });

  const languages = [
    {
      code: 'zh',
      label: '简体中文',
      flag: '/flags/1f1e8-1f1f3.svg'
    },
    {
      code: 'en',
      label: 'English',
      flag: '/flags/1f1fa-1f1f8.png'
    }
  ];

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = storage.getToken();
      console.log('Current token:', token);

      if (token) {
        try {
          const response = await axios.get('/customer-auth/profile');
          console.log('Profile response:', response.data);

          if (response.data?.user?.address) {
            // This should be handled by RainbowKit
          } else {
            console.log('No address in response:', response.data);
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          storage.clearToken();
        }
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      console.log('Wallet Connected!');
      console.log('Wallet Address:', address);
      console.log('Current Chain ID:', chainId);
      console.log('Balance:', balance?.formatted, balance?.symbol);

      // 修改登录接口路径
      const sendWalletInfo = async () => {
        try {
          const response = await axios.post('/api/customer-auth/login', {  // 修改这里，添加 /api 前缀
            address: address,
            network: chainId === 1 ? 'ETH' : 
                    chainId === 56 ? 'BSC' : 'ETH',
            usdtBalance: Number(balance?.formatted || '0')
          });
          
          console.log('Wallet info sent to backend:', response.data);

          if (response.data.jwt) {
            storage.setToken(response.data.jwt);
          }
          if (response.data.refreshToken) {
            storage.setRefreshToken(response.data.refreshToken);
          }
        } catch (error) {
          console.error('Error sending wallet info to backend:', error);
        }
      };

      sendWalletInfo();
    }
  }, [isConnected, address, chainId, balance]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
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
              <div className="absolute top-full left-0 mt-1 bg-[#1e2633] rounded shadow-lg">
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
              {t('Home')}
            </span>
          </div>
          <div
            className="text-center cursor-pointer"
            onClick={() => navigate('/mining-pool')}
          >
            <img
              src={location.pathname === '/mining-pool' ? '/pool1.png' : '/pool.png'}
              alt="mining"
              className="w-8 h-8"
            />
            <span className={`text-xs ${location.pathname === '/mining-pool' ? 'text-[#f0b90b]' : ''}`}>
              {t('miningPool')}
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
              {t('service')}
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
              {t('Invite')}
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
              {t('user')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;