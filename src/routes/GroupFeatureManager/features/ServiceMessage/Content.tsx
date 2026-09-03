import React, { useMemo } from 'react';
import { Button, Space, Tag, Popconfirm, Alert } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import FeatureListContainer from '../../components/FeatureListContainer';
import useFeatureList from '../../../hooks/useFeatureList';
import ServiceMessageForm from './Form';

interface ServiceMessageConfigGroupContentProps {
  open: boolean;
  bot: any;
  group: any;
}

const ServiceMessageGroupContent: React.FC<ServiceMessageConfigGroupContentProps> = ({
  open,
  bot,
  group,
}) => {
  const state = useFeatureList<any>({
    apiPath: '/service-messages',
    botId: bot?._id,
    groupId: group?._id,
    enabled: open,
    deleteMode: 'single',
  });

  const { data, loading, formOpen, editingRecord, openCreate, openEdit, closeForm, handleDelete } =
    state;

  const countEnabledTypes = (record: any) => {
    const fields = [
      'isJoinGroupDeleted',
      'isLeftGroupDeleted',
      'isNewTitleDeleted',
      'isNewPhotoDeleted',
      'isDeletePhotoDeleted',
      'isPinnedMessageDeleted',
      'isForumTopicCreatedDeleted',
      'isForumTopicEditedDeleted',
      'isForumTopicClosedDeleted',
      'isForumTopicReopenedDeleted',
      'isGeneralTopicHiddenDeleted',
      'isGeneralTopicUnhiddenDeleted',
      'isBoostAddedDeleted',
      'isVideoChatStartedDeleted',
      'isVideoChatEndedDeleted',
      'isVideoChatScheduledDeleted',
      'isVideoChatInvitedDeleted',
      'isWriteAccessAllowedDeleted',
      'isMigrateDeleted',
    ];
    return fields.filter((field) => (record as any)[field]).length;
  };

  const columns: ColumnsType<any> = useMemo(
    () => [
      {
        title: '状态',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 80,
        render: (_, record) => (record.isActive ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag>),
      },
      {
        title: '启用类型',
        key: 'enabledCount',
        width: 100,
        render: (_, record) => {
          const count = countEnabledTypes(record);
          return <Tag color={count > 0 ? 'blue' : 'default'}>{count} / 19</Tag>;
        },
      },
      {
        title: '延迟删除',
        dataIndex: 'deleteDelay',
        key: 'deleteDelay',
        width: 100,
        render: (_, record) =>
          !record.deleteDelay || record.deleteDelay === 0 ? (
            <Tag color="orange">立即</Tag>
          ) : (
            <Tag color="blue">{record.deleteDelay}秒</Tag>
          ),
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        fixed: 'right' as const,
        render: (_, record) => (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除此配置吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [openEdit, handleDelete],
  );

  const renderMobileCard = (record: any) => {
    const count = countEnabledTypes(record);
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            {record.isActive ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag>}
            <Tag color={count > 0 ? 'blue' : 'default'}>{count} / 19 种类型</Tag>
          </div>
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        </div>
        <div className="text-gray-600 text-sm">
          延迟删除：
          {!record.deleteDelay || record.deleteDelay === 0 ? (
            <Tag color="orange">立即</Tag>
          ) : (
            <Tag color="blue">{record.deleteDelay}秒</Tag>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <FeatureListContainer<any>
        title="服务消息配置"
        data={data}
        loading={loading}
        columns={columns}
        createButtonText={data.length > 0 ? '编辑配置' : '新建配置'}
        onCreateClick={() => {
          if (data.length > 0) {
            openEdit(data[0]);
          } else {
            openCreate();
          }
        }}
        pagination={false}
        scroll={{ x: 800 }}
        renderMobileCard={renderMobileCard}
        headerExtra={
          <Alert
            message="服务消息自动删除"
            description="机器人将根据配置自动删除指定类型的服务消息（如新成员加入、群组信息修改等）。注意：机器人需要有管理员权限才能删除消息。"
            type="info"
            showIcon
            closable
          />
        }
      />

      <ServiceMessageForm
        visible={formOpen}
        record={editingRecord}
        bot={bot}
        group={group}
        onClose={(refresh?: boolean) => {
          closeForm();
          if (refresh) {
            state.fetchData();
          }
        }}
      />
    </>
  );
};

export default ServiceMessageGroupContent;
