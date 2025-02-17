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
      }
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
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
