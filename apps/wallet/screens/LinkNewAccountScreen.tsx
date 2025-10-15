import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import QrScanner from '../components/QrScanner';
import { IdentityService } from '../services/IdentityService';

type Chain = 'evm' | 'solana' | 'bitcoin';
type LinkingStep = 'select-chain' | 'display-challenge' | 'scan-proof' | 'success';

interface LinkNewAccountScreenProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function LinkNewAccountScreen({ onComplete, onCancel }: LinkNewAccountScreenProps) {
  const [step, setStep] = useState<LinkingStep>('select-chain');
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [challenge, setChallenge] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChainSelect = async (chain: Chain) => {
    setIsProcessing(true);
    setSelectedChain(chain);

    try {
      // Generate a unique challenge for this linking attempt
      const challengeMessage = await IdentityService.generateLinkChallenge(chain);
      setChallenge(challengeMessage);
      setStep('display-challenge');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate challenge. Please try again.');
      console.error('Challenge generation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanProof = () => {
    // This will open the camera to scan the signed proof QR code
    setStep('scan-proof');
  };

  const handleProofScanned = async (proofData: string) => {
    setIsProcessing(true);

    try {
      // Parse the proof data (format: address|signature)
      const [address, signature] = proofData.split('|');

      if (!address || !signature || !selectedChain) {
        throw new Error('Invalid proof format');
      }

      // Verify the signature
      const isValid = await IdentityService.verifyLinkSignature({
        originalMessage: challenge,
        signature,
        address,
        chain: selectedChain,
      });

      if (!isValid) {
        Alert.alert('Verification Failed', 'The signature could not be verified. Please try again.');
        setStep('display-challenge');
        return;
      }

      // Save the linked account
      await IdentityService.addLinkedAccount({
        chain: selectedChain,
        address,
        signature,
        challenge,
        linkedAt: new Date().toISOString(),
      });

      setStep('success');
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to verify proof');
      setStep('display-challenge');
    } finally {
      setIsProcessing(false);
    }
  };

  const getChainIcon = (chain: Chain): string => {
    switch (chain) {
      case 'evm':
        return '⟠';
      case 'solana':
        return '◎';
      case 'bitcoin':
        return '₿';
    }
  };

  const getChainName = (chain: Chain): string => {
    switch (chain) {
      case 'evm':
        return 'Ethereum (EVM)';
      case 'solana':
        return 'Solana';
      case 'bitcoin':
        return 'Bitcoin';
    }
  };

  const getChainInstructions = (chain: Chain): string => {
    switch (chain) {
      case 'evm':
        return 'Use MetaMask or any EVM wallet to sign the message';
      case 'solana':
        return 'Use Phantom or any Solana wallet to sign the message';
      case 'bitcoin':
        return 'Use a Bitcoin wallet that supports message signing';
    }
  };

  // Select Chain Step
  if (step === 'select-chain') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Link New Account</Text>
          <Text style={styles.subtitle}>
            Choose which blockchain you want to link
          </Text>

          <View style={styles.chainsContainer}>
            <ChainOption
              chain="evm"
              icon={getChainIcon('evm')}
              name={getChainName('evm')}
              description="Link Ethereum, Polygon, BSC, and all EVM chains"
              onSelect={() => handleChainSelect('evm')}
              disabled={isProcessing}
            />

            <ChainOption
              chain="solana"
              icon={getChainIcon('solana')}
              name={getChainName('solana')}
              description="Link your Solana wallet address"
              onSelect={() => handleChainSelect('solana')}
              disabled={true} // Coming soon
              badge="Coming Soon"
            />

            <ChainOption
              chain="bitcoin"
              icon={getChainIcon('bitcoin')}
              name={getChainName('bitcoin')}
              description="Link your Bitcoin wallet address"
              onSelect={() => handleChainSelect('bitcoin')}
              disabled={true} // Coming soon
              badge="Coming Soon"
            />
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Display Challenge Step
  if (step === 'display-challenge' && selectedChain) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Scan This QR Code</Text>
          <Text style={styles.subtitle}>
            On your desktop, go to verify.veritas.id/link
          </Text>

          <View style={styles.qrContainer}>
            <QRCode value={challenge} size={250} />
          </View>

          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>
              {getChainIcon(selectedChain)} {getChainName(selectedChain)}
            </Text>
            <Text style={styles.instructionsText}>
              1. Open verify.veritas.id/link on your desktop browser{'\n'}
              2. Scan this QR code{'\n'}
              3. {getChainInstructions(selectedChain)}{'\n'}
              4. A new QR code will appear with your signature{'\n'}
              5. Come back here and scan that QR code
            </Text>
          </View>

          <View style={styles.challengeTextBox}>
            <Text style={styles.challengeLabel}>Challenge Message:</Text>
            <Text style={styles.challengeText}>{challenge}</Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleScanProof}
            disabled={isProcessing}
          >
            <Text style={styles.nextButtonText}>I Have Signed → Scan Proof</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Scan Proof Step
  if (step === 'scan-proof') {
    return (
      <View style={styles.container}>
        <QrScanner
          onScan={handleProofScanned}
          onCancel={() => setStep('display-challenge')}
        />
      </View>
    );
  }

  // Success Step
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.successEmoji}>✅</Text>
        </View>
        <Text style={styles.successTitle}>Account Linked!</Text>
        <Text style={styles.successText}>
          Your {selectedChain && getChainName(selectedChain)} wallet is now linked to your Veritas identity.
        </Text>
      </View>
    </View>
  );
}

function ChainOption({
  chain,
  icon,
  name,
  description,
  onSelect,
  disabled,
  badge,
}: {
  chain: Chain;
  icon: string;
  name: string;
  description: string;
  onSelect: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.chainOption, disabled && styles.chainOptionDisabled]}
      onPress={onSelect}
      disabled={disabled}
    >
      <Text style={styles.chainIcon}>{icon}</Text>
      <View style={styles.chainInfo}>
        <View style={styles.chainHeader}>
          <Text style={styles.chainName}>{name}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.chainDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  chainsContainer: {
    marginBottom: 24,
  },
  chainOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  chainOptionDisabled: {
    opacity: 0.5,
  },
  chainIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  chainInfo: {
    flex: 1,
  },
  chainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chainName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#856404',
  },
  chainDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  instructionsBox: {
    backgroundColor: '#e7f3ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#004085',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#004085',
    lineHeight: 22,
  },
  challengeTextBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  challengeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  challengeText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  scannerPlaceholder: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    minHeight: 300,
  },
  scannerText: {
    fontSize: 48,
    marginBottom: 16,
  },
  scannerSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  manualButton: {
    backgroundColor: '#6c757d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  manualButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successIcon: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 80,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
});
