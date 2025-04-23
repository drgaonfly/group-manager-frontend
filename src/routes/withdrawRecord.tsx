import { useTranslation } from "react-i18next";
import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../lib/auth";
import Pagination from "../components/Pagination";
import ReasonAlert from "../components/ReasonAlert";

// 定义提现记录的类型
interface WithdrawRecord {
  _id: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "rejected" | "processing";
  createdAt: string;
  finalAmount: number;
  fee: number;
  reason?: string; // 拒绝原因
}

function Record() {
  const { t } = useTranslation();

  // 获取用户信息
  const { data: user } = useUser();

  const [withdrawRecords, setWithdrawRecords] = useState<WithdrawRecord[]>([]);

  const [showRecords, setShowRecords] = useState(false);
  const [showReasonAlert, setShowReasonAlert] = useState(false);
  const [currentReason, setCurrentReason] = useState("");
  const { isLoading } = useQuery({
    queryKey: ["withdrawRecords", user?._id],
    queryFn: async () => {
      const response = await axios.get(`/withdraws/customer`);
      if (response.data?.data) {
        setWithdrawRecords(response.data?.data);
        setShowRecords(true);
      }
    },
  });

  // 处理点击查看拒绝原因
  const handleShowReason = (reason: string) => {
    setCurrentReason(reason);
    setShowReasonAlert(true);
  };

  return (
    <div className="min-h-screen bg-[#1a1b1e] p-5">
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
          <span className="text-white ml-4">{t("withdrawRecords")}</span>
        </div>
      </div>

      {/* 采矿记录 */}
      <div className="flex flex-col items-center justify-center h-screen mb-5 pt-4">
        <div className="flex flex-col items-center justify-center w-full max-w-2xl">
          <div className="overflow-y-auto max-h-[90vh] w-full">
            {" "}
            {/* 设置最大高度并启用滚动 */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                {" "}
                {/* 使用 Flexbox 居中 */}
                <span className="text-gray-400">{t("record.loading")}</span>
              </div>
            ) : showRecords && withdrawRecords.length > 0 ? (
              <Pagination
                items={withdrawRecords}
                itemsPerPage={5}
                className="w-full"
                newestFirst={true}
                renderItem={(record) => (
                  <div
                    key={record._id}
                    className="bg-[#25262b] text-white rounded-lg shadow-md p-4 mb-4 w-full transition-opacity duration-500 ease-in-out"
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
                          {t("record.fee")}: {record.fee} {t("miningpool.usdt")}
                        </span>
                      ) : record.status === "rejected" && record.reason ? (
                        <span
                          className="text-sm flex items-center text-red-400 cursor-pointer hover:text-red-300 transition-colors duration-200 bg-[#2d2d35] px-2 py-1 rounded-md"
                          onClick={() => handleShowReason(record.reason || "")}
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
                          {t("record.viewReason", { defaultValue: "查看原因" })}
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
                emptyMessage={
                  <div className="flex flex-col items-center justify-center h-full">
                    <img
                      src="/nors-BR_U97rM.png"
                      alt={t("miningpool.noDataAlt")}
                      className="w-24 h-24 mb-4 object-contain"
                    />
                    <span className="text-gray-400">
                      {t("miningpool.noData")}
                    </span>
                  </div>
                }
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                {" "}
                {/* 使用 Flexbox 居中 */}
                <img
                  src="/nors-BR_U97rM.png"
                  alt={t("miningpool.noDataAlt")}
                  className="w-24 h-24 mb-4 object-contain"
                />
                <span className="text-gray-400">{t("miningpool.noData")}</span>
              </div>
            )}
          </div>
        </div>
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

export default Record;
