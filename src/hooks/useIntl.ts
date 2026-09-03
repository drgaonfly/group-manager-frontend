import { useTranslation } from 'react-i18next';

/**
 * 兼容 @umijs/max 的 useIntl hook
 * 用 react-i18next 实现相同的 API
 */
export function useIntl() {
  const { t } = useTranslation();

  return {
    formatMessage: ({ id, defaultMessage }: { id: string; defaultMessage?: string }) => {
      return t(id, defaultMessage || id);
    },
  };
}