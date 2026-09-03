/**
 * 时间间隔转换工具
 * 统一存储单位：分钟
 */

export type TimeUnit = 'minutes' | 'hours' | 'weeks';

export interface TimeUnitValue {
  timeUnit: TimeUnit;
  value: number;
}

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_WEEK = 60 * 24 * 7; // 10080

/**
 * 将分钟数转换为合适的时间单位和数值（用于表单显示）
 * @param minutes 分钟数
 * @returns { timeUnit, value }
 */
export function minutesToTimeUnit(minutes: number | undefined | null): TimeUnitValue {
  if (!minutes && minutes !== 0) {
    return { timeUnit: 'hours', value: 1 };
  }

  // 如果是周的整数倍
  if (minutes >= MINUTES_PER_WEEK && minutes % MINUTES_PER_WEEK === 0) {
    return { timeUnit: 'weeks', value: minutes / MINUTES_PER_WEEK };
  }

  // 如果是小时的整数倍
  if (minutes >= MINUTES_PER_HOUR && minutes % MINUTES_PER_HOUR === 0) {
    return { timeUnit: 'hours', value: minutes / MINUTES_PER_HOUR };
  }

  // 默认分钟
  return { timeUnit: 'minutes', value: minutes };
}

/**
 * 将时间单位和数值转换为分钟数（用于表单提交）
 * @param value 数值
 * @param timeUnit 时间单位
 * @returns 分钟数
 */
export function timeUnitToMinutes(value: number, timeUnit: TimeUnit): number {
  switch (timeUnit) {
    case 'weeks':
      return value * MINUTES_PER_WEEK;
    case 'hours':
      return value * MINUTES_PER_HOUR;
    case 'minutes':
    default:
      return value;
  }
}

/**
 * 格式化时间间隔（用于表格显示）
 * @param minutes 分钟数
 * @returns 格式化后的字符串，如 "1周"、"2小时"、"30分钟"
 */
export function formatInterval(minutes: number | undefined | null): string {
  if (!minutes && minutes !== 0) return '-';

  if (minutes >= MINUTES_PER_WEEK && minutes % MINUTES_PER_WEEK === 0) {
    return `${minutes / MINUTES_PER_WEEK}周`;
  }

  if (minutes >= MINUTES_PER_HOUR && minutes % MINUTES_PER_HOUR === 0) {
    return `${minutes / MINUTES_PER_HOUR}小时`;
  }

  return `${minutes}分钟`;
}

/**
 * 格式化时间窗口（用于表格显示）
 * @param record 包含 startAt 和 endAt 的记录对象
 * @returns 格式化后的时间窗口字符串，如 "01-30 10:00 ~ 01-31 18:00"
 */
export function formatTimeWindow(record: {
  startAt?: string | Date;
  endAt?: string | Date;
}): string {
  if (!record.startAt && !record.endAt) {
    return '-';
  }

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return '--';
    return new Date(date).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const start = formatDate(record.startAt);
  const end = formatDate(record.endAt);

  return `${start} ~ ${end}`;
}
