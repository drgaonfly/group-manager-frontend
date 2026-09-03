import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

function Home() {
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
        <Title level={3}>Noting Here</Title>
        <Paragraph style={{ marginBottom: 24 }}>
          暂未实现配置
        </Paragraph>
      </Card>
    </div>
  );
}

export default Home;
