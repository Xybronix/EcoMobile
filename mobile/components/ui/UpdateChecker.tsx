import { useMobileI18n } from '@/lib/mobile-i18n';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type UpdateState = 'checking' | 'idle' | 'available' | 'downloading' | 'error';

/**
 * Vérifie au démarrage si une mise à jour OTA est disponible.
 * Si oui, affiche un écran BLOQUANT (plein écran, non dismissable) qui oblige l'utilisateur
 * à installer la mise à jour avant d'accéder à l'application.
 * Les données (AsyncStorage, SQLite) sont conservées lors d'une mise à jour OTA.
 */
export function UpdateChecker() {
  const { t } = useMobileI18n();
  const [updateState, setUpdateState] = useState<UpdateState>('checking');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // expo-updates est inactif en mode développement
    if (!Updates.isEnabled) {
      setUpdateState('idle');
      return;
    }

    const check = async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          setUpdateState('available');
        } else {
          setUpdateState('idle');
        }
      } catch {
        // Serveur OTA injoignable → ne pas bloquer l'utilisateur
        setUpdateState('idle');
      }
    };

    check();
  }, []);

  const handleUpdate = async () => {
    setUpdateState('downloading');
    setErrorMessage('');
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
      // reloadAsync redémarre le JS bundle — le code suivant n'est jamais atteint
    } catch {
      setUpdateState('error');
      setErrorMessage(t('update.mandatory.error'));
    }
  };

  // Vérification initiale en cours ou pas de MAJ → invisible
  if (updateState === 'checking' || updateState === 'idle') return null;

  // Mise à jour disponible / en cours / erreur → écran bloquant
  return (
    <View style={styles.fullScreenOverlay}>
      <View style={styles.card}>
        {/* Icône */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconArrow}>↑</Text>
        </View>

        <Text style={styles.title}>{t('update.mandatory.title')}</Text>
        <Text style={styles.description}>{t('update.mandatory.description')}</Text>
        <Text style={styles.dataNotice}>{t('update.mandatory.dataNotice')}</Text>

        {/* Erreur */}
        {updateState === 'error' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Téléchargement en cours */}
        {updateState === 'downloading' ? (
          <View style={styles.progressRow}>
            <ActivityIndicator color="#16a34a" size="small" />
            <Text style={styles.progressText}>{t('update.mandatory.downloading')}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} activeOpacity={0.85}>
            <Text style={styles.updateButtonText}>
              {updateState === 'error' ? t('update.mandatory.retry') : t('update.mandatory.button')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0fdf4',
    zIndex: 9999,
    elevation: 999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconArrow: {
    fontSize: 32,
    color: '#16a34a',
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  dataNotice: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
  },
  updateButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
