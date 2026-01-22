export interface Prize {
  key: string;
  name: string;
  type: "points" | "custom";
  value: number | string;
  quantity: number;
}

export interface GroupLink {
  key: string;
  link: string;
  mode?: "input" | "select";
  selectedGroup?: {
    _id: string;
    title: string;
    username?: string;
  };
}

export interface RequiredChannel {
  key: string;
  link: string;
  title?: string;
  chatId?: string;
  type?: string; // 'group' | 'supergroup' | 'channel'
  verifying?: boolean;
  error?: string;
  requiredMessageCount?: number; // 该频道的发言数要求
}

export interface LotteryRecord {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  groups: { title: string; username?: string }[];
  prizes: {
    name: string;
    type: string;
    value: number | string;
    quantity: number;
  }[];
  drawMethod: string[];
  fullParticipantsCount?: number;
  scheduledDrawTime?: string;
  requiredMessageCount: number;
  keywords: string[];
  notifyContent?: string;
  joinSuccessContent?: string;
  drawResultContent?: string;
  requiredChannels?: {
    chatId: string;
    title: string;
    requiredMessageCount?: number;
  }[];
}

export interface LotteryFormData {
  title: string;
  keywords: string[];
  requiredMessageCount: number;
  fullParticipantsCount: number;
  scheduledDrawTime?: any;
}

export const genKey = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const LOTTERY_VARIABLES = [
  { key: "{lotteryTitle}", label: "抽奖标题" },
  { key: "{goodsList}", label: "奖品内容" },
  { key: "{joinCondition}", label: "参与条件" },
  { key: "{openCondition}", label: "开奖条件" },
  { key: "{joinNum}", label: "已参与人数" },
];

export const DRAW_RESULT_VARIABLES = [
  { key: "{lotteryTitle}", label: "抽奖标题" },
  { key: "{joinNum}", label: "参与人数" },
  { key: "{eligibleNum}", label: "达标人数" },
  { key: "{winnerList}", label: "中奖名单" },
  { key: "{openTime}", label: "开奖时间" },
];

export const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: "default", text: "待开始" },
  ongoing: { color: "processing", text: "进行中" },
  completed: { color: "success", text: "已完成" },
};
