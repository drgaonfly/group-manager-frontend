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
    { key: genKey(), name: "", type: "points", value: 100, quantity: 1 },
  ]);
  const [groupLinks, setGroupLinks] = useState<GroupLink[]>([
    { key: genKey(), link: "" },
  ]);
  const [drawMethod, setDrawMethod] = useState<string[]>(["fullParticipants"]);
  const [notifyContent, setNotifyContent] = useState("");
  const [joinSuccessContent, setJoinSuccessContent] = useState("");
  const [drawResultContent, setDrawResultContent] = useState("");

  // 从历史记录复制
  const handleCopyFromRecord = (record: LotteryRecord) => {
    const links = record.groups.map((g) => ({
      key: genKey(),
      link: g.username ? `@${g.username}` : "",
    }));
    setGroupLinks(links.length > 0 ? links : [{ key: genKey(), link: "" }]);

    const prizeList = record.prizes.map((p) => ({
      key: genKey(),
      name: p.name,
      type: p.type as "points" | "custom",
      value: p.value,
      quantity: p.quantity,
    }));
    setPrizes(
      prizeList.length > 0
        ? prizeList
        : [
            {
              key: genKey(),
              name: "",
              type: "points",
              value: 100,
              quantity: 1,
            },
          ],
    );

    setDrawMethod(record.drawMethod || ["fullParticipants"]);
    setNotifyContent(record.notifyContent || "");
    setJoinSuccessContent(record.joinSuccessContent || "");
    setDrawResultContent(record.drawResultContent || "");

    form.setFieldsValue({
      title: record.title,
      keywords: record.keywords || ["抽奖"],
      requiredMessageCount: record.requiredMessageCount || 10,
      fullParticipantsCount: record.fullParticipantsCount || 10,
      messageCountStartTime: dayjs(),
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
      const validPrizes = prizes.filter((p) => p.name && p.value);
      if (validPrizes.length === 0) {
        message.error("请添加至少一个有效奖品");
        return setActiveTab("prizes");
      }
      if (drawMethod.length === 0) {
        message.error("请选择开奖方式");
        return setActiveTab("draw");
      }

      setSubmitting(true);
      await axios.post("/lotteries/public", {
        botId,
        botUserId,
        groupLinks: validLinks,
        title: values.title,
        keywords: values.keywords || ["抽奖"],
        messageCountStartTime: values.messageCountStartTime?.toISOString(),
        requiredMessageCount: values.requiredMessageCount || 10,
        drawMethod,
        fullParticipantsCount: values.fullParticipantsCount || 10,
        scheduledDrawTime: values.scheduledDrawTime?.toISOString(),
        prizes: validPrizes.map(({ name, type, value, quantity }) => ({
          name,
          type,
          value,
          quantity,
        })),
        notifyContent,
        joinSuccessContent,
        drawResultContent,
      });
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
              notifyContent={notifyContent}
              setNotifyContent={setNotifyContent}
              joinSuccessContent={joinSuccessContent}
              setJoinSuccessContent={setJoinSuccessContent}
              drawResultContent={drawResultContent}
              setDrawResultContent={setDrawResultContent}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onSubmit={handleSubmit}
              submitting={submitting}
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
