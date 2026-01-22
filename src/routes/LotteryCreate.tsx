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
  RequiredChannel,
  LotteryRecord,
  NotifyButton,
  genKey,
} from "../components/lottery";

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
    { key: genKey(), name: "", type: "custom", value: "", quantity: 1 },
  ]);
  const [groupLinks, setGroupLinks] = useState<GroupLink[]>([
    { key: genKey(), link: "", mode: "input" },
  ]);
  const [requiredChannels, setRequiredChannels] = useState<RequiredChannel[]>(
    [],
  );
  const [drawMethod, setDrawMethod] = useState<string[]>(["fullParticipants"]);
  const [fullParticipantsCount, setFullParticipantsCount] =
    useState<number>(10);
  const [notifyContent, setNotifyContent] = useState(
    "🎟️ {lotteryTitle}\n\n🎫 参与条件:\n {joinCondition}\n\n🎁 奖品内容:\n{goodsList}\n\n⏰ 开奖方式: {openCondition}",
  );
  const [notifyButtons, setNotifyButtons] = useState<NotifyButton[]>([]);
  const [joinSuccessContent, setJoinSuccessContent] = useState(
    "🎉 参与成功！\n\n🎟️ 活动：{lotteryTitle}\n👥 \n🎁 奖品：\n{goodsList}\n\n祝您好运！",
  );
  const [joinSuccessButtons, setJoinSuccessButtons] = useState<NotifyButton[]>(
    [],
  );
  const [drawResultContent, setDrawResultContent] = useState(
    "🎊 开奖结果公布\n\n🎟️ 活动：{lotteryTitle}\n当前参与人数: {joinNum}人\n\n🏆 中奖名单：\n{winnerList}\n\n⏰ 开奖时间：{openTime}",
  );
  const [drawResultButtons, setDrawResultButtons] = useState<NotifyButton[]>(
    [],
  );
  const [media, setMedia] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | undefined>();
  const [enableRequiredChannels, setEnableRequiredChannels] = useState(false);

  // 从历史记录复制
  const handleCopyFromRecord = (record: LotteryRecord) => {
    const links = record.groups.map((g) => ({
      key: genKey(),
      link: g.username ? `@${g.username}` : "",
      mode: "input" as const,
    }));
    setGroupLinks(
      links.length > 0 ? links : [{ key: genKey(), link: "", mode: "input" }],
    );

    const channels =
      (
        record.requiredChannels as
          | { chatId: string; title: string; requiredMessageCount?: number }[]
          | undefined
      )?.map((c) => ({
        key: genKey(),
        link: c.chatId,
        title: c.title,
        requiredMessageCount: c.requiredMessageCount,
      })) || [];
    setRequiredChannels(channels);

    // 设置参与条件复选框状态
    setEnableRequiredChannels(channels.length > 0);

    const prizeList = record.prizes.map((p) => ({
      key: genKey(),
      name: p.name,
      type: "custom" as const,
      value: p.value,
      quantity: p.quantity,
    }));
    setPrizes(
      prizeList.length > 0
        ? prizeList
        : [{ key: genKey(), name: "", type: "custom", value: "", quantity: 1 }],
    );

    setDrawMethod(record.drawMethod || ["fullParticipants"]);
    setFullParticipantsCount(record.fullParticipantsCount || 10);
    setNotifyContent(record.notifyContent || "");
    setNotifyButtons(
      record.notifyButtons?.map((b) => ({
        key: genKey(),
        name: b.name,
        url: b.url,
        row: b.row,
      })) || [],
    );
    setJoinSuccessContent(record.joinSuccessContent || "");
    setJoinSuccessButtons(
      record.joinSuccessButtons?.map((b) => ({
        key: genKey(),
        name: b.name,
        url: b.url,
        row: b.row,
      })) || [],
    );
    setDrawResultContent(record.drawResultContent || "");
    setDrawResultButtons(
      record.drawResultButtons?.map((b) => ({
        key: genKey(),
        name: b.name,
        url: b.url,
        row: b.row,
      })) || [],
    );
    setMedia(record.media || "");
    setMediaType(record.mediaType);

    form.setFieldsValue({
      title: record.title,
      keywords: record.keywords || ["抽奖"],
      scheduledDrawTime: record.scheduledDrawTime
        ? dayjs(record.scheduledDrawTime)
        : null,
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

      const validChannels = requiredChannels.filter((c) => c.link.trim());

      // 验证必须选择必须加入指定群/频道
      if (!enableRequiredChannels) {
        message.error("必须选择必须加入指定群/频道");
        return setActiveTab("condition");
      }

      const hasRequiredChannels = validChannels.length > 0;
      if (!hasRequiredChannels) {
        message.error("请添加至少一个必须加入的群/频道");
        return setActiveTab("condition");
      }

      // 验证至少有一个频道设置了发言数要求（可选）
      // 如果所有频道都没有设置发言数要求，则所有加入频道的用户都有资格

      setSubmitting(true);
      const postData: any = {
        botId,
        botUserId,
        groupLinks: validLinks,
        requiredChannels: validChannels.map((c) => ({
          link: c.link.trim(),
          requiredMessageCount: c.requiredMessageCount,
        })),
        title: values.title,
        keywords: values.keywords || ["抽奖"],
        drawMethod,
        prizes: validPrizes.map(({ name, value, quantity }) => ({
          name,
          type: "custom",
          value: value || name,
          quantity,
        })),
        notifyContent,
        notifyButtons: notifyButtons
          .filter((b) => b.name && b.url)
          .map(({ name, url, row }) => ({ name, url, row })),
        joinSuccessContent,
        joinSuccessButtons: joinSuccessButtons
          .filter((b) => b.name && b.url)
          .map(({ name, url, row }) => ({ name, url, row })),
        drawResultContent,
        drawResultButtons: drawResultButtons
          .filter((b) => b.name && b.url)
          .map(({ name, url, row }) => ({ name, url, row })),
      };

      // 添加媒体数据
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
        postData.scheduledDrawTime = values.scheduledDrawTime?.toISOString();
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
              requiredChannels={requiredChannels}
              setRequiredChannels={setRequiredChannels}
              drawMethod={drawMethod}
              setDrawMethod={setDrawMethod}
              fullParticipantsCount={fullParticipantsCount}
              setFullParticipantsCount={setFullParticipantsCount}
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
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onSubmit={handleSubmit}
              submitting={submitting}
              botId={botId}
              enableRequiredChannels={enableRequiredChannels}
              setEnableRequiredChannels={setEnableRequiredChannels}
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
