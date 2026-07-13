/**
 * How-to-use instructions for Mkweli AML Sanctions Screening.
 *
 * @format
 */

import React, {useMemo} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {useLanguage} from './src/i18n/LanguageContext';
import {LanguagePicker} from './src/i18n/LanguagePicker';
import type {TranslationKey} from './src/i18n/translations';

type Props = {
  onBack: () => void;
};

const SECTION_KEYS: {title: TranslationKey; body: TranslationKey}[] = [
  {title: 'sectionWhatTitle', body: 'sectionWhatBody'},
  {title: 'sectionScreenTitle', body: 'sectionScreenBody'},
  {title: 'sectionUpdateTitle', body: 'sectionUpdateBody'},
  {title: 'sectionStatusTitle', body: 'sectionStatusBody'},
  {title: 'sectionOfflineTitle', body: 'sectionOfflineBody'},
  {title: 'sectionLimitsTitle', body: 'sectionLimitsBody'},
];

export function InstructionsScreen({onBack}: Props) {
  const isDarkMode = useColorScheme() === 'dark';
  const {t} = useLanguage();

  const sections = useMemo(
    () =>
      SECTION_KEYS.map(s => ({
        title: t(s.title),
        body: t(s.body),
      })),
    [t],
  );

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('backA11y')}
          style={styles.backButton}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.backButtonText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={isDarkMode ? styles.darkTitle : styles.lightTitle}>
          {t('instructionsTitle')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator>
        <LanguagePicker />

        <Text style={isDarkMode ? styles.introDark : styles.introLight}>
          {t('instructionsIntro')}
        </Text>

        {sections.map(section => (
          <View
            key={section.title}
            style={[
              styles.card,
              isDarkMode ? styles.cardDark : styles.cardLight,
            ]}>
            <Text
              style={
                isDarkMode ? styles.sectionTitleDark : styles.sectionTitleLight
              }>
              {section.title}
            </Text>
            <Text
              style={
                isDarkMode ? styles.sectionBodyDark : styles.sectionBodyLight
              }>
              {section.body}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.doneButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('returnA11y')}>
          <Text style={styles.doneButtonText}>{t('backToScreening')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  backButton: {
    minWidth: 72,
    paddingVertical: 4,
  },
  backButtonText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSpacer: {
    minWidth: 72,
  },
  lightTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  darkTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introLight: {
    fontSize: 15,
    color: '#555',
    marginBottom: 14,
    marginTop: 12,
    lineHeight: 22,
  },
  introDark: {
    fontSize: 15,
    color: '#BBB',
    marginBottom: 14,
    marginTop: 12,
    lineHeight: 22,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardLight: {
    backgroundColor: '#FFF',
    borderColor: '#DDD',
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#444',
  },
  sectionTitleLight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionTitleDark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  sectionBodyLight: {
    fontSize: 14,
    color: '#444',
    lineHeight: 21,
  },
  sectionBodyDark: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 21,
  },
  doneButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default InstructionsScreen;
