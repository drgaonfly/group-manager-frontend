export interface Group {
  name: string;
  unit: string;
  exchange_rate: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  bot: {
    botName: string;
  };
  botUser: {
    firstName: string;
    lastName: string;
  };
  group: Group;
}

// 定义汇总数据接口
export interface SummaryData {
  totalDeposit: number;
  feeRate: number;
  usdRate: number;
  myrRate: number;
  expectedWithdraw: number;
  totalWithdraw: number;
}

// 日期选项接口
export interface DateOption {
  value: string;
  label: string;
}
