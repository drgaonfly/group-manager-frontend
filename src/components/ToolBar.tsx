import { Row, Col, Button } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import DateSelector from "./DateSelector";

interface ToolBarProps {
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onDownloadExcel: () => void;
  onRefresh?: () => void; // 添加刷新功能的回调
}

const ToolBar: React.FC<ToolBarProps> = ({
  dateFilter,
  onDateFilterChange,
  onDownloadExcel,
  onRefresh,
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
          {onRefresh && (
            <Col>
              <Button icon={<ReloadOutlined />} onClick={onRefresh} />
            </Col>
          )}
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
