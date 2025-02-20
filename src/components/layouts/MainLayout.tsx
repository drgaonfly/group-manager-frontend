import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WalletModal from '../WalletModal';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { storage } from '../../lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isCryptoMenuOpen, setIsCryptoMenuOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('ETH');
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const cryptoOptions = [
    { code: 'BSC', icon: '/hz1-GhDYdp3B.png' },
    { code: 'TRX', icon: '/etc2.png' },
    { code: 'ETH', icon: '/eth-D5Msimja.png' },
  ];

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

  const handleCryptoChange = (crypto: string) => {
    setSelectedCrypto(crypto);
    setIsCryptoMenuOpen(false);
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsLangMenuOpen(false);
  };

  const toggleLangMenu = () => {
    setIsLangMenuOpen(!isLangMenuOpen);
    if (!isLangMenuOpen) {
      setIsCryptoMenuOpen(false);
    }
  };

  const toggleCryptoMenu = () => {
    setIsCryptoMenuOpen(!isCryptoMenuOpen);
    if (!isCryptoMenuOpen) {
      setIsLangMenuOpen(false);
    }
  };

  // 处理钱包连接
  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);  // 只在内存中保存，不需要存储到 localStorage
  };

  // 处理退出登录
  const handleLogout = () => {
    setWalletAddress(null);
    storage.clearToken();  // 清除 jwt 和 refreshToken
    setIsLogoutModalOpen(false);
  };

  // 处理钱包按钮点击
  const handleWalletButtonClick = () => {
    if (walletAddress) {
      setIsLogoutModalOpen(true);
    } else {
      setIsWalletModalOpen(true);
    }
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
            {/* 加密货币选择下拉菜单 */}
            <div className="relative">
              <button
                className="flex items-center space-x-1 px-2 py-1 rounded bg-[#2a313d]"
                onClick={toggleCryptoMenu}
              >
                <img
                  src={cryptoOptions.find(crypto => crypto.code === selectedCrypto)?.icon}
                  alt={selectedCrypto}
                  className="w-5 h-5"
                />
                <span className="text-sm">{selectedCrypto}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isCryptoMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 加密货币下拉菜单 */}
              {isCryptoMenuOpen && (
                <div className="fixed left-0 right-0 top-[52px] bg-[#1e2633] shadow-lg">
                  {cryptoOptions.map((crypto) => (
                    <button
                      key={crypto.code}
                      className={`flex items-center w-full px-4 py-3 text-left hover:bg-gray-700 border-b border-gray-700 ${
                        selectedCrypto === crypto.code ? 'bg-gray-700' : ''
                      }`}
                      onClick={() => handleCryptoChange(crypto.code)}
                    >
                      <div className="flex items-center justify-between w-full px-4">
                        <div className="flex items-center">
                          <img src={crypto.icon} alt={crypto.code} className="w-5 h-5 mr-2" />
                          <span>{crypto.code}</span>
                        </div>
                        {selectedCrypto === crypto.code && (
                          <span className="text-yellow-500">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm"
              onClick={handleWalletButtonClick}
            >
              {walletAddress 
                ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
                : t('connectWallet')
              }
            </button>
          </div>
        </div>
      </div>

      {/* 钱包选择弹窗 */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />

      {/* 添加退出登录确认弹窗 */}
      {isLogoutModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={(e) => e.target === e.currentTarget && setIsLogoutModalOpen(false)}
        >
          <div className="bg-[#1e2633] p-6 rounded-lg shadow-xl mx-4 w-[90%] max-w-md">
            <h3 className="text-lg font-bold mb-4">{t('Logout')}</h3>
            <p className="mb-4">{t('Are you sure you want to disconnect your wallet?')}</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                {t('Cancel')}
              </button>
              <button
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleLogout}
              >
                {t('Disconnect')}
              </button>
            </div>
          </div>
        </div>
      )}

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