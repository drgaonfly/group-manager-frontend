import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getUserProfile } from "../lib/api";

// 定义接口类型
interface BenefitItem {
  stakingmin: number;
  stakingmax: number;
  rewards: number;
  profitmax: number;
  profitmin: number;
  // totalUsdtIncome: number;
  customerRewards: number;
  customerLiquidRate: number;
  usdtIncome: number;
}

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
}

// 定义收益记录响应接口
interface IncomeResponse {
  success: boolean;
  data: IncomeRecord[];
  total: number;
  // totalUsdtIncome: number;
  customerRewards: number;
  customerLiquidRate: number;
  usdtIncome: number;
}

function MiningPool() {
  const { t } = useTranslation();

  // 获取用户信息
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    retry: 1,
  });

  // 获取收益率数据
  const { data: benefitsData } = useQuery<BenefitItem[]>({
    queryKey: ["liquidityBenefits", !!userProfile?.user],
    queryFn: async () => {
      // 根据用户登录状态选择不同的接口
      if (userProfile?.user) {
        const { network, address } = userProfile.user;
        console.log("调用用户接口, network:", network, "address:", address);

        const response = await axios.get("/liquidity/customer-liquidity", {
          params: {
            network,
            address,
          },
        });
        return response.data.data;
      } else {
        console.log("调用普通接口");
        const response = await axios.get("/liquidity/benefits");
        return response.data.data;
      }
    },
    // 依赖于用户信息
    enabled: true,
  });

  // 获取采矿收益记录
  const { data: incomeResponse, isLoading: isLoadingRecords } =
    useQuery<IncomeResponse>({
      queryKey: [
        "miningIncomes",
        userProfile?.user?.network,
        userProfile?.user?.address,
      ],
      queryFn: async () => {
        if (!userProfile?.user)
          return {
            success: true,
            data: [],
            total: 0,
            // totalUsdtIncome: 0,
            customerRewards: 0,
            customerLiquidRate: 0,
          };

        const { network, address } = userProfile.user;
        const response = await axios.get("/incomes/address-income", {
          params: {
            network,
            address,
          },
        });
        return response.data;
      },
      enabled: !!userProfile?.user,
    });

  const incomeRecords = incomeResponse?.data || [];
  // const totalUsdtIncome = incomeResponse?.totalUsdtIncome || 0;
  const customerRewards = incomeResponse?.customerRewards || 0;
  // 获取最新的收益记录的usdtIncome
  const latestIncome = incomeResponse?.usdtIncome || 0;

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
    <div className="">
      <div className="text-center mb-8">
        <h1 className="text-xl mb-2">{t("miningpool.title")}</h1>
        <div className="text-yellow-500 text-3xl font-bold mb-1">
          27578928.3035 <span className="text-sm">USDT</span>
        </div>
        <div className="text-gray-400 text-sm">
          {t("miningpool.totalProduction")}
        </div>
      </div>

      {/* 基本信息 */}
      <div className="space-y-4 mb-8 bg-gray-800 rounded-lg p-3">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <span className="text-gray-400">{t("miningpool.fundingAmount")}</span>
          <span>
            {userProfile?.user?.usdtBalance
              ?.toString()
              .match(/^-?\d+(?:\.\d{0,6})?/)?.[0] || "0.00"}{" "}
            USDT
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <span className="text-gray-400">{t("miningpool.yield")}</span>
          <span>{customerRewards.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <span className="text-gray-400">{t("miningpool.income")}</span>
          <span>{latestIncome.toFixed(2)} USDT</span>
        </div>
        <div className="flex justify-between items-centerpb-3">
          <span className="text-gray-400">{t("miningpool.poolName")}</span>
          <span>{t("miningpool.poolType")}</span>
        </div>
      </div>

      {/* 流动性收益率表格 */}
      <div className="mb-8">
        <h2 className="text-center mb-4">{t("miningpool.liquidityYield")}</h2>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 text-sm p-3 border-b border-gray-700">
            <div className="text-gray-400">
              {t("miningpool.stakeAmount")}
              <br />
              {t("miningpool.usdt")}
            </div>
            <div className="text-gray-400 text-center">
              {t("miningpool.returnRate")}
              <br />
              {t("miningpool.24h")}
            </div>
            <div className="text-gray-400 text-right">
              {t("miningpool.profit")}
              <br />
              {t("miningpool.usdt")}
            </div>
          </div>

          <div className="space-y-2">
            {benefitsData?.map((item, index) => (
              <div key={index} className="grid grid-cols-3 text-sm p-3">
                <div>
                  {item.stakingmin}-{item.stakingmax}
                </div>
                <div className="text-center">{item.rewards.toFixed(2)}%</div>
                <div className="text-right">
                  {item.profitmin}-{item.profitmax}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 采矿记录 */}
      <div className="mb-5">
        <h2 className="text-center mb-4 text-white">
          {t("miningpool.miningRecords")}
        </h2>
        {isLoadingRecords ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : incomeRecords && incomeRecords.length > 0 ? (
          <div className="space-y-[2px]">
            {incomeRecords.map((record) => {
              const { returnRate, flowRate } = parseRemarks(record.remarks);
              return (
                <div
                  key={record._id}
                  className="bg-[#1a1f2e] py-2 px-4 flex items-start"
                >
                  <div className="w-28">
                    <div className="text-[13px] text-gray-400">
                      {formatDate(record.createdAt)}
                    </div>
                    <div className="text-[13px] text-gray-400">
                      {formatTime(record.createdAt)}
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="flex flex-col">
                      <span className="text-[#FFA500] text-lg font-medium">
                        {record.usdtIncome.toFixed(2)}
                      </span>
                      <span className="text-[#FFA500] text-sm">USDT</span>
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <div className="text-[#00FF00] text-[13px]">
                      {t("miningpool.returnRateLabel")}: {returnRate}%
                    </div>
                    <div className="text-[#666] text-[12px]">
                      {t("miningpool.flowRateLabel")}: {flowRate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <img
              src="/nors-BR_U97rM.png"
              alt={t("miningpool.noDataAlt")}
              className="w-24 h-24 mb-4 object-contain"
            />
            <span>{t("miningpool.noData")}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MiningPool;
