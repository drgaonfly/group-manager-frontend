import { useEffect, useState } from "react";
import { Select } from "antd";
import { useTranslation } from "react-i18next";
import { DateOption } from "../props/props";

const { Option } = Select;

interface DateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  value,
  onChange,
  style,
}) => {
  const { t } = useTranslation();
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);

  // 生成过去7天的日期选项
  useEffect(() => {
    const options: DateOption[] = [];

    // 添加"今天"选项
    options.push({
      value: "today",
      label: t("today"),
    });

    // 添加过去6天的选项
    for (let i = 1; i <= 6; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const month = date.getMonth() + 1;
      const day = date.getDate();

      options.push({
        value: `day-${i}`,
        label: `0${month}-${day}`,
      });
    }

    setDateOptions(options);
  }, [t]);

  return (
    <Select style={style || { width: 200 }} value={value} onChange={onChange}>
      {dateOptions.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  );
};

export default DateSelector;
