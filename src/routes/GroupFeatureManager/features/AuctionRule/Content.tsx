import React, { useState } from 'react';
import { Button, Table, Space, Modal, Tag, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  UserOutlined,
  PushpinOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { request } from '@umijs/max';
import useFeatureList from '../../../hooks/useFeatureList';
import FeatureListContainer from '../../components/FeatureListContainer';
import AuctionForm from './Form';

interface Props {
  open: boolean;
  bot: any;
  group: any;
}

const AuctionRuleGroupContent: React.FC<Props> = ({ open, bot, group }) => {
  const { data, loading, formOpen, editingRecord, openCreate, openEdit, closeForm, fetchData } =
    useFeatureList({
      apiPath: '/auctions',
      botId: bot?._id,
      groupId: group?._id,
      enabled: open,
      deleteMode: 'single',
    });

  const [bidsModalOpen, setBidsModalOpen] = useState(false);
  const [bidsData, setBidsData] = useState<any[]>([]);

  const handleDelete = async (id: string) => {
    try {
      await request(`/auctions/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleEnd = async (record: any) => {
    try {
      await request(`/auctions/${record._id}/end`, { method: 'POST' });
      message.success('竞拍已结束');
      fetchData();
    } catch {
      message.error('结束竞拍失败');
    }
  };

  const showBids = async (record: any) => {
    try {
      const res = await request(`/auctions/${record._id}/bids`);
      if (res.success) {
        setBidsData(res.data);
        setBidsModalOpen(true);
      }
    } catch {
      message.error('获取出价记录失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingRecord ? `/auctions/${editingRecord._id}` : '/auctions';
      const method = editingRecord ? 'PUT' : 'POST';
      await request(url, { method, data: { ...values, bot: bot._id, group: group._id } });
      message.success(editingRecord ? '更新成功' : '创建成功');
      closeForm();
      fetchData();
    } catch (e: any) {
      throw new Error(e?.message || '操作失败');
    }
  };

  const getStatusTag = (status: string, endTime: string) => {
    if (status === 'completed') return <Tag color="red">已结束</Tag>;
    if (moment(endTime).isBefore(moment())) return <Tag color="orange">已过期</Tag>;
    return <Tag color="green">进行中</Tag>;
  };

  const columns = [
    { title: '活动标题', dataIndex: 'title', ellipsis: true, width: 140 },
    { title: '起拍价', dataIndex: 'startingPrice', width: 80, render: (v: number) => `${v}积分` },
    {
      title: '加价区间',
      width: 100,
      render: (_: any, r: any) => `${r.minBidIncrement || 0}-${r.maxBidIncrement || 0}积分`,
    },
    { title: '出价次数', dataIndex: 'bids', width: 80, render: (b: any[]) => b?.length || 0 },
    {
      title: '置顶',
      dataIndex: 'isPinned',
      width: 70,
      render: (v: boolean) =>
        v ? (
          <Tag color="blue" icon={<PushpinOutlined />}>
            置顶
          </Tag>
        ) : (
          <Tag>否</Tag>
        ),
    },
    {
      title: '状态',
      width: 80,
      render: (_: any, r: any) => getStatusTag(r.status, r.endTime),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 100,
      render: (t: string) => moment(t).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      width: 100,
      render: (_: any, record: any) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑',
            onClick: () => openEdit(record),
          },
          ...(record.status === 'ongoing' && moment(record.endTime).isAfter(moment())
            ? [
                {
                  key: 'end',
                  icon: <StopOutlined />,
                  label: '结束竞拍',
                  danger: true,
                  onClick: () => handleEnd(record),
                },
              ]
            : []),
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: '删除',
            danger: true,
            onClick: () =>
              Modal.confirm({ title: '确定删除？', onOk: () => handleDelete(record._id) }),
          },
        ];
        return (
          <Space size="small">
            <Button icon={<UserOutlined />} size="small" onClick={() => showBids(record)} />
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
              <Button icon={<MoreOutlined />} size="small" />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  // 移动端卡片渲染函数
  const renderMobileCard = (record: any) => {
    return (
      <>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 mb-1">{record.title}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>{record.startingPrice}积分</span>
              <span>{record.bids?.length || 0} 出价</span>
            </div>
          </div>
          {getStatusTag(record.status, record.endTime)}
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            {record.isPinned && (
              <Tag color="blue" icon={<PushpinOutlined />}>
                置顶
              </Tag>
            )}
            <span>{moment(record.endTime).format('MM-DD HH:mm')}</span>
          </div>
          <Space size={0} className="ml-2">
            <Button icon={<UserOutlined />} size="small" onClick={() => showBids(record)} />
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
            {record.status === 'ongoing' && moment(record.endTime).isAfter(moment()) && (
              <Button
                icon={<StopOutlined />}
                size="small"
                danger
                onClick={() => handleEnd(record)}
              />
            )}
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() =>
                Modal.confirm({ title: '确定删除？', onOk: () => handleDelete(record._id) })
              }
            />
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
        createButtonText="创建竞拍活动"
        onCreateClick={openCreate}
        scroll={{ x: 900 }}
        renderMobileCard={renderMobileCard}
      />

      <Modal
        title={editingRecord ? '编辑竞拍活动' : '创建竞拍活动'}
        open={formOpen}
        onCancel={closeForm}
        footer={null}
        width={window.innerWidth < 768 ? '100%' : '80%'}
        style={window.innerWidth < 768 ? { margin: 0, maxWidth: '100vw' } : { maxWidth: 1000 }}
        destroyOnClose
      >
        <AuctionForm
          currentRow={editingRecord}
          fixedGroupId={group?._id}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        title="出价记录"
        open={bidsModalOpen}
        onCancel={() => setBidsModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Table
          rowKey={(r, i) => `${r.telegramId}_${i}`}
          dataSource={bidsData}
          columns={[
            {
              title: '用户名',
              key: 'user',
              render: (_: any, r: any) => r.firstName || r.username || `用户${r.telegramId}`,
            },
            { title: 'Telegram ID', dataIndex: 'telegramId' },
            { title: '出价金额', dataIndex: 'bidAmount', render: (v: number) => `${v}积分` },
            {
              title: '状态',
              dataIndex: 'isWinning',
              render: (v: boolean) => (v ? <Tag color="green">领先</Tag> : <Tag>出局</Tag>),
            },
            {
              title: '出价时间',
              dataIndex: 'bidTime',
              render: (d: string) => moment(d).format('YYYY-MM-DD HH:mm:ss'),
            },
          ]}
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </>
  );
};

export default AuctionRuleGroupContent;
