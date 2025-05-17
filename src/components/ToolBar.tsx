import { Row, Col, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import DateSelector from "./DateSelector";

interface ToolBarProps {
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onDownloadExcel: () => void;
}

const ToolBar: React.FC<ToolBarProps> = ({
  dateFilter,
  onDateFilterChange,
  onDownloadExcel,
}) => {
  const { t } = useTranslation();

  return (
    <Row justify="space-between" align="middle" className="mb-6">
      <Col>
        {/* 使用抽象出的DateSelector组件 */}
        <DateSelector
          value={dateFilter}
          onChange={(value) => onDateFilterChange(value)}
          style={{ width: 200 }}
        />
      </Col>
      <Col>
        <Row gutter={16} align="middle">
          <Col>
            <LanguageSwitcher />
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={onDownloadExcel}
            >
              {t("downloadExcel")}
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ToolBar;
