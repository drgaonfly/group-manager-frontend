import React from "react";
import { Form, InputNumber, Checkbox, Space, DatePicker } from "antd";

interface DrawMethodTabProps {
  drawMethod: string[];
  setDrawMethod: (methods: string[]) => void;
  fullParticipantsCount: number;
  setFullParticipantsCount: (count: number) => void;
  scheduledDrawTime: any;
  setScheduledDrawTime: (time: any) => void;
}

const DrawMethodTab: React.FC<DrawMethodTabProps> = ({
  drawMethod,
  setDrawMethod,
  fullParticipantsCount,
  setFullParticipantsCount,
  scheduledDrawTime,
  setScheduledDrawTime,
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            开奖时间
          </label>
          <DatePicker
            value={scheduledDrawTime}
            onChange={setScheduledDrawTime}
            showTime
            style={{ width: "100%" }}
            placeholder="请选择开奖时间"
          />
        </div>
      )}
    </div>
  );
};

export default DrawMethodTab;
