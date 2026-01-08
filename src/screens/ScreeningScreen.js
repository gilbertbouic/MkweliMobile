import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { screenClient } from '../services/apiService';

const ScreeningScreen = () => {
  const [response, setResponse] = useState('');

  const handleScreenClient = async () => {
    try {
      const result = await screenClient({ name: 'John Doe' });
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Screening</Text>
      <Button title="Screen Client" onPress={handleScreenClient} />
      {response ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>API Response:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  responseContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  responseText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});

export default ScreeningScreen;
