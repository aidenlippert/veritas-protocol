import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { StoredCredential } from '../services/CredentialService';

interface PresentCredentialScreenProps {
  credential: StoredCredential;
  onBack: () => void;
}

export default function PresentCredentialScreen({
  credential,
  onBack,
}: PresentCredentialScreenProps) {
  const { vc } = credential;
  const credentialSubject = vc.credentialSubject as any;

  // Serialize the full VC for QR code
  const vcString = JSON.stringify(vc);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Present Credential</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Security Notice</Text>
            <Text style={styles.warningText}>
              Only show this QR code to trusted verifiers. This credential contains your personal information.
            </Text>
          </View>
        </View>

        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={vcString}
              size={280}
              backgroundColor="white"
              color="black"
            />
          </View>
          <Text style={styles.qrLabel}>Scan this QR code to verify</Text>
        </View>

        <View style={styles.credentialInfo}>
          <Text style={styles.infoTitle}>Credential Details</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{credentialSubject.role}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Employer</Text>
            <Text style={styles.infoValue}>{credentialSubject.employer}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Date</Text>
            <Text style={styles.infoValue}>
              {new Date(credentialSubject.startDate).toLocaleDateString()}
            </Text>
          </View>

          {credentialSubject.endDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>End Date</Text>
              <Text style={styles.infoValue}>
                {new Date(credentialSubject.endDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Issuer</Text>
            <Text style={[styles.infoValue, styles.monospace]}>
              {vc.issuer.slice(0, 30)}...
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Issued</Text>
            <Text style={styles.infoValue}>
              {new Date(vc.issuanceDate).toLocaleDateString()}
            </Text>
          </View>

          {vc.expirationDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expires</Text>
              <Text style={styles.infoValue}>
                {new Date(vc.expirationDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  warningCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  qrContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  qrLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  credentialInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
});
