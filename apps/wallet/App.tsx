import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { IdentityService } from './services/IdentityService';
import { CredentialService, type StoredCredential } from './services/CredentialService';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import PresentCredentialScreen from './screens/PresentCredentialScreen';
import type { DID } from '@veritas/types';

type Screen = 'dashboard' | 'present';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [did, setDID] = useState<DID | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedCredential, setSelectedCredential] = useState<StoredCredential | null>(null);

  useEffect(() => {
    checkIdentity();
    setupDeepLinking();
  }, []);

  const checkIdentity = async () => {
    const existingIdentity = await IdentityService.getIdentity();
    setDID(existingIdentity);
    setIsLoading(false);
  };

  const setupDeepLinking = () => {
    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then(handleDeepLink);

    // Handle deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  };

  const handleDeepLink = async (url: string | null) => {
    if (!url) return;

    try {
      const { hostname, queryParams } = Linking.parse(url);

      if (hostname === 'credential' && queryParams?.vc) {
        // Received a credential via deep link
        const vcData = decodeURIComponent(queryParams.vc as string);
        await CredentialService.saveCredential(vcData);
        Alert.alert('Success', 'Credential received and stored securely!');
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      Alert.alert('Error', 'Failed to process credential');
    }
  };

  const handleIdentityCreated = (newDID: DID) => {
    setDID(newDID);
  };

  const handlePresentCredential = (credential: StoredCredential) => {
    setSelectedCredential(credential);
    setCurrentScreen('present');
  };

  const handleBack = () => {
    setCurrentScreen('dashboard');
    setSelectedCredential(null);
  };

  const handleAddTestCredential = async () => {
    if (!did) return;

    // For testing: create a sample credential
    const testVC = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://veritas.id/contexts/employment/v1',
      ],
      id: `urn:uuid:test-${Date.now()}`,
      type: ['VerifiableCredential', 'ProofOfEmploymentCredential'],
      issuer: 'did:ethr:polygon:0xTestIssuer',
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: did.id,
        employer: 'Test Company',
        role: 'Software Engineer',
        startDate: '2023-01-01',
        endDate: '2024-12-31',
      },
      proof: {
        type: 'JsonWebSignature2020',
        created: new Date().toISOString(),
        proofPurpose: 'assertionMethod',
        verificationMethod: 'did:ethr:polygon:0xTestIssuer#key-1',
        jws: 'test-signature',
      },
    };

    try {
      await CredentialService.saveCredential(JSON.stringify(testVC));
      Alert.alert('Success', 'Test credential added!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add test credential');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!did) {
    return (
      <>
        <OnboardingScreen onIdentityCreated={handleIdentityCreated} />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      {currentScreen === 'dashboard' ? (
        <DashboardScreen
          did={did}
          onPresentCredential={handlePresentCredential}
          onAddCredential={handleAddTestCredential}
        />
      ) : (
        selectedCredential && (
          <PresentCredentialScreen
            credential={selectedCredential}
            onBack={handleBack}
          />
        )
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
