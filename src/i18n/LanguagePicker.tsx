/**
 * Compact language switcher: EN | FR | PT | ES
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {useLanguage} from './LanguageContext';
import {LANGUAGES, type LanguageCode} from './translations';

type Props = {
  /** Compact layout for headers */
  compact?: boolean;
};

export function LanguagePicker({compact = false}: Props) {
  const {language, setLanguage, t} = useLanguage();
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View
      style={[styles.wrap, compact && styles.wrapCompact]}
      accessibilityRole="radiogroup"
      accessibilityLabel={t('language')}>
      {!compact ? (
        <Text
          style={[
            styles.label,
            isDarkMode ? styles.labelDark : styles.labelLight,
          ]}>
          {t('language')}
        </Text>
      ) : null}
      <View style={styles.row}>
        {LANGUAGES.map(lang => {
          const selected = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              onPress={() => setLanguage(lang.code as LanguageCode)}
              accessibilityRole="radio"
              accessibilityState={{selected}}
              accessibilityLabel={lang.nativeName}
              style={[
                styles.chip,
                selected && styles.chipSelected,
                isDarkMode && !selected && styles.chipDark,
              ]}>
              <Text
                style={[
                  styles.chipText,
                  selected && styles.chipTextSelected,
                  isDarkMode && !selected && styles.chipTextDark,
                ]}>
                {lang.shortLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 10,
  },
  wrapCompact: {
    marginTop: 0,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  labelLight: {
    color: '#555',
  },
  labelDark: {
    color: '#BBB',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  chip: {
    minWidth: 44,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCC',
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  chipDark: {
    backgroundColor: '#2A2A2A',
    borderColor: '#555',
  },
  chipSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  chipTextDark: {
    color: '#EEE',
  },
  chipTextSelected: {
    color: '#FFF',
  },
});

export default LanguagePicker;
