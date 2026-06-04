import { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Input,
  Switch,
  Button,
  Alert,
  Result,
  Upload,
  message,
  Spin,
  Tag,
} from "antd";
import {
  PlusOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";

interface TeacherProfile {
  _id: string;
  display_name: string;
  contactLink: string;
  address: string;
  brief: string;
  isAvailable: boolean;
  images: string[];
  status: string;
}

// 文件转 base64 预览
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const RegisterTeacher = ({
  botId,
  botUserId,
}: {
  botId: string;
  botUserId: string;
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existing, setExisting] = useState<TeacherProfile | null>(null);

  // 图片上传
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);

  // 查询当前用户是否已有老师信息
  useEffect(() => {
    setFetchLoading(true);
    axios
      .get("/teachers/public/me", { params: { botId, botUserId } })
      .then((res) => {
        const teacher = res.data?.data;
        if (teacher) {
          setExisting(teacher);
          setImageUrls(teacher.images || []);
          // 回填表单
          form.setFieldsValue({
            display_name: teacher.display_name,
            contactLink: teacher.contactLink,
            address: teacher.address,
            brief: teacher.brief,
            isAvailable: teacher.isAvailable,
          });
          // 回填文件列表（用于展示）
          if (teacher.images?.length > 0) {
            setImageFileList(
              teacher.images.map((url: string, i: number) => ({
                uid: `existing-${i}`,
                name: `photo-${i + 1}`,
                status: "done",
                url,
              })),
            );
          }
        }
      })
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  }, [botId, botUserId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setError("");
      setLoading(true);

      await axios.post("/teachers/public/register", {
        botId,
        botUserId,
        ...values,
        images: imageUrls,
      });

      setSuccess(true);
    } catch (err: any) {
      if (err?.errorFields) return;
      setError(err?.response?.data?.message || "提交失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spin />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-64 px-4">
        <Result
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          title={existing ? "资料已更新" : "提交成功"}
          subTitle={
            existing
              ? "你的老师信息已更新"
              : "等待管理员审核，通过后将在列表中展示"
          }
          extra={<Button onClick={() => setSuccess(false)}>继续编辑</Button>}
        />
      </div>
    );
  }

  const isEditing = !!existing;
  const isPending = existing?.status === "pending";
  const isRejected = existing?.status === "rejected";

  return (
    <div className="px-4 py-4">
      {/* 状态提示 */}
      {isPending && (
        <Alert
          type="info"
          message="审核中"
          description="您的入驻申请正在审核中，请耐心等待"
          showIcon
          className="mb-4"
        />
      )}
      {isRejected && (
        <Alert
          type="error"
          message="审核未通过"
          description="您的申请已被拒绝，请修改后重新提交"
          showIcon
          className="mb-4"
        />
      )}
      {isEditing && existing?.status === "approved" && (
        <Alert
          type="success"
          message={
            <span>
              已认证老师{" "}
              <Tag color="success" style={{ marginLeft: 4 }}>
                ✓ 认证
              </Tag>
            </span>
          }
          showIcon
          className="mb-4"
        />
      )}

      <div className="text-lg font-semibold mb-4">
        {isEditing ? "更新我的资料" : "申请入驻"}
      </div>

      {error && (
        <Alert type="error" message={error} showIcon className="mb-4" />
      )}

      <Form form={form} layout="vertical" initialValues={{ isAvailable: true }}>
        <Form.Item
          name="display_name"
          label="花名"
          rules={[{ required: true, message: "请输入花名" }]}
        >
          <Input placeholder="您的花名" />
        </Form.Item>

        <Form.Item
          name="contactLink"
          label="联系方式"
          rules={[
            { required: true, message: "请输入联系方式" },
            {
              pattern: /^(https:\/\/t\.me\/|@)[A-Za-z0-9_]+/,
              message: "请输入 Telegram 链接或 @用户名",
            },
          ]}
        >
          <Input placeholder="https://t.me/xxx 或 @用户名" />
        </Form.Item>

        <Form.Item
          name="address"
          label="地点"
          rules={[{ required: true, message: "请输入补习地点" }]}
        >
          <Input placeholder="所在区域，如：七里河" />
        </Form.Item>

        <Form.Item name="brief" label="简介">
          <Input.TextArea
            placeholder="价位、描述等（花名、价位、身高体重等）"
            rows={4}
            showCount
            maxLength={300}
          />
        </Form.Item>

        <Form.Item name="isAvailable" label="接单状态" valuePropName="checked">
          <Switch checkedChildren="可约" unCheckedChildren="休息" />
        </Form.Item>

        {/* 图片上传 */}
        <Form.Item label="个人照片">
          <Upload
            listType="picture-card"
            fileList={imageFileList}
            accept="image/*"
            customRequest={async ({ file, onSuccess, onError }) => {
              setImageUploading(true);
              const formData = new FormData();
              formData.append("file", file as File);
              try {
                const res = await axios.post("/upload/public", formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });
                const url = res.data?.data?.url;
                if (!url) throw new Error("未获取到图片地址");
                setImageUrls((prev) => [...prev, url]);
                onSuccess?.(res.data);
              } catch (e: any) {
                onError?.(e);
                message.error("图片上传失败");
              } finally {
                setImageUploading(false);
              }
            }}
            onChange={({ fileList }) => setImageFileList(fileList)}
            onRemove={(file) => {
              const url = (file as any).url || file.response?.data?.url;
              if (url) {
                setImageUrls((prev) => prev.filter((u) => u !== url));
              }
              return true;
            }}
            onPreview={async (file) => {
              if (!file.url && !file.preview && file.originFileObj) {
                file.preview = await getBase64(file.originFileObj);
              }
              window.open(file.url || file.preview, "_blank");
            }}
          >
            {imageFileList.length < 6 && (
              <div>
                {imageUploading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8, fontSize: 12 }}>上传照片</div>
              </div>
            )}
          </Upload>
          <div className="text-xs text-gray-400 mt-1">
            最多上传 6 张，建议清晰正面照
          </div>
        </Form.Item>

        <Button
          type="primary"
          block
          size="large"
          loading={loading}
          onClick={handleSubmit}
        >
          {isEditing ? "保存更新" : "提交申请"}
        </Button>
      </Form>
    </div>
  );
};

export default RegisterTeacher;
