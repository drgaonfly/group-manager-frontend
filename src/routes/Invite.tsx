import { useState } from "react";
import { useTranslation } from "react-i18next";
import ConnectWalletAlert from "../components/ConnectWalletAlert";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useUser } from "../lib/auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// 定义深度收益接口
interface DepthIncome {
  _id: string;
  depth: number;
  incomeRate: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface DepthIncomeResponse {
  success: boolean;
  data: DepthIncome[];
}

// 定义客户数据接口
interface Customer {
  _id: string;
  id: string;
  network: string;
  address: string;
  liquidRate?: number; // 改为可选属性
  depth?: number;
  children?: Customer[];
  createdAt?: string;
  ownInviteCode?: string;
  // 其他可能的字段
}

function Invite() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("invite"); // 'invite' 或 'record'
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { openConnectModal } = useConnectModal();

  const { data: user } = useUser();

  // 获取深度收益数据
  const { data: depthIncomeResponse, isLoading: depthIncomeLoading } = useQuery(
    {
      queryKey: ["depthIncome"],
      queryFn: async () => {
        const response = await axios.get<DepthIncomeResponse>(
          "/depth-incomes/latest",
        );
        return response.data;
      },
    },
  );

  const handleButtonClick = async () => {
    try {
      if (!user) {
        setAlertMessage(t("connectWalletAlert"));
        setShowAlert(true);
        openConnectModal?.();
        return;
      }

      if (user.ownInviteCode) {
        const baseUrl = import.meta.env.VITE_API_URL_DEV;
        const fullInviteUrl = `${baseUrl}?inviter=${user.ownInviteCode}`;
        await navigator.clipboard.writeText(fullInviteUrl);
        setAlertMessage(t("invite.copySuccess"));
      } else {
        setAlertMessage(t("invite.noInviteCode"));
      }
      setShowAlert(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setAlertMessage(t("invite.copyFailed"));
      setShowAlert(true);
    }
  };

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
  // 渲染客户树状结构的递归函数
  const renderCustomerTree = (customer: Customer, level = 0) => {
    return (
      <div key={customer._id} className="mb-2">
        <div
          className={`flex items-center justify-between p-3 rounded bg-[#1a1f2e] hover:bg-[#232838] transition-colors`}
          style={{ marginLeft: level * 20 + "px" }}
        >
          <div className="flex items-center">
            <span className="bg-[#2d2d35] text-xs px-2 py-1 rounded mr-2 text-yellow-400 font-medium">
              {customer.network}
            </span>
            <span className="text-sm text-gray-300">
              {customer.address.substring(0, 6)}...
              {customer.address.substring(customer.address.length - 4)}
            </span>
            <button
              className="text-xs text-gray-400 hover:text-yellow-400 bg-[#2d2d35] p-1 rounded ml-2 group"
              onClick={() => {
                navigator.clipboard.writeText(customer.address);
                setAlertMessage(t("invite.copySuccess") || "复制成功");
                setShowAlert(true);
              }}
            >
              <svg
                className="w-3 h-3 group-hover:text-yellow-400 transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
              </svg>
            </button>
          </div>

          {customer.createdAt && (
            <div className="text-right text-xs text-gray-500">
              <div>{formatDate(customer.createdAt)}</div>
              <div>{formatTime(customer.createdAt)}</div>
            </div>
          )}
        </div>

        {customer.children && customer.children.length > 0 && (
          <div className="mt-2">
            {customer.children.map((child) =>
              // 递归调用renderCustomerTree，而不是直接渲染子元素
              renderCustomerTree(child, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* 顶部标题和图标部分 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">{t("invite.title")}</h1>
          <p className="text-sm text-gray-400">{t("invite.subtitle1")}</p>
          <p className="text-sm text-gray-400">{t("invite.subtitle2")}</p>
        </div>
        <div className="w-20 h-20">
          <img
            src="/yqtbg-CTuPoj49.png"
            alt={t("invite.inviteIcon")}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-8 mb-6 mx-auto w-68">
        <button
          className={`flex-1 pb-2 text-center text-lg ${activeTab === "invite" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400"}`}
          onClick={() => setActiveTab("invite")}
        >
          {t("invite.tabInvite")}
        </button>
        <button
          className={`flex-1 pb-2 text-center text-lg ${activeTab === "record" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400"}`}
          onClick={() => setActiveTab("record")}
        >
          {t("invite.tabRecord")}
        </button>
      </div>

      {/* 内容区域 */}
      {activeTab === "invite" ? (
        <div className="space-y-6">
          {/* 加入会员按钮 */}
          <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
            <span>{t("invite.joinMemberTip")}</span>
            <button
              className="bg-yellow-500 text-black px-4 py-2 rounded"
              onClick={handleButtonClick}
            >
              {t("invite.drawNow")}
            </button>
          </div>

          {/* 邀请链接 */}
          <div className="bg-gray-800 p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <span>{t("invite.myInviteLink")}</span>
              <div className="flex items-center gap-2">
                <button
                  className="bg-yellow-500 text-black px-4 py-1 rounded"
                  onClick={() => {
                    if (!user) {
                      setAlertMessage(t("connectWalletAlert"));
                      setShowAlert(true);
                      openConnectModal?.();
                      return;
                    }
                    if (user.ownInviteCode) {
                      const baseUrl = import.meta.env.VITE_API_URL_DEV;
                      const fullInviteUrl = `${baseUrl}?inviter=${user.ownInviteCode}`;
                      navigator.clipboard.writeText(fullInviteUrl);
                      setAlertMessage(t("invite.copySuccess"));
                      setShowAlert(true);
                    }
                  }}
                >
                  {t("invite.copy")}
                </button>
              </div>
            </div>
          </div>

          {/* 邀请步骤 */}
          <div className="space-y-8 bg-gray-800 p-4 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13.95 2.013l7.054 7.053a1.5 1.5 0 0 1 0 2.121l-7.054 7.054a1.5 1.5 0 0 1-2.121 0l-7.054-7.054a1.5 1.5 0 0 1 0-2.121l7.054-7.053a1.5 1.5 0 0 1 2.121 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">{t("invite.step1Title")}</h3>
                <p className="text-sm text-gray-400">{t("invite.step1Desc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8 8z" />
                  <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">{t("invite.step2Title")}</h3>
                <p className="text-sm text-gray-400">{t("invite.step2Desc")}</p>
              </div>
            </div>
            {/* 邀请步骤 */}
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83c-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25l6 2.25v4.7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold">{t("invite.step3Title")}</h3>
                <p className="text-sm text-gray-400">{t("invite.step3Desc")}</p>
              </div>
            </div>
          </div>

          {/* 深度收益模块 */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold text-lg text-center mb-4">
              {t("invite.depthIncomeTitle") || "深度收益"}
            </h3>

            {depthIncomeLoading ? (
              <div className="flex justify-center py-4">
                <span className="text-gray-400">
                  {t("loading") || "加载中..."}
                </span>
              </div>
            ) : depthIncomeResponse?.success &&
              depthIncomeResponse.data?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-2 text-left text-gray-400">
                        {t("invite.level") || "邀请级别"}
                      </th>
                      <th className="py-2 text-right text-gray-400">
                        {t("invite.incomeRate") || "收益率"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {depthIncomeResponse.data.map((item) => (
                      <tr key={item._id} className="border-b border-gray-700">
                        <td className="py-2 text-left">
                          <span className="bg-gray-700 px-2 py-1 rounded-md">
                            {item.depth}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span className="text-yellow-500 font-bold">
                            {item.incomeRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                {t("invite.noDepthIncomeData") || "暂无深度收益数据"}
              </div>
            )}
          </div>
        </div>
      ) : (
        // 记录页面 - 显示层级树状结构
        <div className="space-y-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold text-lg text-center mb-4">
              {t("invite.tabRecord") || "Invited Users"}
            </h3>

            {user && user.depthCustomers && user.depthCustomers.length > 0 ? (
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                {/* 只渲染那些不是其他元素的子元素的顶层元素 */}
                {user.depthCustomers
                  .filter((customer) => {
                    // 检查这个customer是否是其他customer的子元素
                    const isChildOfAnother = user.depthCustomers?.some(
                      (parent) =>
                        parent.children?.some(
                          (child) => child._id === customer._id,
                        ),
                    );
                    return !isChildOfAnother;
                  })
                  .map((customer) => {
                    // 确保customer对象包含所需的必要属性
                    if (!customer.network) {
                      return null;
                    }
                    return renderCustomerTree(customer as Customer);
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center mt-10">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <img
                    src="/nors-BR_U97rM.png"
                    alt={t("invite.noDataAlt")}
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <p className="text-gray-400">{t("invite.noData")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 钱包连接提醒弹窗 */}
      <ConnectWalletAlert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
      />
    </div>
  );
}

export default Invite;
