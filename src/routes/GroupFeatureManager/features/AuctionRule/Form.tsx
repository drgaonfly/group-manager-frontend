import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  message,
  Card,
  InputNumber,
  Space,
  Checkbox,
} from 'antd';
import { PushpinOutlined } from '@ant-design/icons';
import moment from 'moment';
import RichTextEditor from '../../../../components/RichTextEditor';

const { TextArea } = Input;

// 竞拍通知变量
const AUCTION_VARIABLES: { key: string; label: string; desc?: string }[] = [
  { key: '{auctionTitle}', label: '竞拍标题' },
  { key: '{startingPrice}', label: '起拍价' },
  { key: '{minBidIncrement}', label: '最小加价幅度' },
  { key: '{maxBidIncrement}', label: '最大加价幅度' },
  { key: '{endTime}', label: '结束时间' },
  { key: '{currentHighestBid}', label: '当前最高出价' },
  { key: '{bidCount}', label: '出价次数' },
  { key: '{currentBot}', label: '当前机器人', desc: '当前机器人的昵称' },
];

// 竞拍结束通知变量
const AUCTION_END_VARIABLES: { key: string; label: string; desc?: string }[] = [
  { key: '{auctionTitle}', label: '竞拍标题' },
  { key: '{winnerName}', label: '获胜者姓名' },
  { key: '{winningBid}', label: '获胜出价' },
  { key: '{totalBids}', label: '总出价次数' },
  { key: '{participantCount}', label: '参与人数' },
  { key: '{endTime}', label: '结束时间' },
  { key: '{currentBot}', label: '当前机器人', desc: '当前机器人的昵称' },
];

// 默认结束通知内容
const DEFAULT_END_NOTIFY_CONTENT =
  '🏆 竞拍结束：{auctionTitle}<br><br>' +
  '🎉 恭喜获胜者：{winnerName}<br>' +
  '💰 获胜出价：{winningBid}积分<br>' +
  '📊 总出价次数：{totalBids}<br>' +
  '👥 参与人数：{participantCount}<br>' +
  '⏰ 结束时间：{endTime}<br><br>' +
  '感谢大家的参与！';
const DEFAULT_NOTIFY_CONTENT =
  '🏆 竞拍活动：{auctionTitle}<br><br>' +
  '💰 起拍价：{startingPrice}积分<br>' +
  '📈 加价区间：{minBidIncrement}-{maxBidIncrement}积分<br>' +
  '⏰ 结束时间：{endTime}<br><br>' +
  '💡 参与方式：回复"竞拍"参与竞拍';

interface AuctionFormData {
  title: string;
  group: string;
  keywords: string[];
  startingPrice: number;
  minBidIncrement: number;
  maxBidIncrement: number;
  endTime: moment.Moment;
  auctionResult: string;
  isPinned: boolean;
  notifyContent: string;
  endNotifyContent: string;
}

interface AuctionFormProps {
  currentRow: any;
  onSubmit: (values: AuctionFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  /** 从外层直接传入群组 ID，跳过 GroupSelect */
  fixedGroupId?: string;
}

const AuctionForm: React.FC<AuctionFormProps> = ({
  currentRow,
  onSubmit,
  onCancel,
  loading = false,
  fixedGroupId,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentRow?._id) {
      // 编辑模式，加载现有数据
      const formData = {
        ...currentRow,
        group: currentRow.group?._id
          ? currentRow.group._id.toString()
          : currentRow.group ?? undefined,
        endTime: currentRow.endTime ? moment(currentRow.endTime) : undefined,
      };
      form.setFieldsValue(formData);
    } else {
      // 新建模式，设置默认值
      form.setFieldsValue({
        keywords: ['竞拍'],
        startingPrice: 100,
        minBidIncrement: 50,
        maxBidIncrement: 200,
        isPinned: true,
        notifyContent: DEFAULT_NOTIFY_CONTENT,
        endNotifyContent: DEFAULT_END_NOTIFY_CONTENT,
        // 外层传入固定群组时预填
        ...(fixedGroupId ? { group: fixedGroupId } : {}),
      });
    }
  }, [currentRow, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 验证结束时间必须是未来时间
      if (values.endTime && values.endTime.isBefore(moment())) {
        message.error('结束时间必须是未来时间');
        return;
      }

      const submitData = {
        ...values,
        endTime: values.endTime?.toDate(),
      };

      console.log('AuctionForm 提交的数据:', submitData);
      await onSubmit(submitData);
      message.success('保存成功');
      onCancel();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请检查表单填写');
        return;
      }
      message.error(error.message || '保存失败');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Card title="基本信息">
        <Form.Item
          name="title"
          label="竞拍标题"
          rules={[{ required: true, message: '请输入竞拍标题' }]}
        >
          <Input placeholder="请输入竞拍活动标题" />
        </Form.Item>

        <Form.Item
          name="keywords"
          label="触发关键词"
          rules={[{ required: true, message: '请设置触发关键词' }]}
        >
          <Select mode="tags" placeholder="输入关键词，按回车添加" />
        </Form.Item>

        <Space.Compact style={{ display: 'flex', width: '100%' }}>
          <Form.Item
            name="startingPrice"
            label="起拍价（积分）"
            rules={[{ required: true, message: '请输入起拍价' }]}
            style={{ flex: 1, marginRight: 8 }}
          >
            <InputNumber min={1} placeholder="起拍价" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="minBidIncrement"
            label="最小加价（积分）"
            rules={[
              { required: true, message: '请输入最小加价幅度' },
              () => ({
                validator(_, value) {
                  if (!value || value >= 1) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('最小加价必须大于等于1'));
                },
              }),
            ]}
            style={{ flex: 1, marginRight: 8 }}
          >
            <InputNumber min={1} placeholder="最小加价" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maxBidIncrement"
            label="最大加价（积分）"
            rules={[
              { required: true, message: '请输入最大加价幅度' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const minBid = getFieldValue('minBidIncrement');
                  if (!value || !minBid || value >= minBid) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('最大加价必须大于等于最小加价'));
                },
              }),
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber min={1} placeholder="最大加价" style={{ width: '100%' }} />
          </Form.Item>
        </Space.Compact>

        <Form.Item
          name="endTime"
          label="结束时间"
          rules={[{ required: true, message: '请选择结束时间' }]}
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < moment().startOf('day')}
          />
        </Form.Item>

        <Form.Item
          name="auctionResult"
          label="竞价结果"
          rules={[{ required: true, message: '请输入竞价结果' }]}
          extra="获胜者将收到此内容的私信"
        >
          <TextArea rows={4} placeholder="请输入获胜者将收到的竞价结果内容..." />
        </Form.Item>

        <Form.Item name="isPinned" valuePropName="checked">
          <Checkbox>
            <PushpinOutlined className="mr-1" />
            置顶竞拍通知
          </Checkbox>
        </Form.Item>
      </Card>

      <Card title="通知设置" style={{ marginTop: 16 }}>
        <Form.Item
          name="notifyContent"
          label="竞拍通知内容"
          rules={[{ required: true, message: '请输入竞拍通知内容' }]}
        >
          <RichTextEditor
            placeholder="请输入竞拍通知内容，支持富文本格式和变量..."
            height={200}
            variables={AUCTION_VARIABLES}
            showVariables={true}
          />
        </Form.Item>
      </Card>

      <Card title="结束通知设置" style={{ marginTop: 16 }}>
        <Form.Item
          name="endNotifyContent"
          label="竞拍结束通知内容"
          rules={[{ required: true, message: '请输入竞拍结束通知内容' }]}
          extra="竞拍结束后将在群里发送此通知"
        >
          <RichTextEditor
            placeholder="请输入竞拍结束通知内容，支持富文本格式和变量..."
            height={200}
            variables={AUCTION_END_VARIABLES}
            showVariables={true}
          />
        </Form.Item>
      </Card>

      {/* 操作按钮 */}
      <div style={{ textAlign: 'right', marginTop: 24 }}>
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

export default AuctionForm;
