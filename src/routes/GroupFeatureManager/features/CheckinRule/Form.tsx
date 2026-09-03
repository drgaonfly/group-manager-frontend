import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  InputNumber,
  Row,
  Col,
  Space,
  Select,
  Switch,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useIntl } from "../../../../hooks/useIntl";
import RichTextEditor, {
  convertToTelegramHtml,
  toQuillHtml,
} from "../../../../components/RichTextEditor";

interface StreakCycle {
  days: number;
  multiplier: number;
}

interface Props {
  editingRecord?: any;
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CheckinRuleForm: React.FC<Props> = ({
  editingRecord,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [successContent, setSuccessContent] = useState("");
  const [enableStreakBonus, setEnableStreakBonus] = useState(false);
  const [streakCycles, setStreakCycles] = useState<StreakCycle[]>([
    { days: 3, multiplier: 2 },
    { days: 5, multiplier: 3 },
    { days: 10, multiplier: 4 },
  ]);
  const [maxMultiplier, setMaxMultiplier] = useState(4);

  useEffect(() => {
    if (editingRecord?._id) {
      // 真正的编辑模式：有 _id
      form.setFieldsValue({
        group: editingRecord.group?._id,
        type: editingRecord.type,
        reward: editingRecord.reward,
        keywords: Array.isArray(editingRecord.keywords)
          ? editingRecord.keywords
          : editingRecord.keywords
              ?.split(/[,，\n]/)
              .map((k: string) => k.trim())
              .filter((k: string) => k) || [],
        isOnline: editingRecord.isOnline !== false,
        deleteAfterSeconds: editingRecord.deleteAfterSeconds ?? 0,
        deleteUserMsgAfterSeconds: editingRecord.deleteUserMsgAfterSeconds ?? 0,
      });
      setSuccessContent(toQuillHtml(editingRecord.success_content || ""));
      setEnableStreakBonus(editingRecord.enableStreakBonus || false);
      setStreakCycles(
        editingRecord.streakCycles?.length
          ? editingRecord.streakCycles
          : [
              { days: 3, multiplier: 2 },
              { days: 5, multiplier: 3 },
              { days: 10, multiplier: 4 },
            ],
      );
      setMaxMultiplier(editingRecord.maxMultiplier || 4);
    } else {
      // 新建模式（editingRecord 为 null，或仅携带 type 等预填值）
      form.resetFields();
      form.setFieldsValue({
        type: editingRecord?.type ?? "daily",
        reward: 10,
        keywords: ["签到"],
        isOnline: true,
        deleteAfterSeconds: 0,
        deleteUserMsgAfterSeconds: 0,
      });
      setSuccessContent("");
      setEnableStreakBonus(false);
      setStreakCycles([
        { days: 3, multiplier: 2 },
        { days: 5, multiplier: 3 },
        { days: 10, multiplier: 4 },
      ]);
      setMaxMultiplier(4);
    }
  }, [editingRecord]);

  const handleFinish = async (values: any) => {
    const keywordArray = Array.isArray(values.keywords)
      ? values.keywords.filter((k: string) => k && k.trim())
      : (values.keywords || "")
          .split(/[,，\n]/)
          .map((k: string) => k.trim())
          .filter((k: string) => k);

    const formData = {
      ...values,
      keywords: keywordArray,
      success_content: convertToTelegramHtml(successContent),
      enableStreakBonus,
      streakCycles,
      maxMultiplier,
    };

    await onSubmit(formData);
  };

  const addStreakCycle = () =>
    setStreakCycles([...streakCycles, { days: 1, multiplier: 1 }]);

  const removeStreakCycle = (index: number) => {
    const next = [...streakCycles];
    next.splice(index, 1);
    setStreakCycles(next);
  };

  const updateStreakCycle = (
    index: number,
    field: keyof StreakCycle,
    value: number,
  ) => {
    const next = [...streakCycles];
    next[index] = { ...next[index], [field]: value };
    setStreakCycles(next);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        type: "daily",
        reward: 10,
        keywords: ["签到"],
        isOnline: true,
        deleteAfterSeconds: 0,
        deleteUserMsgAfterSeconds: 0,
      }}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="type"
            label={intl.formatMessage({
              id: "checkin_type",
              defaultMessage: "签到类型",
            })}
            rules={[{ required: true, message: "请选择签到类型" }]}
          >
            <Select
              disabled={!!editingRecord?._id}
              options={[
                { label: "每日签到", value: "daily" },
                { label: "初次签到", value: "first" },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="reward"
            label={intl.formatMessage({
              id: "reward_points",
              defaultMessage: "奖励积分",
            })}
            rules={[{ required: true, message: "请输入奖励积分" }]}
          >
            <InputNumber min={1} precision={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="keywords"
        label={intl.formatMessage({
          id: "trigger_keywords",
          defaultMessage: "触发关键词",
        })}
        rules={[{ required: true, message: "请输入触发关键词" }]}
        extra="多个关键词用逗号分隔"
      >
        <Select
          mode="tags"
          placeholder="输入关键词，按回车添加"
          tokenSeparators={[",", "，"]}
        />
      </Form.Item>

      <Form.Item name="isOnline" label="状态" valuePropName="checked">
        <Switch checkedChildren="启用" unCheckedChildren="停用" />
      </Form.Item>

      {/* 连续签到奖励 */}
      <Form.Item
        label={
          <span>
            启用连续签到奖励&nbsp;
            <Tooltip title="开启后，连续签到天数越多，获得的积分倍率越高">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        <Switch
          checked={enableStreakBonus}
          onChange={setEnableStreakBonus}
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      </Form.Item>

      {enableStreakBonus && (
        <>
          <Form.Item
            label="连续签到周期配置"
            extra="配置连续签到天数对应的积分倍率（按天数降序匹配）"
          >
            {streakCycles.map((cycle, index) => (
              <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                <Col xs={12} sm={10}>
                  <InputNumber
                    value={cycle.days}
                    onChange={(v) => updateStreakCycle(index, "days", v || 1)}
                    min={1}
                    style={{ width: "100%" }}
                    addonAfter="天"
                    placeholder="天数"
                  />
                </Col>
                <Col xs={12} sm={10}>
                  <InputNumber
                    value={cycle.multiplier}
                    onChange={(v) =>
                      updateStreakCycle(index, "multiplier", v || 1)
                    }
                    min={1}
                    step={0.1}
                    style={{ width: "100%" }}
                    addonAfter="倍"
                    placeholder="倍率"
                  />
                </Col>
                <Col xs={24} sm={4}>
                  {streakCycles.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => removeStreakCycle(index)}
                    />
                  )}
                </Col>
              </Row>
            ))}
            <Button
              type="dashed"
              onClick={addStreakCycle}
              icon={<PlusOutlined />}
              style={{ width: "100%" }}
            >
              添加周期
            </Button>
          </Form.Item>

          <Form.Item label="最高倍率限制">
            <InputNumber
              value={maxMultiplier}
              onChange={(v) => setMaxMultiplier(v || 1)}
              min={1}
              step={0.1}
              addonAfter="倍"
            />
          </Form.Item>
        </>
      )}

      <Form.Item label="签到成功提示" required style={{ marginBottom: 24 }}>
        <RichTextEditor
          value={successContent}
          onChange={setSuccessContent}
          placeholder="请输入签到成功后的提示内容，支持富文本格式和变量..."
          height={150}
          variables="all"
        />
      </Form.Item>

      {/* 阅后即焚 */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="deleteAfterSeconds"
            label={
              <span>
                签到消息自动删除（秒）&nbsp;
                <Tooltip title="签到成功消息发送后，经过此秒数自动删除。填 0 表示不删除">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
          >
            <InputNumber
              min={0}
              precision={0}
              style={{ width: "100%" }}
              placeholder="0 = 不删除"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="deleteUserMsgAfterSeconds"
            label={
              <span>
                用户消息自动删除（秒）&nbsp;
                <Tooltip title="用户发送签到关键词后，经过此秒数自动删除其消息。填 0 表示不删除">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
          >
            <InputNumber
              min={0}
              precision={0}
              style={{ width: "100%" }}
              placeholder="0 = 不删除"
            />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ textAlign: "right" }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default CheckinRuleForm;
