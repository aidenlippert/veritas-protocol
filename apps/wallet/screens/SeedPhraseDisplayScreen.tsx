import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

interface SeedPhraseDisplayScreenProps {
  mnemonic: string;
  onContinue: () => void;
  onBack: () => void;
}

export default function SeedPhraseDisplayScreen({ mnemonic, onContinue, onBack }: SeedPhraseDisplayScreenProps) {
  const words = mnemonic.split(' ');
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleContinue = () => {
    if (!hasConfirmed) {
      Alert.alert(
        'Important!',
        'Please confirm that you have written down your recovery phrase. Without it, you will lose access to your identity if you lose this device.',
        [
          { text: 'Go Back', style: 'cancel' },
          {
            text: 'I Have Written It Down',
            onPress: onContinue,
            style: 'destructive',
          },
        ]
      );
    } else {
      onContinue();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Recovery Phrase</Text>
      <Text style={styles.subtitle}>
        Write down these 12 words in order. You'll need them to restore your identity.
      </Text>

      <View style={styles.warningBox}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <View style={styles.warningTextContainer}>
          <Text style={styles.warningTitle}>Keep This Safe</Text>
          <Text style={styles.warningText}>
            • Never share with anyone{'\n'}
            • Store in a secure location{'\n'}
            • Write it down on paper{'\n'}
            • This is the ONLY way to recover your identity
          </Text>
        </View>
      </View>

      <View style={styles.wordsContainer}>
        {words.map((word, index) => (
          <View key={index} style={styles.wordBox}>
            <Text style={styles.wordNumber}>{index + 1}</Text>
            <Text style={styles.word}>{word}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.checkbox, hasConfirmed && styles.checkboxChecked]}
        onPress={() => setHasConfirmed(!hasConfirmed)}
      >
        <View style={styles.checkboxBox}>
          {hasConfirmed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>
          I have written down my recovery phrase
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !hasConfirmed && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!hasConfirmed}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  wordBox: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  wordNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 12,
    width: 20,
  },
  word: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 4,
  },
  checkboxChecked: {
    opacity: 1,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
