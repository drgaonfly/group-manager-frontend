import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUser } from "../lib/auth";
import Pagination from "../components/Pagination";

// 定义收益记录接口
interface IncomeRecord {
  _id: string;
  usdtIncome: number;
  remarks: string;
  isAuthorized: boolean;
  isVerified: boolean;
  createdAt: string;
  customerRewards: number;
  customerLiquidRate: number;
  type: string;
  ethIncome: number;
}

// 定义收益记录响应接口
interface IncomeResponse {
  success: boolean;
  data: IncomeRecord[];
  total: number;
  customerRewards: number;
  customerLiquidRate: number;
  type: string;
  ethIncome: number;
}

function UserIncome() {
  const { t } = useTranslation();
  const { data: user } = useUser();

  // 获取收益记录
  const { data: incomeResponse, isLoading } = useQuery<IncomeResponse>({
    queryKey: ["miningIncomes", user?._id],
    queryFn: async () => {
      if (!user)
        return {
          success: true,
          data: [],
          total: 0,
          customerRewards: 0,
          customerLiquidRate: 0,
        };

      const response = await axios.get("/incomes/address-income");
      return response.data;
    },
    enabled: !!user,
  });

  const incomeRecords = incomeResponse?.data || [];
  const hasData = incomeRecords.length > 0;

  // 格式化日期为YYYY-M-D格式
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };

  // 格式化时间为HH:mm:ss格式
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // 解析备注信息
  const parseRemarks = (remarks: string) => {
    const returnRateMatch = remarks.match(/回报率: ([\d.]+)%/);
    const flowRateMatch = remarks.match(/流动倍率: (\d+)/);

    return {
      returnRate: returnRateMatch ? returnRateMatch[1] : "0",
      flowRate: flowRateMatch ? flowRateMatch[1] : "0",
    };
  };

  return (
    <div className="min-h-screen bg-[#1a1b1e]">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 bg-[#1a1b1e] z-10">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => window.history.back()} className="text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-white ml-4">{t("users.income")}</span>
        </div>
      </div>

      {/* 收益记录内容 */}
      <div className="pt-16 px-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : hasData ? (
          <div className="space-y-8">
            {/* 收益记录列表 */}
            <div className="mb-8">
              <Pagination
                itemsPerPage={6}
                items={incomeRecords}
                newestFirst={true}
                renderItem={(record: IncomeRecord) => {
                  const { returnRate } = parseRemarks(record.remarks);
                  return (
                    <div
                      key={record._id}
                      className="bg-[#1a1f2e] hover:bg-[#232838] transition-colors py-3 px-4 flex items-center rounded-lg mb-2"
                    >
                      {/* 左侧时间信息 */}
                      <div className="w-28 border-gray-700 pr-3">
                        <div className="text-[13px] text-gray-300 font-medium">
                          {formatDate(record.createdAt)}
                        </div>
                        <div className="text-[12px] text-gray-500">
                          {formatTime(record.createdAt)}
                        </div>
                      </div>

                      {/* 中间收益信息 */}
                      <div className="flex-1 flex justify-center">
                        <div>
                          <div className="text-[13px] text-[#FFA500] font-medium">
                            {record.ethIncome || "0.00"} ETH
                          </div>
                          <div className="text-[12px] text-gray-500">
                            ≈{record.usdtIncome} USDT
                          </div>
                        </div>
                      </div>

                      {/* 右侧状态信息 */}
                      <div className="w-32 border-gray-700 pl-3 text-right">
                        <div className="text-[#00FF00] text-[13px] font-medium mb-1">
                          {t("miningpool.returnRateLabel")}: {returnRate}%
                        </div>
                        <div className="text-gray-400 text-[12px]">
                          {t(`income.${record.type}`)}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 h-64">
            <img
              src="/nors-BR_U97rM.png"
              alt={t("users.noDataAlt")}
              className="w-24 h-24 mb-4 object-contain"
            />
            <span>{t("users.noData")}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserIncome;
