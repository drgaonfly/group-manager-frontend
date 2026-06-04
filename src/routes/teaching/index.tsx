import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Result } from "antd";
import TeacherList from "./TeacherList";
import RegisterTeacher from "./RegisterTeacher";
import WriteReview from "./WriteReview";
import MyProfile from "./MyProfile";

// ── 底部导航 Tab 定义 ─────────────────────────────────────────────
const TABS = [
  { key: "list", label: "老师", icon: "📋" },
  { key: "register", label: "入驻", icon: "📝" },
  { key: "review", label: "写车评", icon: "✍️" },
  { key: "profile", label: "我的", icon: "👤" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TeachingApp = () => {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get("botId");
  const botUserId = searchParams.get("botUserId");
  const [activeTab, setActiveTab] = useState<TabKey>("list");

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

  const renderContent = () => {
    switch (activeTab) {
      case "list":
        return <TeacherList botId={botId} botUserId={botUserId} />;
      case "register":
        return <RegisterTeacher botId={botId} botUserId={botUserId} />;
      case "review":
        return <WriteReview botId={botId} botUserId={botUserId} />;
      case "profile":
        return <MyProfile botId={botId} botUserId={botUserId} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto pb-16">{renderContent()}</div>

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              activeTab === tab.key
                ? "text-blue-500"
                : "text-gray-400 active:bg-gray-50"
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 h-0.5 w-8 bg-blue-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TeachingApp;
