import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface SeedPhraseConfirmScreenProps {
  mnemonic: string;
  onConfirmed: () => void;
  onBack: () => void;
}

export default function SeedPhraseConfirmScreen({ mnemonic, onConfirmed, onBack }: SeedPhraseConfirmScreenProps) {
  const words = mnemonic.split(' ');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [verifyIndices, setVerifyIndices] = useState<number[]>([]);

  useEffect(() => {
    // Select 4 random positions to verify
    const indices: number[] = [];
    while (indices.length < 4) {
      const randomIndex = Math.floor(Math.random() * words.length);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    indices.sort((a, b) => a - b);
    setVerifyIndices(indices);

    // Create shuffled array of the words to verify
    const wordsToVerify = indices.map(i => words[i]);
    const shuffled = [...wordsToVerify].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, []);

  const handleWordSelect = (word: string) => {
    setSelectedWords([...selectedWords, word]);
  };

  const handleWordRemove = (index: number) => {
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
  };

  const handleVerify = () => {
    const expectedWords = verifyIndices.map(i => words[i]);
    const isCorrect = JSON.stringify(selectedWords) === JSON.stringify(expectedWords);

    if (isCorrect) {
      onConfirmed();
    } else {
      Alert.alert(
        'Incorrect Order',
        'The words you selected don\'t match your recovery phrase. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => setSelectedWords([]),
          },
        ]
      );
    }
  };

  const isComplete = selectedWords.length === verifyIndices.length;
  const availableWords = shuffledWords.filter(w => !selectedWords.includes(w));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Recovery Phrase</Text>
      <Text style={styles.subtitle}>
        Select the words in the correct order to verify your backup.
      </Text>

      <View style={styles.positionsContainer}>
        {verifyIndices.map((wordIndex, slotIndex) => (
          <View key={slotIndex} style={styles.positionBox}>
            <Text style={styles.positionNumber}>Word #{wordIndex + 1}</Text>
            {selectedWords[slotIndex] ? (
              <TouchableOpacity
                style={styles.selectedWord}
                onPress={() => handleWordRemove(slotIndex)}
              >
                <Text style={styles.selectedWordText}>{selectedWords[slotIndex]}</Text>
                <Text style={styles.removeIcon}>×</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptySlot}>
                <Text style={styles.emptySlotText}>Tap word below</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Available Words</Text>
      <View style={styles.wordsContainer}>
        {availableWords.map((word, index) => (
          <TouchableOpacity
            key={index}
            style={styles.wordButton}
            onPress={() => handleWordSelect(word)}
          >
            <Text style={styles.wordButtonText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, !isComplete && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={!isComplete}
      >
        <Text style={styles.buttonText}>Verify & Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
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
    marginBottom: 32,
    lineHeight: 22,
  },
  positionsContainer: {
    marginBottom: 24,
  },
  positionBox: {
    marginBottom: 16,
  },
  positionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  selectedWord: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedWordText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  removeIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptySlot: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  emptySlotText: {
    fontSize: 16,
    color: '#adb5bd',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  wordButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  wordButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
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
