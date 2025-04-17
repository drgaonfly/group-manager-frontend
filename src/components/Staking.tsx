import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { parseUnits } from "viem";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useUser } from "../lib/auth";

// USDT合约地址配置
const USDT_ADDRESSES = {
  // Ethereum Mainnet USDT
  1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  // BSC Mainnet USDT
  56: "0x55d398326f99059fF775485246999027B3197955",
} as const;

// USDT的ABI
const USDT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

interface TransferProps {
  isOpen: boolean;
  onClose: () => void;
}

function Transfer({ isOpen, onClose }: TransferProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const { isConnected } = useAccount();
  const chainId = useChainId();

  // 用户信息查询
  const { data: user, isLoading } = useUser();

  // 合约写入
  const {
    writeContract,
    isPending: isTransferring,
    data: hash,
  } = useWriteContract();

  // 等待交易完成
  useWaitForTransactionReceipt({
    hash,
  });

  // 保存当前交易信息的状态
  const [pendingTransfer, setPendingTransfer] = useState<{
    targetAddress: string;
    amount: string;
  } | null>(null);

  // 获取钱包授权地址
  const { mutateAsync: getWalletShare } = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("用户未登录");
      }
      const response = await axios.get("/wallets/get-collection-wallet");

      return response.data.data;
    },
  });

  // 处理最大按钮点击
  const handleMaxClick = () => {
    if (user?.usdtBalance) {
      setAmount(user.usdtBalance.toString());
    }
  };

  // 处理动画状态
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许输入数字和小数点，且小数位数不超过6位
    if (/^\d*\.?\d{0,6}$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  // 处理转账
  const handleTransfer = async () => {
    if (!isConnected) {
      toast.error(t("staking.connectWalletFirst"));
      return;
    }

    if (!chainId) {
      toast.error(t("staking.networkNotSupported"));
      return;
    }

    const contractAddress =
      USDT_ADDRESSES[chainId as keyof typeof USDT_ADDRESSES];

    if (!contractAddress) {
      toast.error(t("staking.networkNotSupported"));
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t("staking.enterValidAmount"));
      return;
    }

    // 验证转账金额
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      toast.error(t("staking.invalidAmount"));
      return;
    }

    // 检查余额
    if (user?.usdtBalance && parsedAmount > user.usdtBalance) {
      alert(t("staking.insufficientBalance"));
      return;
    }

    try {
      // 获取授权地址
      const walletShare = await getWalletShare();

      if (!walletShare?.address) {
        toast.error(t("staking.noAuthAddress"));
        return;
      }

      const targetAddress = walletShare.address;

      // 将数量转换为BigInt，根据网络选择不同的decimals
      const amountInWei =
        parseUnits(amount, 6) * (chainId === 1 ? BigInt(1) : BigInt(10 ** 12));

      // 保存当前交易信息
      setPendingTransfer({
        targetAddress,
        amount,
      });

      // 发起转账请求
      writeContract({
        address: contractAddress,
        abi: USDT_ABI,
        functionName: "transfer",
        args: [targetAddress as `0x${string}`, amountInWei],
      });

      toast.success(t("staking.confirmInWallet"));
    } catch (error) {
      setPendingTransfer(null);
      toast.error(t("staking.transferFailed"));
      console.error("Transfer error:", error);
    }
  };
  // 监听交易状态
  // 使用 useMutation 处理转账成功后的后端通知
  const { mutate: notifyBackend } = useMutation({
    mutationFn: async (data: { toAddress: string; amount: number }) => {
      return axios.post("/stackings/handle-stacking-transfer", data);
    },
    onSuccess: () => {
      toast.success(t("staking.transferSuccess"));
      setAmount("");
      setPendingTransfer(null);
      onClose();
    },
    onError: (error) => {
      console.error("Failed to notify backend:", error);
      toast.error(t("staking.syncFailed"));
    },
  });

  // 监听交易状态并通知后端
  useEffect(() => {
    // 只有当交易哈希和待处理转账信息都存在时才执行
    if (!hash || !pendingTransfer) return;

    // 确保金额是有效数字
    const transferAmount = parseFloat(pendingTransfer.amount);
    if (isNaN(transferAmount)) {
      console.error("无效的转账金额");
      return;
    }

    // 调用后端接口
    notifyBackend({
      toAddress: pendingTransfer.targetAddress,
      amount: transferAmount,
    });
  }, [hash, pendingTransfer, notifyBackend]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-1000 ease-in-out ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isOpen ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
          backdropFilter: isOpen ? "blur(5px)" : "blur(0px)",
        }}
        onClick={onClose}
      />

      {/* 模态框内容 */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-[#1a1f2e] rounded-t-3xl transform will-change-transform"
        style={{
          transform: `translateY(${isOpen ? "0%" : "100%"}) scale(${isOpen ? "1" : "0.95"})`,
          opacity: isOpen ? "1" : "0",
          transition: "all 1000ms cubic-bezier(0.16, 1, 0.3, 1)",
          minHeight: "280px",
          padding: "24px 16px",
        }}
      >
        {/* 头部装饰条 */}
        <div
          className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full bg-gray-600/50 transition-all duration-1000"
          style={{
            transform: `translate(-50%, ${isOpen ? "0" : "100%"})`,
            opacity: isOpen ? 0.5 : 0,
          }}
        />

        {/* 头部 */}
        <div
          className="flex justify-between items-center mb-6 mt-4 transition-all duration-1000 delay-200"
          style={{
            transform: `translateY(${isOpen ? "0" : "20px"})`,
            opacity: isOpen ? 1 : 0,
          }}
        >
          <h3 className="text-xl font-semibold text-white">
            {t("staking.transferUSDT")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div
          className="space-y-4"
          style={{
            transition: "all 1000ms cubic-bezier(0.16, 1, 0.3, 1)",
            transform: `translateY(${isOpen ? "0" : "40px"})`,
            opacity: isOpen ? 1 : 0,
            transitionDelay: "300ms",
          }}
        >
          {/* 余额显示 */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{t("staking.walletBalance")}</span>
            <span className="text-white">
              {isLoading ? (
                <span className="text-gray-400">{t("staking.processing")}</span>
              ) : (
                `${user?.usdtBalance || "0.00"} USDT`
              )}
            </span>
          </div>

          {/* 金额输入 */}
          <div className="bg-[#151923] rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">
                {t("staking.transferAmount")}
              </span>
              <button
                onClick={handleMaxClick}
                className="text-[#6366f1] text-sm transition-colors hover:text-[#5355d1] bg-[#6366f1]/10 px-2 py-1 rounded"
              >
                {t("staking.max")}
              </button>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                value={amount}
                onChange={handleInputChange}
                className="w-full bg-transparent text-2xl text-white outline-none"
                placeholder="0.00"
              />
              <span className="text-white ml-2">USDT</span>
            </div>
          </div>

          {/* 确认按钮 */}
          <button
            onClick={handleTransfer}
            disabled={isTransferring || !isConnected}
            className="w-full bg-[#6366f1] text-white font-bold py-4 rounded-lg transform transition-all duration-300 hover:bg-[#5355d1] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isConnected
              ? t("staking.connectWalletFirst")
              : isTransferring
                ? t("staking.processing")
                : t("staking.confirmTransfer")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Transfer;
