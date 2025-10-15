import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { IdentityService } from '../services/IdentityService';
import SeedPhraseDisplayScreen from './SeedPhraseDisplayScreen';
import SeedPhraseConfirmScreen from './SeedPhraseConfirmScreen';
import type { DID } from '@veritas/types';

interface OnboardingScreenProps {
  onIdentityCreated: (did: DID) => void;
}

type OnboardingStep = 'welcome' | 'display-seed' | 'confirm-seed' | 'success';

export default function OnboardingScreen({ onIdentityCreated }: OnboardingScreenProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [did, setDid] = useState<DID | null>(null);

  const handleCreateIdentity = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const { did: newDid, mnemonic: newMnemonic } = await IdentityService.createIdentity();
      setDid(newDid);
      setMnemonic(newMnemonic);
      setStep('display-seed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create identity');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSeedDisplayContinue = () => {
    setStep('confirm-seed');
  };

  const handleSeedConfirmed = () => {
    setStep('success');
    // Show success for 2 seconds before completing onboarding
    setTimeout(() => {
      if (did) {
        onIdentityCreated(did);
      }
    }, 2000);
  };

  // Welcome screen
  if (step === 'welcome') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Veritas</Text>
          <Text style={styles.subtitle}>
            Your Sovereign Identity
          </Text>

          <View style={styles.features}>
            <FeatureItem
              emoji="🔐"
              title="You Own It"
              text="Your identity, your keys, your control"
            />
            <FeatureItem
              emoji="🌐"
              title="Universal"
              text="One identity across all blockchains"
            />
            <FeatureItem
              emoji="✅"
              title="Verifiable"
              text="Cryptographically secure credentials"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isCreating && styles.buttonDisabled]}
            onPress={handleCreateIdentity}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create My Identity</Text>
            )}
          </TouchableOpacity>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.disclaimer}>
            By continuing, you agree to be responsible for securely storing your recovery phrase.
          </Text>
        </View>
      </View>
    );
  }

  // Display seed phrase
  if (step === 'display-seed') {
    return (
      <SeedPhraseDisplayScreen
        mnemonic={mnemonic}
        onContinue={handleSeedDisplayContinue}
        onBack={() => setStep('welcome')}
      />
    );
  }

  // Confirm seed phrase
  if (step === 'confirm-seed') {
    return (
      <SeedPhraseConfirmScreen
        mnemonic={mnemonic}
        onConfirmed={handleSeedConfirmed}
        onBack={() => setStep('display-seed')}
      />
    );
  }

  // Success screen
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>🎉</Text>
        </View>
        <Text style={styles.successTitle}>Identity Created!</Text>
        <Text style={styles.successText}>
          Your sovereign identity is ready.{'\n'}
          Welcome to Veritas.
        </Text>
      </View>
    </View>
  );
}

function FeatureItem({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 48,
  },
  features: {
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fee',
    borderRadius: 8,
  },
  errorText: {
    color: '#c00',
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 80,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  successText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    lineHeight: 26,
  },
});
