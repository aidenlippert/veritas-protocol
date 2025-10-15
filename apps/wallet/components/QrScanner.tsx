import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface QrScannerProps {
  onScan: (data: string) => void;
  onCancel?: () => void;
}

export default function QrScanner({ onScan, onCancel }: QrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    // Request permission when component mounts if not already granted
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    Vibration.vibrate(100); // Haptic feedback
    onScan(data);
  };

  const handleRescan = () => {
    setScanned(false);
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  // Loading state while checking permissions
  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  // Permission denied state
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorIcon}>📷</Text>
          <Text style={styles.errorTitle}>Camera Access Required</Text>
          <Text style={styles.errorText}>
            Veritas needs camera access to scan QR codes for wallet linking.
          </Text>

          {permission.canAskAgain ? (
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
              <Text style={styles.buttonText}>Grant Camera Access</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.errorSubtext}>
                Camera access was denied. Please enable it in your device settings.
              </Text>
              <TouchableOpacity style={styles.button} onPress={handleOpenSettings}>
                <Text style={styles.buttonText}>Open Settings</Text>
              </TouchableOpacity>
            </>
          )}

          {onCancel && (
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Camera view with scanner
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlaySection} />

          {/* Middle section with scanning frame */}
          <View style={styles.middleSection}>
            <View style={styles.overlaySection} />
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <View style={styles.overlaySection} />
          </View>

          {/* Bottom overlay with instructions */}
          <View style={[styles.overlaySection, styles.bottomSection]}>
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsText}>
                Position the QR code within the frame
              </Text>
              {scanned && (
                <TouchableOpacity style={styles.rescanButton} onPress={handleRescan}>
                  <Text style={styles.rescanButtonText}>Tap to Rescan</Text>
                </TouchableOpacity>
              )}
            </View>

            {onCancel && (
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlaySection: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleSection: {
    flexDirection: 'row',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  bottomSection: {
    justifyContent: 'flex-start',
    paddingTop: 32,
  },
  instructionsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  rescanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#ddd',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
