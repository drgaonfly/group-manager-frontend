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

// 创建一个 client
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
