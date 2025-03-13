import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

// 定义提现记录的类型
interface WithdrawRecord {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
}

function Record() {
    const { t } = useTranslation();
    const { userId } = useParams<{ userId: string }>();
    const [withdrawRecords, setWithdrawRecords] = useState<WithdrawRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showRecords, setShowRecords] = useState(false);

    useEffect(() => {
        const fetchWithdrawRecords = async () => {
            try {
                const response = await axios.get(`/withdraws/customer/${userId}`);
                setWithdrawRecords(response.data.data);
                setShowRecords(true);
            } catch (error) {
                console.error('Error fetching withdraw records:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWithdrawRecords();
    }, [userId]);

    return (
      <div className="min-h-screen bg-[#1a1b1e] p-5">
        {/* 顶部导航 */}
        <div className="fixed top-0 left-0 right-0 bg-[#1a1b1e] z-10">
          <div className="flex items-center px-4 py-3">
            <button 
              onClick={() => window.history.back()} 
              className="text-white"
            >
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
            <span className="text-white ml-4">{t('record.back')}</span>
          </div>
        </div>
  
        {/* 采矿记录 */}
        <div className="flex flex-col items-center justify-center h-screen mb-5 pt-16">
          <h2 className="text-center mb-4 text-2xl font-bold text-white">{t('record.myMiningPool')}</h2>
          <div className="flex flex-col items-center justify-center w-full max-w-2xl">
            <div className="overflow-y-auto max-h-[70vh] w-full"> {/* 设置最大高度并启用滚动 */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full"> {/* 使用 Flexbox 居中 */}
                  <span className="text-gray-400">{t('record.loading')}</span>
                </div>
              ) : showRecords && withdrawRecords.length > 0 ? (
                withdrawRecords.map(record => (
                  <div key={record._id} className="bg-gray-800 text-white rounded-lg shadow-md p-4 mb-4 w-full transition-opacity duration-500 ease-in-out">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-lg font-semibold">{record.amount} {t('miningpool.usdt')}</span>
                      </div>
                      <span className="text-sm text-gray-400">{new Date(record.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mt-2">
                      <span className={`text-sm ${record.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                        {t(`record.status.${record.status}`)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full"> {/* 使用 Flexbox 居中 */}
                  <img src="/nors-BR_U97rM.png" alt={t('miningpool.noDataAlt')} className="w-24 h-24 mb-4 object-contain" />
                  <span className="text-gray-400">{t('miningpool.noData')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}

export default Record; 