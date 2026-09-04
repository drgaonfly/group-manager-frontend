import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Col,
  Layout,
  Row,
  Space,
  Tag,
  message,
  Skeleton,
} from "antd";
import {
  RobotOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import GroupFeaturesModal from "./GroupFeatureManager/GroupFeaturesModal";
import ChannelFeaturesModal from "./GroupFeatureManager/ChannelFeaturesModal";

const { Header, Content } = Layout;

const BotDetail = () => {
  const { botId, botUserId } = useParams<{ botId: string; botUserId: string }>();
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"groups" | "channels">("groups");

  // 功能管理 Modal 状态
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [groupFeaturesOpen, setGroupFeaturesOpen] = useState(false);
  const [channelFeaturesOpen, setChannelFeaturesOpen] = useState(false);

  // 当前用户信息（从 localStorage 或 API 获取）
  const [currentUser, setCurrentUser] = useState<any>(null);

  const loadBot = async () => {
    if (!botId || !botUserId) return;
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_API_URL;

      // console.log('botId', botId)
      // console.log('botUserId', botUserId)

      // 调用公开接口
      const res = await axios.get(
        `${backendUrl}/public/bots/${botId}/${botUserId}`
      );


      const responseData = res.data?.data ;

  

      setBot(responseData.bot);
      
      setCurrentUser(responseData.proxyUser);

    } catch (err: any) {
      message.error(err?.response?.data?.message ?? "加载失败");
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBot();
  }, [botId, botUserId]);

  const allGroups: any[] = (bot?.groups || []).filter(
    (g: any) => g.type !== "channel",
  );
  const allChannels: any[] = (bot?.groups || []).filter(
    (g: any) => g.type === "channel",
  );
  const groups = allGroups;
  const channels = allChannels;

  // console.log('res bot', bot)

  // console.log('res proxyUser', currentUser)

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header className="bg-white px-4 sm:px-6 flex items-center gap-3 shadow-sm sticky top-0 z-100">
        <div className="w-px h-5 bg-gray-200" />
        <RobotOutlined className="text-blue-500 text-lg" />
        <span className="text-base sm:text-lg font-semibold text-gray-800 truncate flex-1">
          {loading
            ? "机器人详情"
            : bot
              ? `${bot.botName || bot.userName}`
              : "机器人不存在"}
        </span>
        {bot && (
          <Badge
            status={bot.isOnline ? "success" : "default"}
            text={bot.isOnline ? "在线" : "离线"}
          />
        )}
      </Header>

      <Content className="p-4 sm:p-6 w-full">
        {loading ? (
          <Card>
            <Skeleton active paragraph={{ rows: 5 }} />
          </Card>
        ) : !bot ? (
          <Card>
            <div className="text-center py-20 text-gray-400">机器人不存在</div>
          </Card>
        ) : (
          <Space direction="vertical" size={8} className="w-full">
            {/* 统计卡片 */}
            <Row gutter={[12, 12]}>
              {[
                {
                  key: "groups",
                  label: "群组数",
                  value: groups.length,
                  icon: <TeamOutlined />,
                  color: "#1677ff",
                  bg: activeTab === "groups" ? "#bae0ff" : "#e6f4ff",
                  borderColor: activeTab === "groups" ? "#1677ff" : "#1677ff22",
                },
                {
                  key: "channels",
                  label: "频道数",
                  value: channels.length,
                  icon: <TeamOutlined />,
                  color: "#722ed1",
                  bg: activeTab === "channels" ? "#d8adf0" : "#f9f0ff",
                  borderColor:
                    activeTab === "channels" ? "#722ed1" : "#722ed122",
                },
              ].map((s) => (
                <Col xs={12} sm={6} key={s.key}>
                  <div
                    className="rounded-lg p-3.5 sm:p-4 flex items-center gap-2.5 sm:gap-3 cursor-pointer transition-all hover:shadow-md"
                    style={{
                      background: s.bg,
                      border: `1px solid ${s.borderColor}`,
                    }}
                    onClick={() => {
                      if (s.key === "groups") setActiveTab("groups");
                      if (s.key === "channels") setActiveTab("channels");
                    }}
                  >
                    <div
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                      style={{ background: `${s.color}18`, color: s.color }}
                    >
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xl sm:text-2xl font-bold leading-tight"
                        style={{ color: s.color }}
                      >
                        {s.value}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {s.label}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* 群组/频道列表 */}
            <Card
              title={
                <Space>
                  <TeamOutlined
                    className={
                      activeTab === "groups"
                        ? "text-blue-500"
                        : "text-purple-500"
                    }
                  />
                  {activeTab === "groups" ? "群组列表" : "频道列表"}
                  <Tag color={activeTab === "groups" ? "blue" : "purple"}>
                    {activeTab === "groups" ? groups.length : channels.length}
                  </Tag>
                </Space>
              }
              className="overflow-hidden"
            >
              <div className="space-y-3">
                {(activeTab === "groups" ? groups : channels).map(
                  (record: any) => (
                    <div
                      key={record._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-800 truncate">
                            {record.title}
                          </h3>
                          {record.username && (
                            <p className="text-sm text-gray-500">
                              @{record.username}
                            </p>
                          )}
                        </div>
                        <Tag
                          color={activeTab === "groups" ? "blue" : "purple"}
                          className="ml-2"
                        >
                          {record.type}
                        </Tag>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-gray-500">
                          <span className="font-medium">
                            {record.memberCount ?? 0}
                          </span>{" "}
                          成员
                        </span>
                        <Button
                          type="primary"
                          size="small"
                          icon={<SettingOutlined />}
                          onClick={() => {
                            if (activeTab === "groups") {
                              setSelectedGroup(record);
                              setGroupFeaturesOpen(true);
                            } else {
                              setSelectedChannel(record);
                              setChannelFeaturesOpen(true);
                            }
                          }}
                        >
                          管理
                        </Button>
                      </div>
                    </div>
                  ),
                )}
                {(activeTab === "groups" ? groups : channels).length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    {activeTab === "groups"
                      ? "该机器人暂无群组"
                      : "该机器人暂无频道"}
                  </div>
                )}
              </div>
            </Card>
          </Space>
        )}
      </Content>

      {/* 群组功能管理 Modal */}
      {selectedGroup && (
        <GroupFeaturesModal
          open={groupFeaturesOpen}
          onClose={() => {
            setGroupFeaturesOpen(false);
            setSelectedGroup(null);
          }}
          bot={bot}
          group={selectedGroup}
          currentUser={currentUser}
        />
      )}

      {/* 频道功能管理 Modal */}
      {selectedChannel && (
        <ChannelFeaturesModal
          open={channelFeaturesOpen}
          onClose={() => {
            setChannelFeaturesOpen(false);
            setSelectedChannel(null);
          }}
          bot={bot}
          channel={selectedChannel}
          currentUser={currentUser}
        />
      )}
    </Layout>
  );
};

export default BotDetail;
