import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import Pagination from "../components/Pagination";
import { useUser } from "../lib/auth";
import ReasonAlert from "../components/ReasonAlert";

// 定义提现记录的类型
interface WithdrawRecord {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  finalAmount?: number;
  fee?: number;
  reason?: string;
}

// 定义收益记录接口
interface IncomeRecord {
  _id: string;
  usdtIncome: number;
  remarks: string;
  isAuthorized: boolean;
  isVerified: boolean;
  createdAt: string;
  earningTime?: string; // 添加可选的 earningTime 字段
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

// 定义兑换记录接口
interface ExchangeRecord {
  id: string;
  type: "usdt to eth" | "eth to usdt";
  amount: number;
  createdAt: string;
}

function Bill() {
  const { t } = useTranslation();
  const [withdrawRecords, setWithdrawRecords] = useState<WithdrawRecord[]>([]);
  const [exchangeRecords, setExchangeRecords] = useState<ExchangeRecord[]>([]);
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true);
  const [showReasonAlert, setShowReasonAlert] = useState(false);
  const [currentReason, setCurrentReason] = useState("");

  // 获取用户信息
  const { data: user } = useUser();

  // 获取收益记录
  const { data: incomeResponse, isLoading: isLoadingIncomes } =
    useQuery<IncomeResponse>({
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

  // 获取提现记录
  const { data: withdrawData, isLoading: isLoadingWithdraws } = useQuery({
    queryKey: ["withdrawRecords", user?._id],
    queryFn: async () => {
      if (!user) {
        return [];
      }
      const response = await axios.get(`/withdraws/customer`);
      return response.data.data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (withdrawData) {
      setWithdrawRecords(withdrawData);
    }
  }, [withdrawData]);

  // 获取兑换记录
  const { mutate: fetchExchangeRecords } = useMutation({
    mutationFn: async () => {
      if (!user) {
        return [];
      }

      // 先获取 USDT 到 ETH 的记录
      const usdtToEthResponse = await axios.post(`/records/customer`, {
        type: "usdt to eth",
      });

      // 再获取 ETH 到 USDT 的记录
      const ethToUsdtResponse = await axios.post(`/records/customer`, {
        type: "eth to usdt",
      });

      // 合并两种类型的记录
      return [...usdtToEthResponse.data.data, ...ethToUsdtResponse.data.data];
    },
    onSuccess: (data) => {
      setExchangeRecords(data);
      setIsLoadingExchanges(false);
    },
    onError: (error) => {
      console.error("Error fetching exchange records:", error);
      setIsLoadingExchanges(false);
    },
  });

  useEffect(() => {
    if (user) {
      fetchExchangeRecords();
    } else {
      setIsLoadingExchanges(false);
    }
  }, [user]);

  const incomeRecords = incomeResponse?.data || [];
  const isLoading =
    isLoadingWithdraws || isLoadingIncomes || isLoadingExchanges;
  const hasData =
    incomeRecords.length > 0 ||
    withdrawRecords.length > 0 ||
    exchangeRecords.length > 0;

  const customerRewards = incomeResponse?.customerRewards || 0;

  // 格式化日期为YYYY-M-D格式
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份从0开始，要+1
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };

  // 格式化时间为HH:mm:ss格式（不使用toLocaleTimeString）
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // // 解析备注信息
  // const parseRemarks = (remarks: string) => {
  //   const returnRateMatch = remarks.match(/回报率: ([\d.]+)%/);
  //   const flowRateMatch = remarks.match(/流动倍率: (\d+)/);

  //   return {
  //     returnRate: returnRateMatch ? returnRateMatch[1] : "0",
  //     flowRate: flowRateMatch ? flowRateMatch[1] : "0",
  //   };
  // };

  // 处理点击查看拒绝原因
  const handleShowReason = (reason: string) => {
    setCurrentReason(reason);
    setShowReasonAlert(true);
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 bg-[#121212] z-10">
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
          <span className="text-white ml-4">{t("bill")}</span>
        </div>
      </div>

      {/* 账单记录 */}
      <div className="pt-16 px-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : hasData ? (
          <div className="space-y-8">
            {/* 收益记录 */}
            {incomeRecords.length > 0 && (
              <div className="mb-8">
                <h3 className="text-white text-lg font-semibold mb-4 pl-1">
                  {t("miningpool.miningRecords")}
                </h3>
                <Pagination
                  items={incomeRecords}
                  newestFirst={true}
                  renderItem={(record: IncomeRecord) => {
                    // const { returnRate } = parseRemarks(record.remarks);
                    return (
                      <div
                        key={record._id}
                        className="bg-[#1a1f2e] hover:bg-[#232838] transition-colors py-3 px-4 flex items-center rounded-lg mb-2"
                      >
                        {/* 左侧时间信息 */}
                        <div className="w-28 border-gray-700 pr-3">
                          <div className="text-[13px] text-gray-300 font-medium">
                            {formatDate(record.earningTime || record.createdAt)}
                          </div>
                          <div className="text-[12px] text-gray-500">
                            {formatTime(record.earningTime || record.createdAt)}
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
                            {t("miningpool.returnRateLabel")}: {customerRewards}
                            %
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
            )}

            {/* 兑换记录 */}
            {exchangeRecords.length > 0 && (
              <div className="mb-8">
                <h3 className="text-white text-lg font-semibold mb-4 pl-1">
                  {t("record.exchangeRecords")}
                </h3>
                <Pagination
                  items={exchangeRecords}
                  newestFirst={true}
                  renderItem={(record: ExchangeRecord) => (
                    <div
                      key={record.id}
                      className="bg-[#1a1f2e] py-4 px-5 rounded-xl flex justify-between items-center shadow-lg transition-transform hover:scale-[1.02] border border-gray-800"
                    >
                      {/* 左侧日期时间 */}
                      <div className="flex flex-col w-1/4">
                        <div className="text-[13px] text-gray-300 font-medium">
                          {formatDate(record.createdAt)}
                        </div>
                        <div className="text-[12px] text-gray-400 mt-0.5">
                          {formatTime(record.createdAt)}
                        </div>
                      </div>

                      {/* 中间金额和类型 */}
                      <div className="flex-1 flex justify-center items-center w-2/4">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-semibold text-[#4ADE80] tracking-tight">
                            {record.amount.toFixed(2)}
                          </span>
                          <span className="text-[#4ADE80] text-xs mt-0.5 opacity-80">
                            {record.type === "usdt to eth" ? "USDT" : "ETH"}
                          </span>
                        </div>
                      </div>

                      {/* 右侧类型 */}
                      <div className="text-right w-1/4 flex flex-col items-end">
                        <span className="text-xs px-2 py-1 rounded-full mt-2 text-blue-400 whitespace-nowrap">
                          {record.type === "usdt to eth"
                            ? t("record.usdtToEth")
                            : t("record.ethToUsdt")}
                        </span>
                      </div>
                    </div>
                  )}
                />
              </div>
            )}

            {/* 提现记录 */}
            {withdrawRecords.length > 0 && (
              <div>
                <h3 className="text-white text-lg font-semibold mb-4 pl-1">
                  {t("withdrawRecords")}
                </h3>
                <Pagination
                  items={withdrawRecords}
                  newestFirst={true}
                  renderItem={(record: WithdrawRecord) => (
                    <div
                      key={record._id}
                      className="bg-[#1a1f2e] text-white rounded-lg shadow-md p-4 mb-4 w-full transition-opacity duration-500 ease-in-out"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-lg font-semibold">
                            {record.amount} {t("miningpool.usdt")}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {new Date(record.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between">
                        {(record.status === "completed" ||
                          record.status === "pending") &&
                        record.fee !== undefined ? (
                          <span className="text-sm text-gray-400">
                            {t("record.fee")}: {record.fee}{" "}
                            {t("miningpool.usdt")}
                          </span>
                        ) : record.status === "rejected" && record.reason ? (
                          <span
                            className="text-sm flex items-center text-red-400 cursor-pointer hover:text-red-300 transition-colors duration-200 bg-[#2d2d35] px-2 py-1 rounded-md"
                            onClick={() =>
                              handleShowReason(record.reason || "")
                            }
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {t("record.viewReason", {
                              defaultValue: "查看原因",
                            })}
                          </span>
                        ) : (
                          <span></span>
                        )}
                        <span
                          className={`text-sm ${
                            record.status === "completed"
                              ? "text-green-400"
                              : record.status === "rejected"
                                ? "text-red-400"
                                : record.status === "processing"
                                  ? "text-yellow-400"
                                  : record.status === "pending"
                                    ? "text-blue-400"
                                    : "text-red-400"
                          }`}
                        >
                          {t(`record.status.${record.status}`)}
                        </span>
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 h-64">
            <img
              src="/nors-BR_U97rM.png"
              alt={t("noData")}
              className="w-28 h-28 mb-4 object-contain opacity-80"
            />
            <span className="text-gray-500">{t("noData")}</span>
          </div>
        )}
      </div>

      {/* 使用新的拒绝原因弹窗 */}
      <ReasonAlert
        isOpen={showReasonAlert}
        onClose={() => setShowReasonAlert(false)}
        reason={currentReason}
        title={t("record.rejectReason", { defaultValue: "拒绝原因" })}
      />
    </div>
  );
}

export default Bill;
