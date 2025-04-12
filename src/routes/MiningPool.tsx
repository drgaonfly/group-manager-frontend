import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUser } from "../lib/auth";
import Pagination from "../components/Pagination";

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
  ethIncome: number;
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
  ethIncome: number;
  type: string;
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
  type: string;
  ethIncome: number;
}

function MiningPool() {
  const { t } = useTranslation();

  // 获取用户信息
  const { data: user } = useUser();

  // 获取收益率数据
  const { data: benefitsData } = useQuery<BenefitItem[]>({
    queryKey: ["liquidityBenefits", !!user],
    queryFn: async () => {
      // 根据用户登录状态选择不同的接口
      let response;

      if (user) {
        response = await axios.get("/liquidity/customer-liquidity");
      } else {
        response = await axios.get("/liquidity/benefits");
      }

      return response.data.data;
    },
    // 依赖于用户信息
    enabled: true,
  });

  // 获取采矿收益记录
  const { data: incomeResponse, isLoading: isLoadingRecords } =
    useQuery<IncomeResponse>({
      queryKey: ["miningIncomes", user?._id],
      queryFn: async () => {
        if (!user)
          return {
            success: true,
            data: [],
            total: 0,
            // totalUsdtIncome: 0,
            customerRewards: 0,
            customerLiquidRate: 0,
          };

        const response = await axios.get("/incomes/address-income");
        return response.data;
      },
      enabled: !!user,
    });

  const incomeRecords = incomeResponse?.data || [];
  console.log(incomeResponse);
  // const totalUsdtIncome = incomeResponse?.totalUsdtIncome || 0;
  const customerRewards = incomeResponse?.customerRewards || 0;
  // 获取最新的收益记录的usdtIncome
  const latestIncome = incomeResponse?.usdtIncome || 0;
  const ethIncome = incomeResponse?.ethIncome || 0;

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

  // 渲染单条收益记录
  const renderIncomeRecord = (record: IncomeRecord) => {
    const { returnRate } = parseRemarks(record.remarks);
    return (
      <div className="bg-[#1a1f2e] hover:bg-[#232838] transition-colors py-3 px-4 flex items-center rounded-lg mb-2">
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
            <div className="text-[14px] text-[#FFA500] font-medium">
              {record.ethIncome?.toFixed(6) || "0.00"} ETH
            </div>
            <div className="text-[12px] text-gray-500">
              ≈{record.usdtIncome.toFixed(2)} USDT
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
            {user?.usdtBalance?.toString().match(/^-?\d+(?:\.\d{0,6})?/)?.[0] ||
              "0.00"}{" "}
            USDT
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <span className="text-gray-400">{t("miningpool.yield")}</span>
          <span>{customerRewards.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <span className="text-gray-400">{t("miningpool.income")}</span>
          <div>
            <span className="text-yellow-500">
              {ethIncome?.toString().match(/^-?\d+(?:\.\d{0,6})?/)?.[0] ||
                "0.00"}{" "}
              ETH
            </span>
            <span className="text-gray-400 text-xs ml-1">
              ≈{" "}
              {latestIncome?.toString().match(/^-?\d+(?:\.\d{0,6})?/)?.[0] ||
                "0.00"}{" "}
              {t("miningpool.usdt")}
            </span>
          </div>
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
        ) : (
          <Pagination
            items={incomeRecords}
            itemsPerPage={5} // 每页显示5条记录
            renderItem={(record) => renderIncomeRecord(record)}
            emptyMessage={
              <div className="flex flex-col items-center justify-center text-gray-400">
                <img
                  src="/nors-BR_U97rM.png"
                  alt={t("miningpool.noDataAlt")}
                  className="w-24 h-24 mb-4 object-contain"
                />
                <span>{t("miningpool.noData")}</span>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default MiningPool;
