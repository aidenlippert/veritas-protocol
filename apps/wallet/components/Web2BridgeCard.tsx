import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { CredentialService } from '../services/CredentialService';

// Enable browser session to be dismissed
WebBrowser.maybeCompleteAuthSession();

interface Web2BridgeCardProps {
  did: string;
  onCredentialAdded?: () => void;
}

export const Web2BridgeCard: React.FC<Web2BridgeCardProps> = ({ did, onCredentialAdded }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubConnect = async () => {
    try {
      setIsLoading(true);

      // Open OAuth flow in browser
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const authUrl = `${apiUrl}/auth/github?did=${encodeURIComponent(did)}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'veritas://credential'
      );

      if (result.type === 'success') {
        // Extract VC from URL
        const { queryParams } = Linking.parse(result.url);
        if (queryParams?.vc) {
          const vcData = decodeURIComponent(queryParams.vc as string);
          await CredentialService.saveCredential(vcData);
          Alert.alert('Success!', 'GitHub reputation credential added to your wallet');
          onCredentialAdded?.();
        }
      }
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      Alert.alert('Error', 'Failed to connect GitHub account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🌉</Text>
        <Text style={styles.title}>Import Your Reputation</Text>
      </View>

      <Text style={styles.description}>
        Connect your GitHub account to instantly add your developer reputation to your wallet
      </Text>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleGitHubConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text style={styles.buttonIcon}>🐙</Text>
            <Text style={styles.buttonText}>Connect GitHub</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.benefits}>
        <Text style={styles.benefitItem}>✓ Instant verification</Text>
        <Text style={styles.benefitItem}>✓ Followers & repo stats</Text>
        <Text style={styles.benefitItem}>✓ Account age proof</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  description: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  benefits: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  benefitItem: {
    fontSize: 12,
    color: '#4a5568',
  },
});
