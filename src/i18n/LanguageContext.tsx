/**
 * App language context with persistence.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import RNFS from 'react-native-fs';
import {
  type LanguageCode,
  type TranslationKey,
  LANGUAGES,
  interpolate,
  isLanguageCode,
  translations,
} from './translations';

const LANG_PATH = `${RNFS.DocumentDirectoryPath}/settings/language-v1.json`;

type TFunction = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: TFunction;
  locale: string;
  ready: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

async function readStoredLanguage(): Promise<LanguageCode | null> {
  try {
    const exists = await RNFS.exists(LANG_PATH);
    if (!exists) {
      return null;
    }
    const raw = await RNFS.readFile(LANG_PATH, 'utf8');
    const parsed = JSON.parse(raw) as {language?: string};
    if (parsed.language && isLanguageCode(parsed.language)) {
      return parsed.language;
    }
  } catch {
    // ignore
  }
  return null;
}

async function writeStoredLanguage(code: LanguageCode): Promise<void> {
  try {
    const dir = `${RNFS.DocumentDirectoryPath}/settings`;
    if (!(await RNFS.exists(dir))) {
      await RNFS.mkdir(dir);
    }
    const tmp = `${LANG_PATH}.tmp`;
    await RNFS.writeFile(tmp, JSON.stringify({language: code}), 'utf8');
    if (await RNFS.exists(LANG_PATH)) {
      await RNFS.unlink(LANG_PATH);
    }
    await RNFS.moveFile(tmp, LANG_PATH);
  } catch {
    // non-fatal
  }
}

export function LanguageProvider({children}: {children: React.ReactNode}) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await readStoredLanguage();
      if (!cancelled && stored) {
        setLanguageState(stored);
      }
      if (!cancelled) {
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    void writeStoredLanguage(code);
  }, []);

  const t = useCallback<TFunction>(
    (key, params) => {
      const table = translations[language] ?? translations.en;
      const template = table[key] ?? translations.en[key] ?? String(key);
      return interpolate(template, params);
    },
    [language],
  );

  const locale =
    LANGUAGES.find(l => l.code === language)?.locale ?? 'en-US';

  const value = useMemo(
    () => ({language, setLanguage, t, locale, ready}),
    [language, setLanguage, t, locale, ready],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}

export function useT(): TFunction {
  return useLanguage().t;
}
