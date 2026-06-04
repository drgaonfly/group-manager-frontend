import TanstackProvider from "./providers/TanstackProvider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home";
import Warn from "./routes/Warn";
import LotteryCreate from "./routes/LotteryCreate";
import RedPacketApp from "./routes/redpacket";
import RedPacketCreate from "./routes/redpacket/Create";
import RedPacketHistory from "./routes/redpacket/history";
import TeachingApp from "./routes/teaching";
import "./i18n";

const router = createBrowserRouter([
  {
    path: "/lottery/create",
    element: <LotteryCreate />,
  },
  {
    path: "/redpacket",
    element: <RedPacketApp />,
    children: [
      { path: "create", element: <RedPacketCreate /> },
      { path: "history", element: <RedPacketHistory /> },
    ],
  },
  {
    path: "/teaching",
    element: <TeachingApp />,
  },
  {
    path: "/:query",
    element: <Home />,
  },
  {
    path: "/",
    element: <Warn />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TanstackProvider>
      <RouterProvider router={router} />
    </TanstackProvider>
  </StrictMode>,
);
