import { message, Form } from 'antd';
import { useState, useEffect } from 'react';
import { UploadFile } from 'antd/lib/upload/interface';
import { useIntl } from '../../../../hooks/useIntl';
import { request } from '@umijs/max';
import MyUpload from '@/components/MyUpload';
import RichTextEditor, { convertToTelegramHtml, toQuillHtml } from '@/components/RichTextEditor';
import InlineMenuEditor, { InlineMenuItem } from '@/components/InlineMenuEditor';
import extractPathFromUrl from '@/utils/extractPathFromUrl';
import {
  ModalForm,
  ProFormGroup,
  ProFormDigit,
  ProFormSwitch,
  ProFormSelect,
} from '@ant-design/pro-components';

type menuItem = InlineMenuItem;

interface GroupWelcomeFormProps {
  open: boolean;
  onCancel: (visible: boolean) => void;
  botId: string;
  currentRow?: any;
  onSuccess?: () => void;
  fixedGroupId?: string;
}

const GroupWelcomeForm: React.FC<GroupWelcomeFormProps> = ({
  open,
  onCancel,
  botId,
  currentRow,
  onSuccess,
  fixedGroupId,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [mediaFileList, setMediaFileList] = useState<UploadFile[]>([]);
  const [menus, setMenus] = useState<menuItem[]>([]);
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [groups, setGroups] = useState<any[]>([]);

  const isEdit = !!currentRow?._id;

  // medias 直接从 mediaFileList 里派生，只取已上传成功且有 url 的
  const medias = mediaFileList
    .filter((f) => f.status === 'done' && f.url)
    .map((f) => extractPathFromUrl(f.url as string))
    .filter(Boolean);

  useEffect(() => {
    if (open && botId && !fixedGroupId) {
      request(`/bots/${botId}`)
        .then((res: any) => {
          const botGroups = (res?.data?.groups || []).filter((g: any) => g.type !== 'channel');
          setGroups(botGroups);
        })
        .catch((err: any) => {
          console.error('Failed to fetch groups:', err);
        });
    }
  }, [open, botId, fixedGroupId]);

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (isEdit && currentRow) {
        const formattedMenus = (currentRow.menus || []).map((item: any, index: number) => ({
          _id: item._id || `${Date.now()}-${index}`,
          name: item.name || '',
          type: item.type || 'url',
          url: item.url || '',
          callback: item.callback,
          copy_text: item.copy_text,
          row: item.row ?? 1,
          style: item.style || 'primary',
        }));

        setContent(toQuillHtml(currentRow.contents?.join('\n') || ''));
        setCaption(toQuillHtml(currentRow.caption || ''));
        setMediaFileList(
          (currentRow.medias || []).map((url: string, idx: number) => ({
            uid: `existing-${idx}`,
            name: `media${idx + 1}`,
            status: 'done' as const,
            url,
          })),
        );
        setMenus(formattedMenus);

        form.setFieldsValue({
          group: currentRow.group?._id
            ? currentRow.group._id.toString()
            : currentRow.group ?? undefined,
          deleteAfterSeconds: currentRow.deleteAfterSeconds || 0,
          pinNewMember: currentRow.pinNewMember || false,
        });
      } else {
        setContent('');
        setCaption('');
        setMediaFileList([]);
        setMenus([]);
        form.setFieldsValue({
          deleteAfterSeconds: 0,
          pinNewMember: false,
          ...(fixedGroupId ? { group: fixedGroupId } : {}),
        });
      }
    }
  }, [open, currentRow, isEdit, form, fixedGroupId]);

  const handleSubmit = async () => {
    try {
      const hide = message.loading(<FormattedMessage id="updating" defaultMessage="Updating..." />);

      const telegramContent = convertToTelegramHtml(content);
      const telegramCaption = convertToTelegramHtml(caption);
      const formValues = form.getFieldsValue();

      const payload = {
        bot: botId,
        group: formValues.group,
        contents: telegramContent
          ? telegramContent.split('\n').filter((v: string) => v.trim())
          : [],
        caption: telegramCaption || '',
        medias,
        menus: menus.map(({ name, type, url, callback, copy_text, row, style }) => ({
          name,
          type: type || 'url',
          url,
          callback,
          copy_text,
          row: row ?? 1,
          style: style || 'primary',
        })),
        deleteAfterSeconds: formValues.deleteAfterSeconds || 0,
        pinNewMember: formValues.pinNewMember || false,
      };

      if (isEdit) {
        await request(`/group-welcomes/${currentRow._id}`, {
          method: 'PUT',
          data: payload,
        });
      } else {
        await request('/group-welcomes', {
          method: 'POST',
          data: payload,
        });
      }

      hide();
      message.success(
        <FormattedMessage id="update_successful" defaultMessage="Update successful" />,
      );

      form.resetFields();
      setContent('');
      setCaption('');
      setMediaFileList([]);
      setMenus([]);
      onCancel(false);
      onSuccess?.();

      return true;
    } catch (error: any) {
      console.error('操作失败:', error);
      message.error(
        error?.response?.data?.message ?? (
          <FormattedMessage id="update_failed" defaultMessage="Update failed" />
        ),
      );
      return false;
    }
  };

  return (
    <ModalForm
      title={
        isEdit
          ? intl.formatMessage({ id: 'edit_group_welcome', defaultMessage: '编辑群欢迎配置' })
          : intl.formatMessage({ id: 'create_group_welcome', defaultMessage: '新建群欢迎配置' })
      }
      open={open}
      form={form}
      width={window.innerWidth < 768 ? '100%' : 800}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => onCancel(false),
        style: window.innerWidth < 768 ? { margin: 0, maxWidth: '100vw' } : undefined,
      }}
      onFinish={handleSubmit}
    >
      {fixedGroupId ? (
        <Form.Item name="group" hidden initialValue={fixedGroupId}>
          <input />
        </Form.Item>
      ) : (
        <ProFormSelect
          name="group"
          label={intl.formatMessage({ id: 'group', defaultMessage: '群组' })}
          options={groups.map((g) => ({ label: g.title, value: g._id }))}
          placeholder={intl.formatMessage({
            id: 'please_select_groups',
            defaultMessage: '请选择群组',
          })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'please_select_groups',
                defaultMessage: '请选择群组',
              }),
            },
          ]}
          disabled={isEdit}
        />
      )}

      <Form.Item
        label={intl.formatMessage({ id: 'welcome_message', defaultMessage: '欢迎消息' })}
        style={{ marginBottom: 24 }}
      >
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="请输入欢迎消息..."
          height={150}
          variables="all"
        />
      </Form.Item>

      <Form.Item
        label={intl.formatMessage({ id: 'media_caption', defaultMessage: '媒体说明' })}
        style={{ marginBottom: 24 }}
      >
        <RichTextEditor
          value={caption}
          onChange={setCaption}
          placeholder="请输入媒体说明..."
          height={100}
          variables="all"
        />
      </Form.Item>

      <ProFormGroup>
        <Form.Item label={intl.formatMessage({ id: 'welcome_medias', defaultMessage: '欢迎媒体' })}>
          <MyUpload
            fileList={mediaFileList}
            multiple
            accept=".jpg,.jpeg,.png,.gif,.mp4,.mov"
            onFileUpload={(url: string) => {
              setMediaFileList((prev) =>
                prev.map((f) => (f.status === 'done' && !f.url ? { ...f, url } : f)),
              );
            }}
            onChange={(list) => {
              setMediaFileList(list);
            }}
          />
        </Form.Item>

        <ProFormDigit
          name="deleteAfterSeconds"
          label={intl.formatMessage({
            id: 'delete_after_seconds',
            defaultMessage: '阅后即焚（秒）',
          })}
          tooltip="设置消息发送后多少秒自动删除，0表示不删除"
          fieldProps={{ min: 0, precision: 0, addonAfter: '秒' }}
          placeholder="0"
          width="md"
        />

        <ProFormSwitch
          name="pinNewMember"
          label={intl.formatMessage({ id: 'pin_new_member', defaultMessage: '置顶新成员' })}
          tooltip="开启后，新成员加入时会置顶欢迎消息（需要机器人有管理员权限）"
          fieldProps={{ checkedChildren: '开启', unCheckedChildren: '关闭' }}
        />
      </ProFormGroup>

      <Form.Item
        label={intl.formatMessage({
          id: 'welcome_menu_config',
          defaultMessage: '欢迎菜单配置',
        })}
      >
        <InlineMenuEditor value={menus} onChange={setMenus} showStyle />
      </Form.Item>
    </ModalForm>
  );
};

export default GroupWelcomeForm;
