import { useState, useEffect } from "react";
import socketService from "../services/socketService";

interface CountdownData {
  nextExecutionTime?: string; // ISO格式的下次执行时间
  timeRemaining?: number; // 剩余毫秒数
  formatted?: string; // 格式化的时间字符串
  hours?: number; // 剩余小时数
  minutes?: number; // 剩余分钟数
  seconds?: number; // 剩余秒数
}

/**
 * 用于监听socket倒计时事件的自定义钩子
 * @param event Socket事件名称
 * @param format 倒计时格式 ('full' 或 'compact')
 * @param showZeroValues 是否显示为零的时间单位
 * @returns 格式化的倒计时字符串
 */
const useSocketCountdown = (
  event: string,
  format: "full" | "compact" = "full",
  showZeroValues: boolean = false,
): string => {
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    // 确保socket已连接
    socketService.connect();

    // 处理倒计时数据的函数
    const handleCountdown = (data: CountdownData) => {
      // 打印收到的倒计时数据
      console.log(`倒计时数据(${event}):`, data);

      // 如果没有数据，返回默认值
      if (!data) {
        setCountdown("--:--");
        return;
      }

      // 1. 如果后端已经提供了格式化的字符串，优先使用
      if (data.formatted) {
        setCountdown(data.formatted);
        return;
      }

      // 确定小时、分钟和秒数
      let hours = 0;
      let minutes = 0;
      let seconds = 0;

      // 2. 直接使用提供的时间组件
      if (
        data.hours !== undefined ||
        data.minutes !== undefined ||
        data.seconds !== undefined
      ) {
        hours = data.hours || 0;
        minutes = data.minutes || 0;
        seconds = data.seconds || 0;
      }
      // 3. 从剩余毫秒数计算
      else if (data.timeRemaining) {
        const totalSeconds = Math.floor(data.timeRemaining / 1000);
        hours = Math.floor(totalSeconds / 3600);
        minutes = Math.floor((totalSeconds % 3600) / 60);
        seconds = totalSeconds % 60;
      }
      // 4. 从下次执行时间计算
      else if (data.nextExecutionTime) {
        const now = new Date().getTime();
        const nextTime = new Date(data.nextExecutionTime).getTime();
        const diff = Math.max(0, nextTime - now);

        const totalSeconds = Math.floor(diff / 1000);
        hours = Math.floor(totalSeconds / 3600);
        minutes = Math.floor((totalSeconds % 3600) / 60);
        seconds = totalSeconds % 60;
      } else {
        setCountdown("--:--");
        return;
      }

      // 根据不同格式生成倒计时文本
      if (format === "full") {
        // 全格式: "1小时0分钟0秒"
        let formattedTime = "";
        if (hours > 0 || showZeroValues) formattedTime += `${hours}小时`;
        if (minutes > 0 || hours > 0 || showZeroValues)
          formattedTime += `${minutes}分钟`;
        if (seconds > 0 || minutes > 0 || hours > 0 || showZeroValues)
          formattedTime += `${seconds}秒`;
        setCountdown(formattedTime || "--:--");
      } else {
        // 紧凑格式: "01:00:00"
        setCountdown(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}${
            seconds !== undefined ? `:${String(seconds).padStart(2, "0")}` : ""
          }`,
        );
      }
    };

    // 注册socket事件监听器
    socketService.on<CountdownData>(event, handleCountdown);

    // 组件卸载时清理
    return () => {
      socketService.off(event);
    };
  }, [event, format, showZeroValues]);

  return countdown || "--:--";
};

export default useSocketCountdown;
