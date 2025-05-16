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
    { code: "zh", name: "简体中文" },
    { code: "zh-TW", name: "繁體中文" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
    { code: "fr", name: "Français" },
    { code: "pt", name: "Português" },
    { code: "de", name: "Deutsch" },
  ];

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    // 添加本地存储，保存用户的语言偏好
    localStorage.setItem("i18nextLng", value);
  };

  return (
    <Select
      defaultValue={"zh"}
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
