import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import axios from "axios";
import { getUserProfile } from "../lib/api";
import { useTranslation } from "react-i18next";

// 使用实际的 Record 接口
interface IRecord {
  id: string;
  type: 'usdt to eth' | 'eth to usdt';
  amount: number;
  createdAt: string;
}

// Modal 组件
export function ExchangeRecordModal({ isOpen, onClose, type }: { isOpen: boolean; onClose: () => void; type: string }) {
  const { t } = useTranslation();
  // 获取交易记录
  const { data: records, isLoading } = useQuery<IRecord[]>({
    queryKey: ['exchangeRecords'],
    queryFn: async () => {
      const userProfile = await getUserProfile();
      if (!userProfile?.user?._id) {
        throw new Error('User not found');
      }
      const response = await axios.post(`/records/customer/${userProfile.user._id}`, {
        type: type
      });
      return response.data.data;
    },
    enabled: isOpen, // 只在 modal 打开时获取数据
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 w-11/12 max-w-md rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{t('record.exchangeRecords')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {isLoading ? (
            <div className="text-center text-gray-400 py-4">{t('record.loading')}</div>
          ) : !records || records.length === 0 ? (
            <div className="text-center text-gray-400 py-4">{t('record.noData')}</div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">
                      {record.type === 'eth to usdt' ? t('record.ethToUsdt') : t('record.usdtToEth')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(record.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>{record.amount} {record.type === 'eth to usdt' ? 'ETH' : 'USDT'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 记录按钮组件
export function RecordButton({ type }: { type: string }) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="w-full bg-[#C3A31E] text-white py-3 rounded-lg font-medium"
      >
        {t('record.exchangeRecord')}
      </button>
      <ExchangeRecordModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
        type={type}
      />
    </>
  );
}
