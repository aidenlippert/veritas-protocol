import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { VerifiableCredential } from '@veritas/types';

interface CredentialCardProps {
  credential: VerifiableCredential<any>;
  onPress: () => void;
  onRefresh?: () => void;
}

export default function CredentialCard({ credential, onPress, onRefresh }: CredentialCardProps) {
  const { credentialSubject } = credential;
  const issuedDate = new Date(credential.issuanceDate).toLocaleDateString();
  const expiresDate = credential.expirationDate
    ? new Date(credential.expirationDate).toLocaleDateString()
    : null;

  // Determine if expired or expiring soon (within 7 days)
  const isExpired = credential.expirationDate
    ? new Date(credential.expirationDate) < new Date()
    : false;

  const isExpiringSoon = credential.expirationDate
    ? new Date(credential.expirationDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
    : false;

  // Determine credential type
  const isGitHubCredential = credential.type.includes('GitHubReputationCredential');
  const icon = isGitHubCredential ? '🐙' : '💼';

  // Get display values
  const title = isGitHubCredential ? credentialSubject.username : credentialSubject.role;
  const subtitle = isGitHubCredential
    ? `${credentialSubject.reputation?.followers || 0} followers`
    : credentialSubject.employer;

  return (
    <TouchableOpacity
      style={[styles.card, isExpired && styles.cardExpired]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.role}>{title}</Text>
          <Text style={styles.employer}>{subtitle}</Text>
        </View>
        {isExpired && (
          <View style={styles.expiredBadge}>
            <Text style={styles.expiredText}>Expired</Text>
          </View>
        )}
        {!isExpired && isExpiringSoon && (
          <View style={[styles.expiredBadge, { backgroundColor: '#fef3c7' }]}>
            <Text style={[styles.expiredText, { color: '#f59e0b' }]}>Soon</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Start Date</Text>
          <Text style={styles.detailValue}>
            {new Date(credentialSubject.startDate).toLocaleDateString()}
          </Text>
        </View>

        {credentialSubject.endDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>End Date</Text>
            <Text style={styles.detailValue}>
              {new Date(credentialSubject.endDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Issued</Text>
          <Text style={styles.detailValue}>{issuedDate}</Text>
        </View>

        {expiresDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expires</Text>
            <Text style={[styles.detailValue, isExpired && styles.expiredValue]}>
              {expiresDate}
            </Text>
          </View>
        )}
      </View>

      {(isExpired || isExpiringSoon) && onRefresh && isGitHubCredential && (
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh Credential</Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Tap to present</Text>
        <Text style={styles.footerArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardExpired: {
    opacity: 0.6,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  role: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  employer: {
    fontSize: 16,
    color: '#666',
  },
  expiredBadge: {
    backgroundColor: '#fee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expiredText: {
    color: '#c00',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  expiredValue: {
    color: '#c00',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  footerArrow: {
    fontSize: 18,
    color: '#007AFF',
  },
  refreshButton: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
