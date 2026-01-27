import React from "react";
import { Input, InputNumber, Button } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Prize, genKey } from "../types";

interface PrizeTabProps {
  prizes: Prize[];
  setPrizes: (prizes: Prize[]) => void;
}

const PrizeTab: React.FC<PrizeTabProps> = ({ prizes, setPrizes }) => {
  const addPrize = () =>
    setPrizes([
      ...prizes,
      { key: genKey(), name: "", type: "custom", value: "", quantity: 1 },
    ]);

  const removePrize = (key: string) => {
    if (prizes.length <= 1) return;
    setPrizes(prizes.filter((p) => p.key !== key));
  };

  const updatePrize = (key: string, field: string, value: any) => {
    setPrizes(
      prizes.map((p) => (p.key === key ? { ...p, [field]: value } : p)),
    );
  };

  return (
    <div className="py-2">
      {prizes.map((prize) => (
        <div key={prize.key} className="flex gap-2 mb-3 items-center">
          <Input
            placeholder="奖品名称"
            value={prize.name}
            onChange={(e) => updatePrize(prize.key, "name", e.target.value)}
            style={{ width: 80 }}
          />
          <Input
            placeholder="奖品内容"
            value={String(prize.value || "")}
            onChange={(e) => updatePrize(prize.key, "value", e.target.value)}
            style={{ flex: 1 }}
          />
          <span className="text-gray-500">x</span>
          <InputNumber
            min={1}
            value={prize.quantity}
            onChange={(v) => updatePrize(prize.key, "quantity", v || 1)}
            style={{ width: 60 }}
          />
          {prizes.length > 1 && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removePrize(prize.key)}
            />
          )}
        </div>
      ))}
      <Button type="dashed" onClick={addPrize} block icon={<PlusOutlined />}>
        添加奖品
      </Button>
    </div>
  );
};

export default PrizeTab;
