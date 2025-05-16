import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

function Warn() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card style={{ width: 500, textAlign: "center" }}>
        <Title level={3}>⚠️ 警告</Title>
        <Paragraph style={{ marginBottom: 24 }}>
          您需要在群组中打开此链接才能正常使用功能。
        </Paragraph>
      </Card>
    </div>
  );
}

export default Warn;
