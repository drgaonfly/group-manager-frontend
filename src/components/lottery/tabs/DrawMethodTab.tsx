import React from "react";
import { Form, InputNumber, Checkbox, Space, DatePicker } from "antd";

interface DrawMethodTabProps {
  drawMethod: string[];
  setDrawMethod: (methods: string[]) => void;
  fullParticipantsCount: number;
  setFullParticipantsCount: (count: number) => void;
}

const DrawMethodTab: React.FC<DrawMethodTabProps> = ({
  drawMethod,
  setDrawMethod,
  fullParticipantsCount,
  setFullParticipantsCount,
}) => {
  return (
    <div className="py-2">
      <Form.Item label="开奖条件">
        <Checkbox.Group
          value={drawMethod}
          onChange={(v) => setDrawMethod(v as string[])}
        >
          <Space direction="vertical">
            <Checkbox value="fullParticipants">满人开奖</Checkbox>
            <Checkbox value="scheduledTime">定时开奖</Checkbox>
          </Space>
        </Checkbox.Group>
      </Form.Item>
      {drawMethod.includes("fullParticipants") && (
        <Form.Item label="满人人数">
          <InputNumber
            value={fullParticipantsCount}
            onChange={(value) => setFullParticipantsCount(value || 10)}
            min={1}
            addonAfter="人"
            style={{ width: "100%" }}
          />
        </Form.Item>
      )}
      {drawMethod.includes("scheduledTime") && (
        <Form.Item
          name="scheduledDrawTime"
          label="开奖时间"
          rules={[{ required: true, message: "请选择开奖时间" }]}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
      )}
    </div>
  );
};

export default DrawMethodTab;
