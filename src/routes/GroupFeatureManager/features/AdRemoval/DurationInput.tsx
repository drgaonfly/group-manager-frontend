import React from 'react';
import { Form, InputNumber, Select } from 'antd';

// ─── 常量 ────────────────────────────────────────────────────────────────────

export const TIME_UNIT_OPTIONS = [
  { label: '分', value: 'minute' },
  { label: '时', value: 'hour' },
  { label: '日', value: 'day' },
  { label: '月', value: 'month' },
] as const;

export type TimeUnit = (typeof TIME_UNIT_OPTIONS)[number]['value'];

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

/** 将「值 + 单位」转成秒 */
export function toSeconds(value: number, unit: TimeUnit | string): number {
  switch (unit) {
    case 'minute':
      return value * 60;
    case 'hour':
      return value * 3600;
    case 'day':
      return value * 86400;
    case 'month':
      return value * 30 * 86400;
    default:
      return value; // 'second'
  }
}

/** 将秒换算成合适的「值 + 单位」 */
export function fromSeconds(seconds: number): { value: number; unit: TimeUnit } {
  if (seconds >= 30 * 86400 && seconds % (30 * 86400) === 0) {
    return { value: seconds / (30 * 86400), unit: 'month' };
  }
  if (seconds >= 86400 && seconds % 86400 === 0) {
    return { value: seconds / 86400, unit: 'day' };
  }
  if (seconds >= 3600 && seconds % 3600 === 0) {
    return { value: seconds / 3600, unit: 'hour' };
  }
  if (seconds >= 60 && seconds % 60 === 0) {
    return { value: seconds / 60, unit: 'minute' };
  }
  return { value: seconds, unit: 'minute' };
}

/** 将秒数格式化为可读文本（用于表格展示） */
export function formatDuration(seconds: number): string {
  if (seconds >= 30 * 86400 && seconds % (30 * 86400) === 0) return `${seconds / (30 * 86400)}月`;
  if (seconds >= 86400) return `${Math.floor(seconds / 86400)}天`;
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}小时`;
  if (seconds >= 60) return `${Math.floor(seconds / 60)}分钟`;
  return `${seconds}秒`;
}

// ─── 组件 ─────────────────────────────────────────────────────────────────────

export interface DurationInputProps {
  /** Form.Item name，用于数值输入框 */
  valueFieldName: string;
  /** Form.Item name，用于单位下拉 */
  unitFieldName: string;
  label: string;
  tooltip?: string;
  required?: boolean;
  /** 数值最小值，默认 1 */
  min?: number;
  /**
   * 换算成秒后的最小允许值。
   * 例如传 30，则填 6 秒会提示「最短 30 秒」，不允许提交。
   */
  minSeconds?: number;
}

/**
 * 带单位选择的时长输入组件。
 * 内部由两个 noStyle Form.Item 组成，嵌套在外层 Form.Item 的 label 下，
 * 需要配合 antd Form 使用。
 */
const DurationInput: React.FC<DurationInputProps> = ({
  valueFieldName,
  unitFieldName,
  label,
  tooltip,
  required,
  min = 1,
  minSeconds,
}) => (
  <Form.Item
    label={label}
    tooltip={tooltip}
    required={required}
    style={{ marginBottom: 24 }}
    // 跨字段联合校验：value + unit → 秒
    shouldUpdate={(prev, cur) =>
      prev[valueFieldName] !== cur[valueFieldName] || prev[unitFieldName] !== cur[unitFieldName]
    }
  >
    {({ getFieldValue }) => {
      const extraRules = [];

      if (required) {
        extraRules.push({ required: true, message: `请输入${label}` });
      }

      if (minSeconds !== undefined) {
        extraRules.push({
          validator: (_: any, value: number) => {
            const unit = getFieldValue(unitFieldName) ?? 'second';
            const seconds = toSeconds(Number(value) || 0, unit);
            if (seconds < minSeconds) {
              const hint = formatDuration(minSeconds);
              return Promise.reject(new Error(`${label}最短为 ${hint}`));
            }
            return Promise.resolve();
          },
        });
      }

      return (
        <Form.Item
          label={label}
          tooltip={tooltip}
          required={required}
          style={{ marginBottom: 0 }}
          noStyle
        >
          <Form.Item name={valueFieldName} noStyle rules={extraRules}>
            <InputNumber min={min} precision={0} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name={unitFieldName} noStyle>
            <Select style={{ width: 80, marginLeft: 8 }} options={[...TIME_UNIT_OPTIONS]} />
          </Form.Item>
        </Form.Item>
      );
    }}
  </Form.Item>
);

export default DurationInput;
