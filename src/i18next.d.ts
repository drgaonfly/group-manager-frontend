import 'i18next';
import resources from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      en: typeof resources.en;
      zh: typeof resources.zh;
    };
  }
}
