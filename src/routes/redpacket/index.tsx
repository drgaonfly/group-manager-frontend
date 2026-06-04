import {
  useSearchParams,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { Button, Result } from "antd";
import { LeftOutlined, HistoryOutlined } from "@ant-design/icons";

export interface RedPacketContext {
  botId: string;
  botUserId: string;
}

// 每个子页面的顶部标题配置
const TITLES: Record<string, string> = {
  "/redpacket/create": "发红包",
  "/redpacket/history": "红包记录",
};

const RedPacketApp = () => {
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

  const isHistory = location.pathname === "/redpacket/history";
  const title = TITLES[location.pathname] ?? "红包";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-10">
        {isHistory ? (
          <Button
            type="link"
            icon={<LeftOutlined />}
            size="small"
            onClick={() => navigate(`/redpacket/create?${qs}`)}
          >
            返回
          </Button>
        ) : (
          <div style={{ width: 60 }} />
        )}

        <span className="font-bold text-base">{title}</span>

        {isHistory ? (
          <div style={{ width: 60 }} />
        ) : (
          <Button
            type="link"
            icon={<HistoryOutlined />}
            size="small"
            onClick={() => navigate(`/redpacket/history?${qs}`)}
          >
            记录
          </Button>
        )}
      </div>

      {/* 子页面内容 */}
      <Outlet context={{ botId, botUserId }} />
    </div>
  );
};

export default RedPacketApp;
