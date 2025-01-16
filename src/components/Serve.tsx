import { useState, useEffect } from 'react';

function Service() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    '/6e020bb6147a59192671c4c087d27af8.jpg',
    '/407abd8409e441a71998a5256d9e3f06.jpg'
  ];

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // 每3秒切换一次

    return () => clearInterval(timer);
  }, [images.length]);

  // 手动切换
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  // 常见问题模块切换展开/收起状态
  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: "邀请好友有奖励吗？",
      answer: "是的，您可以通过您的链接邀请您的朋友加入矿池。您可以在参加朋友邀请链的同时从矿池中获得ETH奖励。"
    },
    {
      question: "如何提取我的收入？",
      answer: "您可以表每天收到的USDT，然后申请提现处理，矿池会在24小时内自动发送到您连接平台的钱包，不支持其他钱包地址。"
    },
    {
      question: "资产安全吗？",
      answer: "我们采用最先进的安全措施保护您的资产。"
    },
    {
      question: "什么时候计算利润？",
      answer: "系统每24小时自动计算一次收益。"
    },
    {
      question: "如何加入流动性挖矿？",
      answer: "连接钱包后即可参与流动性挖矿。"
    }
  ];

  return (
    <div className="bg-gray-900 text-white">
      {/* 轮播图 */}
      <div className="relative w-full h-48 mb-2 overflow-hidden rounded-lg xl:h-[600px]">
        <div 
          className="flex w-full h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-contain flex-shrink-0" // Changed from object-cover to object-contain
            />
          ))}
        </div>

        {/* 轮播指示器 */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-opacity ${
                currentIndex === index ? 'bg-white' : 'bg-white opacity-50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 特点图标行 */}
      <div className="mb-4"><h4 className="text-xl mb-4 text-center">人工智能采矿石</h4></div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center bg-gray-800 p-4 rounded-lg">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span>无需转移</span>
        </div>
        <div className="text-center bg-gray-800 p-4 rounded-lg">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8V4l8 8-8 8v-4H4V8h8z" />
            </svg>
          </div>
          <span>收入稳定性</span>
        </div>
      </div>

      {/* 描述文本 */}
      <p className="text-gray-400 mb-8 text-sm">
        致力于打造全球最大的智能合约云平台DEX、IMORDAO
      </p>

      {/* 特点列表 */}
      <div className="space-y-4 mb-6">
        <h3 className="text-xl font-bold mb-4">项目特点</h3>
        
        <div className="flex items-center space-x-3 bg-gray-800 p-4 rounded-lg">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83c-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25l6 2.25v4.7z"/>
            </svg>
          </div>
          <div>
            <h4 className="font-bold">安全可靠</h4>
            <p className="text-sm text-gray-400">无需转移，USDT存入自动赚取收益</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-gray-800 p-4 rounded-lg">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 8h4V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zm10-4h-4v4h4V4z"/>
            </svg>
          </div>
          <div>
            <h4 className="font-bold">职业稳定性</h4>
            <p className="text-sm text-gray-400">专业团队，全年稳定运营</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-gray-800 p-4 rounded-lg">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
          <div>
            <h4 className="font-bold">低入门槛</h4>
            <p className="text-sm text-gray-400">共享方法教学实战</p>
          </div>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="mb-6">
        <h3 className="text-xl mb-4 text-center">常见问题</h3>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggleItem(index)}
              >
                <span>{item.question}</span>
                <svg 
                  className={`w-4 h-4 text-gray-400 transform transition-transform duration-300 ${
                    expandedItems.includes(index) ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {expandedItems.includes(index) && (
                <div className="px-4 pb-4 text-gray-400">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
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
            <img src="/hz2-YHl_SqFU.png" alt="LBank" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">LBank</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz3-CeJ0Klg9.png" alt="Keaken" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Keaken</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz4-B2n-FwQS.png" alt="Gate.io" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Gate.io</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz5-70KQLU_G.png" alt="Okex" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Okex</span>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/hz6-DtnYgGg4.png" alt="Bitfinex" className="w-8 h-8" />
            <span className="text-base text-[#656a6e] font-bold">Bitfinex</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Service