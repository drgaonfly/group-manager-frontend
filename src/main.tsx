import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './i18n/index' // 引入 i18n 配置
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
  connectorsForWallets
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
        injectedWallet, // 这会支持包括 TronLink 在内的注入钱包
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
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
  },
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

// Render app with updated providers
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <TanstackProvider>
        <RainbowKitProvider theme={myTheme}>
          <RouterProvider router={router} />
        </RainbowKitProvider>
      </TanstackProvider>
    </WagmiProvider>
  </StrictMode>,
)
