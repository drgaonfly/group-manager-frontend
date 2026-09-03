import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Switch,
  InputNumber,
  message,
  Divider,
  Row,
  Col,
  Card,
  Typography,
  Alert,
} from 'antd';
import { request } from '@umijs/max';

const { Title, Text } = Typography;

interface ServiceMessageFormProps {
  visible: boolean;
  record?: any;
  bot: any;
  group: any;
  onClose: (refresh?: boolean) => void;
}

// 服务消息类型配置
const messageTypeGroups = [
  {
    title: '👥 成员变动',
    items: [
      { key: 'isJoinGroupDeleted', label: '新成员加入' },
      { key: 'isLeftGroupDeleted', label: '成员离开' },
    ],
  },
  {
    title: '📝 群组信息',
    items: [
      { key: 'isNewTitleDeleted', label: '修改群组标题' },
      { key: 'isNewPhotoDeleted', label: '修改群组头像' },
      { key: 'isDeletePhotoDeleted', label: '删除群组头像' },
    ],
  },
  {
    title: '📌 消息操作',
    items: [{ key: 'isPinnedMessageDeleted', label: '置顶消息' }],
  },
  {
    title: '💬 论坛话题',
    items: [
      { key: 'isForumTopicCreatedDeleted', label: '创建话题' },
      { key: 'isForumTopicEditedDeleted', label: '编辑话题' },
      { key: 'isForumTopicClosedDeleted', label: '关闭话题' },
      { key: 'isForumTopicReopenedDeleted', label: '重新打开话题' },
      { key: 'isGeneralTopicHiddenDeleted', label: '隐藏通用话题' },
      { key: 'isGeneralTopicUnhiddenDeleted', label: '显示通用话题' },
    ],
  },
  {
    title: '🚀 助推',
    items: [{ key: 'isBoostAddedDeleted', label: '用户助推' }],
  },
  {
    title: '📹 语音/视频通话',
    items: [
      { key: 'isVideoChatStartedDeleted', label: '视频聊天开始' },
      { key: 'isVideoChatEndedDeleted', label: '视频聊天结束' },
      { key: 'isVideoChatScheduledDeleted', label: '视频聊天计划' },
      { key: 'isVideoChatInvitedDeleted', label: '邀请参与视频聊天' },
    ],
  },
  {
    title: '✅ 权限授予',
    items: [{ key: 'isWriteAccessAllowedDeleted', label: '写入权限授予（核对清单）' }],
  },
  {
    title: '🔄 群组迁移',
    items: [{ key: 'isMigrateDeleted', label: '群组升级' }],
  },
];

const ServiceMessageConfigForm: React.FC<ServiceMessageFormProps> = ({
  visible,
  record,
  bot,
  group,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue(record);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, record, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = { ...values, bot: bot._id, group: group._id };

      if (record) {
        await request(`/service-messages/${record._id}`, { method: 'PUT', data: payload });
        message.success('更新成功');
      } else {
        await request('/service-messages', { method: 'POST', data: payload });
        message.success('创建成功');
      }

      onClose(true);
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请填写必填项');
      } else {
        message.error(error.message || '操作失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={record ? '编辑服务消息配置' : '新建服务消息配置'}
      open={visible}
      onCancel={() => onClose()}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={900}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ isActive: true, deleteDelay: 0 }}>
        <Alert
          message="温馨提示"
          description={
            <div>
              <div>
                • 机器人需要拥有<strong>管理员权限</strong>才能删除服务消息
              </div>
              <div>• 某些服务消息可能在 48 小时后无法删除</div>
              <div>• 建议设置 2-3 秒延迟删除，让成员能够看到消息</div>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="isActive" label="启用配置" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="deleteDelay"
              label="延迟删除（秒）"
              tooltip="0 表示立即删除，最多可延迟 300 秒（5分钟）"
            >
              <InputNumber
                min={0}
                max={300}
                style={{ width: '100%' }}
                placeholder="0 = 立即删除"
                addonAfter="秒"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={5}>选择要删除的服务消息类型</Title>
        <Text type="secondary">开启后，机器人将自动删除对应类型的服务消息</Text>

        <div style={{ marginTop: 16 }}>
          {messageTypeGroups.map((grp) => (
            <Card key={grp.title} size="small" title={grp.title} style={{ marginBottom: 12 }}>
              <Row gutter={[16, 16]}>
                {grp.items.map((item) => (
                  <Col span={12} key={item.key}>
                    <Form.Item name={item.key} valuePropName="checked" style={{ marginBottom: 0 }}>
                      <Switch size="small" />
                    </Form.Item>
                    <span style={{ marginLeft: 8, fontSize: 13 }}>{item.label}</span>
                  </Col>
                ))}
              </Row>
            </Card>
          ))}
        </div>
      </Form>
    </Modal>
  );
};

export default ServiceMessageConfigForm;
