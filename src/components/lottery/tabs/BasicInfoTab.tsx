import React from "react";
import { Form, Input, Select, Button } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { GroupLink, genKey } from "../types";

const { TextArea } = Input;

interface BasicInfoTabProps {
  groupLinks: GroupLink[];
  setGroupLinks: (links: GroupLink[]) => void;
  botGroups: { _id: string; title: string; username?: string }[];
  loadingGroups: boolean;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  groupLinks,
  setGroupLinks,
  botGroups,
  loadingGroups,
}) => {
  const addGroupLink = () =>
    setGroupLinks([...groupLinks, { key: genKey(), link: "", mode: "input" }]);

  const removeGroupLink = (key: string) => {
    if (groupLinks.length <= 1) return;
    setGroupLinks(groupLinks.filter((g) => g.key !== key));
  };

  const updateGroupLink = (key: string, link: string) => {
    setGroupLinks(groupLinks.map((g) => (g.key === key ? { ...g, link } : g)));
  };

  const updateGroupLinkMode = (key: string, mode: "input" | "select") => {
    setGroupLinks(
      groupLinks.map((g) => (g.key === key ? { ...g, mode, link: "" } : g)),
    );
  };

  const selectBotGroup = (key: string, groupId: string) => {
    const group = botGroups.find((g) => g._id === groupId);
    if (group) {
      const link = group.username ? `@${group.username}` : "";
      setGroupLinks(
        groupLinks.map((g) =>
          g.key === key ? { ...g, link, selectedGroup: group } : g,
        ),
      );
    }
  };

  return (
    <div className="py-2">
      <div className="mb-4">
        <div className="mb-2 font-medium">群组/频道链接</div>
        <div className="text-gray-500 text-xs mb-2">
          支持：@username、https://t.me/username
        </div>
        {groupLinks.map((g, idx) => (
          <div key={g.key} className="mb-3">
            <div className="flex gap-2 mb-2">
              <Select
                value={g.mode || "input"}
                onChange={(v) => updateGroupLinkMode(g.key, v)}
                style={{ width: 100 }}
                size="small"
              >
                <Select.Option value="input">手动输入</Select.Option>
                <Select.Option value="select">选择群组</Select.Option>
              </Select>
              {(g.mode || "input") === "input" ? (
                <Input
                  placeholder={`群组/频道 ${idx + 1}`}
                  value={g.link}
                  onChange={(e) => updateGroupLink(g.key, e.target.value)}
                  style={{ flex: 1 }}
                />
              ) : (
                <Select
                  placeholder="选择群组"
                  value={g.selectedGroup?._id}
                  onChange={(v) => selectBotGroup(g.key, v)}
                  style={{ flex: 1 }}
                  loading={loadingGroups}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={botGroups.map((group) => ({
                    label: group.title,
                    value: group._id,
                  }))}
                />
              )}
              {groupLinks.length > 1 && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeGroupLink(g.key)}
                />
              )}
            </div>
            {g.selectedGroup && (
              <div className="text-sm text-blue-600 ml-1">
                ✓ {g.selectedGroup.title}
              </div>
            )}
          </div>
        ))}
        <Button
          type="dashed"
          onClick={addGroupLink}
          block
          icon={<PlusOutlined />}
          size="small"
        >
          添加群组/频道
        </Button>
      </div>
      <Form.Item
        name="title"
        label="活动标题"
        rules={[{ required: true, message: "请输入活动标题" }]}
      >
        <TextArea rows={4} placeholder="如：新年抽奖活动" />
      </Form.Item>
      <Form.Item name="keywords" label="触发关键词">
        <Select
          mode="tags"
          placeholder="输入后回车添加"
          style={{ width: "100%" }}
        />
      </Form.Item>
    </div>
  );
};

export default BasicInfoTab;
