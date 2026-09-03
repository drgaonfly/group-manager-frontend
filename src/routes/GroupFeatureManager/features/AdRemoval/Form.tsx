import React from 'react';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormDigit,
  ProFormGroup,
  ProFormRadio,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import DurationInput, { toSeconds, fromSeconds } from './DurationInput';

export interface AdRemovalFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialValues?: any;
  loading?: boolean;
  botId?: string;
  /** 从外层直接传入群组 ID，跳过 GroupSelect（群组已固定，不可更改） */
  fixedGroupId?: string;
}

/**
 * 将 keywords 数组转成 textarea 字符串，每个词占一行
 * ["广告", "推广", "代理"] → "广告\n推广\n代理"
 */
function keywordsToText(keywords: string[] | undefined): string {
  if (!keywords || keywords.length === 0) return '';
  return keywords.join('\n');
}

/**
 * 将 textarea 字符串解析回词数组。
 * 换行、逗号（全角/半角）、空格均视为分隔符，忽略空项。
 * "广告, 推广\n代理 引流" → ["广告", "推广", "代理", "引流"]
 */
function textToKeywords(text: string): string[] {
  return text
    .split(/[\n,，\s]+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

const AdRemovalForm: React.FC<AdRemovalFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading,
  fixedGroupId,
}) => {
  const isEdit = !!initialValues?._id;

  const formInitialValues = React.useMemo(() => {
    const base = {
      isOnline: true,
      mode: 'any',
      punishmentType: 'none',
      muteDurationValue: 5,
      muteDurationUnit: 'minute',
      count: 0,
      windowValue: 1,
      windowUnit: 'hour',
      selfDestructValue: 30,
      selfDestructUnit: 'minute',
      group: fixedGroupId ?? undefined,
    };

    if (initialValues) {
      const muteParsed = fromSeconds(initialValues.punishment?.muteDuration ?? 300);
      const windowParsed = fromSeconds(initialValues.warning?.windowSeconds ?? 3600);
      const selfDestructParsed = fromSeconds(initialValues.warning?.selfDestructSeconds ?? 30);

      return {
        ...base,
        ...initialValues,
        keywordsText: keywordsToText(initialValues.keywords),
        punishmentType: initialValues.punishment?.type ?? 'none',
        muteDurationValue: muteParsed.value,
        muteDurationUnit: muteParsed.unit,
        count: initialValues.warning?.count ?? 0,
        windowValue: windowParsed.value,
        windowUnit: windowParsed.unit,
        selfDestructValue: selfDestructParsed.value,
        selfDestructUnit: selfDestructParsed.unit,
        group: initialValues.group
          ? typeof initialValues.group === 'object'
            ? initialValues.group._id ?? initialValues.group.toString()
            : initialValues.group
          : fixedGroupId ?? undefined,
      };
    }
    return base;
  }, [initialValues]);

  const handleSubmit = async (values: any) => {
    const {
      keywordsText,
      punishmentType,
      muteDurationValue,
      muteDurationUnit,
      count,
      windowValue,
      windowUnit,
      selfDestructValue,
      selfDestructUnit,
      ...rest
    } = values;

    const keywords = textToKeywords(keywordsText || '');

    let punishment: { type: string; muteDuration?: number } | null = null;
    if (punishmentType === 'mute') {
      punishment = {
        type: 'mute',
        muteDuration: toSeconds(Number(muteDurationValue), muteDurationUnit),
      };
    } else if (punishmentType === 'kick') {
      punishment = { type: 'kick' };
    }

    const warning = {
      count: Number(count) || 0,
      windowSeconds: toSeconds(Number(windowValue), windowUnit),
      selfDestructSeconds: toSeconds(Number(selfDestructValue), selfDestructUnit),
    };

    await onSubmit({ ...rest, keywords, punishment, warning, group: rest.group || null });
  };

  return (
    <ModalForm
      title={isEdit ? '编辑拦截规则' : '添加拦截规则'}
      open={open}
      onOpenChange={(visible) => {
        if (!visible) onCancel();
      }}
      initialValues={formInitialValues}
      onFinish={handleSubmit}
      modalProps={{
        destroyOnClose: true,
        confirmLoading: loading,
        width: window.innerWidth < 768 ? '100%' : '60%',
        style:
          window.innerWidth < 768
            ? { margin: 0, maxWidth: '100vw' }
            : { maxWidth: 900, minWidth: 580 },
      }}
    >
      {/* 基本信息 */}
      <ProFormGroup>
        <ProFormText
          name="name"
          label="规则名称"
          placeholder="例如：通用广告拦截"
          rules={[{ required: true, message: '请输入规则名称' }]}
          width="lg"
        />
        <ProFormTextArea
          name="remark"
          label="备注"
          placeholder="规则描述信息"
          fieldProps={{ autoSize: { minRows: 3 } }}
          width="lg"
        />
      </ProFormGroup>

      {/* 匹配设置 */}
      <ProFormGroup>
        <ProFormSelect
          name="mode"
          label="匹配模式"
          tooltip="any = 消息含任意一个关键词即命中（OR）；all = 消息含全部关键词才命中（AND）"
          valueEnum={{ any: '命中任意词 (OR)', all: '命中全部词 (AND)' }}
          width="md"
        />
      </ProFormGroup>

      {/* 关键词 */}
      <ProFormTextArea
        name="keywordsText"
        label="关键词"
        tooltip="换行、空格、逗号均可作为分隔符，每个词单独存储。匹配逻辑由上方「匹配模式」决定"
        placeholder={`支持换行、空格、逗号分隔，例如：\n广告 推广\n代理,引流`}
        rules={[{ required: true, message: '请输入至少一个关键词' }]}
        fieldProps={{
          autoSize: { minRows: 6, maxRows: 16 },
          style: { fontFamily: 'monospace', fontSize: 13 },
        }}
      />

      {/* ── 警告配置 ── */}
      <ProFormDigit
        name="count"
        label="警告次数"
        tooltip="触发处罚前允许的最大警告次数。填 0 则命中即直接处罚，不发警告。"
        min={0}
        max={100}
        fieldProps={{ precision: 0, addonAfter: '次' }}
        width="sm"
      />

      <Form.Item noStyle shouldUpdate={(prev, cur) => prev.count !== cur.count}>
        {({ getFieldValue }) =>
          Number(getFieldValue('count')) > 0 ? (
            <>
              <DurationInput
                valueFieldName="windowValue"
                unitFieldName="windowUnit"
                label="警告时间窗口"
                tooltip="多少时间内累积达到警告次数才触发处罚，填 0 秒表示不限时间（永久累计）"
                min={0}
              />
              <DurationInput
                valueFieldName="selfDestructValue"
                unitFieldName="selfDestructUnit"
                label="警告消息自焚"
                tooltip="警告消息在多长时间后自动删除，填 0 表示不删除"
                min={0}
              />
            </>
          ) : null
        }
      </Form.Item>

      {/* ── 处罚设置 ── */}
      <ProFormRadio.Group
        name="punishmentType"
        label="触发处罚"
        tooltip="命中规则后，删除消息是默认动作；此处可额外设置对发送者的处罚"
        options={[
          { label: '仅删除消息', value: 'none' },
          { label: '禁言', value: 'mute' },
          { label: '踢出群', value: 'kick' },
        ]}
      />

      <Form.Item noStyle shouldUpdate={(prev, cur) => prev.punishmentType !== cur.punishmentType}>
        {({ getFieldValue }) =>
          getFieldValue('punishmentType') === 'mute' ? (
            <DurationInput
              valueFieldName="muteDurationValue"
              unitFieldName="muteDurationUnit"
              label="禁言时长"
              tooltip="Telegram 限制禁言时长最短 30 秒"
              required
              min={1}
              minSeconds={30}
            />
          ) : null
        }
      </Form.Item>
    </ModalForm>
  );
};

export default AdRemovalForm;
