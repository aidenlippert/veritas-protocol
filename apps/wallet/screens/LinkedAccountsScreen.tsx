import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { IdentityService, LinkedAccount } from '../services/IdentityService';

interface LinkedAccountsScreenProps {
  onLinkNewAccount: () => void;
}

export default function LinkedAccountsScreen({ onLinkNewAccount }: LinkedAccountsScreenProps) {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLinkedAccounts();
  }, []);

  const loadLinkedAccounts = async () => {
    setIsLoading(true);
    try {
      const accounts = await IdentityService.getLinkedAccounts();
      setLinkedAccounts(accounts);
    } catch (error) {
      console.error('Failed to load linked accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChainIcon = (chain: string): string => {
    switch (chain) {
      case 'evm':
        return '⟠'; // Ethereum diamond
      case 'solana':
        return '◎'; // Solana symbol
      case 'bitcoin':
        return '₿'; // Bitcoin symbol
      default:
        return '🔗';
    }
  };

  const getChainName = (chain: string): string => {
    switch (chain) {
      case 'evm':
        return 'Ethereum (EVM)';
      case 'solana':
        return 'Solana';
      case 'bitcoin':
        return 'Bitcoin';
      default:
        return 'Unknown Chain';
    }
  };

  const formatAddress = (address: string): string => {
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderLinkedAccount = ({ item }: { item: LinkedAccount }) => (
    <View style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <Text style={styles.chainIcon}>{getChainIcon(item.chain)}</Text>
        <View style={styles.accountInfo}>
          <Text style={styles.chainName}>{getChainName(item.chain)}</Text>
          <Text style={styles.address}>{formatAddress(item.address)}</Text>
        </View>
      </View>
      <View style={styles.accountFooter}>
        <Text style={styles.linkedDate}>
          Linked {new Date(item.linkedAt).toLocaleDateString()}
        </Text>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verified</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔗</Text>
      <Text style={styles.emptyTitle}>No Linked Accounts</Text>
      <Text style={styles.emptyText}>
        Link your wallets from Ethereum, Solana, and Bitcoin to prove ownership across all chains.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Linked Accounts</Text>
        <Text style={styles.subtitle}>
          Prove ownership of your wallets across multiple blockchains
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={linkedAccounts}
          renderItem={renderLinkedAccount}
          keyExtractor={(item) => `${item.chain}-${item.address}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.linkButton} onPress={onLinkNewAccount}>
          <Text style={styles.linkButtonText}>+ Link New Account</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Linking is done peer-to-peer using QR codes. No server sees your signatures.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  accountCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chainIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  chainName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  accountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkedDate: {
    fontSize: 12,
    color: '#999',
  },
  verifiedBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#155724',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  linkButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#004085',
    lineHeight: 18,
  },
});
