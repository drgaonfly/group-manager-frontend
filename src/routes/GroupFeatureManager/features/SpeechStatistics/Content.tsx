import React, { useState, useEffect } from 'react';
import { Button, message, Tag, Descriptions, Alert } from 'antd';
import { EditOutlined, BarChartOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import SpeechStatisticsForm from './Form';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const CYCLE_LABEL: Record<string, string> = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
};

/**
 * SpeechStatistics is a single-config-per-group pattern (not a list),
 * so it keeps its own minimal state management instead of useFeatureList.
 */
const SpeechStatisticsGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const fetchConfig = async () => {
    if (!bot?._id || !group?._id) return;
    setLoading(true);
    try {
      const res = await request('/speech-configs', {
        method: 'GET',
        params: { botId: bot._id, groupId: group._id, current: 1, pageSize: 1 },
      });
      setConfig(res?.data?.[0] ?? null);
    } catch {
      message.error('获取发言统计配置失败');
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
        message="发言统计"
        description="统计群组内成员的发言情况，支持按日/周/月周期发放排行榜积分奖励，以及即时发言积分奖励。"
        type="info"
        showIcon
        icon={<BarChartOutlined />}
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
          <Descriptions.Item label="最小统计字数">{config.minSpeechLength} 字</Descriptions.Item>
          <Descriptions.Item label="允许纯数字">
            {config.allowPureNumberSpeech ? <Tag color="green">是</Tag> : <Tag>否</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="排行榜奖励">
            {config.enableActivityReward ? (
              <Tag color="blue">
                {CYCLE_LABEL[config.activityRewardCycle] || '每日'} 前 {config.activityRewardTopN}{' '}
                名 +{config.activityRewardPoints} 积分
              </Tag>
            ) : (
              <Tag color="default">未启用</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="即时发言奖励">
            {config.enableSpeechReward ? (
              <Tag color="purple">
                {CYCLE_LABEL[config.speechRewardCycle] || '每日'} 每次 +{config.speechRewardPoints}{' '}
                积分 （上限 {config.speechRewardMaxTimes} 次）
              </Tag>
            ) : (
              <Tag color="default">未启用</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '32px 0' }}>
          该群组暂未配置发言统计，点击「新建配置」开始设置
        </div>
      )}

      <SpeechStatisticsForm
        open={formOpen}
        onOpenChange={setFormOpen}
        currentRow={bot}
        editingConfig={config}
        onSaved={() => {
          setFormOpen(false);
          fetchConfig();
        }}
        fixedGroupId={group?._id}
      />
    </>
  );
};

export default SpeechStatisticsGroupContent;
