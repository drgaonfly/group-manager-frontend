import React from "react";
import { Form, Button } from "antd";
import axios from "axios";
import { Prize, GroupLink, NotifyButton } from "./types";
import BasicInfoTab from "./tabs/BasicInfoTab";
import DrawMethodTab from "./tabs/DrawMethodTab";
import NotificationTab from "./tabs/NotificationTab";
import PrizeTab from "./tabs/PrizeTab";

interface LotteryFormProps {
  form: any;
  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
  groupLinks: GroupLink[];
  setGroupLinks: (links: GroupLink[]) => void;
  drawMethod: string[];
  setDrawMethod: (methods: string[]) => void;
  fullParticipantsCount: number;
  setFullParticipantsCount: (count: number) => void;
  scheduledDrawTime: any;
  setScheduledDrawTime: (time: any) => void;
  notifyContent: string;
  setNotifyContent: (content: string) => void;
  notifyButtons: NotifyButton[];
  setNotifyButtons: (buttons: NotifyButton[]) => void;
  notifyPin: boolean;
  setNotifyPin: (pin: boolean) => void;
  joinSuccessContent: string;
  setJoinSuccessContent: (content: string) => void;
  joinSuccessButtons: NotifyButton[];
  setJoinSuccessButtons: (buttons: NotifyButton[]) => void;
  joinSuccessPin: boolean;
  setJoinSuccessPin: (pin: boolean) => void;
  drawResultContent: string;
  setDrawResultContent: (content: string) => void;
  drawResultButtons: NotifyButton[];
  setDrawResultButtons: (buttons: NotifyButton[]) => void;
  drawResultPin: boolean;
  setDrawResultPin: (pin: boolean) => void;
  media: string;
  setMedia: (media: string) => void;
  mediaType: "image" | "video" | undefined;
  setMediaType: (type: "image" | "video" | undefined) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  botId: string | null;
}

const LotteryForm: React.FC<LotteryFormProps> = ({
  form,
  prizes,
  setPrizes,
  groupLinks,
  setGroupLinks,
  drawMethod,
  setDrawMethod,
  fullParticipantsCount,
  setFullParticipantsCount,
  scheduledDrawTime,
  setScheduledDrawTime,
  notifyContent,
  setNotifyContent,
  notifyButtons,
  setNotifyButtons,
  notifyPin,
  setNotifyPin,
  joinSuccessContent,
  setJoinSuccessContent,
  joinSuccessButtons,
  setJoinSuccessButtons,
  joinSuccessPin,
  setJoinSuccessPin,
  drawResultContent,
  setDrawResultContent,
  drawResultButtons,
  setDrawResultButtons,
  drawResultPin,
  setDrawResultPin,
  media,
  setMedia,
  mediaType,
  setMediaType,
  activeTab,
  setActiveTab,
  onSubmit,
  submitting,
  botId,
}) => {
  const [botGroups, setBotGroups] = React.useState<
    { _id: string; title: string; username?: string }[]
  >([]);
  const [loadingGroups, setLoadingGroups] = React.useState(false);

  // 加载机器人的群组列表
  React.useEffect(() => {
    if (botId) {
      setLoadingGroups(true);
      axios
        .get(`/groups/getByBotId?botId=${botId}`)
        .then((res) => {
          if (res.data.success) {
            setBotGroups(res.data.data || []);
          }
        })
        .catch((err) => {
          console.error("加载群组列表失败:", err);
        })
        .finally(() => {
          setLoadingGroups(false);
        });
    }
  }, [botId]);

  const tabs = [
    { key: "basic", label: "基础信息" },
    { key: "draw", label: "开奖方式" },
    { key: "notify", label: "通知内容" },
    { key: "prizes", label: "奖品设置" },
  ];

  return (
    <Form form={form} layout="vertical">
      <div className="flex justify-center gap-2 mb-4">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            type={activeTab === tab.key ? "primary" : "default"}
            size="small"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "basic" && (
        <BasicInfoTab
          groupLinks={groupLinks}
          setGroupLinks={setGroupLinks}
          botGroups={botGroups}
          loadingGroups={loadingGroups}
        />
      )}

      {activeTab === "draw" && (
        <DrawMethodTab
          drawMethod={drawMethod}
          setDrawMethod={setDrawMethod}
          fullParticipantsCount={fullParticipantsCount}
          setFullParticipantsCount={setFullParticipantsCount}
          scheduledDrawTime={scheduledDrawTime}
          setScheduledDrawTime={setScheduledDrawTime}
        />
      )}

      {activeTab === "notify" && (
        <NotificationTab
          notifyContent={notifyContent}
          setNotifyContent={setNotifyContent}
          notifyButtons={notifyButtons}
          setNotifyButtons={setNotifyButtons}
          notifyPin={notifyPin}
          setNotifyPin={setNotifyPin}
          joinSuccessContent={joinSuccessContent}
          setJoinSuccessContent={setJoinSuccessContent}
          joinSuccessButtons={joinSuccessButtons}
          setJoinSuccessButtons={setJoinSuccessButtons}
          joinSuccessPin={joinSuccessPin}
          setJoinSuccessPin={setJoinSuccessPin}
          drawResultContent={drawResultContent}
          setDrawResultContent={setDrawResultContent}
          drawResultButtons={drawResultButtons}
          setDrawResultButtons={setDrawResultButtons}
          drawResultPin={drawResultPin}
          setDrawResultPin={setDrawResultPin}
          media={media}
          setMedia={setMedia}
          mediaType={mediaType}
          setMediaType={setMediaType}
        />
      )}

      {activeTab === "prizes" && (
        <PrizeTab prizes={prizes} setPrizes={setPrizes} />
      )}

      <div className="mt-4">
        <Button
          type="primary"
          onClick={onSubmit}
          loading={submitting}
          block
          size="large"
        >
          创建抽奖活动
        </Button>
      </div>
    </Form>
  );
};

export default LotteryForm;
