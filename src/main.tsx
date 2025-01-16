import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './components/Home'
import MiningPool from './components/MiningPool'
import RootLayout from './components/layouts/RootLayout'
import Service from './components/Serve'
import Invite from './components/Invite'
import User from './components/User'
import Message from './components/Message'
import Record from './components/Record'
import Bill from './components/Bill'

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
