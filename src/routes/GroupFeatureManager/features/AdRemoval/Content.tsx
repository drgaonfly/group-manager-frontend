import React from 'react';
import { Switch, Space, Button, Popconfirm, Tag, Tooltip, Alert } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { addItem, updateItem } from '@/services/ant-design-pro/api';
import { request } from '@umijs/max';
import { message } from 'antd';
import useFeatureList from '../../../hooks/useFeatureList';
import FeatureListContainer from '../../components/FeatureListContainer';
import AdRemovalForm from './Form';
import { formatDuration } from './DurationInput';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const AdRemovalGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const { data, loading, formOpen, editingRecord, openCreate, openEdit, closeForm, fetchData } =
    useFeatureList({
      apiPath: '/ad-removals',
      botId: bot?._id,
      groupId: group?._id,
      enabled: open,
      deleteMode: 'single',
    });

  // AdRemoval uses a custom submit (not the generic hook's handleDelete/handleStatusChange)
  // because the create path needs bot+group injected, and delete uses single mode.

  const handleSubmit = async (values: any) => {
    try {
      let res;
      if (editingRecord?._id) {
        res = await updateItem(`/ad-removals/${editingRecord._id}`, values);
      } else {
        res = await addItem('/ad-removals', { ...values, bot: bot._id, group: group._id });
      }
      if ((res as any)?.success) {
        message.success(editingRecord?._id ? '更新成功' : '添加成功');
        closeForm();
        fetchData();
      }
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await request(`/ad-removals/${id}`, { method: 'DELETE' });
      if ((res as any)?.success) {
        message.success('删除成功');
        fetchData();
      }
    } catch {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (record: any, isOnline: boolean) => {
    try {
      const res = await updateItem(`/ad-removals/${record._id}`, { isOnline });
      if ((res as any)?.success) {
        message.success('更新成功');
        fetchData();
      }
    } catch {
      message.error('操作失败');
    }
  };

  const renderPunishment = (punishment: any, record: any) => {
    const warning = record?.warning;
    const warningCount = warning?.count ?? 0;
    const warningTag =
      warningCount > 0 ? (
        <Tooltip
          title={`警告 ${warningCount} 次后处罚，时间窗口 ${formatDuration(
            warning?.windowSeconds ?? 0,
          )}`}
        >
          <Tag color="gold" style={{ marginRight: 4 }}>
            警告×{warningCount}
          </Tag>
        </Tooltip>
      ) : null;

    if (!punishment?.type)
      return (
        <>
          {warningTag}
          <Tag>仅删除</Tag>
        </>
      );
    if (punishment.type === 'kick')
      return (
        <>
          {warningTag}
          <Tag color="red">踢出群</Tag>
        </>
      );
    if (punishment.type === 'mute') {
      const label = formatDuration(punishment.muteDuration ?? 0);
      return (
        <>
          {warningTag}
          <Tooltip title={`禁言 ${punishment.muteDuration} 秒`}>
            <Tag color="orange">禁言 {label}</Tag>
          </Tooltip>
        </>
      );
    }
    return (
      <>
        {warningTag}
        <Tag>仅删除</Tag>
      </>
    );
  };

  const columns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    {
      title: '行内模式',
      dataIndex: 'mode',
      key: 'mode',
      render: (val: string) =>
        val === 'all' ? <Tag color="blue">全部词</Tag> : <Tag color="green">任意词</Tag>,
    },
    {
      title: '关键词行数',
      dataIndex: 'keywords',
      key: 'keywords',
      render: (keywords: string[][]) => {
        const lines = keywords?.length || 0;
        const total = keywords?.reduce((s, l) => s + (l?.length || 0), 0) || 0;
        return (
          <Tooltip title={`共 ${lines} 行，${total} 个词`}>
            <span>{lines} 行</span>
          </Tooltip>
        );
      },
    },
    {
      title: '处罚',
      dataIndex: 'punishment',
      key: 'punishment',
      render: (p: any, r: any) => renderPunishment(p, r),
    },
    {
      title: '状态',
      dataIndex: 'isOnline',
      key: 'isOnline',
      render: (checked: boolean, record: any) => (
        <Switch checked={checked} size="small" onChange={(v) => handleStatusChange(record, v)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
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
            <div className="text-sm font-semibold text-gray-800 mb-1">{record.name}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Tag color={record.mode === 'all' ? 'blue' : 'green'}>
                {record.mode === 'all' ? '全部词' : '任意词'}
              </Tag>
              <span>{record.keywords?.length || 0} 行</span>
            </div>
          </div>
          <Switch
            checked={record.isOnline}
            size="small"
            onChange={(v) => handleStatusChange(record, v)}
            className="ml-2"
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-600">{renderPunishment(record.punishment, record)}</div>
          <Space size={0} className="ml-2">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record._id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
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
        createButtonText="添加规则"
        onCreateClick={openCreate}
        pagination={false}
        renderMobileCard={renderMobileCard}
        headerExtra={
          <Alert
            type="warning"
            showIcon
            message="去除广告功能需要机器人在目标群组中拥有「删除消息」管理员权限。"
          />
        }
      />

      <AdRemovalForm
        open={formOpen}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={editingRecord}
        loading={loading}
        botId={bot?._id}
        fixedGroupId={group?._id}
      />
    </>
  );
};

export default AdRemovalGroupContent;
