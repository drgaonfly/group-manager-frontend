import React from "react";
import { Form, Button } from "antd";
import axios from "axios";
import { Prize, GroupLink, RequiredChannel, NotifyButton } from "./types";
import BasicInfoTab from "./tabs/BasicInfoTab";
import ConditionTab from "./tabs/ConditionTab";
import DrawMethodTab from "./tabs/DrawMethodTab";
import NotificationTab from "./tabs/NotificationTab";
import PrizeTab from "./tabs/PrizeTab";

interface LotteryFormProps {
  form: any;
  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
  groupLinks: GroupLink[];
  setGroupLinks: (links: GroupLink[]) => void;
  requiredChannels: RequiredChannel[];
  setRequiredChannels: (channels: RequiredChannel[]) => void;
  drawMethod: string[];
  setDrawMethod: (methods: string[]) => void;
  fullParticipantsCount: number;
  setFullParticipantsCount: (count: number) => void;
  notifyContent: string;
  setNotifyContent: (content: string) => void;
  notifyButtons: NotifyButton[];
  setNotifyButtons: (buttons: NotifyButton[]) => void;
  joinSuccessContent: string;
  setJoinSuccessContent: (content: string) => void;
  joinSuccessButtons: NotifyButton[];
  setJoinSuccessButtons: (buttons: NotifyButton[]) => void;
  drawResultContent: string;
  setDrawResultContent: (content: string) => void;
  drawResultButtons: NotifyButton[];
  setDrawResultButtons: (buttons: NotifyButton[]) => void;
  media: string;
  setMedia: (media: string) => void;
  mediaType: "image" | "video" | undefined;
  setMediaType: (type: "image" | "video" | undefined) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  botId: string | null;
  enableRequiredChannels: boolean;
  setEnableRequiredChannels: (enabled: boolean) => void;
}

const LotteryForm: React.FC<LotteryFormProps> = ({
  form,
  prizes,
  setPrizes,
  groupLinks,
  setGroupLinks,
  requiredChannels,
  setRequiredChannels,
  drawMethod,
  setDrawMethod,
  fullParticipantsCount,
  setFullParticipantsCount,
  notifyContent,
  setNotifyContent,
  notifyButtons,
  setNotifyButtons,
  joinSuccessContent,
  setJoinSuccessContent,
  joinSuccessButtons,
  setJoinSuccessButtons,
  drawResultContent,
  setDrawResultContent,
  drawResultButtons,
  setDrawResultButtons,
  media,
  setMedia,
  mediaType,
  setMediaType,
  activeTab,
  setActiveTab,
  onSubmit,
  submitting,
  botId,
  enableRequiredChannels,
  setEnableRequiredChannels,
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
    { key: "condition", label: "参与条件" },
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

      {activeTab === "condition" && (
        <ConditionTab
          requiredChannels={requiredChannels}
          setRequiredChannels={setRequiredChannels}
          enableRequiredChannels={enableRequiredChannels}
          setEnableRequiredChannels={setEnableRequiredChannels}
          botId={botId}
        />
      )}

      {activeTab === "draw" && (
        <DrawMethodTab
          drawMethod={drawMethod}
          setDrawMethod={setDrawMethod}
          fullParticipantsCount={fullParticipantsCount}
          setFullParticipantsCount={setFullParticipantsCount}
        />
      )}

      {activeTab === "notify" && (
        <NotificationTab
          notifyContent={notifyContent}
          setNotifyContent={setNotifyContent}
          notifyButtons={notifyButtons}
          setNotifyButtons={setNotifyButtons}
          joinSuccessContent={joinSuccessContent}
          setJoinSuccessContent={setJoinSuccessContent}
          joinSuccessButtons={joinSuccessButtons}
          setJoinSuccessButtons={setJoinSuccessButtons}
          drawResultContent={drawResultContent}
          setDrawResultContent={setDrawResultContent}
          drawResultButtons={drawResultButtons}
          setDrawResultButtons={setDrawResultButtons}
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
