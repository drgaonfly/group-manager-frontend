/**
 * 日期时间转换工具
 */
import dayjs, { Dayjs } from 'dayjs';

/**
 * 将日期值转换为 dayjs 对象（用于表单初始化）
 * @param date 日期值（Date | string | undefined）
 * @returns Dayjs | undefined
 */
export function toDayjs(date: Date | string | undefined | null): Dayjs | undefined {
  if (!date) return undefined;
  return dayjs(date);
}

/**
 * 将 dayjs 对象转换为 ISO 字符串（用于表单提交）
 * @param date dayjs 对象或其他日期值
 * @returns ISO 字符串或 undefined
 */
export function toISOString(date: Dayjs | Date | string | undefined | null): string | undefined {
  if (!date) return undefined;
  return dayjs(date).toISOString();
}

/**
 * UTC 分钟数（0–1439）→ 本地时间 dayjs 对象（用于 TimePicker 展示）
 *
 * 原理：用 dayjs.utc() 构造 UTC 时刻，再转本地时间。
 * 依赖 dayjs/plugin/utc，已在此文件内按需扩展。
 *
 * @param utcMinutes 从 UTC 午夜起的分钟偏移，如 22:00 → 1320
 */
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export function utcMinutesToLocalDayjs(utcMinutes: number): Dayjs {
  return dayjs.utc().startOf('day').add(utcMinutes, 'minute').local();
}

/**
 * 本地时间 dayjs（TimePicker 选出来的）→ UTC 分钟数（用于存储）
 *
 * @param d 本地时间 dayjs 对象
 * @returns UTC 分钟偏移，如本地 01:30 UTC+8 → UTC 17:30 → 1050
 */
export function localDayjsToUtcMinutes(d: Dayjs): number {
  const utcD = d.utc();
  return utcD.hour() * 60 + utcD.minute();
}

/**
 * UTC 分钟数 → 本地时间 "HH:mm" 字符串（用于列表展示）
 */
export function utcMinutesToLocalLabel(utcMinutes: number): string {
  return utcMinutesToLocalDayjs(utcMinutes).format('HH:mm');
}
