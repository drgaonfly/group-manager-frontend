import { useState } from 'react'
import ConnectWalletAlert from './ConnectWalletAlert'

function Invite() {
    const [activeTab, setActiveTab] = useState('invite') // 'invite' 或 'record'
    const [showAlert, setShowAlert] = useState(false);

        // 处理按钮点击
        const handleButtonClick = () => {
            setShowAlert(true);
        };
        
    return (
        <div className="bg-gray-900 min-h-screen text-white">
            {/* 顶部标题和图标部分 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">邀请好友</h1>
                    <p className="text-sm text-gray-400">一起挖矿获得货币</p>
                    <p className="text-sm text-gray-400">每天赚取金币</p>
                </div>
                <div className="w-20 h-20">
                    <img src="/yqtbg-CTuPoj49.png" alt="邀请图标" className="w-full h-full" />
                </div>
            </div>

            {/* 标签切换 */}
            <div className="flex gap-8 mb-6 mx-auto w-68">
                <button 
                    className={`flex-1 pb-2 text-center text-lg ${activeTab === 'invite' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('invite')}
                >
                    邀请
                </button>
                <button 
                    className={`flex-1 pb-2 text-center text-lg ${activeTab === 'record' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('record')}
                >
                    记录
                </button>
            </div>

            {/* 内容区域 */}
            {activeTab === 'invite' ? (
                <div className="space-y-6">
                    {/* 加入会员按钮 */}
                    <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
                        <span>加入会员享矿池可参与抽奖</span>
                        <button 
                            className="bg-yellow-500 text-black px-4 py-2 rounded"
                            onClick={handleButtonClick}
                        >
                            立即抽奖
                        </button>
                    </div>

                    {/* 邀请链接 */}
                    <div className="bg-gray-800 p-4 rounded">
                        <div className="flex justify-between items-center mb-2">
                            <span>我的邀请链接</span>
                            <button 
                                className="bg-yellow-500 text-black px-4 py-1 rounded"
                                onClick={handleButtonClick}
                            >
                                复制
                            </button>
                        </div>
                    </div>

                    {/* 邀请步骤 */}
                    <div className="space-y-8 bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.95 2.013l7.054 7.053a1.5 1.5 0 0 1 0 2.121l-7.054 7.054a1.5 1.5 0 0 1-2.121 0l-7.054-7.054a1.5 1.5 0 0 1 0-2.121l7.054-7.053a1.5 1.5 0 0 1 2.121 0z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold">获取邀请链接</h3>
                                <p className="text-sm text-gray-400">链接加好友安装矿池开启30天挖矿任务</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                    <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 10c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold">推荐邀请好友</h3>
                                <p className="text-sm text-gray-400">推荐好友参与挖矿，赚取USDT</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83c-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25l6 2.25v4.7z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold">赚取加密货币</h3>
                                <p className="text-sm text-gray-400">每天赚取总达10%的矿矿收入</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // 记录页面 - 暂无数据显示
                <div className="flex flex-col items-center justify-center mt-20">
                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <img src="/nors-BR_U97rM.png" alt="暂无数据" className="w-24 h-24 object-contain" />
                    </div>
                    <p className="text-gray-400">暂无数据</p>
                </div>
            )}

            {/* 钱包连接提醒弹窗 */}
            <ConnectWalletAlert 
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
            />
        </div>
    )
}

export default Invite