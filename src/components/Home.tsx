
function Home() {
  return (
    <div>
      {/* DeFi 标题部分 */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">DeFi</h1>
            <h2 className="text-xl mb-4">流动性采矿池</h2>
            <p className="text-gray-400">加入节点，开始采矿</p>
          </div>
          <div className="relative">
            <img 
              src="/wkcy-DXzGYALG.png" 
              alt="Mining" 
              className="w-28 h-28"
            />
          </div>
        </div>
      </div>

      {/* 提醒框 */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex items-center">
          <span className="text-yellow-500 mr-2">🔔</span>
          <span>双倍采矿收益。</span>
        </div>
      </div>

      {/* 数据统计 */}
      <div className="mb-6">
        <h3 className="text-center mb-4">流动性采矿 数据</h3>
        <div className="space-y-4">
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">总产量</span>
            <span>21653896.6236 USDT</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">有效节点</span>
            <span>41007</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">参加人数</span>
            <span>5134409</span>
          </div>
          <div className="flex justify-between border-b border-[#2c3645] py-2">
            <span className="text-gray-400">用户收益</span>
            <span>410235.3072 USDT</span>
          </div>
        </div>
      </div>

      {/* VIP会员区域 */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-center text-xl mb-4">会员采矿池</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-yellow-500">VIP会员活动采矿池</span>
          <img src="/vcbg-BW6JVUa-.png" alt="mining" className="w-16 h-16" />
        </div>
        <p className="text-sm text-gray-400 mb-6">
          加入会员参与可享受30天双倍采矿收益
        </p>

        {/* 数量输入区域 */}
        <div className="mb-4 border-b border-[#2c3645]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400">数量</span>
            <input 
              type="text" 
              className="w-1/2 ml-auto bg-gray-800 rounded p-3 text-white focus:outline-none text-sm"
              placeholder="请输入质押数量"
            />
          </div>
        </div>

        {/* 预计收入 */}
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">预计收入</span>
            <span className="text-white">0.00 USDT</span>
          </div>
        </div>

        {/* 收益率 */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="text-green-500 text-xl">0%</span>
            <span className="text-gray-400 ml-2">USDT</span>
          </div>
          <p className="text-sm text-gray-400">
            VIP会员采矿可享受双倍收益
          </p>
        </div>

        {/* 加入按钮 */}
        <button className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold">
          参加会员采矿池
        </button>
      </div>

      {/* 流动性采矿产出 */}
      <div className="mb-6">
        <h3 className="text-center text-xl mb-4">流动性采矿产出</h3>
        {/* 标题行 */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">地址</span>
          <span className="text-gray-400">数量</span>
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between items-center bg-gray-800 p-3">
            <span className="text-gray-400">T9ZLRkzh...BIMNFAKe</span>
            <span>155.76USDT</span>
          </div>
          <div className="flex justify-between items-center bg-gray-800 p-3">
            <span className="text-gray-400">0eFyCHsG...xP0WkbJZ</span>
            <span>2207.82USDT</span>
          </div>
          <div className="flex justify-between items-center bg-gray-800 p-3">
            <span className="text-gray-400">TQdDEigh...V86onSfR</span>
            <span>170.91USDT</span>
          </div>
          <div className="flex justify-between items-center bg-gray-800 p-3">
            <span className="text-gray-400">TamOJDBM...FtPcknzZ</span>
            <span>4346.67USDT</span>
          </div>
          <div className="flex justify-between items-center bg-gray-800 p-3">
            <span className="text-gray-400">T98CA34B...YzEQ12LJ</span>
            <span>808.80USDT</span>
          </div>
          <div className="flex justify-between items-center bg-gray-800 p-3">
            <span className="text-gray-400">TyvidHOY...jp74TqcP</span>
            <span>72.25USDT</span>
          </div>
          <div className="flex justify-between items-center bg-gray-800 p-3">
            <span className="text-gray-400">TjWoaB2P...FObTxsCN</span>
            <span>927.99USDT</span>
          </div>
          <div className="flex justify-between items-center bg-gray-800 p-3">
            <span className="text-gray-400">TsMxNLgo...AfcFU5TX</span>
            <span>738.59USDT</span>
          </div>
          <div className="flex justify-between items-center bg-gray-800 p-3">
            <span className="text-gray-400">0xcdxw9e...WhMuxm2</span>
            <span>223.95USDT</span>
          </div>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="mb-6">
        <h3 className="text-xl mb-4 text-center">常见问题</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
            <span>邀请好友有奖励吗？</span>
            <span className="text-gray-400">▼</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
            <span>如何提取我的收入？</span>
            <span className="text-gray-400">▼</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
            <span>资产安全吗？</span>
            <span className="text-gray-400">▼</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
            <span>什么时候计算利润？</span>
            <span className="text-gray-400">▼</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
            <span>如何加入流动性挖矿？</span>
            <span className="text-gray-400">▼</span>
          </div>
        </div>
      </div>

      {/* 监管机构 */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-2">
          <h3 className="text-xl">监管机构</h3>
        </div>
        <p className="text-center text-sm text-gray-400 mb-4">我们拥有全球监管机构</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 aspect-video">
            <img src="/下载.png" alt="Binance" className="w-full h-full object-contain" />
          </div>
          <div className="bg-gray-800 rounded-lg p-4 aspect-video">
            <img src="/下载.png" alt="Binance" className="w-full h-full object-contain" />
          </div>
          <div className="bg-gray-800 rounded-lg p-4 aspect-video">
            <img src="/下载.png" alt="Binance" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* 合作平台 */}
      <div className="mb-10">
        <h3 className="text-xl mb-2 text-center">合作平台</h3>
        <div className="grid grid-cols-2 gap-6 bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <img src="/hz1-GhDYdp3B.png" alt="Binance" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Binance</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz1-GhDYdp3B.png" alt="LBank" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">LBank</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz1-GhDYdp3B.png" alt="Keaken" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Keaken</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz1-GhDYdp3B.png" alt="Gate.io" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Gate.io</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz1-GhDYdp3B.png" alt="Okex" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Okex</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz1-GhDYdp3B.png" alt="Bitfinex" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Bitfinex</span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Home;
