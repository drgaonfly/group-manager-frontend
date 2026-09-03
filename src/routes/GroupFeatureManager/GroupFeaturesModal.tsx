import React, { useState } from 'react';
import { Modal, Tabs } from 'antd';
import { useIntl } from '../../hooks/useIntl';
import {
  MessageOutlined,
  KeyOutlined,
  StopOutlined,
  SmileOutlined,
  SafetyOutlined,
  BarChartOutlined,
  CalendarOutlined,
  TrophyOutlined,
  AuditOutlined,
  DeleteOutlined,
  MoonOutlined,
} from '@ant-design/icons';

import GroupMessage from './features/GroupMessage/Content';
import ReplyRule from './features/ReplyRule/Content';
import AdRemoval from './features/AdRemoval/Content';
import GroupWelcome from './features/GroupWelcome/Content';
import GroupVerify from './features/GroupVerify/Content';
import SpeechStatistics from './features/SpeechStatistics/Content';
import CheckinRule from './features/CheckinRule/Content';
import LotteryRule from './features/LotteryRule/Content';
import AuctionRule from './features/AuctionRule/Content';
import ServiceMessage from './features/ServiceMessage/Content';
import NightMode from './features/NightMode/Content';

interface GroupFeaturesModalProps {
  open: boolean;
  onClose: () => void;
  bot: any;
  group: any;
  botConfig?: any; // 保留兼容性，不再使用
  currentUser: any;
}

const GroupFeaturesModal: React.FC<GroupFeaturesModalProps> = ({
  open,
  onClose,
  bot,
  group,
  currentUser,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<string>('');

  const tabItems = React.useMemo(() => {
    const items: any[] = [];

    if (currentUser?.groupMessage) {
      items.push({
        key: 'groupMessage',
        label: (
          <span>
            <MessageOutlined />{' '}
            {intl.formatMessage({ id: 'group_message', defaultMessage: '群发消息' })}
          </span>
        ),
        children: <GroupMessage open={open} bot={bot} group={group} />,
      });
    }

    if (currentUser?.replyRule) {
      items.push({
        key: 'replyRule',
        label: (
          <span>
            <KeyOutlined /> {intl.formatMessage({ id: 'reply_rule', defaultMessage: '关键词回复' })}
          </span>
        ),
        children: <ReplyRule open={open} bot={bot} group={group} />,
      });
    }

    if (currentUser?.adRemoval) {
      items.push({
        key: 'adRemoval',
        label: (
          <span>
            <StopOutlined /> {intl.formatMessage({ id: 'ad_removal', defaultMessage: '去除广告' })}
          </span>
        ),
        children: <AdRemoval open={open} bot={bot} group={group} />,
      });
    }

    if (currentUser?.serviceMessage) {
      items.push({
        key: 'serviceMessage',
        label: (
          <span>
            <DeleteOutlined />{' '}
            {intl.formatMessage({ id: 'service_message', defaultMessage: '服务消息' })}
          </span>
        ),
        children: <ServiceMessage open={open} bot={bot} group={group} />,
      });
    }

    if (currentUser?.groupWelcome) {
      items.push({
        key: 'groupWelcome',
        label: (
          <span>
            <SmileOutlined />{' '}
            {intl.formatMessage({ id: 'group_welcome', defaultMessage: '群欢迎' })}
          </span>
        ),
        children: <GroupWelcome open={open} bot={bot} group={group} />,
      });
    }

    if (currentUser?.groupVerify) {
      items.push({
        key: 'groupVerify',
        label: (
          <span>
            <SafetyOutlined />{' '}
            {intl.formatMessage({ id: 'group_verify', defaultMessage: '群组验证' })}
          </span>
        ),
        children: <GroupVerify open={open} bot={bot} group={group} />,
      });
    }

    if (currentUser?.speech_static) {
      items.push({
        key: 'speechStatistics',
        label: (
          <span>
            <BarChartOutlined />{' '}
            {intl.formatMessage({ id: 'speech_statistics', defaultMessage: '发言统计' })}
          </span>
        ),
        children: <SpeechStatistics open={open} bot={bot} group={group} />,
      });
    }

    if (currentUser?.checkinRule) {
      items.push({
        key: 'checkinRule',
        label: (
          <span>
            <CalendarOutlined />{' '}
            {intl.formatMessage({ id: 'checkin_rule', defaultMessage: '群签到' })}
          </span>
        ),
        children: <CheckinRule open={open} bot={bot} group={group} />,
      });
    }

    if (currentUser?.lotteryRule) {
      items.push({
        key: 'lotteryRule',
        label: (
          <span>
            <TrophyOutlined />{' '}
            {intl.formatMessage({ id: 'lottery_rule', defaultMessage: '群抽奖' })}
          </span>
        ),
        children: <LotteryRule open={open} bot={bot} group={group} />,
      });
    }

    if (currentUser?.auctionRule) {
      items.push({
        key: 'auctionRule',
        label: (
          <span>
            <AuditOutlined /> {intl.formatMessage({ id: 'auction_rule', defaultMessage: '群竞拍' })}
          </span>
        ),
        children: <AuctionRule open={open} bot={bot} group={group} />,
      });
    }

    if (currentUser?.nightMode) {
      items.push({
        key: 'nightMode',
        label: (
          <span>
            <MoonOutlined /> {intl.formatMessage({ id: 'night_mode', defaultMessage: '夜间模式' })}
          </span>
        ),
        children: <NightMode open={open} bot={bot} group={group} />,
      });
    }

    return items;
  }, [open, bot, group, currentUser]);

  // 当 tab 列表变化时，确保 activeTab 合法
  React.useEffect(() => {
    if (tabItems.length > 0) {
      const keys = tabItems.map((t) => t.key);
      if (!keys.includes(activeTab)) {
        setActiveTab(keys[0]);
      }
    }
  }, [tabItems]);

  return (
    <Modal
      title={`${group?.title || ''}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width="100%"
      style={{ maxWidth: 1100, top: 0, margin: 0, paddingBottom: 0 }}
      styles={{
        body: { minHeight: '50vh', paddingTop: 16 },
        content: {
          height: '100vh',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0, // 移动端无圆角
        },
      }}
      destroyOnClose
      centered={window.innerWidth >= 768}
      className="md:!top-5 md:!rounded-lg [&_.ant-modal-content]:rounded-none md:[&_.ant-modal-content]:rounded-lg"
    >
      {tabItems.length === 0 ? (
        <div className="text-center text-gray-400 py-15">
          {intl.formatMessage({
            id: 'no_features_enabled',
            defaultMessage: '该机器人暂未启用任何群组功能',
          })}
        </div>
      ) : (
        <Tabs
          tabPosition={window.innerWidth < 768 ? 'top' : 'left'}
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          tabBarStyle={{ minWidth: window.innerWidth < 768 ? 'auto' : 120 }}
          style={{ minHeight: '50vh' }}
        />
      )}
    </Modal>
  );
};

export default GroupFeaturesModal;
