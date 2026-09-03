import React, { useState, useEffect } from 'react';
import { Button, message, Tag, Descriptions, Alert } from 'antd';
import { EditOutlined, SafetyOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import GroupVerifyForm from './Form';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

/**
 * GroupVerify is a single-config-per-group pattern (not a list),
 * so it keeps its own minimal state management instead of useFeatureList.
 */
const GroupVerifyGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const fetchConfig = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await request('/group-verifies', {
        method: 'GET',
        params: { botId: bot._id, groupId: group._id, current: 1, pageSize: 1 },
      });
      setConfig(res?.data?.[0] ?? null);
    } catch {
      message.error('获取群验证配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchConfig();
  }, [open, bot?._id, group?._id]);

  return (
    <>
      <Alert
        message="群组验证"
        description="新成员加入群组时，Bot 将发送验证问题，回答正确后才能正常发言。可设置多个选项，支持多个正确答案。"
        type="info"
        showIcon
        icon={<SafetyOutlined />}
        closable
        style={{ marginBottom: 16 }}
      />
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<EditOutlined />}
          loading={loading}
          onClick={() => setFormOpen(true)}
        >
          {config ? '修改配置' : '新建配置'}
        </Button>
      </div>

      {config ? (
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="验证问题">{config.question || '-'}</Descriptions.Item>
          <Descriptions.Item label="选项数">{config.asks?.length || 0}</Descriptions.Item>
          <Descriptions.Item label="正确答案数">
            {config.asks?.filter((a: any) => a.isCorrect).length || 0}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={config.isActive ? 'green' : 'default'}>
              {config.isActive ? '启用' : '停用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="答案选项">
            {config.asks?.map((ask: any, idx: number) => (
              <Tag key={idx} color={ask.isCorrect ? 'green' : 'default'}>
                {ask.name} {ask.isCorrect ? '(正确)' : ''}
              </Tag>
            )) || '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '32px 0' }}>
          该群组暂未配置群验证，点击「新建配置」开始设置
        </div>
      )}

      <GroupVerifyForm
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        botId={bot?._id}
        currentRecord={config}
        fixedGroupId={group?._id}
        onSuccess={() => {
          setFormOpen(false);
          fetchConfig();
        }}
      />
    </>
  );
};

export default GroupVerifyGroupContent;
