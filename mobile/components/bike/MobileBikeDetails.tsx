/* eslint-disable @typescript-eslint/no-unused-vars */
// components/mobile/MobileBikeDetails.tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { Battery, Lock, MapPin, Navigation2, Star, Unlock, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Linking, ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileAuth } from '../../lib/mobile-auth';
import { useMobileI18n } from '../../lib/mobile-i18n';
import type { Bike } from '../../lib/mobile-types';
import { MobileHeader } from '../layout/MobileHeader';

interface MobileBikeDetailsProps {
  bike: Bike;
  onBack: () => void;
  onStartRide: (bike: Bike) => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function MobileBikeDetails({ bike, onBack, onStartRide, onNavigate }: MobileBikeDetailsProps) {
  const { t, language } = useMobileI18n();
  const { user, updateWalletBalance } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showReserveDialog, setShowReserveDialog] = useState(false);

  const handleUnlock = () => {
    if (!user || user.wallet.balance < bike.pricePerMinute * 30) {
      haptics.error();
      toast.error(
        language === 'fr'
          ? 'Solde insuffisant. Veuillez recharger votre compte.'
          : 'Insufficient balance. Please top up your account.'
      );
      return;
    }

    haptics.light();
    // Navigate to inspection screen before unlocking
    if (onNavigate) {
      onNavigate('bike-inspection', {
        bikeId: bike.id,
        bikeName: bike.name,
        inspectionType: 'pickup'
      });
    } else {
      setShowUnlockDialog(true);
    }
  };

  const confirmUnlock = () => {
    haptics.success();
    toast.success(
      language === 'fr'
        ? 'Vélo déverrouillé avec succès !'
        : 'Bike unlocked successfully!'
    );
    setShowUnlockDialog(false);
    onStartRide(bike);
  };

  const handleReserve = () => {
    haptics.light();
    setShowReserveDialog(true);
  };

  const confirmReserve = () => {
    haptics.success();
    toast.success(
      language === 'fr'
        ? 'Vélo réservé pour 15 minutes'
        : 'Bike reserved for 15 minutes'
    );
    setShowReserveDialog(false);
    onBack();
  };

  const getDirections = () => {
    haptics.light();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${bike.location.lat},${bike.location.lng}`;
    Linking.openURL(url);
  };

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
              variant={bike.battery > 50 ? 'default' : 'secondary'}
              style={{ backgroundColor: bike.battery > 50 ? '#16a34a' : '#f59e0b' }}
            >
              <Battery size={16} color="white" />
              <Text style={styles.ml4} color="white">
                {bike.battery}%
              </Text>
            </Badge>
          </View>
          {bike.status !== 'available' && (
            <View style={[styles.absolute, { top: 16, left: 16 }]}>
              <Badge variant="destructive">
                {language === 'fr' ? 'Non disponible' : 'Unavailable'}
              </Badge>
            </View>
          )}
        </View>

        <View style={styles.gap24}>
          {/* Bike Info */}
          <View>
            <Text variant="title" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb4}>
              {bike.name}
            </Text>
            <Text variant="body" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
              {bike.model}
            </Text>
            <View style={[styles.row, styles.alignCenter, styles.gap4, styles.mt8]}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  color={i < 4 ? '#fbbf24' : '#d1d5db'}
                  fill={i < 4 ? '#fbbf24' : 'transparent'}
                />
              ))}
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.ml8}>
                4.0
              </Text>
            </View>
          </View>

          {/* Pricing */}
          <Card style={[styles.p16, { backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#14532d', borderColor: '#16a34a' }]}>
            <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
              <View>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {t('bike.price')}
                </Text>
                <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                  <Text size="2xl" color="#16a34a" weight="bold">
                    {bike.pricePerMinute} {user?.wallet.currency}
                  </Text>
                  <Text size="sm" color="#16a34a">
                    {t('bike.perMinute')}
                  </Text>
                </View>
              </View>
              <Zap size={32} color="#16a34a" />
            </View>
          </Card>

          {/* Stats */}
          <View style={[styles.row, styles.gap16]}>
            <View style={styles.flex1}>
              <Card style={[styles.p16, styles.alignCenter]}>
                <Battery size={24} color="#16a34a" style={styles.mb8} />
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mb4, styles.textCenter]}>
                  {t('bike.battery')}
                </Text>
                <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.textCenter}>
                  {bike.battery}%
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
                  {Math.round((bike.battery / 100) * 50)} km
                </Text>
              </Card>
            </View>
            <View style={styles.flex1}>
              <Card style={[styles.p16, styles.alignCenter]}>
                <MapPin size={24} color="#7c3aed" style={styles.mb8} />
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mb4, styles.textCenter]}>
                  {t('map.distance')}
                </Text>
                <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.textCenter}>
                  0.8 km
                </Text>
              </Card>
            </View>
          </View>

          {/* Location */}
          <Card style={styles.p16}>
            <View style={[styles.row, styles.gap12]}>
              <MapPin size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={{ marginTop: 2 }} />
              <View style={styles.flex1}>
                <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb4}>
                  {language === 'fr' ? 'Localisation' : 'Location'}
                </Text>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {bike.location.address}
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

          {/* Features */}
          <View>
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb12}>
              {t('bike.features')}
            </Text>
            <View style={[styles.row, { flexWrap: 'wrap' }, styles.gap8]}>
              {bike.features.map((feature) => (
                <Badge key={feature} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          {bike.status === 'available' ? (
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
                onPress={handleReserve}
                variant="secondary"
                fullWidth
                style={{ height: 56 }}
              >
                <Lock size={20} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
                <Text style={styles.ml8} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} size="lg">
                  {t('map.reserve')}
                </Text>
              </Button>
            </View>
          ) : (
            <Card style={[styles.p16, styles.alignCenter, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151' }]}>
              <Text variant="body" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
                {language === 'fr'
                  ? 'Ce vélo n\'est pas disponible pour le moment'
                  : 'This bike is not available at the moment'}
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
              {language === 'fr' ? 'Déverrouiller le vélo ?' : 'Unlock bike?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr'
                ? `Vous allez commencer un trajet avec ${bike.name}. Coût: ${bike.pricePerMinute} XOF/min`
                : `You're about to start a ride with ${bike.name}. Cost: ${bike.pricePerMinute} XOF/min`}
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

      {/* Reserve Confirmation Dialog */}
      <AlertDialog open={showReserveDialog} onOpenChange={setShowReserveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'fr' ? 'Réserver le vélo ?' : 'Reserve bike?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'fr'
                ? `Le vélo ${bike.name} sera réservé pour vous pendant 15 minutes.`
                : `${bike.name} will be reserved for you for 15 minutes.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setShowReserveDialog(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={confirmReserve}
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