import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { CredentialService, type StoredCredential } from '../services/CredentialService';
import CredentialCard from '../components/CredentialCard';
import { Web2BridgeCard } from '../components/Web2BridgeCard';
import type { DID } from '@veritas/types';

interface DashboardScreenProps {
  did: DID;
  onPresentCredential: (credential: StoredCredential) => void;
  onAddCredential: () => void;
}

export default function DashboardScreen({
  did,
  onPresentCredential,
  onAddCredential,
}: DashboardScreenProps) {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const creds = await CredentialService.getAllCredentials();
      setCredentials(creds);
    } catch (error) {
      console.error('Error loading credentials:', error);
      Alert.alert('Error', 'Failed to load credentials');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCredentials();
    setIsRefreshing(false);
  };

  const handleDeleteCredential = (id: string) => {
    Alert.alert(
      'Delete Credential',
      'Are you sure you want to delete this credential?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CredentialService.deleteCredential(id);
              await loadCredentials();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete credential');
            }
          },
        },
      ]
    );
  };

  const shortDID = `${did.id.slice(0, 20)}...${did.id.slice(-8)}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Credentials</Text>
        <View style={styles.didContainer}>
          <Text style={styles.didLabel}>Your DID</Text>
          <Text style={styles.didText}>{shortDID}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <Web2BridgeCard did={did.id} onCredentialAdded={loadCredentials} />

        {credentials.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No credentials yet</Text>
            <Text style={styles.emptySubtext}>
              Receive credentials from employers or educational institutions
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={onAddCredential}>
              <Text style={styles.addButtonText}>Add Test Credential</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {credentials.length} {credentials.length === 1 ? 'Credential' : 'Credentials'}
            </Text>
            {credentials.map((cred) => (
              <CredentialCard
                key={cred.id}
                credential={cred.vc}
                onPress={() => onPresentCredential(cred)}
                onRefresh={async () => {
                  // Trigger GitHub OAuth flow for refresh
                  const isGitHub = cred.vc.type.includes('GitHubReputationCredential');
                  if (isGitHub) {
                    // Open GitHub OAuth - same as Web2BridgeCard
                    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
                    const authUrl = `${apiUrl}/auth/github?did=${encodeURIComponent(did.id)}`;
                    // This would need expo-web-browser integration similar to Web2BridgeCard
                    Alert.alert('Refresh', 'GitHub credential refresh will be triggered');
                  }
                }}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  didContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  didLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  didText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
