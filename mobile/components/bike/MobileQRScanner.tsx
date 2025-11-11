// components/mobile/MobileQRScanner.tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { Camera, Hash, Info, MapPin, ScanLine, Sticker, Target, Type, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '../lib/mobile-i18n';
import { mockBikes } from '../lib/mobile-mock-data';
import type { Bike } from '../lib/mobile-types';
import { MobileHeader } from './MobileHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';

interface MobileQRScannerProps {
  onBikeFound: (bike: Bike) => void;
  onBack: () => void;
}

export function MobileQRScanner({ onBikeFound, onBack }: MobileQRScannerProps) {
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');

  const handleScan = () => {
    setIsScanning(true);
    haptics.light();
    
    // TODO: Integrate with html5-qrcode library
    // For now, simulate scan after delay
    setTimeout(() => {
      const randomBike = mockBikes.find((b) => b.status === 'available');
      if (randomBike) {
        haptics.success();
        toast.success(
          language === 'fr' ? 'QR Code scanné !' : 'QR Code scanned!'
        );
        onBikeFound(randomBike);
      }
      setIsScanning(false);
    }, 2000);
  };

  const handleManualSubmit = () => {
    // Find bike by QR code
    const bike = mockBikes.find(
      (b) => b.qrCode.toLowerCase() === manualCode.toLowerCase()
    );

    if (bike) {
      if (bike.status === 'available') {
        haptics.success();
        toast.success(
          language === 'fr' ? 'Vélo trouvé !' : 'Bike found!'
        );
        onBikeFound(bike);
      } else {
        haptics.error();
        toast.error(
          language === 'fr'
            ? 'Ce vélo n\'est pas disponible'
            : 'This bike is not available'
        );
      }
    } else {
      haptics.error();
      toast.error(
        language === 'fr' ? 'Code invalide' : 'Invalid code'
      );
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
          <TabsList className="grid w-full grid-cols-2" style={{ marginBottom: 24 }}>
            <TabsTrigger value="scan" style={styles.row}>
              <Camera size={16} color="currentColor" />
              <Text style={styles.ml8}>
                {language === 'fr' ? 'Scanner' : 'Scan'}
              </Text>
            </TabsTrigger>
            <TabsTrigger value="manual" style={styles.row}>
              <Type size={16} color="currentColor" />
              <Text style={styles.ml8}>
                {language === 'fr' ? 'Manuel' : 'Manual'}
              </Text>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan" style={{ gap: 24 }}>
            {/* QR Scanner */}
            <Card style={[styles.relative, { overflow: 'hidden' }]}>
              <View 
                style={[
                  { 
                    aspectRatio: 1, 
                    backgroundColor: '#111827',
                    padding: 24
                  },
                  styles.alignCenter,
                  styles.justifyCenter
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
                      {language === 'fr'
                        ? 'Appuyez sur le bouton pour scanner'
                        : 'Press the button to scan'}
                    </Text>
                  </View>
                ) : (
                  <View style={[
                    styles.relative, 
                    styles.wT100, 
                    styles.hT100, 
                    styles.alignCenter, 
                    styles.justifyCenter,
                    { gap: 24 }
                  ]}>
                    {/* Scanning animation */}
                    <View 
                      style={[
                        { 
                          width: 256, 
                          height: 256,
                          padding: 16
                        },
                        { 
                          borderWidth: 2, 
                          borderColor: '#10b981',
                          borderRadius: 12
                        },
                        styles.relative,
                        styles.alignCenter,
                        styles.justifyCenter
                      ]}
                    >
                      <View 
                        style={[
                          styles.absolute,
                          { 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            height: 4 
                          },
                          { backgroundColor: '#10b981' }
                        ]}
                      />
                      <ScanLine size={48} color="#10b981" />
                    </View>
                    <View style={styles.alignCenter}>
                      <Text color="white" size="md" style={styles.textCenter}>
                        {t('qr.instructions')}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Card>

            <View style={{ gap: 16 }}>
              <Button
                onPress={handleScan}
                disabled={isScanning}
                variant="primary"
                fullWidth
                style={{ 
                  height: 56,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {isScanning ? (
                  <>
                    <ScanLine size={20} color="white" />
                    <Text color="white" size="lg">
                      {language === 'fr' ? 'Scan en cours...' : 'Scanning...'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Camera size={20} color="white" />
                    <Text color="white" size="lg">
                      {language === 'fr' ? 'Commencer le scan' : 'Start Scanning'}
                    </Text>
                  </>
                )}
              </Button>

              {/* Info */}
              <Card style={[
                { 
                  padding: 16,
                  backgroundColor: colorScheme === 'light' ? '#eff6ff' : '#1e3a8a', 
                  borderColor: '#3b82f6',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12
                }
              ]}>
                <Info size={20} color="#1e40af" />
                <Text size="sm" color="#1e40af" style={{ flex: 1, lineHeight: 20 }}>
                  {language === 'fr'
                    ? 'Pointez votre caméra vers le QR code sur le guidon du vélo'
                    : 'Point your camera at the QR code on the bike handlebar'}
                </Text>
              </Card>
            </View>
          </TabsContent>

          <TabsContent value="manual" style={{ gap: 24 }}>
            {/* Manual Input */}
            <Card style={{ padding: 24 }}>
              <View style={{ gap: 24 }}>
                <View style={{ gap: 12 }}>
                  <Label style={{ textAlign: 'center' }}>{t('qr.bikeCode')}</Label>
                  <Input
                    value={manualCode}
                    onChangeText={(text) => setManualCode(text.toUpperCase())}
                    placeholder="FB-BIKE-001"
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
                  variant="primary"
                  fullWidth
                  style={{ 
                    height: 56,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Zap size={20} color="white" />
                  <Text color="white" size="lg">
                    {t('common.confirm')}
                  </Text>
                </Button>
              </View>
            </Card>

            {/* Instructions */}
            <Card style={[
              { 
                padding: 20,
                backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151' 
              }
            ]}>
              <Text 
                variant="body" 
                color={colorScheme === 'light' ? '#111827' : '#f9fafb'} 
                style={{ marginBottom: 16, textAlign: 'center' }}
                size="lg"
              >
                {language === 'fr'
                  ? 'Comment trouver le code ?'
                  : 'How to find the code?'}
              </Text>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <MapPin size={18} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                  <Text size="md" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={{ flex: 1 }}>
                    1. {language === 'fr'
                      ? 'Localisez le vélo sur la carte'
                      : 'Locate the bike on the map'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <Sticker size={18} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                  <Text size="md" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={{ flex: 1 }}>
                    2. {language === 'fr'
                      ? 'Cherchez l\'autocollant avec le code'
                      : 'Look for the sticker with the code'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <Hash size={18} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                  <Text size="md" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={{ flex: 1 }}>
                    3. {language === 'fr'
                      ? 'Entrez le code exactement comme indiqué'
                      : 'Enter the code exactly as shown'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Example Codes for Demo */}
            <Card style={[
              { 
                padding: 20,
                backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#14532d', 
                borderColor: '#16a34a' 
              }
            ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                <Target size={20} color="#16a34a" />
                <Text size="md" color="#16a34a" style={{ textAlign: 'center' }}>
                  {language === 'fr' ? 'Codes de démo' : 'Demo codes'}
                </Text>
              </View>
              <View style={[
                { 
                  flexDirection: 'row', 
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }, 
                { gap: 12 }
              ]}>
                {mockBikes
                  .filter((b) => b.status === 'available')
                  .slice(0, 3)
                  .map((bike) => (
                    <TouchableOpacity
                      key={bike.id}
                      onPress={() => {
                        haptics.selection();
                        setManualCode(bike.qrCode);
                      }}
                      style={[
                        {
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: 'white', 
                          borderWidth: 1, 
                          borderColor: '#16a34a',
                          minWidth: 120
                        }
                      ]}
                    >
                      <Text size="sm" color="#16a34a" style={styles.textCenter}>
                        {bike.qrCode}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollView>
    </View>
  );
}