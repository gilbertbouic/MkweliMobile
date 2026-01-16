/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { isSanctioned } from './sanctions-data';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView
      style={
        isDarkMode ? styles.darkContainer : styles.lightContainer
      }>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaView>
  );
}

function AppContent() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setResult(isSanctioned(query));
      setLoading(false);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={
            isDarkMode ? styles.darkTitle : styles.lightTitle
          }>
          AML Sanctions Screening
        </Text>
      </View>
      <Image
        source={{uri: 'mweli', isStatic: true}}
        style={styles.logo}
      />
      <View style={styles.searchContainer}>
        <TextInput
          style={
            isDarkMode ? styles.darkInput : styles.lightInput
          }
          placeholder="MKweliAML"
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSearch}>
          <Text style={styles.buttonText}>Screen</Text>
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
              result ? styles.sanctioned : styles.notSanctioned
            }>
            {result
              ? 'Sanctioned: Match found in database.'
              : 'Not sanctioned: No match found.'}
          </Text>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <Text
            style={
              isDarkMode
                ? styles.darkEmptyText
                : styles.lightEmptyText
            }>
            Enter a name and tap Screen to check against sanctions lists.
          </Text>
        </View>
      )}
    </View>
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
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  lightTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  darkTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginVertical: 20,
    resizeMode: 'contain',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  sanctioned: {
    fontSize: 18,
    color: '#B71C1C',
    fontWeight: 'bold',
  },
  notSanctioned: {
    fontSize: 18,
    color: '#388E3C',
    fontWeight: 'bold',
  },
  lightEmptyText: {
    fontSize: 16,
    color: '#666',
  },
  darkEmptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default App;
