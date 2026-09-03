import { utcMinutesToLocalDayjs, localDayjsToUtcMinutes } from '../../../../utils/dateUtils';
import { Modal, Form, Switch, TimePicker, Row, Col, message, Alert } from 'antd';
import React, { useEffect, useState } from 'react';
import { request } from '@umijs/max';
import dayjs from 'dayjs';

interface Props {
  visible: boolean;
  record?: any;
  bot: any;
  group: any;
  onClose: (refresh?: boolean) => void;
}

const NightModeForm: React.FC<Props> = ({ visible, record, bot, group, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (record?._id) {
      form.setFieldsValue({
        isActive: record.isActive,
        startAt: utcMinutesToLocalDayjs(record.startAt),
        endAt: utcMinutesToLocalDayjs(record.endAt),
      });
    } else {
      form.setFieldsValue({
        isActive: true,
        startAt: utcMinutesToLocalDayjs(22 * 60),
        endAt: utcMinutesToLocalDayjs(8 * 60),
      });
    }
  }, [visible, record]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        isActive: values.isActive,
        startAt: localDayjsToUtcMinutes(values.startAt as dayjs.Dayjs),
        endAt: localDayjsToUtcMinutes(values.endAt as dayjs.Dayjs),
        bot: bot._id,
        group: group._id,
      };

      if (record?._id) {
        await request(`/night-modes/${record._id}`, { method: 'PUT', data: payload });
        message.success('更新成功');
      } else {
        await request('/night-modes', { method: 'POST', data: payload });
        message.success('创建成功');
      }

      onClose(true);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message ?? err?.message ?? '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const hh = Math.floor(Math.abs(offsetMinutes) / 60)
    .toString()
    .padStart(2, '0');
  const mm = (Math.abs(offsetMinutes) % 60).toString().padStart(2, '0');
  const tzLabel = `UTC${sign}${hh}:${mm}`;

  return (
    <Modal
      title={record?._id ? '编辑夜间模式' : '新建夜间模式'}
      open={visible}
      onCancel={() => onClose()}
      onOk={handleOk}
      confirmLoading={loading}
      width={440}
      destroyOnClose
    >
      <Alert
        message={`按本地时间（${tzLabel}）输入，自动转换为 UTC 存储。Bot 需拥有管理员权限。`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical">
        <Form.Item name="isActive" label="启用夜间模式" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startAt"
              label={`开始时间（${tzLabel}）`}
              rules={[{ required: true, message: '请选择开始时间' }]}
            >
              <TimePicker
                format="HH:mm"
                minuteStep={5}
                showSecond={false}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endAt"
              label={`结束时间（${tzLabel}）`}
              rules={[{ required: true, message: '请选择结束时间' }]}
            >
              <TimePicker
                format="HH:mm"
                minuteStep={5}
                showSecond={false}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default NightModeForm;
