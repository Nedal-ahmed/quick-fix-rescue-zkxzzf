
import { I18n } from 'i18n-js';
import { translations } from './translations';

const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
i18n.defaultLocale = 'en';
i18n.locale = 'en';

// Enable fallbacks if you want `en-US` and `en-GB` to fallback to `en`
i18n.enableFallback = true;

export default i18n;
