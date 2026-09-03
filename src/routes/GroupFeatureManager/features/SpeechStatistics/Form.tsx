import React, { useEffect, useState } from 'react';
import {
  ModalForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormSelect,
  ProFormGroup,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { request } from '@umijs/max';

interface SpeechStatisticsFormProps {
  open: boolean;
  onOpenChange: (visible: boolean) => void;
  currentRow: any;
  editingConfig?: any;
  onSaved?: () => void;
  /** 从外层直接传入群组 ID，跳过 GroupSelect */
  fixedGroupId?: string;
}

const CYCLE_OPTIONS = [
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
];

const SpeechStatisticsForm: React.FC<SpeechStatisticsFormProps> = ({
  open,
  onOpenChange,
  currentRow,
  editingConfig,
  onSaved,
  fixedGroupId,
}) => {
  // const intl = useIntl();
  const [form] = Form.useForm();
  const [groups, setGroups] = useState<any[]>([]);
  const isEdit = !!editingConfig;

  // Fetch groups for the bot
  useEffect(() => {
    if (open && currentRow?._id && !fixedGroupId) {
      request(`/bots/${currentRow._id}`)
        .then((res: any) => {
          const botGroups = (res?.data?.groups || []).filter((g: any) => g.type !== 'channel');
          setGroups(botGroups);
        })
        .catch((err: any) => {
          console.error('Failed to fetch groups:', err);
        });
    }
  }, [open, currentRow?._id, fixedGroupId]);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (isEdit && editingConfig) {
      form.setFieldsValue({
        ...editingConfig,
        groupId: editingConfig.group?._id || editingConfig.group,
      });
    } else if (fixedGroupId) {
      // 新建且外层已指定群组，预填并锁定
      form.setFieldsValue({ groupId: fixedGroupId });
    }
  }, [open, editingConfig, fixedGroupId]);

  const botName = currentRow?.botName || currentRow?.userName || '';
  const groupName = editingConfig?.group?.title ? ` · ${editingConfig.group.title}` : '';

  return (
    <ModalForm
      form={form}
      title={`发言统计配置 - ${botName}${groupName}`}
      open={open}
      onOpenChange={onOpenChange}
      width={680}
      modalProps={{ destroyOnClose: true }}
      submitter={{ render: (_, dom) => dom.reverse() }}
      initialValues={{
        minSpeechLength: 1,
        allowPureNumberSpeech: false,
        enableActivityReward: false,
        activityRewardCycle: 'daily',
        activityRewardTopN: 3,
        activityRewardPoints: 10,
        enableSpeechReward: false,
        speechRewardCycle: 'daily',
        speechRewardPoints: 1,
        speechRewardMaxTimes: 5,
      }}
      onFinish={async (values) => {
        try {
          if (isEdit) {
            await request(`/speech-configs/${editingConfig._id}`, {
              method: 'PUT',
              data: values,
            });
          } else {
            await request('/speech-configs', {
              method: 'POST',
              data: { ...values, botId: currentRow._id, groupId: values.groupId },
            });
          }
          onOpenChange(false);
          onSaved?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      {fixedGroupId ? (
        <Form.Item name="groupId" hidden initialValue={fixedGroupId}>
          <input />
        </Form.Item>
      ) : (
        <ProFormSelect
          name="groupId"
          label="群组"
          options={groups.map((g) => ({ label: g.title, value: g._id }))}
          placeholder="请选择群组"
          rules={[{ required: true, message: '请选择群组' }]}
          disabled={isEdit}
        />
      )}

      {/* 基础统计 */}

      <ProFormGroup>
        <ProFormDigit
          name="minSpeechLength"
          label="最小统计字数"
          width="sm"
          min={1}
          tooltip="发言字数低于此值不计入统计"
          fieldProps={{ addonAfter: '字' }}
        />

        <ProFormSwitch
          name="allowPureNumberSpeech"
          label="允许纯数字"
          tooltip="开启后纯数字发言也纳入统计"
        />
      </ProFormGroup>

      {/* 排行榜奖励 */}
      <ProFormGroup title="排行榜奖励">
        <ProFormSwitch
          name="enableActivityReward"
          label="启用"
          tooltip="周期结束时自动为发言前 N 名用户发放积分"
        />
        <Form.Item
          noStyle
          shouldUpdate={(p, c) => p.enableActivityReward !== c.enableActivityReward}
        >
          {({ getFieldValue }) =>
            getFieldValue('enableActivityReward') && (
              <>
                <ProFormSelect
                  name="activityRewardCycle"
                  label="统计周期"
                  width="sm"
                  options={CYCLE_OPTIONS}
                  rules={[{ required: true }]}
                />
                <ProFormDigit
                  name="activityRewardTopN"
                  label="奖励前 N 名"
                  width="xs"
                  min={1}
                  max={100}
                  rules={[{ required: true }]}
                />
                <ProFormDigit
                  name="activityRewardPoints"
                  label="每人积分"
                  width="xs"
                  min={1}
                  rules={[{ required: true }]}
                  fieldProps={{ addonAfter: '分' }}
                />
              </>
            )
          }
        </Form.Item>
      </ProFormGroup>

      {/* 即时发言奖励 */}
      <ProFormGroup title="即时发言奖励">
        <ProFormSwitch
          name="enableSpeechReward"
          label="启用"
          tooltip="每条发言立即获得积分，周期内达到上限后不再发放"
        />
        <Form.Item noStyle shouldUpdate={(p, c) => p.enableSpeechReward !== c.enableSpeechReward}>
          {({ getFieldValue }) =>
            getFieldValue('enableSpeechReward') && (
              <>
                <ProFormSelect
                  name="speechRewardCycle"
                  label="奖励周期"
                  width="sm"
                  options={CYCLE_OPTIONS}
                  rules={[{ required: true }]}
                />
                <ProFormDigit
                  name="speechRewardPoints"
                  label="每次积分"
                  width="xs"
                  min={1}
                  rules={[{ required: true }]}
                  fieldProps={{ addonAfter: '分' }}
                />
                <ProFormDigit
                  name="speechRewardMaxTimes"
                  label="周期上限"
                  width="xs"
                  min={1}
                  rules={[{ required: true }]}
                  tooltip="周期内超过此次数后不再发放"
                  fieldProps={{ addonAfter: '次' }}
                />
              </>
            )
          }
        </Form.Item>
      </ProFormGroup>
    </ModalForm>
  );
};

export default SpeechStatisticsForm;
