/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { bikeService } from '@/services/bikeService';
import type { Bike } from '@/services/bikeService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { Camera, Hash, ScanLine, Type, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface MobileQRScannerProps {
  onBikeFound: (bike: Bike) => void;
  onBack: () => void;
}

export function MobileQRScanner({ onBikeFound, onBack }: MobileQRScannerProps) {
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  const [isSearching, setIsSearching] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    haptics.light();
    
    // TODO: Integrate with camera QR scanner
    setTimeout(() => {
      setIsScanning(false);
      toast.info(
        language === 'fr' 
          ? 'Scanner QR non implémenté. Utilisez la saisie manuelle.' 
          : 'QR scanner not implemented. Use manual input.'
      );
    }, 2000);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      toast.error(t('qr.enterCode'));
      return;
    }

    try {
      setIsSearching(true);
      const bike = await bikeService.getBikeByCode(manualCode.trim());
      
      if (bike.status === 'AVAILABLE') {
        haptics.success();
        toast.success(t('qr.bikeFound'));
        onBikeFound(bike);
      } else {
        haptics.error();
        toast.error(t('qr.bikeUnavailable'));
      }
    } catch (error) {
      haptics.error();
      toast.error(t('qr.invalidCode'));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <MobileHeader title={t('qr.title')} showBack onBack={onBack} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContentPadded, { gap: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList style={{ marginBottom: 24 }}>
            <TabsTrigger value="scan" style={styles.row}>
              <Camera size={18} color={colors.text} />
              <Text style={styles.ml8}>
                {t('qr.scan')}
              </Text>
            </TabsTrigger>
            <TabsTrigger value="manual" style={styles.row}>
              <Type size={18} color={colors.text} />
              <Text style={styles.ml8}>
                {t('qr.manual')}
              </Text>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" style={{ gap: 24 }}>
            <View 
              style={[
                { 
                  aspectRatio: 1, 
                  backgroundColor: '#111827',
                  padding: 24
                },
                styles.alignCenter,
                styles.justifyCenter,
                styles.rounded12
              ]}
            >
              {!isScanning ? (
                <View style={[styles.alignCenter, { gap: 16, padding: 32 }]}>
                  <Camera size={64} color="#9ca3af" />
                  <Text 
                    color="#9ca3af" 
                    style={[styles.textCenter, { lineHeight: 20 }]}
                    size="md"
                  >
                    {t('qr.tapToScan')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.alignCenter, styles.justifyCenter, { gap: 24 }]}>
                  <View 
                    style={[
                      { width: 256, height: 256, padding: 16 },
                      { borderWidth: 2, borderColor: '#10b981', borderRadius: 12 },
                      styles.alignCenter,
                      styles.justifyCenter
                    ]}
                  >
                    <ScanLine size={48} color="#10b981" />
                  </View>
                  <Text color="white" size="md" style={styles.textCenter}>
                    {t('qr.instructions')}
                  </Text>
                </View>
              )}
            </View>

            <Button
              onPress={handleScan}
              disabled={isScanning}
              variant="primary"
              fullWidth
              style={{ height: 56 }}
            >
              {isScanning ? (
                <View style={[styles.row, styles.gap4, styles.alignCenter, styles.justifyCenter]}>
                  <ScanLine size={20} color="white" />
                  <Text style={styles.ml8} color="white" size="lg">
                    {t('qr.scanning')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.row, styles.gap4, styles.alignCenter, styles.justifyCenter]}>
                  <Camera size={20} color="white" />
                  <Text style={styles.ml8} color="white" size="lg">
                    {t('qr.startScanning')}
                  </Text>
                </View>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="manual" style={{ gap: 24 }}>
            <View style={[styles.card, { padding: 24 }]}>
              <View style={{ gap: 24 }}>
                <View style={{ gap: 12 }}>
                  <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.textCenter}>
                    {t('qr.bikeCode')}
                  </Text>
                  <Input
                    value={manualCode}
                    onChangeText={setManualCode}
                    placeholder="BIKE001"
                    style={{ 
                      height: 56, 
                      fontSize: 18, 
                      textAlign: 'center', 
                      letterSpacing: 2 
                    }}
                  />
                </View>

                <Button
                  onPress={handleManualSubmit}
                  disabled={isSearching || !manualCode.trim()}
                  variant="primary"
                  fullWidth
                  style={{ height: 56 }}
                >
                  <View style={[styles.row, styles.gap4, styles.alignCenter, styles.justifyCenter]}>
                    <Zap size={20} color="white" />
                    <Text style={styles.ml8} color="white" size="lg">
                      {isSearching ? t('common.loading') : t('common.confirm')}
                    </Text>
                  </View>
                </Button>
              </View>
            </View>

            <View style={[styles.card, { padding: 20, backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151' }]}>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={{ marginBottom: 16, textAlign: 'center' }}>
                {t('qr.howToFind')}
              </Text>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <Hash size={18} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                  <Text size="md" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={{ flex: 1 }}>
                    {t('qr.findSticker')}
                  </Text>
                </View>
              </View>
            </View>
          </TabsContent>
        </Tabs>
      </ScrollView>
    </View>
  );
}