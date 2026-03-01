import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { ArrowLeft, CheckCircle, Download, RefreshCw, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';

interface MobileAppInfoProps {
  onBack: () => void;
}

type CheckStatus = 'idle' | 'checking' | 'available' | 'up-to-date' | 'downloading' | 'error';

export default function MobileAppInfo({ onBack }: MobileAppInfoProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const { t } = useMobileI18n();
  const [checkStatus, setCheckStatus] = useState<CheckStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const updateId = Updates.updateId;
  const channel = Updates.channel;
  const isUpdateEnabled = Updates.isEnabled;
  const createdAt = Updates.createdAt;

  const handleCheckUpdate = async () => {
    if (!isUpdateEnabled) {
      toast.info(t('appInfo.devModeNotice'));
      return;
    }
    haptics.light();
    setCheckStatus('checking');
    setErrorMessage('');
    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        setCheckStatus('available');
      } else {
        setCheckStatus('up-to-date');
      }
    } catch {
      setCheckStatus('error');
      setErrorMessage(t('appInfo.checkError'));
    }
  };

  const handleApplyUpdate = async () => {
    haptics.medium();
    setCheckStatus('downloading');
    setErrorMessage('');
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch {
      setCheckStatus('error');
      setErrorMessage(t('appInfo.downloadError'));
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return t('appInfo.unknown');
    return date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const cardBg = isDark ? '#1f2937' : '#ffffff';
  const separatorColor = isDark ? '#374151' : '#e5e7eb';
  const tagBg = isDark ? '#374151' : '#f3f4f6';

  const infoRow = (label: string, value: string) => (
    <View
      style={[
        styles.row,
        styles.justifyBetween,
        styles.alignCenter,
        styles.py12,
        { borderBottomWidth: 1, borderBottomColor: separatorColor },
      ]}
    >
      <Text size="sm" color={mutedColor}>{label}</Text>
      <Text size="sm" color={textColor} style={{ fontWeight: '600', maxWidth: '60%', textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#111827' : '#f9fafb' }]}>
      {/* Header */}
      <View
        style={[
          styles.row,
          styles.alignCenter,
          styles.gap12,
          styles.px16,
          styles.py16,
          { backgroundColor: cardBg, borderBottomWidth: 1, borderBottomColor: separatorColor },
        ]}
      >
        <TouchableOpacity onPress={() => { haptics.light(); onBack(); }} style={styles.p4}>
          <ArrowLeft size={22} color={textColor} />
        </TouchableOpacity>
        <Text variant="title" color={textColor} size="lg">
          {t('appInfo.about')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.p16, styles.pb32]}
        showsVerticalScrollIndicator={false}
      >
        {/* App identity */}
        <View style={[{ backgroundColor: cardBg, borderRadius: 12, padding: 20, marginBottom: 16 }]}>
          <View style={[styles.alignCenter, styles.mb16]}>
            <View
              style={[
                styles.w48,
                styles.h48,
                styles.roundedFull,
                styles.alignCenter,
                styles.justifyCenter,
                styles.mb12,
                { backgroundColor: '#16a34a' },
              ]}
            >
              <Text color="white" style={{ fontSize: 22, fontWeight: '700' }}>FB</Text>
            </View>
            <Text variant="title" color={textColor} size="xl" style={{ marginBottom: 4 }}>FreeBike</Text>
            <Text size="sm" color={mutedColor}>
              {t('appInfo.appVersion')} {appVersion}
            </Text>
          </View>

          {infoRow(t('appInfo.appVersion'), appVersion)}
          {infoRow(
            t('appInfo.updateChannel'),
            channel ?? t('appInfo.notConfigured')
          )}
          {infoRow(
            t('appInfo.activeUpdateId'),
            updateId ? updateId.substring(0, 16) + '…' : t('appInfo.nativeBuild')
          )}
          {infoRow(
            t('appInfo.installedOn'),
            formatDate(createdAt)
          )}
          <View style={[styles.row, styles.justifyBetween, styles.alignCenter, styles.py12]}>
            <Text size="sm" color={mutedColor}>{t('appInfo.otaUpdates')}</Text>
            <View
              style={[
                styles.px8,
                styles.py4,
                { borderRadius: 999, backgroundColor: isUpdateEnabled ? '#dcfce7' : tagBg },
              ]}
            >
              <Text size="xs" color={isUpdateEnabled ? '#166534' : mutedColor} style={{ fontWeight: '600' }}>
                {isUpdateEnabled ? t('appInfo.enabled') : t('appInfo.devMode')}
              </Text>
            </View>
          </View>
        </View>

        {/* Update check section */}
        <View style={[{ backgroundColor: cardBg, borderRadius: 12, padding: 20, marginBottom: 16 }]}>
          <Text
            variant="title"
            color={textColor}
            size="base"
            style={{ marginBottom: 12, fontWeight: '700' }}
          >
            {t('appInfo.updates')}
          </Text>

          {checkStatus === 'idle' && (
            <View style={[styles.row, styles.alignCenter, styles.gap8, styles.mb16]}>
              <View style={[styles.w8, styles.h8, { borderRadius: 999, backgroundColor: '#d1d5db' }]} />
              <Text size="sm" color={mutedColor}>{t('appInfo.checkPrompt')}</Text>
            </View>
          )}
          {checkStatus === 'checking' && (
            <View style={[styles.row, styles.alignCenter, styles.gap8, styles.mb16]}>
              <ActivityIndicator size="small" color="#22c55e" />
              <Text size="sm" color={mutedColor}>{t('appInfo.checking')}</Text>
            </View>
          )}
          {checkStatus === 'up-to-date' && (
            <View style={[styles.row, styles.alignCenter, styles.gap8, styles.mb16]}>
              <CheckCircle size={18} color="#22c55e" />
              <Text size="sm" color="#16a34a" style={{ fontWeight: '600' }}>
                {t('appInfo.upToDate')}
              </Text>
            </View>
          )}
          {checkStatus === 'available' && (
            <View style={[styles.mb16]}>
              <View style={[styles.row, styles.alignCenter, styles.gap8, styles.mb8]}>
                <Download size={18} color="#f59e0b" />
                <Text size="sm" color="#d97706" style={{ fontWeight: '600' }}>
                  {t('appInfo.available')}
                </Text>
              </View>
              <Text size="xs" color={mutedColor}>{t('appInfo.availableDesc')}</Text>
            </View>
          )}
          {checkStatus === 'downloading' && (
            <View style={[styles.row, styles.alignCenter, styles.gap8, styles.mb16]}>
              <ActivityIndicator size="small" color="#22c55e" />
              <Text size="sm" color={mutedColor}>{t('appInfo.downloading')}</Text>
            </View>
          )}
          {checkStatus === 'error' && (
            <View style={[styles.row, styles.alignCenter, styles.gap8, styles.mb16]}>
              <XCircle size={18} color="#ef4444" />
              <Text size="sm" color="#ef4444" style={{ flex: 1 }}>{errorMessage}</Text>
            </View>
          )}

          {checkStatus === 'available' ? (
            <TouchableOpacity
              style={[styles.alignCenter, styles.py12, { borderRadius: 10, backgroundColor: '#22c55e' }]}
              onPress={handleApplyUpdate}
            >
              <Text color="white" style={{ fontWeight: '700', fontSize: 14 }}>
                {t('appInfo.installUpdate')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.row,
                styles.alignCenter,
                styles.justifyCenter,
                styles.gap8,
                styles.py12,
                {
                  borderRadius: 10,
                  backgroundColor: checkStatus === 'checking' || checkStatus === 'downloading'
                    ? (isDark ? '#374151' : '#e5e7eb')
                    : '#16a34a',
                },
              ]}
              onPress={handleCheckUpdate}
              disabled={checkStatus === 'checking' || checkStatus === 'downloading'}
            >
              <RefreshCw
                size={16}
                color={checkStatus === 'checking' || checkStatus === 'downloading' ? mutedColor : 'white'}
              />
              <Text
                color={checkStatus === 'checking' || checkStatus === 'downloading' ? mutedColor : 'white'}
                style={{ fontWeight: '700', fontSize: 14 }}
              >
                {t('appInfo.checkUpdates')}
              </Text>
            </TouchableOpacity>
          )}

          {(checkStatus === 'error' || checkStatus === 'up-to-date') && (
            <TouchableOpacity
              style={[styles.alignCenter, styles.py8, styles.mt8]}
              onPress={() => setCheckStatus('idle')}
            >
              <Text size="sm" color={mutedColor}>{t('appInfo.reset')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text size="xs" color={mutedColor} style={{ textAlign: 'center' }}>
          {t('appInfo.copyright', { year: new Date().getFullYear().toString() })}
        </Text>
      </ScrollView>
    </View>
  );
}
