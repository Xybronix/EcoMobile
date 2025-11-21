import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { bikeService } from '@/services/bikeService';
import type { Bike } from '@/services/bikeService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { Battery, Calendar, MapPin, Navigation2, Unlock, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { MobileHeader } from '@/components/layout/MobileHeader';

interface MobileBikeDetailsProps {
  bike: Bike;
  onBack: () => void;
  onStartRide: (bike: Bike) => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function MobileBikeDetails({ bike: initialBike, onBack, onStartRide, onNavigate }: MobileBikeDetailsProps) {
  const { t, language } = useMobileI18n();
  const { user } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showReserveDialog, setShowReserveDialog] = useState(false);
  const [bike, setBike] = useState<Bike>(initialBike);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBikeDetails();
  }, [initialBike.id]);

  const loadBikeDetails = async () => {
    try {
      setIsLoading(true);
      const detailedBike = await bikeService.getBikeById(initialBike.id);
      setBike(detailedBike);
    } catch (error) {
      console.error('Error loading bike details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = () => {
    const hourlyRate = bike.currentPricing?.hourlyRate || 200;
    const requiredBalance = hourlyRate * 0.5; // 30 minutes minimum

    if (!user || user.wallet.balance < requiredBalance) {
      haptics.error();
      toast.error(
        language === 'fr'
          ? 'Solde insuffisant. Veuillez recharger votre compte.'
          : 'Insufficient balance. Please top up your account.'
      );
      return;
    }

    haptics.light();
    if (onNavigate) {
      onNavigate('bike-inspection', {
        bikeId: bike.id,
        bikeName: bike.code,
        bikeEquipment: bike.equipment,
        inspectionType: 'pickup'
      });
    } else {
      setShowUnlockDialog(true);
    }
  };

  const confirmUnlock = async () => {
    try {
      await bikeService.unlockBike(bike.id);
      haptics.success();
      toast.success(t('bike.unlockSuccess'));
      setShowUnlockDialog(false);
      onStartRide(bike);
    } catch (error) {
      haptics.error();
      toast.error(t('common.error'));
    }
  };

  const getDirections = () => {
    haptics.light();
    if (bike.latitude && bike.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${bike.latitude},${bike.longitude}`;
      Linking.openURL(url);
    }
  };

  const currentPricing = bike.currentPricing;
  const hasPromotions = currentPricing?.appliedPromotions && currentPricing.appliedPromotions.length > 0;

  return (
    <View style={styles.container}>
      <MobileHeader title={t('bike.details')} showBack onBack={onBack} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentPadded}
        showsVerticalScrollIndicator={false}
      >
        {/* Bike Image */}
        <View style={[styles.relative, styles.wT100, { height: 256 }, { backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#14532d' }, styles.rounded12, styles.mb24]}>
          <View style={[styles.absolute, { top: 0, left: 0, right: 0, bottom: 0 }, styles.alignCenter, styles.justifyCenter]}>
            <Zap size={96} color="#16a34a" />
          </View>
          <View style={[styles.absolute, { top: 16, right: 16 }]}>
            <Badge
              variant={bike.batteryLevel > 50 ? 'default' : 'secondary'}
              style={{ backgroundColor: bike.batteryLevel > 50 ? '#16a34a' : '#f59e0b' }}
            >
              <Battery size={16} color="white" />
              <Text style={styles.ml4} color="white">
                {bike.batteryLevel}%
              </Text>
            </Badge>
          </View>
          {bike.status !== 'AVAILABLE' && (
            <View style={[styles.absolute, { top: 16, left: 16 }]}>
              <Badge variant="destructive">
                {t('bike.unavailable')}
              </Badge>
            </View>
          )}
        </View>

        <View style={styles.gap24}>
          {/* Bike Info */}
          <View>
            <Text variant="title" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb4}>
              {bike.code}
            </Text>
            <Text variant="body" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
              {bike.model}
            </Text>
          </View>

          {/* Pricing */}
          {currentPricing && (
            <Card style={[styles.p16, { backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#14532d', borderColor: '#16a34a' }]}>
              <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                <View>
                  <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                    {t('bike.price')}
                  </Text>
                  <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                    <Text size="2xl" color="#16a34a" weight="bold">
                      {currentPricing.hourlyRate} XOF
                    </Text>
                    <Text size="sm" color="#16a34a">
                      /h
                    </Text>
                  </View>
                  {hasPromotions && (
                    <View style={[styles.row, styles.alignCenter, styles.gap4, styles.mt4]}>
                      <Text size="xs" color="#6b7280" style={{ textDecorationLine: 'line-through' }}>
                        {currentPricing.originalHourlyRate} XOF/h
                      </Text>
                      <Badge variant="default" size="sm">
                        <Text color="white" size="xs">
                          {currentPricing.appliedPromotions![0].name}
                        </Text>
                      </Badge>
                    </View>
                  )}
                </View>
                <Zap size={32} color="#16a34a" />
              </View>
            </Card>
          )}

          {/* Stats */}
          <View style={[styles.row, styles.gap16]}>
            <View style={styles.flex1}>
              <Card style={[styles.p16, styles.alignCenter]}>
                <Battery size={24} color="#16a34a" style={styles.mb8} />
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mb4, styles.textCenter]}>
                  {t('bike.battery')}
                </Text>
                <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.textCenter}>
                  {bike.batteryLevel}%
                </Text>
              </Card>
            </View>
            <View style={styles.flex1}>
              <Card style={[styles.p16, styles.alignCenter]}>
                <Zap size={24} color="#3b82f6" style={styles.mb8} />
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mb4, styles.textCenter]}>
                  {t('bike.range')}
                </Text>
                <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.textCenter}>
                  {Math.round((bike.batteryLevel / 100) * 50)} km
                </Text>
              </Card>
            </View>
          </View>

          {/* Location */}
          {(bike.latitude && bike.longitude) && (
            <Card style={styles.p16}>
              <View style={[styles.row, styles.gap12]}>
                <MapPin size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={{ marginTop: 2 }} />
                <View style={styles.flex1}>
                  <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb4}>
                    {t('bike.location')}
                  </Text>
                  <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                    {bike.locationName || `${bike.latitude}, ${bike.longitude}`}
                  </Text>
                  <TouchableOpacity
                    onPress={getDirections}
                    style={[styles.row, styles.alignCenter, styles.gap4, styles.mt8]}
                  >
                    <Navigation2 size={16} color="#16a34a" />
                    <Text size="sm" color="#16a34a">
                      {t('bike.getDirections')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}

          {/* Equipment */}
          {bike.equipment && bike.equipment.length > 0 && (
            <View>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb12}>
                {t('bike.features')}
              </Text>
              <View style={[styles.row, { flexWrap: 'wrap' }, styles.gap8]}>
                {bike.equipment.map((feature) => (
                  <Badge key={feature} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {bike.status === 'AVAILABLE' ? (
            <View style={styles.gap12}>
              <Button
                onPress={handleUnlock}
                variant="primary"
                fullWidth
                style={{ height: 56 }}
              >
                <Unlock size={20} color="white" />
                <Text style={styles.ml8} color="white" size="lg">
                  {t('map.unlock')}
                </Text>
              </Button>

              <Button
                onPress={() => {
                  haptics.light();
                  onNavigate?.('bike-reservation', bike);
                }}
                variant="outline"
                fullWidth
                style={{ height: 56 }}
              >
                <Calendar size={20} color="#16a34a" />
                <Text style={styles.ml8} color="#16a34a" size="lg">
                  Réserver ce vélo
                </Text>
              </Button>
            </View>
          ) : (
            <Card style={[styles.p16, styles.alignCenter, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151' }]}>
              <Text variant="body" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
                {t('bike.unavailable')}
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Unlock Confirmation Dialog */}
      <AlertDialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('bike.unlockConfirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {`${t('bike.unlockConfirm.description')} ${bike.code, currentPricing?.hourlyRate || 200}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setShowUnlockDialog(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={confirmUnlock}
              style={{ backgroundColor: '#16a34a' }}
            >
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}