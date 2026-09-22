import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Col,
  Input,
  Layout,
  Row,
  Space,
  Tag,
  message,
  Skeleton,
  Pagination,
} from "antd";
import {
  RobotOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import GroupFeaturesModal from "./GroupFeatureManager/GroupFeaturesModal";
import ChannelFeaturesModal from "./GroupFeatureManager/ChannelFeaturesModal";

const { Header, Content } = Layout;

const BotDetail = () => {
  const { botId, botUserId } = useParams<{
    botId: string;
    botUserId: string;
  }>();

  const [bot, setBot] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [stats, setStats] = useState({ groupCount: 0, channelCount: 0 });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"groups" | "channels">("groups");
  const [searchText, setSearchText] = useState("");

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 功能管理 Modal 状态
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [groupFeaturesOpen, setGroupFeaturesOpen] = useState(false);
  const [channelFeaturesOpen, setChannelFeaturesOpen] = useState(false);

  // 当前用户信息
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 加载数据：直接带请求参数向后端请求过滤后的数据
  const loadBot = useCallback(async () => {
    if (!botId || !botUserId) return;
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_API_URL;
      const typeParam = activeTab === "groups" ? "group" : "channel";

      const res = await axios.get(
        `${backendUrl}/public/bots/${botId}/${botUserId}`,
        {
          params: {
            type: typeParam, // 传递后端过滤类型
            keyword: searchText.trim() || null, // 模糊搜索
            page: currentPage, // 当前页码
            pageSize: pageSize, // 每页条数
          },
        },
      );

      const responseData = res.data?.data;

      setBot(responseData.bot);
      setGroups(responseData.groups || []);
      setCurrentUser(responseData.proxyUser);
      setTotal(responseData.pagination?.total || 0);
      if (responseData.stats) {
        setStats(responseData.stats);
      }

      // 保存 token
      if (res.data?.token) {
        localStorage.setItem("token", JSON.stringify(res.data.token));
      }
      if (res.data?.refreshToken) {
        localStorage.setItem(
          "refreshToken",
          JSON.stringify(res.data.refreshToken),
        );
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? "加载失败");
    } finally {
      setLoading(false);
    }
  }, [botId, botUserId, activeTab, searchText, currentPage, pageSize]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadBot();
      message.success("刷新成功");
    } finally {
      setRefreshing(false);
    }
  };

  // 依赖项改变时自动触发请求
  useEffect(() => {
    loadBot();
  }, [loadBot]);

  // 切换 Tab 或搜索关键词变动时，重置回到第 1 页
  const handleTabChange = (key: "groups" | "channels") => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header className="bg-white px-4 sm:px-6 flex items-center gap-3 shadow-sm sticky top-0 z-100">
        <div className="w-px h-5 bg-gray-200" />
        <RobotOutlined className="text-blue-500 text-lg" />
        <span className="text-base sm:text-lg font-semibold text-gray-800 truncate flex-1">
          {loading && !bot
            ? "机器人详情"
            : bot
              ? `${bot.botName || bot.userName}`
              : "机器人不存在"}
        </span>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={refreshing}
          size="middle"
        >
          刷新
        </Button>
        {bot && (
          <Badge
            status={bot.isOnline ? "success" : "default"}
            text={bot.isOnline ? "在线" : "离线"}
          />
        )}
      </Header>

      <Content className="p-4 sm:p-6 w-full">
        {loading && !bot ? (
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
                  value: stats.groupCount,
                  icon: <TeamOutlined />,
                  color: "#1677ff",
                  bg: activeTab === "groups" ? "#bae0ff" : "#e6f4ff",
                  borderColor: activeTab === "groups" ? "#1677ff" : "#1677ff22",
                },
                {
                  key: "channels",
                  label: "频道数",
                  value: stats.channelCount,
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
                    onClick={() => handleTabChange(s.key as any)}
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
                <Space wrap>
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
                      {total}
                    </Tag>
                  </Space>
                  <Input
                    placeholder="搜索群名 / @用户名"
                    prefix={<SearchOutlined className="text-gray-400" />}
                    allowClear
                    size="small"
                    style={{ width: 200 }}
                    value={searchText}
                    onChange={handleSearchChange}
                  />
                </Space>
              }
              className="overflow-hidden"
            >
              <div className="space-y-3">
                {groups.map((record: any) => (
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
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <UserOutlined />
                        <span className="font-semibold text-gray-700">
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
                ))}

                {!loading && groups.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    {activeTab === "groups"
                      ? "该机器人暂无群组"
                      : "该机器人暂无频道"}
                  </div>
                )}
              </div>

              {/* 后端真实分页 */}
              {total > 0 && (
                <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={total}
                    showSizeChanger
                    pageSizeOptions={["5", "10", "20", "50"]}
                    showTotal={(t) => `共 ${t} 条记录`}
                    onChange={(page, newPageSize) => {
                      setCurrentPage(page);
                      setPageSize(newPageSize);
                    }}
                  />
                </div>
              )}
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
