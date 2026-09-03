import React, { useState, useEffect } from 'react';
import { Button, message, Tag, Descriptions, Alert } from 'antd';
import { EditOutlined, MoonOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import { utcMinutesToLocalLabel } from '@/utils/dateUtils';
import NightModeForm from './Form';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const NightModeContent: React.FC<Props> = ({ open, bot, group }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const fetchConfig = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await request('/night-modes', {
        method: 'GET',
        params: { botId: bot._id, groupId: group._id, current: 1, pageSize: 1 },
      });
      setConfig(res?.data?.[0] ?? null);
    } catch {
      message.error('获取夜间模式配置失败');
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
        message="夜间模式"
        description="启用后，Bot 将在设定时间段内对群组全体禁言，时段结束后自动解禁。管理员和群主不受影响，仅普通成员被限制发言。Bot 需拥有管理员权限。"
        type="info"
        showIcon
        icon={<MoonOutlined />}
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
          <Descriptions.Item label="状态">
            <Tag color={config.isActive ? 'blue' : 'default'}>
              {config.isActive ? '启用' : '禁用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="开始时间">
            {typeof config.startAt === 'number' ? utcMinutesToLocalLabel(config.startAt) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="结束时间">
            {typeof config.endAt === 'number' ? utcMinutesToLocalLabel(config.endAt) : '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '32px 0' }}>
          该群组暂未配置夜间模式，点击「新建配置」开始设置
        </div>
      )}

      <NightModeForm
        visible={formOpen}
        record={config}
        bot={bot}
        group={group}
        onClose={(refresh) => {
          setFormOpen(false);
          if (refresh) fetchConfig();
        }}
      />
    </>
  );
};

export default NightModeContent;
