import { Card, Row, Col, Statistic, Divider, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { SummaryData } from "../props/props";

const { Text } = Typography;

interface SummaryStatsProps {
  summaryData?: SummaryData;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ summaryData }) => {
  const { t } = useTranslation();

  return (
    <Card bordered={false} className="mt-4">
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title={t("home.totalDeposit")}
            value={summaryData?.totalDeposit || 0}
            precision={2}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={t("home.feeRate")}
            value={summaryData?.feeRate || 0}
            precision={2}
            suffix="%"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={t("home.usdtRate")}
            value={summaryData?.usdRate || 0}
            precision={2}
          />
        </Col>
      </Row>
      <Divider />
      <Row gutter={16}>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title={t("home.expectedWithdraw")}
              value={summaryData?.expectedWithdraw || 0}
              precision={2}
              prefix="$"
            />
            <Text type="secondary">{/* 可以在这里添加额外的计算信息 */}</Text>
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title={t("home.totalWithdraw")}
              value={summaryData?.totalWithdraw || 0}
              precision={2}
              prefix="$"
            />
            <Text type="secondary">{/* 可以在这里添加额外的计算信息 */}</Text>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default SummaryStats;
