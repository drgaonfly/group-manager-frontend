export interface Transaction {
  id: string;
  amount: number;
  exchange_rate: number;
  fee_rate: number;
  type: string;
  createdAt: string;
  bot: {
    botName: string;
  };
  botUser: {
    firstName: string;
    lastName: string;
  };
  group: {
    name: string;
  };
}

// 定义汇总数据接口
export interface SummaryData {
  totalDeposit: number;
  feeRate: number;
  usdtRate: number;
  myrRate: number;
  expectedWithdraw: number;
  totalWithdraw: number;
}

// 日期选项接口
export interface DateOption {
  value: string;
  label: string;
}
