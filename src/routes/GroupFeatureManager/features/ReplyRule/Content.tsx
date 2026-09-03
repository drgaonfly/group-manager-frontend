import React from 'react';
import { Switch, Space, Button, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useFeatureList from '../../../hooks/useFeatureList';
import FeatureListContainer from '../../components/FeatureListContainer';
import ReplyRuleForm from './Form';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const ReplyRuleGroupContent: React.FC<Props> = ({ open, bot, group }) => {
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
    apiPath: '/reply-rules',
    botId: bot?._id,
    groupId: group?._id,
    enabled: open,
  });

  const columns = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      width: 160,
      render: (keywords: string[]) => {
        const arr = Array.isArray(keywords) ? keywords : [keywords];
        return (
          <Space wrap size={[4, 4]}>
            {arr.slice(0, 3).map((k, i) => (
              <Tag key={i} color="blue">
                {k}
              </Tag>
            ))}
            {arr.length > 3 && <Tag>+{arr.length - 3}</Tag>}
          </Space>
        );
      },
    },
    {
      title: '模糊',
      dataIndex: 'isFuzzy',
      width: 60,
      render: (v: boolean) => (v ? <Tag color="geekblue">模糊</Tag> : <Tag>精确</Tag>),
    },
    {
      title: '回复内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (text: string) => (
        <div dangerouslySetInnerHTML={{ __html: text || '-' }} style={{ maxWidth: 200 }} />
      ),
    },
    {
      title: '阅后即焚',
      dataIndex: 'deleteAfterSeconds',
      width: 90,
      render: (v: number) => (v ? <Tag color="orange">{v}秒</Tag> : '-'),
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      width: 90,
      render: (_: any, record: any) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={record.isOnline}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      width: 90,
      render: (_: any, record: any) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 移动端卡片渲染函数
  const renderMobileCard = (record: any) => {
    const keywords = Array.isArray(record.keyword) ? record.keyword : [record.keyword];
    return (
      <>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-800 mb-1">
              <Space wrap size={[4, 4]}>
                {keywords.slice(0, 3).map((k: string, i: number) => (
                  <Tag key={i} color="blue">
                    {k}
                  </Tag>
                ))}
                {keywords.length > 3 && <Tag>+{keywords.length - 3}</Tag>}
              </Space>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Tag color={record.isFuzzy ? 'geekblue' : 'default'}>
                {record.isFuzzy ? '模糊' : '精确'}
              </Tag>
              {record.deleteAfterSeconds && <Tag color="orange">{record.deleteAfterSeconds}秒</Tag>}
            </div>
          </div>
          <Switch
            checkedChildren="启用"
            unCheckedChildren="禁用"
            checked={record.isOnline}
            onChange={(checked) => handleStatusChange(record, checked)}
            className="ml-2"
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div
            className="text-xs text-gray-600 flex-1 min-w-0 truncate"
            dangerouslySetInnerHTML={{ __html: record.content || '-' }}
          />
          <Space size={0} className="ml-2">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
            <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
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
        onCreateClick={openCreate}
        scroll={{ x: 710 }}
        renderMobileCard={renderMobileCard}
      />

      <ReplyRuleForm
        open={formOpen}
        onOpenChange={(v) => {
          if (!v) closeForm();
        }}
        currentRow={bot}
        editingRecord={editingRecord}
        fixedGroupId={group?._id}
        onSuccess={() => {
          closeForm();
          fetchData();
        }}
      />
    </>
  );
};

export default ReplyRuleGroupContent;
