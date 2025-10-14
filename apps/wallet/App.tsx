import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { IdentityService } from './services/IdentityService';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import type { DID } from '@veritas/types';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [did, setDID] = useState<DID | null>(null);

  useEffect(() => {
    checkIdentity();
  }, []);

  const checkIdentity = async () => {
    const existingIdentity = await IdentityService.getIdentity();
    setDID(existingIdentity);
    setIsLoading(false);
  };

  const handleIdentityCreated = (newDID: DID) => {
    setDID(newDID);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      {did ? (
        <HomeScreen did={did} />
      ) : (
        <OnboardingScreen onIdentityCreated={handleIdentityCreated} />
      )}
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
