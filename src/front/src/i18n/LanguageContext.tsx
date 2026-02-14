import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { en } from './translations/en';
import { pl } from './translations/pl';
import { tagTranslations } from './tagTranslations';

type Language = 'en' | 'pl';
export type TranslationKey = keyof typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  translateTag: (englishLabel: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'everpal_language';

const detectLanguage = (): Language => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'pl') {
    return stored;
  }
  if (navigator.language.startsWith('pl')) {
    return 'pl';
  }
  return 'en';
};

const interpolate = (template: string, params?: Record<string, string | number>): string => {
  if (!params) {
    return template;
  }
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const translations = language === 'pl' ? pl : en;
    const template = translations[key] || en[key];
    return interpolate(template, params);
  };

  const translateTag = (englishLabel: string): string => {
    if (language === 'en') {
      return englishLabel;
    }
    return tagTranslations[englishLabel] || englishLabel;
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateTag }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
