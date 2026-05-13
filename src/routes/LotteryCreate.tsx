import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Form, Button, Card, message, Result, Tabs } from "antd";
import { PlusOutlined, GiftOutlined, HistoryOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  LotteryForm,
  LotteryHistory,
  Prize,
  GroupLink,
  LotteryRecord,
  NotifyButton,
  genKey,
} from "../components/lottery";

// 默认内容常量
const DEFAULT_NOTIFY_CONTENT =
  "🎟️ {lotteryTitle}\n\n🎫 参与条件:\n {joinCondition}\n\n🎁 奖品内容:\n{goodsList}\n\n⏰ 开奖方式:\n{openCondition}";

const DEFAULT_JOIN_SUCCESS_CONTENT =
  "🎉 参与成功！\n\n🎟️ 活动：{lotteryTitle}\n\n🎁 奖品：\n{goodsList}\n\n祝您好运！";

const DEFAULT_DRAW_RESULT_CONTENT =
  "🎊 开奖结果公布\n\n🎟️ 活动：{lotteryTitle}\n当前参与人数: {joinNum}人\n\n🏆 中奖名单：\n{winnerList}\n\n⏰ 开奖时间：{openTime}";

const LotteryCreate = () => {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get("botId");
  const botUserId = searchParams.get("botUserId");

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [mainTab, setMainTab] = useState<"create" | "history">("create");

  const [prizes, setPrizes] = useState<Prize[]>([
    { key: genKey(), name: "", value: 0, quantity: 1 },
  ]);
  const [groupLinks, setGroupLinks] = useState<GroupLink[]>([
    { key: genKey(), link: "", mode: "input" },
  ]);
  const [drawMethod, setDrawMethod] = useState<string[]>(["fullParticipants"]);
  const [fullParticipantsCount, setFullParticipantsCount] =
    useState<number>(10);
  const [scheduledDrawTime, setScheduledDrawTime] = useState<any>(null);
  const [notifyContent, setNotifyContent] = useState(DEFAULT_NOTIFY_CONTENT);
  const [notifyButtons, setNotifyButtons] = useState<NotifyButton[]>([]);
  const [notifyPin, setNotifyPin] = useState<boolean>(false);
  const [joinSuccessContent, setJoinSuccessContent] = useState(
    DEFAULT_JOIN_SUCCESS_CONTENT,
  );
  const [joinSuccessButtons, setJoinSuccessButtons] = useState<NotifyButton[]>(
    [],
  );
  const [joinSuccessPin, setJoinSuccessPin] = useState<boolean>(false);
  const [drawResultContent, setDrawResultContent] = useState(
    DEFAULT_DRAW_RESULT_CONTENT,
  );
  const [drawResultButtons, setDrawResultButtons] = useState<NotifyButton[]>(
    [],
  );
  const [drawResultPin, setDrawResultPin] = useState<boolean>(false);
  const [media, setMedia] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>();

  // 从历史记录复制
  const handleCopyFromRecord = (record: LotteryRecord) => {
    // 在新架构中，我们不再使用groups和requiredChannels
    // 保持默认值即可
    setGroupLinks([{ key: genKey(), link: "", mode: "input" }]);

    const prizeList = record.prizes.map((p) => ({
      key: genKey(),
      name: p.name,
      value: typeof p.value === "number" ? p.value : 0,
      quantity: p.quantity,
    }));
    setPrizes(
      prizeList.length > 0
        ? prizeList
        : [{ key: genKey(), name: "", value: 0, quantity: 1 }],
    );

    setDrawMethod(record.drawMethod || ["fullParticipants"]);
    setFullParticipantsCount(record.fullParticipantsCount || 10);
    setNotifyContent(record.notifyContent || DEFAULT_NOTIFY_CONTENT);
    setNotifyButtons(
      record.notifyButtons?.map((b) => ({
        key: genKey(),
        name: b.name,
        url: b.url,
        row: b.row,
      })) || [],
    );
    // 从历史记录复制置顶设置，如果没有则默认为false
    setNotifyPin(record.notifyPin || false);
    setJoinSuccessContent(
      record.joinSuccessContent || DEFAULT_JOIN_SUCCESS_CONTENT,
    );
    setJoinSuccessButtons(
      record.joinSuccessButtons?.map((b) => ({
        key: genKey(),
        name: b.name,
        url: b.url,
        row: b.row,
      })) || [],
    );
    setJoinSuccessPin(record.joinSuccessPin || false);
    setDrawResultContent(
      record.drawResultContent || DEFAULT_DRAW_RESULT_CONTENT,
    );
    setDrawResultButtons(
      record.drawResultButtons?.map((b) => ({
        key: genKey(),
        name: b.name,
        url: b.url,
        row: b.row,
      })) || [],
    );
    setDrawResultPin(record.drawResultPin || false);
    setMedia(record.media || "");
    setMediaType(record.mediaType);
    setScheduledDrawTime(
      record.scheduledDrawTime ? dayjs(record.scheduledDrawTime) : null,
    );

    form.setFieldsValue({
      title: record.title,
      keywords: record.keywords || ["抽奖"],
    });

    setMainTab("create");
    setActiveTab("basic");
    message.success("已复制配置，请修改后创建");
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const validLinks = groupLinks.map((g) => g.link.trim()).filter((l) => l);
      if (validLinks.length === 0) {
        message.error("请输入至少一个群组/频道链接");
        return setActiveTab("basic");
      }
      const validPrizes = prizes.filter((p) => p.name);
      if (validPrizes.length === 0) {
        message.error("请添加至少一个奖品");
        return setActiveTab("prizes");
      }
      if (drawMethod.length === 0) {
        message.error("请选择开奖方式");
        return setActiveTab("draw");
      }

      // 验证定时开奖时间
      if (drawMethod.includes("scheduledTime") && !scheduledDrawTime) {
        message.error("请选择定时开奖时间");
        return setActiveTab("draw");
      }

      setSubmitting(true);
      const postData: any = {
        botId,
        botUserId,
        groupLinks: validLinks,
        title: values.title,
        keywords: values.keywords || ["抽奖"],
        drawMethod,
        prizes: validPrizes.map(({ name, value, quantity }) => ({
          name,
          value,
          quantity,
        })),
        notifyContent,
        notifyButtons: notifyButtons
          .filter((b) => b.name && b.url)
          .map(({ name, url, row }) => ({ name, url, row })),
        notifyPin,
        joinSuccessContent,
        joinSuccessButtons: joinSuccessButtons
          .filter((b) => b.name && b.url)
          .map(({ name, url, row }) => ({ name, url, row })),
        joinSuccessPin,
        drawResultContent,
        drawResultButtons: drawResultButtons
          .filter((b) => b.name && b.url)
          .map(({ name, url, row }) => ({ name, url, row })),
        drawResultPin,
      };

      // 添加媒体数据
      console.log("准备添加媒体数据:", {
        media,
        mediaType,
        mediaTypeof: typeof media,
      });
      if (media && mediaType) {
        postData.media = media;
        postData.mediaType = mediaType;
        console.log("添加媒体数据:", { media, mediaType });
      } else {
        console.log("没有媒体数据");
      }

      // 只在选择了满人开奖时才发送 fullParticipantsCount
      if (drawMethod.includes("fullParticipants")) {
        postData.fullParticipantsCount = fullParticipantsCount;
        console.log("满人开奖设置:", {
          状态值: fullParticipantsCount,
          最终值: postData.fullParticipantsCount,
          类型: typeof fullParticipantsCount,
        });
      }

      // 只在选择了定时开奖时才发送 scheduledDrawTime
      if (drawMethod.includes("scheduledTime")) {
        postData.scheduledDrawTime = scheduledDrawTime?.toISOString();
      }

      console.log("提交的数据:", postData);
      await axios.post("/lotteries/public", postData);
      setSuccess(true);
      message.success("抽奖活动创建成功！");
    } catch (err: any) {
      if (err?.errorFields) return message.error("请填写必填项");
      message.error(err?.response?.data?.message || "创建失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Result
          status="success"
          title="抽奖活动创建成功！"
          subTitle="抽奖通知已发送到群组"
          extra={
            <Button
              type="primary"
              onClick={() => {
                window.close();
                setTimeout(() => window.location.reload(), 100);
              }}
            >
              关闭页面
            </Button>
          }
        />
      </div>
    );
  }

  if (!botId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Result
          status="error"
          title="参数错误"
          subTitle="请从机器人私聊中点击链接进入此页面"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center mb-4">
            <GiftOutlined style={{ fontSize: 40, color: "#1890ff" }} />
            <h1 className="text-xl font-bold mt-3">群抽奖</h1>
          </div>

          <Tabs
            activeKey={mainTab}
            onChange={(k) => setMainTab(k as "create" | "history")}
            centered
            items={[
              {
                key: "create",
                label: (
                  <span>
                    <PlusOutlined /> 创建抽奖
                  </span>
                ),
              },
              {
                key: "history",
                label: (
                  <span>
                    <HistoryOutlined /> 历史记录
                  </span>
                ),
              },
            ]}
          />

          {mainTab === "create" ? (
            <LotteryForm
              form={form}
              prizes={prizes}
              setPrizes={setPrizes}
              groupLinks={groupLinks}
              setGroupLinks={setGroupLinks}
              drawMethod={drawMethod}
              setDrawMethod={setDrawMethod}
              fullParticipantsCount={fullParticipantsCount}
              setFullParticipantsCount={setFullParticipantsCount}
              scheduledDrawTime={scheduledDrawTime}
              setScheduledDrawTime={setScheduledDrawTime}
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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onSubmit={handleSubmit}
              submitting={submitting}
              botId={botId}
            />
          ) : (
            <LotteryHistory
              botUserId={botUserId}
              onCopy={handleCopyFromRecord}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default LotteryCreate;
