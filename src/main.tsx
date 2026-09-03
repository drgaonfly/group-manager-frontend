import TanstackProvider from "./providers/TanstackProvider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home";
import Warn from "./routes/Warn";
import WebAppLogin from "./routes/WebAppLogin";
import Bot from "./routes/Bot";
import "./i18n";
import "./style/index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/warn",
    element: <Warn />,
  },
  {
    path: "/webapp/login",
    element: <WebAppLogin />,
  },
  {
    path: "/login",
    element: <WebAppLogin />,
  },
  {
    path: "/bots/:id",
    element: <Bot />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TanstackProvider>
      <RouterProvider router={router} />
    </TanstackProvider>
  </StrictMode>,
);
