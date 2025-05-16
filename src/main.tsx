import TanstackProvider from "./providers/TanstackProvider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home";
import Warn from "./routes/Warn";
import "./i18n";

// 创建路由配置
const router = createBrowserRouter([
  {
    path: "/:query",
    element: <Home />,
  },
  {
    path: "/",
    element: <Warn />,
  },
]);

// 渲染应用程序
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TanstackProvider>
      <RouterProvider router={router} />
    </TanstackProvider>
  </StrictMode>,
);
