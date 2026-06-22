import {
  useSearchParams,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { Button, Result } from "antd";
import { LeftOutlined, HistoryOutlined } from "@ant-design/icons";

export interface LotteryContext {
  botId: string;
  botUserId: string;
}

const TITLES: Record<string, string> = {
  "/lottery/create": "创建抽奖",
  "/lottery/history": "抽奖记录",
};

const LotteryApp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const botId = searchParams.get("botId");
  const botUserId = searchParams.get("botUserId");
  const qs = `botId=${botId}&botUserId=${botUserId}`;

  if (!botId || !botUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Result
          status="error"
          title="参数错误"
          subTitle="请通过机器人主菜单打开此页面"
        />
      </div>
    );
  }

  const isHistory = location.pathname === "/lottery/history";
  const title = TITLES[location.pathname] ?? "抽奖";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 — 足够高的触摸区域，iOS 安全区适配 */}
      <div
        className="flex items-center justify-between bg-white border-b sticky top-0 z-10"
        style={{ padding: "0 12px", height: 52 }}
      >
        <div style={{ width: 72, display: "flex", alignItems: "center" }}>
          {isHistory && (
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={() => navigate(`/lottery/create?${qs}`)}
              style={{ fontSize: 15, padding: "0 4px" }}
            >
              返回
            </Button>
          )}
        </div>

        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: 0.3 }}>
          {title}
        </span>

        <div style={{ width: 72, display: "flex", justifyContent: "flex-end" }}>
          {!isHistory && (
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => navigate(`/lottery/history?${qs}`)}
              style={{ fontSize: 15, padding: "0 4px" }}
            >
              记录
            </Button>
          )}
        </div>
      </div>

      <Outlet context={{ botId, botUserId }} />
    </div>
  );
};

export default LotteryApp;
