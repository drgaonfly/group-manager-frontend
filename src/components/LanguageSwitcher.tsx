import { Select } from "antd";
import { useTranslation } from "react-i18next";
import { GlobalOutlined } from "@ant-design/icons";

const { Option } = Select;

interface LanguageSwitcherProps {
  style?: React.CSSProperties;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style }) => {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", name: "English" },
    { code: "cn", name: "简体中" },
  ];

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    // 添加本地存储，保存用户的语言偏好
    localStorage.setItem("i18nextLng", value);
  };

  return (
    <Select
      defaultValue={i18n.language}
      style={{ width: 120, ...style }}
      onChange={handleLanguageChange}
      suffixIcon={<GlobalOutlined />}
    >
      {languages.map((lang) => (
        <Option key={lang.code} value={lang.code}>
          {lang.name}
        </Option>
      ))}
    </Select>
  );
};

export default LanguageSwitcher;
