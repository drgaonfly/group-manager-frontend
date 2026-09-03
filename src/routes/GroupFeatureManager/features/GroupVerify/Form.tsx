import React, { useState, useEffect } from "react";
import { message, Form, Modal, Button, Space, Switch, Input } from "antd";
import {
  ProFormTextArea,
  ProColumns,
  EditableProTable,
} from "@ant-design/pro-components";
import { useIntl } from "../../../../hooks/useIntl";
import { request } from "../../../../services/api";

type VerifyAsk = {
  _id: string;
  name: string;
  isCorrect: boolean;
};

interface GroupVerifyFormProps {
  open: boolean;
  onCancel: () => void;
  botId: string;
  /** 编辑时传入现有记录 */
  currentRecord?: any;
  onSuccess?: () => void;
  /** 从外层直接传入群组 ID，新建时跳过 GroupSelect */
  fixedGroupId?: string;
}

const GroupVerifyForm: React.FC<GroupVerifyFormProps> = ({
  open,
  onCancel,
  botId,
  currentRecord,
  onSuccess,
  fixedGroupId,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [asks, setAsks] = useState<VerifyAsk[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!currentRecord;

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (currentRecord) {
        form.setFieldsValue({
          group: currentRecord.group?._id,
          question: currentRecord.question || "",
          isActive: currentRecord.isActive !== false,
        });
        setAsks(
          (currentRecord.asks || []).map((a: any, i: number) => ({
            _id: String(i),
            name: a.name,
            isCorrect: a.isCorrect,
          })),
        );
      } else {
        form.setFieldsValue({
          isActive: true,
          // 新建时若外层已指定群组，预填并锁定
          ...(fixedGroupId ? { group: fixedGroupId } : {}),
        });
        setAsks([]);
      }
    }
  }, [open, currentRecord]);

  const askColumns: ProColumns<VerifyAsk>[] = [
    {
      title: intl.formatMessage({
        id: "verify_answer",
        defaultMessage: "答案选项",
      }),
      dataIndex: "name",
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: "verify_answer_required",
              defaultMessage: "请输入答案选项",
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({
        id: "is_correct",
        defaultMessage: "是否正确",
      }),
      dataIndex: "isCorrect",
      valueType: "select",
      valueEnum: {
        true: {
          text: intl.formatMessage({ id: "correct", defaultMessage: "正确" }),
          status: "Success",
        },
        false: {
          text: intl.formatMessage({ id: "incorrect", defaultMessage: "错误" }),
          status: "Error",
        },
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: intl.formatMessage({
              id: "is_correct_required",
              defaultMessage: "请选择是否正确",
            }),
          },
        ],
      },
    },
    {
      title: intl.formatMessage({ id: "options", defaultMessage: "操作" }),
      valueType: "option",
      width: 120,
      render: (_, record, __, action) => [
        <a key="editable" onClick={() => action?.startEditable?.(record._id)}>
          {intl.formatMessage({ id: "edit", defaultMessage: "编辑" })}
        </a>,
      ],
    },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const correctAnswers = asks.filter(
        (ask) => ask.isCorrect === true || (ask.isCorrect as any) === "true",
      );
      if (correctAnswers.length === 0) {
        message.error(
          intl.formatMessage({
            id: "at_least_one_correct_answer",
            defaultMessage: "至少需要一个正确答案",
          }),
        );
        return;
      }

      if (asks.length === 0) {
        message.error("请至少添加一个答案选项");
        return;
      }

      setSubmitting(true);

      const payload = {
        bot: botId,
        group: values.group || fixedGroupId,
        question: values.question,
        asks: asks.map(({ name, isCorrect }) => ({
          name,
          isCorrect: isCorrect === true || (isCorrect as any) === "true",
        })),
        isActive: values.isActive,
      };

      if (isEdit) {
        await request(`/group-verifies/${currentRecord._id}`, {
          method: "PUT",
          data: payload,
        });
      } else {
        await request("/group-verifies", {
          method: "POST",
          data: payload,
        });
      }

      message.success(isEdit ? "更新成功" : "创建成功");
      onSuccess?.();
      onCancel();
    } catch (error: any) {
      if (error?.errorFields) return; // 表单校验错误，不提示
      message.error(
        error?.response?.data?.message ?? (isEdit ? "更新失败" : "创建失败"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "编辑群验证配置" : "创建群验证配置"}
      open={open}
      onCancel={onCancel}
      width={window.innerWidth < 768 ? "100%" : 800}
      destroyOnClose
      style={
        window.innerWidth < 768 ? { margin: 0, maxWidth: "100vw" } : undefined
      }
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            {isEdit ? "保存" : "创建"}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="group" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="isActive" label="是否启用" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="停用" />
        </Form.Item>

        <ProFormTextArea
          name="question"
          label={intl.formatMessage({
            id: "verify_question",
            defaultMessage: "验证问题",
          })}
          placeholder={intl.formatMessage({
            id: "verify_question_placeholder",
            defaultMessage: "请输入验证问题",
          })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "verify_question_required",
                defaultMessage: "请输入验证问题",
              }),
            },
          ]}
          extra={intl.formatMessage({
            id: "verify_question_tip",
            defaultMessage: "新用户加入群组时需要回答的验证问题",
          })}
          fieldProps={{ autoSize: { minRows: 4 } }}
        />

        <EditableProTable<VerifyAsk>
          rowKey="_id"
          headerTitle="答案选项配置"
          columns={askColumns}
          value={asks}
          onChange={(value: readonly VerifyAsk[]) => setAsks([...value])}
          editable={{ type: "multiple" }}
          recordCreatorProps={{
            newRecordType: "dataSource",
            position: "bottom",
            record: () => ({
              _id: Date.now().toString(),
              name: "",
              isCorrect: false,
            }),
          }}
          toolBarRender={false}
        />
      </Form>
    </Modal>
  );
};

export default GroupVerifyForm;
