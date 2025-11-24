/* eslint-disable react/no-unescaped-entities */
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { bikeService } from '@/services/bikeService';
import type { Bike } from '@/services/bikeService';
import { bikeRequestService } from '@/services/bikeRequestService';
import { walletService } from '@/services/walletService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { Battery, Calendar, MapPin, Navigation2, Unlock, Zap, Shield, AlertTriangle } from 'lucide-react-native';
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
  const [bike, setBike] = useState<Bike>(initialBike);
  const [isLoading, setIsLoading] = useState(false);
  const [depositInfo, setDepositInfo] = useState<any>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [priceInfo, setPriceInfo] = useState<{
    amount: number;
    willBeCharged: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadBikeDetails();
    checkUserEligibility();
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

  const checkUserEligibility = async () => {
    if (!user) return;

    try {
      // Vérifier la caution
      const depositData = await walletService.getDepositInfo();
      setDepositInfo(depositData);

      // Vérifier l'abonnement actif
      const subscription = await walletService.getCurrentSubscription();
      setCurrentSubscription(subscription);

      // Calculer le prix et la logique de facturation
      const hourlyRate = initialBike.currentPricing?.hourlyRate || 200;
      const estimatedCost = hourlyRate * 0.5; // 30 minutes minimum

      if (subscription) {
        setPriceInfo({
          amount: estimatedCost,
          willBeCharged: false,
          message: `Inclus dans votre forfait ${subscription.planName}`
        });
      } else {
        setPriceInfo({
          amount: estimatedCost,
          willBeCharged: true,
          message: `Sera déduit de votre portefeuille`
        });
      }
    } catch (error) {
      console.error('Error checking user eligibility:', error);
    }
  };

  const handleUnlock = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    // Vérifications de sécurité
    if (!depositInfo?.canUseService) {
      haptics.error();
      toast.error(`Caution insuffisante. Minimum requis: ${depositInfo?.requiredDeposit || 20000} FCFA`);
      onNavigate?.('recharge-deposit');
      return;
    }

    if (priceInfo?.willBeCharged && user.wallet.balance < priceInfo.amount) {
      haptics.error();
      toast.error('Solde insuffisant. Veuillez recharger votre compte.');
      onNavigate?.('wallet');
      return;
    }

    try {
      haptics.light();
      
      const unlockRequest = await bikeRequestService.createUnlockRequest(bike.id);
      
      toast.success('Demande de déverrouillage envoyée. Un administrateur va valider votre demande.');
      
      // Naviguer vers l'écran de suivi des demandes
      onNavigate?.('account-management', { activeTab: 'requests' });
      
    } catch (error: any) {
      haptics.error();
      toast.error(error.message || 'Erreur lors de la demande');
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
        {/* Service Eligibility Status */}
        {depositInfo && !depositInfo.canUseService && (
          <Card style={[styles.p16, styles.mb24, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
            <View style={[styles.row, styles.gap12]}>
              <Shield size={20} color="#dc2626" />
              <View style={styles.flex1}>
                <Text size="sm" color="#991b1b" weight="bold">
                  Utilisation des vélos bloquée
                </Text>
                <Text size="sm" color="#991b1b" style={styles.mt4}>
                  Votre caution est insuffisante pour utiliser ce service.
                </Text>
              </View>
            </View>
          </Card>
        )}

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

          {/* Pricing & Subscription Info */}
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
                  
                  {/* Subscription Status */}
                  {priceInfo && (
                    <View style={styles.mt8}>
                      <Text size="xs" color={priceInfo.willBeCharged ? '#f59e0b' : '#16a34a'}>
                        {priceInfo.willBeCharged ? '💳' : '✅'} {priceInfo.message}
                      </Text>
                      {priceInfo.willBeCharged && (
                        <Text size="xs" color="#6b7280" style={styles.mt4}>
                          Estimation 30 min: {priceInfo.amount} XOF
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                <Zap size={32} color="#16a34a" />
              </View>
            </Card>
          )}

          {/* Subscription Info Card */}
          {currentSubscription && (
            <Card style={[styles.p16, { backgroundColor: '#eff6ff', borderColor: '#3b82f6' }]}>
              <View style={[styles.row, styles.gap12]}>
                <Calendar size={20} color="#3b82f6" />
                <View style={styles.flex1}>
                  <Text variant="body" color="#1e40af" weight="bold">
                    Forfait actif: {currentSubscription.planName}
                  </Text>
                  <Text size="sm" color="#1e40af">
                    Type: {currentSubscription.packageType} - Expire le {new Date(currentSubscription.endDate).toLocaleDateString()}
                  </Text>
                  {currentSubscription.bikeCode && (
                    <Text size="sm" color="#3b82f6" style={styles.mt4}>
                      Vélo réservé: {currentSubscription.bikeCode}
                    </Text>
                  )}
                </View>
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
              {/* Unlock Button with conditional styling */}
              <Button
                onPress={handleUnlock}
                variant="primary"
                fullWidth
                style={{ 
                  height: 56,
                  backgroundColor: depositInfo?.canUseService ? '#16a34a' : '#9ca3af',
                  opacity: depositInfo?.canUseService ? 1 : 0.6
                }}
                disabled={!depositInfo?.canUseService}
              >
                <Unlock size={20} color="white" />
                <Text style={styles.ml8} color="white" size="lg">
                  {depositInfo?.canUseService ? t('map.unlock') : 'Caution insuffisante'}
                </Text>
              </Button>

              {/* Reserve Button */}
              <Button
                onPress={() => {
                  if (!depositInfo?.canUseService) {
                    toast.error('Caution insuffisante pour effectuer une réservation');
                    return;
                  }
                  haptics.light();
                  onNavigate?.('bike-reservation', bike);
                }}
                variant="outline"
                fullWidth
                style={{ 
                  height: 56,
                  opacity: depositInfo?.canUseService ? 1 : 0.6
                }}
                disabled={!depositInfo?.canUseService}
              >
                <Calendar size={20} color={depositInfo?.canUseService ? "#16a34a" : "#9ca3af"} />
                <Text style={styles.ml8} color={depositInfo?.canUseService ? "#16a34a" : "#9ca3af"} size="lg">
                  {depositInfo?.canUseService ? 'Réserver ce vélo' : 'Réservation bloquée'}
                </Text>
              </Button>

              {/* Warning for blocked actions */}
              {!depositInfo?.canUseService && (
                <Card style={[styles.p12, { backgroundColor: '#fef3c7' }]}>
                  <View style={[styles.row, styles.gap8]}>
                    <AlertTriangle size={16} color="#f59e0b" />
                    <Text size="xs" color="#92400e">
                      Pour débloquer l'accès, rechargez votre caution à {depositInfo?.requiredDeposit || 20000} XOF minimum.
                    </Text>
                  </View>
                </Card>
              )}
            </View>
          ) : (
            <Card style={[styles.p16, styles.alignCenter, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#374151' }]}>
              <Text variant="body" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
                {bike.status === 'MAINTENANCE' ? '🔧 ' : ''}
                {t('bike.unavailable')}
              </Text>
              {bike.status === 'MAINTENANCE' && (
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.textCenter, styles.mt4]}>
                  Ce vélo est actuellement en maintenance pour votre sécurité
                </Text>
              )}
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}