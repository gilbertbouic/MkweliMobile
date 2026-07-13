/**
 * @format
 */

import {
  interpolate,
  isLanguageCode,
  LANGUAGES,
  translations,
  type TranslationKey,
} from '../src/i18n/translations';

describe('i18n translations', () => {
  const keys = Object.keys(translations.en) as TranslationKey[];

  test('supports EN FR PT ES', () => {
    expect(LANGUAGES.map(l => l.code)).toEqual(['en', 'fr', 'pt', 'es']);
    expect(isLanguageCode('en')).toBe(true);
    expect(isLanguageCode('sp')).toBe(false);
  });

  test('all languages have the same keys as English', () => {
    for (const lang of ['fr', 'pt', 'es'] as const) {
      const langKeys = Object.keys(translations[lang]).sort();
      expect(langKeys).toEqual([...keys].sort());
    }
  });

  test('no empty strings in any language', () => {
    for (const lang of LANGUAGES) {
      for (const key of keys) {
        const value = translations[lang.code][key];
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('interpolate replaces placeholders', () => {
    expect(interpolate('Hello {{name}}', {name: 'Ada'})).toBe('Hello Ada');
    expect(interpolate('{{ok}}/{{total}}', {ok: 3, total: 4})).toBe('3/4');
  });

  test('French screen button differs from English', () => {
    expect(translations.fr.screen).toBe('Contrôler');
    expect(translations.en.screen).toBe('Screen');
  });

  test('Spanish and Portuguese how-to titles are localized', () => {
    expect(translations.es.howToUse).toBe('Cómo usar');
    expect(translations.pt.howToUse).toBe('Como usar');
  });
});
