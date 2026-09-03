import React from 'react';
import { Switch, Space, Button, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useIntl } from '../../../../hooks/useIntl';
import useFeatureList from '../../../hooks/useFeatureList';
import FeatureListContainer from '../../components/FeatureListContainer';
import { formatInterval, formatTimeWindow } from '@/utils/intervalUtils';
import ChannelPostForm from './Form';

interface Props {
  open: boolean;
  bot: any;
  channel: any;
}

const ChannelPostGroupContent: React.FC<Props> = ({ open, bot, channel }) => {
  const intl = useIntl();

  const {
    data,
    loading,
    formOpen,
    editingRecord,
    openCreate,
    openEdit,
    closeForm,
    handleDelete,
    handleStatusChange,
    fetchData,
  } = useFeatureList({
    apiPath: '/channel-posts',
    botId: bot?._id,
    groupId: channel?._id,
    enabled: open,
    deleteMode: 'batch',
    statusField: 'isOnline',
  });

  const columns = [
    {
      title: intl.formatMessage({ id: 'content', defaultMessage: '内容' }),
      dataIndex: 'content',
      ellipsis: true,
      render: (text: string) => (
        <div
          dangerouslySetInnerHTML={{ __html: text || '-' }}
          title={text?.replace(/<[^>]+>/g, '') || ''}
          style={{ maxWidth: 220 }}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'type', defaultMessage: '类型' }),
      dataIndex: 'sendType',
      width: 150,
      ellipsis: true,
      render: (_: any, record: any) =>
        record.sendType === 'immediate' ? '立即发送' : '定时循环发送',
    },
    {
      title: intl.formatMessage({ id: 'interval', defaultMessage: '间隔' }),
      dataIndex: 'interval',
      width: 80,
      render: formatInterval,
    },
    {
      title: intl.formatMessage({ id: 'time_window', defaultMessage: '时间窗口' }),
      width: 150,
      render: (_: any, record: any) => formatTimeWindow(record),
    },
    {
      title: intl.formatMessage({ id: 'clear_last_post', defaultMessage: '清除上条' }),
      dataIndex: 'isClearLastPost',
      width: 80,
      render: (val: boolean) => (val ? <Tag color="orange">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: intl.formatMessage({ id: 'status', defaultMessage: '状态' }),
      dataIndex: 'isOnline',
      width: 90,
      render: (_: any, record: any) => (
        <Switch
          checkedChildren={intl.formatMessage({ id: 'enabled', defaultMessage: '启用' })}
          unCheckedChildren={intl.formatMessage({ id: 'disabled', defaultMessage: '禁用' })}
          checked={record.isOnline}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.searchTable.titleOption', defaultMessage: '操作' }),
      width: 100,
      render: (_: any, record: any) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title={intl.formatMessage({ id: 'confirm_delete', defaultMessage: '确定删除？' })}
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 移动端卡片渲染函数
  const renderMobileCard = (record: any) => {
    return (
      <>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <div
              className="text-sm text-gray-800 mb-1"
              dangerouslySetInnerHTML={{ __html: record.content || '-' }}
            />
            <div className="text-xs text-gray-500">
              {record.sendType === 'immediate' ? '立即发送' : '定时循环发送'}
            </div>
          </div>
          <Switch
            checkedChildren={intl.formatMessage({ id: 'enabled', defaultMessage: '启用' })}
            unCheckedChildren={intl.formatMessage({ id: 'disabled', defaultMessage: '禁用' })}
            checked={record.isOnline}
            onChange={(checked) => handleStatusChange(record, checked)}
            className="ml-2"
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            {record.interval && <span>间隔: {formatInterval(record.interval)}</span>}
            {record.isClearLastPost && <Tag color="orange">清除上条</Tag>}
          </div>
          <Space size={0} className="ml-2">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
            <Popconfirm
              title={intl.formatMessage({ id: 'confirm_delete', defaultMessage: '确定删除？' })}
              onConfirm={() => handleDelete(record._id)}
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        </div>
      </>
    );
  };

  return (
    <>
      <FeatureListContainer
        data={data}
        loading={loading}
        columns={columns}
        createButtonText={intl.formatMessage({
          id: 'add_channel_post',
          defaultMessage: '新建推广',
        })}
        onCreateClick={openCreate}
        scroll={{ x: 800 }}
        renderMobileCard={renderMobileCard}
      />

      <ChannelPostForm
        open={formOpen}
        onClose={closeForm}
        currentRow={bot}
        fixedChannelId={channel?._id}
        editingRecord={editingRecord}
        onSuccess={() => {
          closeForm();
          fetchData();
        }}
      />
    </>
  );
};

export default ChannelPostGroupContent;
