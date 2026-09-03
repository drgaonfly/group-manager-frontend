import React, { useState } from 'react';
import { Modal, Tabs } from 'antd';
import { useIntl } from '../../hooks/useIntl';
import { MessageOutlined } from '@ant-design/icons';

import ChannelPost from './features/ChannelPost/Content';

interface ChannelFeaturesModalProps {
  open: boolean;
  onClose: () => void;
  bot: any;
  channel: any;
  currentUser: any;
}

const ChannelFeaturesModal: React.FC<ChannelFeaturesModalProps> = ({
  open,
  onClose,
  bot,
  channel,
  currentUser,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<string>('');

  const tabItems = React.useMemo(() => {
    const items: any[] = [];

    if (currentUser?.channelPost) {
      items.push({
        key: 'channelPost',
        label: (
          <span>
            <MessageOutlined />{' '}
            {intl.formatMessage({ id: 'channel_post', defaultMessage: '频道推广' })}
          </span>
        ),
        children: <ChannelPost open={open} bot={bot} channel={channel} />,
      });
    }

    return items;
  }, [open, bot, channel, currentUser]);

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
      title={`${channel?.title || ''}`}
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
            id: 'no_channel_features_enabled',
            defaultMessage: '该机器人暂未启用任何频道功能',
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

export default ChannelFeaturesModal;
