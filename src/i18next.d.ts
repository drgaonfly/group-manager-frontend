import 'i18next';
import resources from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      en: typeof resources.en;
      zh: typeof resources.zh;
      'zh-TW': typeof resources['zh-TW'];
      ja: typeof resources.ja;
      ko: typeof resources.ko;
      it: typeof resources.it;
      fr: typeof resources.fr;
      pt: typeof resources.pt;
      ru: typeof resources.ru;
      ar: typeof resources.ar;
      hi: typeof resources.hi;
      bg: typeof resources.bg;
      es: typeof resources.es;
      de: typeof resources.de;
    };
  }
}
