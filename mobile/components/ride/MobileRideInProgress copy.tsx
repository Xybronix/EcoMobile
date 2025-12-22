/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { AlertTriangle, Clock, DollarSign, MapPin, Pause, Play, StopCircle, Lock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { toast } from 'sonner';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { rideService } from '@/services/rideService';
import { bikeRequestService } from '@/services/bikeRequestService';
import { walletService } from '@/services/walletService';
import type { Bike, Ride } from '@/lib/mobile-types';
import { MobileHeader } from '@/components/layout/MobileHeader';

interface MobileRideInProgressProps {
  bike: Bike;
  onEndRide: () => void;
  onReportIssue: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function MobileRideInProgress({
  bike,
  onEndRide,
  onReportIssue,
  onNavigate,
}: MobileRideInProgressProps) {
  const { t } = useMobileI18n();
  const { user, refreshUser } = useMobileAuth();
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRide, setIsLoadingRide] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [priceInfo, setPriceInfo] = useState<{
    currentCost: number;
    willBeCharged: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadActiveRide();
    loadUserSubscription();
  }, []);

  const loadActiveRide = async () => {
    try {
      setIsLoadingRide(true);
      const activeRide = await rideService.getActiveRide();
      if (activeRide) {
        setCurrentRide(activeRide);
        const startTime = new Date(activeRide.startTime);
        const now = new Date();
        setDuration(Math.floor((now.getTime() - startTime.getTime()) / 1000));
        if (activeRide.distance) {
          setDistance(activeRide.distance);
        }
      }
    } catch (error) {
      console.error('Failed to load active ride:', error);
      toast.error(t('ride.failedToLoad'));
    } finally {
      setIsLoadingRide(false);
    }
  };

  const loadUserSubscription = async () => {
    try {
      const subscription = await walletService.getCurrentSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.log('No active subscription');
    }
  };

  useEffect(() => {
    if (!isPaused && currentRide) {
      const timer = setInterval(() => {
        setDuration((prev) => prev + 1);
        setDistance((prev) => prev + 0.01);
        
        // Recalculer le prix en temps réel
        updatePriceInfo();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused, currentRide, duration, currentSubscription]);

  const updatePriceInfo = () => {
    if (!currentRide) return;

    const hourlyRate = bike.pricingPlan?.hourlyRate || 200;
    const durationHours = duration / 3600;
    let calculatedCost = Math.ceil(durationHours * hourlyRate);

    if (currentSubscription) {
      // Avec abonnement - vérifier si on est en overtime
      const isOvertime = checkIfOvertime(currentRide.startTime, currentSubscription.packageType);
      
      if (isOvertime) {
        // Appliquer la logique d'overtime avec réduction
        const overrideInfo = getOvertimePrice(calculatedCost, currentSubscription);
        setPriceInfo({
          currentCost: overrideInfo.finalCost,
          willBeCharged: overrideInfo.finalCost > 0,
          message: `${t('subscription.overtime')} ${ overrideInfo.reductionPercentage }`
        });
      } else {
        // Dans les heures du forfait - gratuit
        setPriceInfo({
          currentCost: calculatedCost,
          willBeCharged: false,
          message: `${t('subscription.included')} ${ currentSubscription.planName }`
        });
      }
    } else {
      // Sans abonnement - prix normal
      setPriceInfo({
        currentCost: calculatedCost,
        willBeCharged: true,
        message: t('subscription.normalRate')
      });
    }
  };

  const checkIfOvertime = (startTime: string, packageType: string): boolean => {
    const rideStart = new Date(startTime);
    const hour = rideStart.getHours();
    
    switch (packageType.toLowerCase()) {
      case 'daily':
      case 'journalier':
        return hour < 8 || hour >= 19;
      case 'morning':
        return hour < 6 || hour >= 12;
      case 'evening':
        return hour < 19 || hour >= 22;
      default:
        return false;
    }
  };

  const getOvertimePrice = (originalCost: number, subscription: any) => {
    const reductionPercentage = 50;
    const finalCost = Math.round(originalCost * (1 - reductionPercentage / 100));
    
    return {
      finalCost,
      reductionPercentage
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast.success(
      isPaused
        ? t('ride.resumed')
        : t('ride.paused')
    );
  };

  const handleEndRide = async () => {
    if (!currentRide) return;

    try {
      const currentLocation = {
        latitude: bike.latitude || 0,
        longitude: bike.longitude || 0
      };

      await bikeRequestService.createLockRequest(
        bike.id, 
        currentRide.id, 
        currentLocation
      );
      
      toast.success(t('lock.requestSent'));
      
      onNavigate?.('account-management', { activeTab: 'requests' });
      
    } catch (error: any) {
      toast.error(error.message || t('lock.requestError'));
    }
  };

  const handleReportIssue = () => {
    if (onNavigate) {
      onNavigate('create-incident', {
        bikeId: bike.id,
        rideId: currentRide?.id
      });
    } else {
      onReportIssue();
    }
  };

  if (isLoadingRide) {
    return (
      <View style={styles.container}>
        <MobileHeader title={t('ride.inProgress')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>{t('ride.loading')}</Text>
        </View>
      </View>
    );
  }

  if (!currentRide) {
    return (
      <View style={styles.container}>
        <MobileHeader title={t('ride.inProgress')} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{t('ride.noActiveRide')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MobileHeader title={t('ride.inProgress')} />

      <View style={styles.content}>
        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapContent}>
            <MapPin size={64} color="#16a34a" />
            <Text style={styles.mapTitle}>
              {t('ride.inProgressMessage')}
            </Text>
            <Text style={styles.mapSubtitle}>
              {t('ride.gpsActive')}
            </Text>
          </View>

          {/* Pause Overlay */}
          {isPaused && (
            <View style={styles.pauseOverlay}>
              <Pause size={64} color="white" />
              <Text style={styles.pauseText}>
                {t('ride.pausedMessage')}
              </Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.details}>
            {/* Bike Info */}
            <View style={styles.card}>
              <View style={styles.bikeInfo}>
                <View>
                  <Text style={styles.cardLabel}>
                    {t('ride.currentBike')}
                  </Text>
                  <Text style={styles.bikeName}>{bike.code}</Text>
                  <Text style={styles.bikeModel}>{bike.model}</Text>
                </View>
                <View style={styles.batteryInfo}>
                  <Text style={styles.cardLabel}>
                    {t('bike.battery')}
                  </Text>
                  <Text style={styles.batteryLevel}>{bike.batteryLevel}%</Text>
                </View>
              </View>
            </View>

            {/* Subscription Status */}
            {currentSubscription && (
              <View style={[styles.card, { backgroundColor: '#eff6ff', borderColor: '#3b82f6' }]}>
                <Text style={[styles.cardLabel, { color: '#1e40af' }]}>
                  {`${t('subscription.active')} ${ currentSubscription.planName }`}
                </Text>
                <Text style={[styles.bikeModel, { color: '#3b82f6' }]}>
                  {priceInfo?.message || `${t('subscription.included')} ${ currentSubscription.planName }`}
                </Text>
              </View>
            )}

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Clock size={24} color="#2563eb" />
                <Text style={styles.statLabel}>{t('ride.duration')}</Text>
                <Text style={styles.statValue}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.statCard}>
                <MapPin size={24} color="#7c3aed" />
                <Text style={styles.statLabel}>{t('ride.distance')}</Text>
                <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
              </View>

              <View style={styles.statCard}>
                <DollarSign size={24} color={priceInfo?.willBeCharged ? "#f59e0b" : "#16a34a"} />
                <Text style={styles.statLabel}>{t('ride.currentCost')}</Text>
                <Text style={[styles.statValue, { color: priceInfo?.willBeCharged ? "#f59e0b" : "#16a34a" }]}>
                  {priceInfo?.currentCost || 0} <Text style={styles.currencySmall}>
                    {user?.wallet?.currency || 'XAF'}
                  </Text>
                </Text>
                {priceInfo && (
                  <Text style={[styles.statLabel, { color: priceInfo.willBeCharged ? "#f59e0b" : "#16a34a", marginTop: 4 }]}>
                    {priceInfo.willBeCharged ? t('payment.toPay') : t('payment.included')}
                  </Text>
                )}
              </View>
            </View>

            {/* Cost Breakdown */}
            <View style={styles.costCard}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>
                  {t('ride.elapsedTime')}
                </Text>
                <Text style={styles.costValue}>
                  {Math.ceil(duration / 60)} {t('common.minutes')}
                </Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>
                  {t('ride.rate')}
                </Text>
                <Text style={styles.costValue}>
                  {bike.pricingPlan?.hourlyRate || 200} {user?.wallet?.currency || 'XAF'}/h
                </Text>
              </View>
              {priceInfo?.willBeCharged && (
                <View style={[styles.costRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>
                    {t('payment.willBeDeducted')}
                  </Text>
                  <Text style={styles.totalValue}>
                    {priceInfo.currentCost} {user?.wallet?.currency || 'XAF'}
                  </Text>
                </View>
              )}
              {!priceInfo?.willBeCharged && currentSubscription && (
                <View style={[styles.costRow, { backgroundColor: '#f0fdf4' }]}>
                  <Text style={[styles.totalLabel, { color: '#16a34a' }]}>
                    {t('payment.includedInPlan')}
                  </Text>
                  <Text style={[styles.totalValue, { color: '#16a34a' }]}>
                    0 {user?.wallet?.currency || 'XAF'}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handlePauseResume}
                style={styles.pauseButton}
              >
                {isPaused ? (
                  <>
                    <Play size={20} color="#374151" />
                    <Text style={styles.pauseButtonText}>
                      {t('ride.resume')}
                    </Text>
                  </>
                ) : (
                  <>
                    <Pause size={20} color="#374151" />
                    <Text style={styles.pauseButtonText}>
                      {t('ride.pause')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEndRide}
                style={styles.endButton}
                disabled={isLoading}
              >
                <Lock size={20} color="white" />
                <Text style={styles.endButtonText}>
                  {isLoading ? t('common.loading') : t('lock.requestButton')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReportIssue}
                style={styles.reportButton}
              >
                <AlertTriangle size={20} color="#d97706" />
                <Text style={styles.reportButtonText}>
                  {t('ride.reportIssue')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info about admin validation */}
            <View style={[styles.safetyCard, { backgroundColor: '#eff6ff' }]}>
              <Text style={[styles.safetyText, { color: '#1e40af' }]}>
                {t('lock.adminValidation')}
              </Text>
            </View>

            {/* Safety Info */}
            <View style={styles.safetyCard}>
              <Text style={styles.safetyText}>
                {t('ride.safetyReminder')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  mapContainer: {
    height: '40%',
    backgroundColor: '#dbeafe',
    position: 'relative',
  },
  mapContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: {
    fontSize: 20,
    color: 'white',
    marginTop: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  details: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bikeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  bikeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  bikeModel: {
    fontSize: 14,
    color: '#6b7280',
  },
  batteryInfo: {
    alignItems: 'flex-end',
  },
  batteryLevel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#16a34a',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  currencySmall: {
    fontSize: 14,
  },
  costCard: {
    backgroundColor: '#dbeafe',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#bfdbfe',
    paddingTop: 8,
    marginTop: 4,
  },
  costLabel: {
    fontSize: 14,
    color: '#1e40af',
  },
  costValue: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  pauseButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  endButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#d97706',
  },
  safetyCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
  },
  safetyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});