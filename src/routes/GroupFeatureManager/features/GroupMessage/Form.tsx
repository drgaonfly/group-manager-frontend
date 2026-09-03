import { message, Form, Space } from "antd";
import { useState, useEffect } from "react";
import { UploadFile } from "antd/lib/upload/interface";
import { useIntl } from "../../../../hooks/useIntl";
import { request } from "@umijs/max";
import { addItem, updateItem } from "../../../../services/api";
import MyUpload from "../../../../components/MyUpload";
import RichTextEditor, {
  convertToTelegramHtml,
  toQuillHtml,
} from "../../../../components/RichTextEditor";
import InlineMenuEditor, {
  InlineMenuItem,
} from "../../../../components/InlineMenuEditor";
import {
  timeUnitToMinutes,
  minutesToTimeUnit,
  TimeUnit,
} from "../../../../utils/intervalUtils";
import { toISOString } from "../../../../utils/dateUtils";
import extractPathFromUrl from "../../../../utils/extractPathFromUrl";
import {
  ModalForm,
  ProFormGroup,
  ProFormDigit,
  ProFormSelect,
  ProFormRadio,
  ProFormSwitch,
  ProFormDependency,
  ProFormDateTimePicker,
} from "@ant-design/pro-components";

type menuItem = InlineMenuItem;

interface GroupMessageFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  currentRow?: any;
  onSuccess?: () => void;
  editingRecord?: any;
  fixedGroupId?: string;
}

const GroupMessageForm: React.FC<GroupMessageFormProps> = ({
  open,
  onCancel,
  currentRow,
  onSuccess,
  editingRecord,
  fixedGroupId,
}) => {
  const intl = useIntl();
  const isEdit = !!editingRecord?._id;
  const [content, setContent] = useState("");
  const [mediaFileList, setMediaFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [menus, setMenus] = useState<menuItem[]>([]);

  const medias = mediaFileList
    .filter((f) => f.status === "done" && f.url)
    .map((f) => extractPathFromUrl(f.url as string))
    .filter(Boolean);

  useEffect(() => {
    if (!open) return;
    form.resetFields();

    if (isEdit) {
      setContent(toQuillHtml(editingRecord.content || ""));
      const initialMedias: string[] = Array.isArray(editingRecord.medias)
        ? editingRecord.medias
        : [];
      setMediaFileList(
        initialMedias.filter(Boolean).map((url, idx) => ({
          uid: `existing-${idx}`,
          name: `media${idx + 1}`,
          status: "done" as const,
          url,
        })),
      );
      setMenus(
        (editingRecord.menus || []).map((m: any, i: number) => ({
          _id: m._id || `menu-${i}`,
          name: m.name,
          type: m.type || "url",
          url: m.url,
          callback: m.callback,
          copy_text: m.copy_text,
          row: m.row ?? 1,
          style: m.style || "primary",
        })),
      );
      const { timeUnit, value: intervalValue } = minutesToTimeUnit(
        editingRecord.intervalTime,
      );
      form.setFieldsValue({
        sendType: editingRecord.sendType || "scheduled",
        intervalTime: intervalValue,
        timeUnit,
        startAt: editingRecord.startAt,
        endAt: editingRecord.endAt,
        autoDeletePrevious: editingRecord.autoDeletePrevious || false,
        isPinned: editingRecord.isPinned || false,
      });
    } else {
      setContent("");
      setMediaFileList([]);
      setMenus([]);
    }
  }, [open, editingRecord]);

  const handleFinish = async (values: any) => {
    const telegramContent = convertToTelegramHtml(content);

    if (isEdit) {
      const hide = message.loading("更新中...");
      try {
        const intervalMinutes = timeUnitToMinutes(
          values.intervalTime || 0,
          values.timeUnit as TimeUnit,
        );
        await updateItem(`/group-messages/${editingRecord._id}`, {
          ...values,
          bot: editingRecord.bot?._id ?? editingRecord.bot,
          content: telegramContent,
          intervalTime: intervalMinutes,
          medias,
          menus: menus.map(
            ({ name, type, url, callback, copy_text, row, style }) => ({
              name,
              type: type || "url",
              url,
              callback,
              copy_text,
              row: row ?? 1,
              style: style || "primary",
            }),
          ),
          startAt: toISOString(values.startAt),
          endAt: toISOString(values.endAt),
        });
        hide();
        message.success("更新成功");
        form.resetFields();
        setContent("");
        setMediaFileList([]);
        setMenus([]);
        onCancel(false);
        onSuccess?.();
        return true;
      } catch (error: any) {
        hide();
        message.error(error?.response?.data?.message ?? "更新失败，请重试");
        return false;
      }
    }

    const hide = message.loading("添加中");
    try {
      const data = {
        ...values,
        content: telegramContent,
        bot: currentRow?._id,
        intervalTime:
          values.sendType === "immediate"
            ? 0
            : timeUnitToMinutes(
                values.intervalTime || 0,
                values.timeUnit as TimeUnit,
              ),
        groups: fixedGroupId ? [fixedGroupId] : [],
        group: fixedGroupId,
        medias,
        sendType: values.sendType,
        menus: menus.map(
          ({ name, type, url, callback, copy_text, row, style }) => ({
            name,
            type: type || "url",
            url,
            callback,
            copy_text,
            row: row ?? 1,
            style: style || "primary",
          }),
        ),
        startAt: toISOString(values.startAt),
        endAt: toISOString(values.endAt),
      };

      if (values.sendType === "immediate") {
        await request(`/bots/${currentRow?._id}/send-group-message`, {
          method: "PUT",
          data: {
            content: telegramContent,
            medias,
            menus: data.menus,
            groups: fixedGroupId ? [fixedGroupId] : [],
            isPinned: values.isPinned || false,
          },
        });
      } else {
        await addItem("/group-messages", data);
      }

      hide();
      message.success("添加成功");
      form.resetFields();
      setContent("");
      setMediaFileList([]);
      setMenus([]);
      onCancel(false);
      onSuccess?.();
      return true;
    } catch (error: any) {
      hide();
      message.error(error?.response?.data?.message ?? "操作失败，请重试");
      return false;
    }
  };

  return (
    <ModalForm
      title={
        isEdit
          ? intl.formatMessage({
              id: "edit_group_message",
              defaultMessage: "编辑群发消息",
            })
          : intl.formatMessage({
              id: "add_group_message",
              defaultMessage: "Add Group Message",
            })
      }
      open={open}
      form={form}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onCancel(false),
        width: window.innerWidth < 768 ? "100%" : 800,
        style:
          window.innerWidth < 768
            ? { margin: 0, maxWidth: "100vw" }
            : undefined,
      }}
      onFinish={handleFinish}
    >
      <Form.Item
        label={intl.formatMessage({
          id: "content",
          defaultMessage: "Message Content",
        })}
        required
        style={{ marginBottom: 24 }}
      >
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="请输入消息内容..."
          height={200}
          variables="all"
        />
      </Form.Item>

      <ProFormGroup>
        <Form.Item
          label={intl.formatMessage({
            id: "media",
            defaultMessage: "媒体文件",
          })}
        >
          <MyUpload
            fileList={mediaFileList}
            multiple
            accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mkv,.webm"
            onFileUpload={(url) => {
              setMediaFileList((prev) =>
                prev.map((f) =>
                  f.status === "done" && !f.url ? { ...f, url } : f,
                ),
              );
            }}
            onChange={(list) => setMediaFileList(list)}
          />
        </Form.Item>

        <ProFormSwitch
          name="isPinned"
          label={intl.formatMessage({
            id: "is_pinned",
            defaultMessage: "置顶消息",
          })}
          initialValue={false}
          tooltip="发送后将该消息置顶到群组顶部"
        />
      </ProFormGroup>

      <ProFormGroup>
        <ProFormRadio.Group
          name="sendType"
          label={intl.formatMessage({
            id: "send_type",
            defaultMessage: "Send Type",
          })}
          initialValue="immediate"
          options={[
            {
              label: intl.formatMessage({
                id: "immediate_send",
                defaultMessage: "立即发送",
              }),
              value: "immediate",
            },
            {
              label: intl.formatMessage({
                id: "scheduled_send",
                defaultMessage: "定时发送",
              }),
              value: "scheduled",
            },
          ]}
        />
      </ProFormGroup>

      <ProFormDependency name={["sendType"]}>
        {({ sendType }) =>
          sendType === "scheduled" && (
            <>
              <ProFormGroup
                label={intl.formatMessage({
                  id: "interval_time",
                  defaultMessage: "Interval Time",
                })}
                style={{ marginBottom: 32 }}
              >
                <Space>
                  <ProFormSelect
                    name="timeUnit"
                    width="xs"
                    initialValue="hours"
                    options={[
                      {
                        label: intl.formatMessage({
                          id: "minutes",
                          defaultMessage: "Minutes",
                        }),
                        value: "minutes",
                      },
                      {
                        label: intl.formatMessage({
                          id: "hours",
                          defaultMessage: "Hours",
                        }),
                        value: "hours",
                      },
                      {
                        label: intl.formatMessage({
                          id: "weeks",
                          defaultMessage: "Weeks",
                        }),
                        value: "weeks",
                      },
                    ]}
                    noStyle
                  />
                  <ProFormDigit
                    name="intervalTime"
                    width="xs"
                    min={1}
                    fieldProps={{ style: { width: "100%" }, precision: 0 }}
                    noStyle
                  />
                </Space>
              </ProFormGroup>

              <ProFormGroup>
                <ProFormDateTimePicker
                  width="md"
                  name="startAt"
                  label="发送开始时间"
                  fieldProps={{
                    format: "YYYY-MM-DD HH:mm",
                    showTime: { format: "HH:mm" },
                  }}
                  tooltip="允许发送消息的开始时间"
                />
                <ProFormDateTimePicker
                  width="md"
                  name="endAt"
                  label="发送结束时间"
                  fieldProps={{
                    format: "YYYY-MM-DD HH:mm",
                    showTime: { format: "HH:mm" },
                  }}
                  tooltip="允许发送消息的结束时间"
                />
              </ProFormGroup>

              <ProFormGroup>
                <ProFormSwitch
                  name="autoDeletePrevious"
                  label={intl.formatMessage({
                    id: "auto_delete_previous",
                    defaultMessage: "自动删除上一条",
                  })}
                  initialValue={false}
                  tooltip="发送新消息前，自动删除该群组上一条已发送的消息"
                />
              </ProFormGroup>
            </>
          )
        }
      </ProFormDependency>

      <Form.Item
        label={intl.formatMessage({
          id: "inline_menu_config",
          defaultMessage: "按钮设置",
        })}
      >
        <InlineMenuEditor value={menus} onChange={setMenus} showStyle />
      </Form.Item>
    </ModalForm>
  );
};

export default GroupMessageForm;
