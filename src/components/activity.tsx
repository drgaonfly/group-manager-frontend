import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useUser } from "../lib/auth";

interface ActivityData {
  _id: string;
  id: string;
  activityEndTime: string;
  createdAt: string;
  ethProfit: number;
  lockDuration: number;
  status: string;
  usdtAmount: number;
  customer: {
    _id: string;
    id: string;
    network: string;
  };
}

interface ActivityProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Activity({ isOpen, onClose }: ActivityProps) {
  const { t } = useTranslation();
  // 使用 useQuery 获取用户信息和活动数据
  const { data: user } = useUser();

  // 获取待处理的活动数据
  const { data: activityData } = useQuery<{
    success: boolean;
    data: ActivityData;
  }>({
    queryKey: ["pendingActivity", user?._id],
    queryFn: async () => {
      if (!user) {
        return null;
      }
      const response = await axios.get("/activities/pending");
      return response.data;
    },
    enabled: !!user,
  });

  const updateActivityMutation = useMutation({
    mutationFn: async () => {
      if (!user || !activityData?.data) {
        throw new Error("Missing required data");
      }
      return axios.post("/activities/update-and-release");
    },
    onSuccess: () => {
      onClose();
    },
  });

  // 如果没有待处理的活动数据，不显示弹窗
  if (!isOpen || !activityData?.success) return null;

  const activity = activityData.data;
  const startDate = dayjs(activity.createdAt).format("YYYY/MM/DD");
  const endDate = dayjs(activity.activityEndTime).format("YYYY/MM/DD");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* 半透明背景 */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* 活动内容容器 */}
      <div
        className="relative z-10 w-[320px] rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 活动图片作为背景 */}
        <div className="relative">
          <img
            src="/image/activity.11d9dec0.png"
            alt="Activity"
            className="w-full h-full object-cover"
          />

          {/* 活动文字内容覆盖在图片上 */}
          <div className="absolute inset-0 flex flex-col p-6 pt-10">
            {/* 标题部分 - 带金色横幅背景 */}
            <div className="relative mb-2 mt-1">
              <div className="absolute -left-6 top-1 w-40 h-6 bg-gradient-to-r from-yellow-400 to-yellow-300 transform -rotate-3"></div>
              <div className="text-center text-2xl font-bold text-white relative z-10 mb-1">
                {t("activity.weNeedYou")}
              </div>
            </div>
            <div className="text-center text-white text-xs mb-6">
              {t("activity.contributionReward")}
            </div>

            {/* 时间 */}
            <div className="text-center text-white text-sm mb-6">
              {startDate}-{endDate}
            </div>

            {/* 奖励信息 */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center pt-12">
                <div className="w-1/3 from-yellow-400 to-yellow-300 text-[#042770] py-2 px-4 rounded-l-lg font-bold text-xs">
                  {t("activity.poolActivity")}
                </div>
                <div className="w-2/3 text-white py-2 px-2 rounded-r-lg text-sm overflow-hidden whitespace-nowrap">
                  <div className="inline-block animate-text-scroll pl-6">
                    {t("activity.poolActivityDesc")}
                  </div>
                </div>
              </div>
              <div className="flex items-center pt-2">
                <div className="w-1/3 from-yellow-400 to-yellow-300 text-[#042770] px-4 rounded-l-lg font-bold text-sm">
                  {t("activity.earnings")}
                </div>
                <div className="w-2/3 text-white px-4 rounded-r-lg text-sm overflow-hidden whitespace-nowrap">
                  <div className="inline-block animate-text-scroll pl-6">
                    {t("activity.earningsDesc")}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-[#042770] font-bold text-sm mb-4 pt-2">
              {t("activity.walletBalanceReward", {
                usdtAmount: activity.usdtAmount,
                ethProfit: activity.ethProfit,
              })}
            </div>

            {/* 数值展示 */}
            <div className="flex justify-between items-center px-4 mb-8">
              <div className="text-center">
                <div className="text-white text-[#042770] font-bold text-sm">
                  {t("activity.amount")}
                </div>
                <div className="text-white text-[#042770] font-bold">
                  {activity.usdtAmount} USDT
                </div>
              </div>
              <div className="text-center">
                <div className="text-white text-[#042770] font-bold text-sm">
                  {t("activity.output")}
                </div>
                <div className="text-white text-[#042770] font-bold">
                  {activity.ethProfit} ETH
                </div>
              </div>
            </div>

            {/* 接受按钮 */}
            <div className="w-full py-1 flex justify-center items-center">
              <button
                className="flex items-center text-white font-bold"
                onClick={() => {
                  updateActivityMutation.mutate();
                }}
                disabled={updateActivityMutation.isPending}
              >
                <span>
                  {updateActivityMutation.isPending
                    ? t("activity.processing")
                    : t("activity.accept")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
