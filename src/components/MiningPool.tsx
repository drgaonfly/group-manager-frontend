function MiningPool() {
    return (
        <div className="">
            <div className="text-center mb-8">
                <h1 className="text-xl mb-2">我的采矿池</h1>
                <div className="text-yellow-500 text-3xl font-bold mb-1">
                    27578928.3035 <span className="text-sm">USDT</span>
                </div>
                <div className="text-gray-400 text-sm">总产量</div>
            </div>

            {/* 基本信息 */}
            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">采矿资金数量</span>
                    <span>0.00 USDT</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">收益率</span>
                    <span>0.00%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">采矿收入</span>
                    <span>0.00 USDT</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">货币池名称</span>
                    <span>流动性采矿池</span>
                </div>
            </div>

            {/* 流动性收益率表格 */}
            <div className="mb-8">
                <h2 className="text-center mb-4">流动性收益率</h2>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 text-sm p-3 border-b border-gray-700">
                        <div className="text-gray-400">质押数量<br/>(USDT)</div>
                        <div className="text-gray-400 text-center">回报率<br/>(24H)</div>
                        <div className="text-gray-400 text-right">利润<br/>(USDT)</div>
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
                <h2 className="text-center mb-4">采矿记录</h2>
                <div className="flex flex-col items-center justify-center text-gray-400">
                    <img src="/nors-BR_U97rM.png" alt="暂无数据" className="w-20 h-20 mb-4 object-contain" />
                    <span>暂无数据</span>
                </div>
            </div>
        </div>
    )
}

export default MiningPool