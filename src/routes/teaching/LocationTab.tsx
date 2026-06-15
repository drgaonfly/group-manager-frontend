import { useState } from "react";
import axios from "axios";
import { Button, message, Typography } from "antd";
import { AimOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Text } = Typography;

const LocationTab = ({
  botId,
  botUserId,
}: {
  botId: string;
  botUserId: string;
}) => {
  const [locating, setLocating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      message.error("当前设备不支持定位");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await axios.post("/bot-user-configs/public/location", {
            botId,
            botUserId,
            lng: pos.coords.longitude,
            lat: pos.coords.latitude,
          });
          setLastUpdated(new Date());
          message.success("位置已更新");
        } catch {
          message.error("位置更新失败，请重试");
        } finally {
          setLocating(false);
        }
      },
      () => {
        message.error("获取位置失败，请检查定位权限");
        setLocating(false);
      },
      { timeout: 10000 },
    );
  };

  return (
    <div className="px-4 py-8 flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <EnvironmentOutlined style={{ fontSize: 48 }} />
        <Text className="text-base text-gray-600">更新我的位置</Text>
        <Text type="secondary" style={{ fontSize: 12, textAlign: "center" }}>
          位置信息用于附近老师查询，不会公开显示
        </Text>
      </div>

      <Button
        type="primary"
        size="large"
        icon={<AimOutlined />}
        loading={locating}
        onClick={handleUpdateLocation}
        className="w-40"
      >
        {locating ? "定位中..." : "更新位置"}
      </Button>

      {lastUpdated && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          上次更新：{lastUpdated.toLocaleTimeString("zh-CN")}
        </Text>
      )}
    </div>
  );
};

export default LocationTab;
