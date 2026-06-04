import { useState, useEffect } from "react";
import axios from "axios";
import {
  Form,
  Select,
  Rate,
  Input,
  Switch,
  Button,
  Alert,
  Result,
  Upload,
  message,
  Avatar,
  Spin,
} from "antd";
import {
  PlusOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";

interface TeacherOption {
  _id: string;
  display_name: string;
  images: string[];
  address?: string;
}

const RATING_FIELDS = [
  { name: "avatar_rating", label: "📷 人照" },
  { name: "appearance_rating", label: "💃 颜值" },
  { name: "body_rating", label: "👙 身材" },
  { name: "service_rating", label: "✨ 服务" },
  { name: "attitude_rating", label: "🥰 态度" },
  { name: "circumstance_rating", label: "🏠 环境" },
] as const;

const WriteReview = ({
  botId,
  botUserId,
}: {
  botId: string;
  botUserId: string;
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 媒体上传
  const [mediaFileList, setMediaFileList] = useState<UploadFile[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);

  // 加载老师列表（排除自己）
  const loadTeachers = (search?: string) => {
    setTeachersLoading(true);
    axios
      .get("/teachers/public/list", {
        params: {
          botId,
          search: search || undefined,
          excludeBotUserId: botUserId,
        },
      })
      .then((res) => setTeachers(res.data?.data || []))
      .catch(() => setTeachers([]))
      .finally(() => setTeachersLoading(false));
  };

  useEffect(() => {
    loadTeachers();
  }, [botId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (mediaUrls.length === 0) {
        setError("请至少上传一张出击图片或视频");
        return;
      }

      setError("");
      setLoading(true);

      await axios.post("/evaluations/public", {
        botId,
        botUserId,
        teacherId: values.teacherId,
        avatar_rating: values.avatar_rating,
        appearance_rating: values.appearance_rating,
        body_rating: values.body_rating,
        service_rating: values.service_rating,
        attitude_rating: values.attitude_rating,
        circumstance_rating: values.circumstance_rating,
        process_desc: values.process_desc,
        isReportedAnoymously: values.isReportedAnoymously ?? false,
        proof_media: mediaUrls,
      });

      setSuccess(true);
    } catch (err: any) {
      if (err?.errorFields) return;
      setError(err?.response?.data?.message || "提交失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-64 px-4">
        <Result
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          title="车评已提交"
          subTitle="等待管理员审核后将公开展示"
          extra={
            <Button
              onClick={() => {
                form.resetFields();
                setMediaFileList([]);
                setMediaUrls([]);
                setSuccess(false);
                setError("");
              }}
            >
              再写一条
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="text-lg font-semibold mb-4">写车评</div>

      {error && (
        <Alert type="error" message={error} showIcon className="mb-4" />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          avatar_rating: 5,
          appearance_rating: 5,
          body_rating: 5,
          service_rating: 5,
          attitude_rating: 5,
          circumstance_rating: 5,
          isReportedAnoymously: false,
        }}
      >
        {/* 选择老师 */}
        <Form.Item
          name="teacherId"
          label="选择老师"
          rules={[{ required: true, message: "请选择要评价的老师" }]}
        >
          <Select
            showSearch
            placeholder="搜索花名"
            filterOption={false}
            onSearch={loadTeachers}
            notFoundContent={
              teachersLoading ? <Spin size="small" /> : "未找到老师"
            }
            options={teachers.map((t) => ({
              value: t._id,
              label: (
                <div className="flex items-center gap-2">
                  <Avatar
                    size="small"
                    src={t.images?.[0]}
                    icon={<UserOutlined />}
                  />
                  <span>{t.display_name}</span>
                  {t.address && (
                    <span className="text-gray-400 text-xs">{t.address}</span>
                  )}
                </div>
              ),
            }))}
          />
        </Form.Item>

        {/* 评分区域 */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="text-sm font-medium text-gray-500 mb-3">评分</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {RATING_FIELDS.map((field) => (
              <Form.Item
                key={field.name}
                name={field.name}
                label={
                  <span className="text-sm text-gray-600">{field.label}</span>
                }
                style={{ marginBottom: 0 }}
              >
                <Rate style={{ fontSize: 16 }} />
              </Form.Item>
            ))}
          </div>
        </div>

        <Form.Item
          name="process_desc"
          label="过程描述"
          rules={[{ required: true, message: "请填写过程描述" }]}
        >
          <Input.TextArea
            placeholder="详细描述补习过程..."
            rows={5}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          name="isReportedAnoymously"
          label="匿名提交"
          valuePropName="checked"
        >
          <Switch checkedChildren="匿名" unCheckedChildren="实名" />
        </Form.Item>

        {/* 出击图片/视频（必选） */}
        <Form.Item
          label="出击图片/视频"
          required
          validateStatus={mediaUrls.length === 0 && error ? "error" : ""}
          help={
            mediaUrls.length === 0 && error
              ? "请至少上传一张出击图片或视频"
              : ""
          }
        >
          <Upload
            listType="picture-card"
            fileList={mediaFileList}
            accept="image/*,video/*"
            customRequest={async ({ file, onSuccess, onError }) => {
              setMediaUploading(true);
              const formData = new FormData();
              formData.append("file", file as File);
              try {
                const res = await axios.post("/upload/public", formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });
                const url = res.data?.data?.url;
                if (!url) throw new Error("未获取到文件地址");
                setMediaUrls((prev) => [...prev, url]);
                onSuccess?.(res.data);
              } catch (e: any) {
                onError?.(e);
                message.error("上传失败");
              } finally {
                setMediaUploading(false);
              }
            }}
            onChange={({ fileList }) => setMediaFileList(fileList)}
            onRemove={(file) => {
              const url = (file as any).url || file.response?.data?.url;
              if (url) {
                setMediaUrls((prev) => prev.filter((u) => u !== url));
              }
              return true;
            }}
          >
            {mediaFileList.length < 4 && (
              <div>
                {mediaUploading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8, fontSize: 12 }}>上传</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Button
          type="primary"
          block
          size="large"
          loading={loading}
          onClick={handleSubmit}
        >
          提交车评
        </Button>
      </Form>
    </div>
  );
};

export default WriteReview;
