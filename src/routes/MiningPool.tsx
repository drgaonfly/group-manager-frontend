import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 定义接口类型
interface BenefitItem {
    stakingmin: number;
    stakingmax: number;
    rewards: number;
    profitmax: number;
    profitmin: number;
}

function MiningPool() {
    const { t } = useTranslation();

    // 获取收益率数据
    const { data: benefitsData } = useQuery<BenefitItem[]>({
        queryKey: ['liquidityBenefits'],
        queryFn: async () => {
            const response = await axios.get('/liquidity/benefits');
            return response.data.data;
        }
    });

    return (
        <div className="">
            <div className="text-center mb-8">
                <h1 className="text-xl mb-2">{t('miningpool.title')}</h1>
                <div className="text-yellow-500 text-3xl font-bold mb-1">
                    27578928.3035 <span className="text-sm">USDT</span>
                </div>
                <div className="text-gray-400 text-sm">{t('miningpool.totalProduction')}</div>
            </div>

            {/* 基本信息 */}
            <div className="space-y-4 mb-8 bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400">{t('miningpool.fundingAmount')}</span>
                    <span>0.00 USDT</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400">{t('miningpool.yield')}</span>
                    <span>0.00%</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="text-gray-400">{t('miningpool.income')}</span>
                    <span>0.00 USDT</span>
                </div>
                <div className="flex justify-between items-centerpb-3">
                    <span className="text-gray-400">{t('miningpool.poolName')}</span>
                    <span>{t('miningpool.poolType')}</span>
                </div>
            </div>

            {/* 流动性收益率表格 */}
            <div className="mb-8">
                <h2 className="text-center mb-4">{t('miningpool.liquidityYield')}</h2>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 text-sm p-3 border-b border-gray-700">
                        <div className="text-gray-400">{t('miningpool.stakeAmount')}<br/>{t('miningpool.usdt')}</div>
                        <div className="text-gray-400 text-center">{t('miningpool.returnRate')}<br/>{t('miningpool.24h')}</div>
                        <div className="text-gray-400 text-right">{t('miningpool.profit')}<br/>{t('miningpool.usdt')}</div>
                    </div>
                    
                    <div className="space-y-2">
                        {benefitsData?.map((item, index) => (
                            <div key={index} className="grid grid-cols-3 text-sm p-3">
                                <div>{item.stakingmin}-{item.stakingmax}</div>
                                <div className="text-center">{item.rewards.toFixed(2)}%</div>
                                <div className="text-right">{item.profitmin}-{item.profitmax}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 采矿记录 */}
            <div className="mb-5">
                <h2 className="text-center mb-4">{t('miningpool.miningRecords')}</h2>
                <div className="flex flex-col items-center justify-center text-gray-400">
                    <img src="/nors-BR_U97rM.png" alt={t('miningpool.noDataAlt')} className="w-24 h-24 mb-4 object-contain" />
                    <span>{t('miningpool.noData')}</span>
                </div>
            </div>
        </div>
    )
}

export default MiningPool