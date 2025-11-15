import { AlertTriangle, Clock, DollarSign, MapPin, Pause, Play, StopCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { toast } from 'sonner';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { rideService } from '@/services/rideService';
import type { Bike, Ride, Location } from '@/lib/mobile-types';
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
  const [duration, setDuration] = useState(0); // in seconds
  const [distance, setDistance] = useState(0); // in km
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRide, setIsLoadingRide] = useState(true);

  // Load current active ride
  useEffect(() => {
    loadActiveRide();
  }, []);

  const loadActiveRide = async () => {
    try {
      setIsLoadingRide(true);
      const activeRide = await rideService.getActiveRide();
      if (activeRide) {
        setCurrentRide(activeRide);
        // Calculate duration from start time
        const startTime = new Date(activeRide.startTime);
        const now = new Date();
        setDuration(Math.floor((now.getTime() - startTime.getTime()) / 1000));
        // Set distance from ride data if available
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

  // Timer effect
  useEffect(() => {
    if (!isPaused && currentRide) {
      const timer = setInterval(() => {
        setDuration((prev) => prev + 1);
        setDistance((prev) => prev + 0.01);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused, currentRide]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentCost = bike.pricingPlan 
    ? Math.ceil((duration / 3600) * bike.pricingPlan.hourlyRate)
    : Math.ceil((duration / 60) * 0.5 + 1);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast.success(
      isPaused
        ? t('ride.resumed')
        : t('ride.paused')
    );
  };

  const handleEndRide = () => {
    if (onNavigate) {
      onNavigate('bike-inspection', {
        bikeId: bike.id,
        bikeName: bike.code,
        inspectionType: 'return'
      });
    } else {
      setShowEndDialog(true);
    }
  };

  const confirmEndRide = async () => {
    if (!currentRide) return;
    
    setIsLoading(true);
    try {
      const endLocation: Location = {
        latitude: bike.latitude || 0,
        longitude: bike.longitude || 0,
        address: bike.locationName || t('ride.unknownLocation')
      };

      const completedRide = await rideService.endRide(currentRide.id, endLocation);
      
      await refreshUser();
      
      toast.success(`${t('ride.completedMessage')} ${ completedRide.cost || 0, user?.wallet?.currency || 'XAF' }`);
      
      setShowEndDialog(false);
      onEndRide();
    } catch (error: any) {
      toast.error(t(error.message) || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportIssue = () => {
    if (onNavigate) {
      onNavigate('report-issue', {
        bikeId: bike.id,
        bikeName: bike.code,
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
          <ActivityIndicator size="large" color="#5D5CDE" />
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
                <DollarSign size={24} color="#16a34a" />
                <Text style={styles.statLabel}>{t('ride.currentCost')}</Text>
                <Text style={styles.statValue}>
                  {currentCost} <Text style={styles.currencySmall}>
                    {user?.wallet?.currency || 'XAF'}
                  </Text>
                </Text>
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
                  {bike.pricingPlan?.hourlyRate || '0.5'} {user?.wallet?.currency || 'XAF'}/
                  {bike.pricingPlan ? t('common.hour') : t('common.minute')}
                </Text>
              </View>
              <View style={[styles.costRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>
                  {t('ride.estimatedTotal')}
                </Text>
                <Text style={styles.totalValue}>
                  {currentCost} {user?.wallet?.currency || 'XAF'}
                </Text>
              </View>
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
                <StopCircle size={20} color="white" />
                <Text style={styles.endButtonText}>
                  {isLoading ? t('common.loading') : t('ride.endRide')}
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

            {/* Safety Info */}
            <View style={styles.safetyCard}>
              <Text style={styles.safetyText}>
                {t('ride.safetyReminder')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* End Ride Confirmation Dialog */}
      <Modal
        visible={showEndDialog}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEndDialog(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContent}>
            <Text style={styles.dialogTitle}>
              {t('ride.confirmEnd')}
            </Text>
            <View style={styles.dialogDescription}>
              <Text style={styles.dialogSummary}>{t('ride.summaryTitle')}</Text>
              <View style={styles.rideSummary}>
                <Text style={styles.summaryItem}>• {t('ride.duration')}: {formatTime(duration)}</Text>
                <Text style={styles.summaryItem}>• {t('ride.distance')}: {distance.toFixed(2)} km</Text>
                <Text style={styles.summaryItem}>• {t('ride.cost')}: {currentCost} {user?.wallet?.currency || 'XAF'}</Text>
              </View>
              <Text style={styles.dialogWarning}>
                {t('ride.chargeWarning')}
              </Text>
            </View>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogCancel}
                onPress={() => setShowEndDialog(false)}
                disabled={isLoading}
              >
                <Text style={styles.dialogCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogConfirm, isLoading && { opacity: 0.5 }]}
                onPress={confirmEndRide}
                disabled={isLoading}
              >
                <Text style={styles.dialogConfirmText}>
                  {isLoading ? t('common.loading') : t('ride.endRide')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Les styles restent identiques...
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
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialogContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  dialogDescription: {
    marginBottom: 24,
  },
  dialogSummary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  rideSummary: {
    marginBottom: 12,
  },
  summaryItem: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  dialogWarning: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  dialogCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  dialogConfirm: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  dialogConfirmText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});