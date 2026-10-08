/**
 * Mkweli AML Sanctions Screening
 * Screens names against UN / EU / UK / USA lists.
 * Lists auto-refresh every 30 days on open (and on demand).
 *
 * @format
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  type AppStateStatus,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {
  getSanctionsMeta,
  initSanctionsData,
  isListsStale,
  screenName,
  updateSanctionsLists,
  countNamesInMeta,
  formatNameCount,
  type SanctionsMeta,
  type ScreenResult,
  type UpdateProgress,
} from './sanctions-data';
import {InstructionsScreen} from './InstructionsScreen';
import {LanguageProvider, useLanguage} from './src/i18n/LanguageContext';
import {LanguagePicker} from './src/i18n/LanguagePicker';
import type {TranslationKey} from './src/i18n/translations';

type Screen = 'home' | 'instructions';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <LanguageProvider>
      <SafeAreaView
        style={isDarkMode ? styles.darkContainer : styles.lightContainer}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppShell />
      </SafeAreaView>
    </LanguageProvider>
  );
}

function AppShell() {
  const [screen, setScreen] = useState<Screen>('home');

  if (screen === 'instructions') {
    return <InstructionsScreen onBack={() => setScreen('home')} />;
  }

  return <AppContent onOpenInstructions={() => setScreen('instructions')} />;
}

function AppContent({onOpenInstructions}: {onOpenInstructions: () => void}) {
  const {t, locale} = useLanguage();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<ScreenResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [meta, setMeta] = useState<SanctionsMeta | null>(null);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [updateSummary, setUpdateSummary] = useState<{
    mode: 'manual' | 'auto';
    ok: number;
    total: number;
    failed: string;
    error: string;
  } | null>(null);
  const isDarkMode = useColorScheme() === 'dark';
  const updatingRef = useRef(false);
  const autoStartedRef = useRef(false);
  const [updateMode, setUpdateMode] = useState<'manual' | 'auto' | null>(null);

  const formatDate = useCallback(
    (iso: string | null): string => {
      if (!iso) {
        return t('bundledSeed');
      }
      try {
        return new Date(iso).toLocaleString(locale);
      } catch {
        return iso;
      }
    },
    [t, locale],
  );

  const refreshMeta = useCallback(async (): Promise<SanctionsMeta | null> => {
    try {
      const m = await getSanctionsMeta();
      setMeta(m);
      return m;
    } catch {
      return null;
    }
  }, []);

  const runListUpdate = useCallback(
    async (mode: 'manual' | 'auto') => {
      if (updatingRef.current) {
        return;
      }
      updatingRef.current = true;
      setUpdating(true);
      setUpdateMode(mode);
      setUpdateSummary(null);
      setProgress(null);
      try {
        const {meta: newMeta, results} = await updateSanctionsLists(
          p => setProgress(p),
        );
        setMeta(newMeta);
        const ok = results.filter(r => r.ok).length;
        const fail = results.filter(r => !r.ok);
        setUpdateSummary({
          mode,
          ok,
          total: results.length,
          failed: fail.map(f => `${f.label} (${f.error})`).join('; '),
          error: '',
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : String(err ?? 'Update failed');
        setUpdateSummary({
          mode,
          ok: 0,
          total: 0,
          failed: '',
          error: message,
        });
        await refreshMeta();
      } finally {
        updatingRef.current = false;
        setUpdating(false);
        setUpdateMode(null);
      }
    },
    // `t` is intentionally kept: it re-creates this callback (and the auto-update
    // effects that depend on it) when the UI language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshMeta, t],
  );

  /** Auto-download when lists are bundled seed or older than 30 days. */
  const maybeAutoUpdate = useCallback(
    async (current: SanctionsMeta | null) => {
      if (!current || updatingRef.current) {
        return;
      }
      if (!isListsStale(current)) {
        return;
      }
      await runListUpdate('auto');
    },
    [runListUpdate],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initSanctionsData();
        if (cancelled) {
          return;
        }
        const m = await refreshMeta();
        if (cancelled) {
          return;
        }
        setBooting(false);
        // First open (and any open with stale lists): download + parse automatically
        if (!autoStartedRef.current) {
          autoStartedRef.current = true;
          await maybeAutoUpdate(m);
        }
      } finally {
        if (!cancelled) {
          setBooting(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [maybeAutoUpdate, refreshMeta]);

  // Re-check when returning to the app (covers multi-day backgrounding)
  useEffect(() => {
    const onState = (state: AppStateStatus) => {
      if (state !== 'active' || updatingRef.current) {
        return;
      }
      void (async () => {
        const m = await refreshMeta();
        await maybeAutoUpdate(m);
      })();
    };
    const sub = AppState.addEventListener('change', onState);
    return () => sub.remove();
  }, [maybeAutoUpdate, refreshMeta]);

  const runScreening = (name: string) => {
    setLoading(true);
    setResult(null);
    // Defer so the spinner paints; token search is sync on the JS thread.
    setTimeout(() => {
      setResult(screenName(name));
      setLoading(false);
      const q = name.trim();
      if (q) {
        setRecentSearches(prev => [q, ...prev.filter(s => s !== q)].slice(0, 15));
      }
    }, 50);
  };

  const handleSearch = () => {
    runScreening(query);
  };

  const handleClearAllSearches = () => {
    setQuery('');
    setResult(null);
    setRecentSearches([]);
    setLoading(false);
  };

  const handleUpdateLists = () => {
    void runListUpdate('manual');
  };

  const canClearSearches =
    query.length > 0 || result !== null || recentSearches.length > 0;

  const stale = meta ? isListsStale(meta) : false;
  const totalNames = countNamesInMeta(meta);
  // Same string as the post-update "{{names}} total names" figure.
  const namesLabel = formatNameCount(totalNames, locale);
  const updateMessage = (() => {
    if (!updateSummary) {
      return updating ? null : null;
    }
    if (updateSummary.error) {
      return t(
        updateSummary.mode === 'auto' ? 'autoUpdateFailed' : 'updateFailed',
        {error: updateSummary.error},
      );
    }
    if (updateSummary.failed) {
      return t(
        updateSummary.mode === 'auto' ? 'autoUpdatePartial' : 'updatePartial',
        {
          ok: updateSummary.ok,
          total: updateSummary.total,
          names: namesLabel,
          failed: updateSummary.failed,
        },
      );
    }
    return t(updateSummary.mode === 'auto' ? 'autoUpdateOk' : 'updateOk', {
      ok: updateSummary.ok,
      total: updateSummary.total,
      names: namesLabel,
    });
  })();

  const progressText =
    progress != null
      ? t(progress.messageKey as TranslationKey, progress.messageParams)
      : '';

  const header = (
    <View style={styles.header}>
      <Text style={isDarkMode ? styles.darkTitle : styles.lightTitle}>
        {t('appTitle')}
      </Text>
      <TouchableOpacity
        onPress={onOpenInstructions}
        accessibilityRole="link"
        accessibilityLabel={t('howToUseA11y')}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        style={styles.helpLink}>
        <Text style={styles.helpLinkText}>{t('howToUse')}</Text>
      </TouchableOpacity>
      <LanguagePicker />
    </View>
  );

  if (booting) {
    return (
      <View style={styles.container}>
        {header}
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
        <Text style={isDarkMode ? styles.darkEmptyText : styles.lightEmptyText}>
          {t('loadingData')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        {header}
        {/* Sharp density PNGs: mkweli_light / mkweli_dark for theme */}
        <Image
          source={{uri: isDarkMode ? 'mkweli_dark' : 'mkweli_light'}}
          style={styles.logo}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={t('appTitle')}
        />

        <View
          style={[
            styles.statusCard,
            isDarkMode ? styles.statusCardDark : styles.statusCardLight,
          ]}>
          <Text
            style={
              isDarkMode ? styles.statusTitleDark : styles.statusTitleLight
            }>
            {t('sanctionsLists')}
          </Text>
          <Text
            style={isDarkMode ? styles.statusBodyDark : styles.statusBodyLight}>
            {t('lastUpdate', {date: formatDate(meta?.lastFullUpdateAt ?? null)})}
          </Text>
          <Text
            style={isDarkMode ? styles.statusBodyDark : styles.statusBodyLight}>
            {t('namesLoaded', {
              count: namesLabel,
            })}
          </Text>
          {stale ? <Text style={styles.staleText}>{t('staleNotice')}</Text> : null}
          {meta ? (
            <View style={styles.sourceRow}>
              {Object.values(meta.sources).map(s => (
                <Text
                  key={s.id}
                  style={
                    isDarkMode ? styles.sourceChipDark : styles.sourceChipLight
                  }>
                  {s.label}: {formatNameCount(s.nameCount, locale)}
                  {s.source === 'downloaded' ? '' : t('seedSuffix')}
                  {s.lastError ? ' ⚠' : ''}
                </Text>
              ))}
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.updateButton,
              updating && styles.updateButtonDisabled,
            ]}
            onPress={handleUpdateLists}
            disabled={updating}>
            {updating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>{t('updateLists')}</Text>
            )}
          </TouchableOpacity>

          {updating && progress ? (
            <View style={styles.progressBox}>
              <Text
                style={
                  isDarkMode ? styles.statusBodyDark : styles.statusBodyLight
                }>
                [{progress.sourceIndex}/{progress.totalSources}] {progressText}
              </Text>
              <ActivityIndicator
                size="small"
                color="#007BFF"
                style={styles.progressSpinner}
              />
            </View>
          ) : null}

          {updating && updateMode === 'auto' && !updateMessage ? (
            <Text
              style={[
                styles.updateMessage,
                isDarkMode ? styles.statusBodyDark : styles.statusBodyLight,
              ]}>
              {t('autoUpdating')}
            </Text>
          ) : null}
          {updateMessage ? (
            <Text
              style={[
                styles.updateMessage,
                isDarkMode ? styles.statusBodyDark : styles.statusBodyLight,
              ]}>
              {updateMessage}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.clearSearchesButton,
            !canClearSearches && styles.updateButtonDisabled,
          ]}
          onPress={handleClearAllSearches}
          disabled={!canClearSearches}
          accessibilityRole="button"
          accessibilityLabel={t('clearAllSearchesA11y')}>
          <Text style={styles.buttonText}>{t('clearAllSearches')}</Text>
        </TouchableOpacity>

        {recentSearches.length > 0 ? (
          <View style={styles.recentBox}>
            <Text
              style={
                isDarkMode ? styles.tokensHintDark : styles.tokensHintLight
              }>
              {t('recentSearches')}
            </Text>
            <View style={styles.recentList}>
              {recentSearches.map(name => (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.recentChip,
                    isDarkMode ? styles.recentChipDark : styles.recentChipLight,
                  ]}
                  onPress={() => {
                    setQuery(name);
                    runScreening(name);
                  }}
                  disabled={updating}
                  accessibilityRole="button"
                  accessibilityLabel={name}>
                  <Text
                    style={
                      isDarkMode
                        ? styles.recentChipTextDark
                        : styles.recentChipTextLight
                    }
                    numberOfLines={1}>
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.searchContainer}>
          <TextInput
            style={isDarkMode ? styles.darkInput : styles.lightInput}
            placeholder={t('placeholderName')}
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            value={query}
            onChangeText={setQuery}
            editable={!updating}
          />
          <TouchableOpacity
            style={[styles.button, updating && styles.updateButtonDisabled]}
            onPress={handleSearch}
            disabled={updating}>
            <Text style={styles.buttonText}>{t('screen')}</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007BFF"
            style={styles.loader}
          />
        ) : result !== null ? (
          <View style={styles.resultContainer}>
            <Text
              style={
                result.status === 'strong'
                  ? styles.sanctioned
                  : result.status === 'possible'
                    ? styles.possibleMatch
                    : result.status === 'clear'
                      ? styles.notSanctioned
                      : isDarkMode
                        ? styles.darkEmptyText
                        : styles.lightEmptyText
              }>
              {result.status === 'strong'
                ? t('resultStrong', {count: result.strongCount})
                : result.status === 'possible'
                  ? t('resultPossible', {count: result.possibleCount})
                  : result.status === 'short_query'
                    ? t('resultShortQuery')
                    : result.status === 'empty_query'
                      ? t('resultEmptyQuery')
                      : t('resultClear')}
            </Text>
            {result.queryTokens.length > 0 ? (
              <Text
                style={
                  isDarkMode ? styles.tokensHintDark : styles.tokensHintLight
                }>
                {t('tokensUsed', {tokens: result.queryTokens.join(' · ')})}
              </Text>
            ) : null}
            {result.matches.length > 0 ? (
              <View style={styles.matchList}>
                {result.matches.map((m, i) => (
                  <View
                    key={`${m.name}-${i}`}
                    style={[
                      styles.matchRow,
                      isDarkMode ? styles.matchRowDark : styles.matchRowLight,
                      m.strength === 'strong'
                        ? styles.matchRowStrong
                        : styles.matchRowPossible,
                    ]}>
                    <View style={styles.matchHeader}>
                      <Text
                        style={
                          m.strength === 'strong'
                            ? styles.matchBadgeStrong
                            : styles.matchBadgePossible
                        }>
                        {m.strength === 'strong'
                          ? t('badgeStrong')
                          : t('badgePossible')}
                      </Text>
                      <Text
                        style={
                          isDarkMode
                            ? styles.matchScoreDark
                            : styles.matchScoreLight
                        }>
                        {t('matchScore', {score: m.score})}
                      </Text>
                    </View>
                    <Text
                      style={
                        isDarkMode
                          ? styles.matchNameDark
                          : styles.matchNameLight
                      }>
                      {m.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
            {result.status === 'strong' || result.status === 'possible' ? (
              <Text
                style={
                  isDarkMode ? styles.reviewHintDark : styles.reviewHintLight
                }>
                {t('resultReviewHint')}
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <Text
              style={isDarkMode ? styles.darkEmptyText : styles.lightEmptyText}>
              {t('emptyHint')}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lightContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  lightTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  darkTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  helpLink: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  helpLinkText: {
    color: '#007BFF',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  logo: {
    width: 280,
    height: 112,
    alignSelf: 'center',
    marginVertical: 16,
  },
  statusCard: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusCardLight: {
    backgroundColor: '#FFF',
    borderColor: '#DDD',
  },
  statusCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#444',
  },
  statusTitleLight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  statusTitleDark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  statusBodyLight: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  statusBodyDark: {
    fontSize: 13,
    color: '#BBB',
    marginBottom: 2,
  },
  staleText: {
    fontSize: 13,
    color: '#E65100',
    marginTop: 6,
    marginBottom: 4,
  },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  sourceChipLight: {
    fontSize: 11,
    color: '#333',
    backgroundColor: '#EEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sourceChipDark: {
    fontSize: 11,
    color: '#EEE',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  updateButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginTop: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  progressBox: {
    marginTop: 10,
    alignItems: 'center',
  },
  progressSpinner: {
    marginTop: 6,
  },
  updateMessage: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
  },
  clearSearchesButton: {
    backgroundColor: '#C62828',
    marginHorizontal: 12,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  recentBox: {
    marginHorizontal: 12,
    marginTop: 8,
  },
  recentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  recentChip: {
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  recentChipLight: {
    backgroundColor: '#FFF',
    borderColor: '#CCC',
  },
  recentChipDark: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  recentChipTextLight: {
    fontSize: 13,
    color: '#333',
  },
  recentChipTextDark: {
    fontSize: 13,
    color: '#EEE',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  lightInput: {
    flex: 1,
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#FFF',
    color: '#333',
  },
  darkInput: {
    flex: 1,
    height: 40,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#333',
    color: '#FFF',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  resultContainer: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 20,
    paddingHorizontal: 16,
    width: '100%',
  },
  sanctioned: {
    fontSize: 18,
    color: '#B71C1C',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  possibleMatch: {
    fontSize: 18,
    color: '#E65100',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notSanctioned: {
    fontSize: 18,
    color: '#388E3C',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lightEmptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  darkEmptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  tokensHintLight: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tokensHintDark: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  matchList: {
    marginTop: 16,
    gap: 8,
  },
  matchRow: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  matchRowLight: {
    backgroundColor: '#FFF',
    borderColor: '#DDD',
  },
  matchRowDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#444',
  },
  matchRowStrong: {
    borderLeftWidth: 4,
    borderLeftColor: '#B71C1C',
  },
  matchRowPossible: {
    borderLeftWidth: 4,
    borderLeftColor: '#E65100',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  matchBadgeStrong: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B71C1C',
    textTransform: 'uppercase',
  },
  matchBadgePossible: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E65100',
    textTransform: 'uppercase',
  },
  matchScoreLight: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  matchScoreDark: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EEE',
  },
  matchNameLight: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  matchNameDark: {
    fontSize: 15,
    color: '#F2F2F0',
    fontWeight: '500',
  },
  reviewHintLight: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    color: '#555',
    textAlign: 'center',
  },
  reviewHintDark: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
    color: '#AAA',
    textAlign: 'center',
  },
});

export default App;
