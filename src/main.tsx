import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './i18n/index' // 引入 i18n 配置
import i18n from 'i18next' // 添加 i18next 导入
import Home from './routes/Home'
import MiningPool from './routes/MiningPool'
import RootLayout from './components/layouts/RootLayout'
import Service from './routes/Serve'
import Invite from './routes/Invite'
import User from './routes/User'
import Message from './routes/Message'
import Record from './routes/Record'
import Bill from './routes/Bill'
import UserIncome from './routes/UserIncome'
import TeamIncome from './routes/TeamIncome'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import merge from 'lodash.merge'
import {
  RainbowKitProvider,
  darkTheme,
  Theme,
  connectorsForWallets,
  Locale
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { mainnet, bsc, polygon } from 'wagmi/chains'
import { http } from 'wagmi'
import '@rainbow-me/rainbowkit/styles.css'
import {
  metaMaskWallet,
  tokenPocketWallet,
  trustWallet,
  walletConnectWallet,
  injectedWallet
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig } from 'wagmi'
import { createStorage } from 'wagmi'

import TanstackProvider from './providers/TanstackProvider';

const projectId = '53c1015715e79435548ffbb946b55315' // Get from WalletConnect Cloud

// 先创建 connectors
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        tokenPocketWallet,
        trustWallet,
        injectedWallet,
        walletConnectWallet
      ]
    }
  ],
  {
    appName: 'MEV Bot',
    projectId: projectId
  }
)

// 使用 createConfig 而不是 getDefaultConfig
const config = createConfig({
  connectors,
  chains: [mainnet, bsc, polygon],
  transports: {
    [mainnet.id]: http('https://ethereum.publicnode.com'),
    [bsc.id]: http('https://bsc-dataseed1.binance.org'),
    [polygon.id]: http('https://polygon-rpc.com'),
  },
  storage: createStorage({ storage: window.localStorage }), // 添加持久化存储
})

// 创建自定义主题
const myTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#f0b90b',
    accentColorForeground: '#000000',
    connectButtonBackground: '#1a1f2e',
    connectButtonInnerBackground: '#1a1f2e',
    connectButtonText: '#ffffff',
    modalBackground: '#1a1f2e',
    modalText: '#ffffff',
    modalTextSecondary: '#9ca3af',
    actionButtonBorder: '#2c3645',
    actionButtonBorderMobile: '#2c3645',
    menuItemBackground: '#1a1f2e',
    generalBorder: '#2c3645',
    generalBorderDim: '#2c3645',
    closeButton: '#9ca3af',
    closeButtonBackground: '#1f2937'
  },
  radii: {
    connectButton: '8px',
    modal: '12px',
    menuButton: '8px'
  }
} as Theme);

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/mining-pool',
        element: <MiningPool />
      },
      {
        path: '/service',
        element: <Service />
      },
      {
        path: '/invite',
        element: <Invite />
      },
      {
        path: '/user',
        element: <User />
      },
    ]
  },
  {
    path: '/message',
    element: <Message />
  },
  {
    path: '/record/:userId',
    element: <Record />
  },
  {
    path: '/bill',
    element: <Bill />
  },
  {
    path: '/user/income',
    element: <UserIncome />
  },
  {
    path: 'user/teams',
    element: <TeamIncome />
  }
])

// 添加语言映射函数
const getRainbowKitLocale = (i18nLang: string): Locale => {
  switch (i18nLang) {
    case 'zh':
      return 'zh-CN'
    case 'en':
      return 'en-US'
    case 'zh-TW':
      return 'zh-TW'
    case 'ja':
      return 'ja-JP'
    case 'ko':
      return 'ko-KR' as Locale
    case 'it':
      return 'it-IT' as Locale
    case 'fr':
      return 'fr-FR' as Locale
    default:
      return 'en-US' as Locale
  }
}

// 创建包装组件来处理语言变化
const AppWithLocale = () => {
  const [locale, setLocale] = useState<Locale>(getRainbowKitLocale(i18n.language));

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLocale(getRainbowKitLocale(lng));
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <TanstackProvider>
        <RainbowKitProvider theme={myTheme} locale={locale}>
          <RouterProvider router={router} />
        </RainbowKitProvider>
      </TanstackProvider>
    </WagmiProvider>
  );
};

// 使用更新的提供程序渲染应用程序
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithLocale />
  </StrictMode>,
)