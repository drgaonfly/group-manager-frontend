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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './utils/axios'
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { mainnet, bsc, polygon } from 'wagmi/chains'
import {http } from 'wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const projectId = '53c1015715e79435548ffbb946b55315' // Get from WalletConnect Cloud

// Create wagmi config with default RainbowKit configuration
const config = getDefaultConfig({
  appName: 'mev',
  projectId: projectId,
  chains: [mainnet, bsc, polygon],
  ssr: true, // Enable if using server-side rendering
  transports: {
    [mainnet.id]: http('https://eth-mainnet.alchemyapi.io/v2/YOUR-API-KEY'),
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
    [polygon.id]: http('https://polygon-rpc.com'),
  },
});

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
    path: '/record',
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

// Create query client
const queryClient = new QueryClient();

// Render app with updated providers
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <RouterProvider router={router} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
