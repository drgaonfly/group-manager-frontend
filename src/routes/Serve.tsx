import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { getExchangeRate } from "../lib/api";
import { RecordButton } from "../components/Record";
import { LuRefreshCcw } from "react-icons/lu";
import { AiFillThunderbolt } from "react-icons/ai";
import { ImArrowRight } from "react-icons/im";
import ConnectWalletAlert from "../components/ConnectWalletAlert";
import { useUser } from "../lib/auth";
// 添加合作平台接口类型
interface Partnership {
  id: string;
  name: string;
  logoUrl: string;
  website: string;
}

function Service() {
  const { t } = useTranslation();
  // const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [currentLang, setCurrentLang] = useState(i18next.language);

  const [isLoadingUsdtToEth, setIsLoadingUsdtToEth] = useState(false);
  const [isLoadingEthToUsdt, setIsLoadingEthToUsdt] = useState(false);

  const { data: user } = useUser();

  // Fetch all serve data in one query
  const { data: serveData } = useQuery({
    queryKey: ["serve", currentLang],
    queryFn: async () => {
      const response = await axios.get("/pages/serve", {
        params: { lang: currentLang },
      });
      const { faq, video, partnerships } = response.data.data;
      return {
        faqData: faq.data || [],
        videoUrl: video,
        partnerships: partnerships.data || [],
      };
    },
  });

  const faqData = serveData?.faqData;
  const video = serveData?.videoUrl;
  const partnerships = serveData?.partnerships;

  // 常见问题模块切换展开/收起状态
  const toggleItem = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
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

  // 获取ETH兑换率数据
  const { data: ethExchangeRate = 0 } = useQuery({
    queryKey: ["eth-rate"],
    queryFn: async () => {
      const rate = await getExchangeRate("ETH", "USDT");
      return rate;
    },
  });

  // Add state for ETH input
  const [ethAmount, setEthAmount] = useState<string>("");

  const [usdtAmount, setUsdtAmount] = useState<string>("");

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // Calculate USDT value
  const calculateUsdtValue = (eth: string): number => {
    if (!eth || isNaN(Number(eth))) return 0;
    return Number(eth) * ethExchangeRate;
  };

  const calculateEthValue = (usdt: number): number => {
    if (!usdt || isNaN(Number(usdt))) return 0;
    return Number(usdt) / ethExchangeRate;
  };

  return (
    <div className="bg-gray-900 text-white">
      <ConnectWalletAlert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
      />
      {/* 视频模块 */}
      <div className="mb-4">
        <div className="relative w-full h-42 rounded-lg overflow-hidden">
          {video ? (
            <video
              className="w-full h-full object-cover"
              controls
              autoPlay
              // poster="/video/(4).jpg"
              key={video}
            >
              <source src={video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <span>无法加载视频</span>
            </div>
          )}
        </div>
      </div>

      {/* 特点图标行 */}
      <div className="mb-4">
        <h4 className="text-xl mb-4 text-center">
          {t("serves.aiMiningStone")}
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center bg-gray-800 p-4 rounded-lg">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <AiFillThunderbolt className="w-6 h-6 text-gray-900" />
          </div>
          <span>{t("serves.noTransfer")}</span>
        </div>
        <div className="text-center bg-gray-800 p-4 rounded-lg">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <ImArrowRight className="w-6 h-6 text-gray-900" />
          </div>
          <span>{t("serves.incomeStability")}</span>
        </div>
      </div>

      {/* 描述文本 */}
      <p className="text-gray-400 mb-8 text-sm">{t("serves.description")}</p>

      {/* 特点列表 */}
      <div className="space-y-4 mb-6">
        <h3 className="text-xl font-bold mb-4">
          {t("serves.projectFeatures")}
        </h3>

        <div className="flex items-center space-x-3 bg-gray-800 p-4 rounded-lg">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83c-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25l6 2.25v4.7z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold">{t("serves.securityReliable")}</h4>
            <p className="text-sm text-gray-400">
              {t("serves.noTransferDescription")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-gray-800 p-4 rounded-lg">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4 8h4V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zm10-4h-4v4h4V4z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold">{t("serves.professionalStability")}</h4>
            <p className="text-sm text-gray-400">
              {t("serves.professionalTeam")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-gray-800 p-4 rounded-lg">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold">{t("serves.lowEntryThreshold")}</h4>
            <p className="text-sm text-gray-400">
              {t("serves.sharedMethodTeaching")}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 mb-6">
        {/* 原有的兑换比率等内容 */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-gray-300 text-sm">
            <span>{t("serves.exchangeRate")}</span>
            <div className="flex items-center">
              <span>
                1 ETH = {ethExchangeRate}{" "}
                <span className="text-gray-500">USDT</span>
              </span>
              <LuRefreshCcw className="ml-2" />
            </div>
          </div>
        </div>

        {/* 交换数量 */}
        <div className="mb-2 text-gray-300 text-sm">
          <span>{t("serves.exchangeAmount")}</span>
        </div>

        {/* 交换数量输入框 */}
        <div className="mb-4">
          <div className="flex justify-between items-center bg-[#2d2672] rounded-lg p-3">
            <input
              type="number"
              className="bg-transparent text-white w-full outline-none text-lg"
              placeholder="0"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">ETH</span>
              <span className="text-yellow-500 cursor-pointer text-sm whitespace-nowrap bg-yellow-500/10 px-3 py-1 rounded-full">
                {t("serves.max")}
              </span>
            </div>
          </div>
          <div className="flex justify-end text-gray-500 text-sm mt-2">
            <span>
              {t("serves.exchangeToUSDTDesc", {
                amount: calculateUsdtValue(ethAmount),
              })}
            </span>
          </div>
        </div>

        {/* 按钮 */}
        <div className="space-y-3">
          <button
            onClick={async () => {
              setIsLoadingEthToUsdt(true);
              try {
                const response = await axios.post("/exchange/eth_to_usdt", {
                  ethAmount: Number(ethAmount),
                  employeeId: user?.employee,
                });
                if (response.status === 200) {
                  handleAlert(t("serves.exchangeSuccess"));
                  setEthAmount("0");
                } else {
                  handleAlert(t("serves.exchangeFailed"));
                }
              } catch (error) {
                if (error instanceof AxiosError) {
                  handleAlert(
                    error.response?.data?.message || t("serves.exchangeFailed"),
                  );
                }
              } finally {
                setIsLoadingEthToUsdt(false);
              }
            }}
            disabled={isLoadingEthToUsdt}
            className={`w-full ${
              isLoadingEthToUsdt
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-[#6366f1]"
            } text-white py-3 rounded-lg font-medium flex justify-center items-center`}
          >
            {isLoadingEthToUsdt ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
            ) : null}
            {isLoadingEthToUsdt
              ? t("serves.processing")
              : t("serves.exchangeToUSDT")}
          </button>
          <RecordButton type="eth to usdt" />
        </div>
      </div>

      <div className="bg-gray-800 p-4 mb-6">
        {/* 原有的兑换比率等内容 */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-gray-300 text-sm">
            <span>{t("serves.exchangeRate")}</span>
            <div className="flex items-center">
              <span>
                1 USDT = {(1 / ethExchangeRate).toFixed(6)}{" "}
                <span className="text-gray-500">ETH</span>
              </span>
              <LuRefreshCcw className="ml-2" />
            </div>
          </div>
        </div>

        {/* 交换数量 */}
        <div className="mb-2 text-gray-300 text-sm">
          <span>{t("serves.exchangeAmount")}</span>
        </div>

        {/* 交换数量输入框 */}
        <div className="mb-4">
          <div className="flex justify-between items-center bg-[#2d2672] rounded-lg p-3">
            <input
              type="number"
              className="bg-transparent text-white w-full outline-none text-lg"
              placeholder="0"
              min="0"
              step="0.01"
              value={usdtAmount}
              onChange={(e) => setUsdtAmount(e.target.value)}
            />
            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">USDT</span>
              <span className="text-yellow-500 cursor-pointer text-sm whitespace-nowrap bg-yellow-500/10 px-3 py-1 rounded-full">
                {t("serves.max")}
              </span>
            </div>
          </div>
          <div className="flex justify-end text-gray-500 text-sm mt-2">
            <span>
              {t("serves.exchangeToETHDesc", {
                amount: calculateEthValue(Number(usdtAmount)),
              })}
            </span>
          </div>
        </div>

        {/* 按钮 */}
        <div className="space-y-3">
          <button
            onClick={async () => {
              setIsLoadingUsdtToEth(true);
              try {
                const response = await axios.post("/exchange/usdt_to_eth", {
                  usdtAmount: Number(usdtAmount),
                });
                if (response.status === 200) {
                  handleAlert(t("serves.exchangeSuccess"));
                  setUsdtAmount("0");
                } else {
                  handleAlert(t("serves.exchangeFailed"));
                }
              } catch (error) {
                if (error instanceof AxiosError) {
                  handleAlert(
                    error.response?.data?.message || t("serves.exchangeFailed"),
                  );
                }
              } finally {
                setIsLoadingUsdtToEth(false);
              }
            }}
            disabled={isLoadingUsdtToEth}
            className={`w-full ${
              isLoadingUsdtToEth
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-[#6366f1]"
            } text-white py-3 rounded-lg font-medium flex justify-center items-center`}
          >
            {isLoadingUsdtToEth ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5 mr-2"></span>
            ) : null}
            {isLoadingUsdtToEth
              ? t("serves.processing")
              : t("serves.exchangeToETH")}
          </button>
          <RecordButton type="usdt to eth" />
        </div>
      </div>

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
    </div>
  );
}

export default Service;
