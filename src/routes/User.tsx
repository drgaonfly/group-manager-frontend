import { useState } from 'react';
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next';
import ConnectWalletAlert from '../components/ConnectWalletAlert';

function User() {
    const { t } = useTranslation();
    const [showAlert, setShowAlert] = useState(false);

    // 处理提现按钮点击
    const handleWithdraw = () => {
        setShowAlert(true);
    };

    return (
        <div className="bg-gray-900 text-white">
            {/* 总资产区域 */}
            <div className="mb-6">
                <div className="flex items-center justify-end">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                    </svg>
                    <Link to="/bill" className="text-xs text-yellow-500">{t('users.assetBill')}</Link>
                </div>
                <div className="flex justify-center items-center mb-2">
                    <div className="text-white text-2xl font-extrabold">{t('users.totalAssets')}</div>
                </div>
                <div className="text-3xl font-bold text-center">
                    <span className="text-yellow-500">0.00</span>
                    <span className="text-yellow-500 text-lg ml-1">{t('miningpool.usdt')}</span>
                </div>
                <div className="text-gray-400 text-xs mt-1 text-center">
                    {t('users.totalIncome')}: <span className="text-yellow-500">{t('miningpool.usdt')}</span>
                </div>
            </div>

            {/* 数据统计区域 */}
            <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-800 p-4 rounded-lg">
                <div className="text-center">
                    <div className="text-gray-400 text-xs mb-2">{t('users.todayEarnings')}</div>
                    <div className="text-yellow-500 text-lg">0.00 {t('miningpool.usdt')}</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-400 text-xs mb-2">{t('users.yieldRate')}</div>
                    <div className="text-yellow-500 text-lg">0.00%</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-400 text-xs mb-2">{t('users.lockedBalance')}</div>
                    <div className="text-yellow-500 text-lg">0.00 {t('miningpool.usdt')}</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-400 text-xs mb-2">{t('users.availableBalance')}</div>
                    <div className="text-yellow-500 text-lg">0.00 {t('miningpool.usdt')}</div>
                </div>
            </div>

            {/* 提现区域 */}
            <div className="text-lg font-medium mb-2 text-center">{t('users.withdraw')}</div>
            <div className="mb-4 bg-gray-800 p-4 rounded-lg">
                <input 
                    type="number" 
                    placeholder={t('users.enterWithdrawAmount')}
                    className="w-full bg-[#181e25] p-2 mb-4 rounded-lg outline-none focus:outline-none" 
                />
                <div className="flex justify-between items-center text-sm mb-3">
                    <span className="">{t('users.available')}: 0 {t('miningpool.usdt')}</span>
                    <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                        </svg>
                        <Link to="/record" className="text-gray-400">{t('users.record')}</Link>
                    </div>
                </div>
                <button 
                    className="w-full bg-yellow-500 text-black py-3 rounded-full font-medium"
                    onClick={handleWithdraw}
                >
                    {t('users.confirm')}
                </button>
            </div>

            {/* 钱包连接提醒弹窗 */}
            <ConnectWalletAlert 
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
            />

            {/* 采矿记录 */}
            <div className="mb-5">
                <h2 className="text-center mb-4">{t('users.myMiningPool')}</h2>
                <div className="flex flex-col items-center justify-center text-gray-400">
                    <img src="/nors-BR_U97rM.png" alt={t('miningpool.noDataAlt')} className="w-24 h-24 mb-4 object-contain" />
                    <span>{t('miningpool.noData')}</span>
                </div>
            </div>
        </div>
    )
}

export default User