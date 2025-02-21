import Rate from "./Rate";

const Rates = () => {
  return (
    <div className="grid grid-cols-2 gap-6 max-w-screen-lg mx-auto mb-6">
      <Rate
        icon={<img src="/public/vcbg-BW6JVUa-.png" alt="Winning Rate" className="rounded-full" />}
        title="Winning Rate"
        content="26.09%"
      />
      <Rate
        icon={<img src="/public/vcbg-BW6JVUa-.png" alt="Stake" className="rounded-full" />}
        title="Stake"
        content="0.00% USDT"
      />
    </div>
  );
};

export default Rates;