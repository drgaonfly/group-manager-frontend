import React, { useState } from 'react';
import {
  Button,
  Space,
  message,
  Tag,
  Card,
  Spin,
  Empty,
  Popconfirm,
  Modal,
  Descriptions,
  Alert,
} from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import useFeatureList from '../../../hooks/useFeatureList';
import CheckinRuleForm from './Form';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

type RuleType = 'daily' | 'first';

const TYPE_LABEL: Record<RuleType, string> = {
  daily: '每日签到',
  first: '初次签到',
};

const TYPE_COLOR: Record<RuleType, string> = {
  daily: 'blue',
  first: 'green',
};

/**
 * CheckinRule uses a Card layout (one card per type: daily/first) instead of a table.
 * It uses useFeatureList only for data loading + enabled gate — no FeatureListContainer.
 */
const CheckinRuleGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const { data, loading, fetchData } = useFeatureList({
    apiPath: '/checkin-rules',
    botId: bot?._id,
    groupId: group?._id,
    enabled: open,
    deleteMode: 'single',
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<RuleType>('daily');
  const [editingRecord, setEditingRecord] = useState<any>(null);

  // Build daily/first rule map from list data
  const rules: Record<RuleType, any> = {
    daily: data.find((r: any) => r.type === 'daily') ?? null,
    first: data.find((r: any) => r.type === 'first') ?? null,
  };

  const handleEdit = (type: RuleType) => {
    setEditingType(type);
    setEditingRecord(rules[type]);
    setFormOpen(true);
  };

  const handleDelete = async (type: RuleType) => {
    const rule = rules[type];
    if (!rule?._id) return;
    try {
      await request(`/checkin-rules/${rule._id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord?._id) {
        await request(`/checkin-rules/${editingRecord._id}`, {
          method: 'PUT',
          data: { ...values, bot: bot._id, group: group._id },
        });
      } else {
        await request('/checkin-rules', {
          method: 'POST',
          data: { ...values, type: editingType, bot: bot._id, group: group._id },
        });
      }
      message.success(editingRecord ? '更新成功' : '创建成功');
      setFormOpen(false);
      fetchData();
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || e.message || '操作失败');
    }
  };

  const renderRuleCard = (type: RuleType) => {
    const rule = rules[type];
    return (
      <Card
        key={type}
        size="small"
        title={
          <Space>
            <Tag color={TYPE_COLOR[type]}>{TYPE_LABEL[type]}</Tag>
            {rule ? (
              <Tag color={rule.isOnline ? 'success' : 'default'}>
                {rule.isOnline ? '启用' : '停用'}
              </Tag>
            ) : (
              <Tag color="default">未配置</Tag>
            )}
          </Space>
        }
        extra={
          rule ? (
            <Space>
              <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(type)}>
                编辑
              </Button>
              <Popconfirm
                title={`确定删除${TYPE_LABEL[type]}规则吗？`}
                onConfirm={() => handleDelete(type)}
              >
                <Button size="small" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            </Space>
          ) : (
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleEdit(type)}
            >
              配置
            </Button>
          )
        }
        style={{ marginBottom: 16 }}
      >
        {rule ? (
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="触发词">
              {(rule.keywords || []).map((k: string, i: number) => <Tag key={i}>{k}</Tag>) || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="奖励积分">{rule.reward}</Descriptions.Item>
            <Descriptions.Item label="连续奖励">
              {rule.enableStreakBonus ? <Tag color="blue">已启用</Tag> : <Tag>未启用</Tag>}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`尚未配置${TYPE_LABEL[type]}规则`}
            style={{ margin: '8px 0' }}
          />
        )}
      </Card>
    );
  };

  return (
    <>
      <Alert
        message="群签到"
        description="支持每日签到和初次签到两种规则，用户发送触发关键词即可获得积分奖励。可配置连续签到倍率激励。"
        type="info"
        showIcon
        icon={<CalendarOutlined />}
        closable
        style={{ marginBottom: 16 }}
      />
      <Spin spinning={loading}>
        {renderRuleCard('daily')}
        {renderRuleCard('first')}
      </Spin>

      <Modal
        title={`${editingRecord ? '编辑' : '配置'}${TYPE_LABEL[editingType]}规则 — ${group?.title}`}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        footer={null}
        width={window.innerWidth < 768 ? '100%' : '80%'}
        style={window.innerWidth < 768 ? { margin: 0, maxWidth: '100vw' } : { maxWidth: 900 }}
        destroyOnClose
      >
        <CheckinRuleForm
          editingRecord={editingRecord ? editingRecord : { type: editingType }}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>
    </>
  );
};

export default CheckinRuleGroupContent;
