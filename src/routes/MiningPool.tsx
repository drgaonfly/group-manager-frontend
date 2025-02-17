import { useTranslation } from 'react-i18next';

function MiningPool() {
    const { t } = useTranslation();

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
                        <div className="grid grid-cols-3 text-sm p-3">
                            <div>0-999</div>
                            <div className="text-center">1.00%</div>
                            <div className="text-right">0-10</div>
                        </div>
                        <div className="grid grid-cols-3 text-sm p-3">
                            <div>1000-4999</div>
                            <div className="text-center">1.50%</div>
                            <div className="text-right">15-75</div>
                        </div>
                        <div className="grid grid-cols-3 text-sm p-3">
                            <div>5000-9999</div>
                            <div className="text-center">2.50%</div>
                            <div className="text-right">125-250</div>
                        </div>
                        <div className="grid grid-cols-3 text-sm p-3">
                            <div>10000-29999</div>
                            <div className="text-center">4.00%</div>
                            <div className="text-right">400-1200</div>
                        </div>
                        <div className="grid grid-cols-3 text-sm p-3">
                            <div>30000-59999</div>
                            <div className="text-center">6.00%</div>
                            <div className="text-right">1800-3600</div>
                        </div>
                        <div className="grid grid-cols-3 text-sm p-3">
                            <div>60000-99999</div>
                            <div className="text-center">7.00%</div>
                            <div className="text-right">4200-7000</div>
                        </div>
                        <div className="grid grid-cols-3 text-sm p-3">
                            <div>100000-299999</div>
                            <div className="text-center">9.00%</div>
                            <div className="text-right">9000-27000</div>
                        </div>
                        <div className="grid grid-cols-3 text-sm p-3">
                            <div>300000-999999</div>
                            <div className="text-center">10.00%</div>
                            <div className="text-right">30000-100000</div>
                        </div>
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