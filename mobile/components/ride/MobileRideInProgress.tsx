import {
  AlertTriangle,
  Clock,
  DollarSign,
  MapPin,
  Pause,
  Play,
  StopCircle
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { toast } from 'sonner';
import { useMobileAuth } from '../../lib/mobile-auth';
import { useMobileI18n } from '../../lib/mobile-i18n';
import type { Bike } from '../../lib/mobile-types';
import { MobileHeader } from '../layout/MobileHeader';

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
  const { t, language } = useMobileI18n();
  const { user, updateWalletBalance } = useMobileAuth();
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0); // in seconds
  const [distance, setDistance] = useState(0); // in km
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setDuration((prev) => prev + 1);
        // Simulate distance increase (in real app, use GPS)
        setDistance((prev) => prev + 0.01);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentCost = Math.ceil((duration / 60) * bike.pricePerMinute);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast.success(
      isPaused
        ? language === 'fr'
          ? 'Trajet repris'
          : 'Ride resumed'
        : language === 'fr'
        ? 'Trajet mis en pause'
        : 'Ride paused'
    );
  };

  const handleEndRide = () => {
    // Navigate to inspection screen before ending the ride
    if (onNavigate) {
      onNavigate('bike-inspection', {
        bikeId: bike.id,
        bikeName: bike.name,
        inspectionType: 'return'
      });
    } else {
      setShowEndDialog(true);
    }
  };

  const confirmEndRide = () => {
    // Deduct cost from wallet
    updateWalletBalance(-currentCost);
    
    toast.success(
      language === 'fr'
        ? `Trajet terminé ! Coût: ${currentCost} ${user?.wallet.currency}`
        : `Ride completed! Cost: ${currentCost} ${user?.wallet.currency}`
    );
    
    setShowEndDialog(false);
    onEndRide();
  };

  const handleReportIssue = () => {
    if (onNavigate) {
      onNavigate('report-issue', {
        bikeId: bike.id,
        bikeName: bike.name
      });
    } else {
      onReportIssue();
    }
  };

  return (
    <View style={styles.container}>
      <MobileHeader title={t('ride.inProgress')} />

      <View style={styles.content}>
        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapContent}>
            <MapPin size={64} color="#16a34a" />
            <Text style={styles.mapTitle}>
              {language === 'fr' ? 'Trajet en cours...' : 'Ride in progress...'}
            </Text>
            <Text style={styles.mapSubtitle}>
              {language === 'fr'
                ? 'GPS tracking actif'
                : 'GPS tracking active'}
            </Text>
          </View>

          {/* Pause Overlay */}
          {isPaused && (
            <View style={styles.pauseOverlay}>
              <Pause size={64} color="white" />
              <Text style={styles.pauseText}>
                {language === 'fr' ? 'Trajet en pause' : 'Ride Paused'}
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
                    {language === 'fr' ? 'Vélo actuel' : 'Current Bike'}
                  </Text>
                  <Text style={styles.bikeName}>{bike.name}</Text>
                  <Text style={styles.bikeModel}>{bike.model}</Text>
                </View>
                <View style={styles.batteryInfo}>
                  <Text style={styles.cardLabel}>
                    {language === 'fr' ? 'Batterie' : 'Battery'}
                  </Text>
                  <Text style={styles.batteryLevel}>{bike.battery}%</Text>
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
                  {currentCost} <Text style={styles.currencySmall}>{user?.wallet.currency}</Text>
                </Text>
              </View>
            </View>

            {/* Cost Breakdown */}
            <View style={styles.costCard}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>
                  {language === 'fr' ? 'Temps écoulé' : 'Elapsed Time'}
                </Text>
                <Text style={styles.costValue}>
                  {Math.ceil(duration / 60)} {language === 'fr' ? 'min' : 'min'}
                </Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>
                  {language === 'fr' ? 'Tarif' : 'Rate'}
                </Text>
                <Text style={styles.costValue}>
                  {bike.pricePerMinute} {user?.wallet.currency}/min
                </Text>
              </View>
              <View style={[styles.costRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>
                  {language === 'fr' ? 'Total estimé' : 'Estimated Total'}
                </Text>
                <Text style={styles.totalValue}>
                  {currentCost} {user?.wallet.currency}
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
                      {language === 'fr' ? 'Reprendre' : 'Resume'}
                    </Text>
                  </>
                ) : (
                  <>
                    <Pause size={20} color="#374151" />
                    <Text style={styles.pauseButtonText}>
                      {t('ride.pauseRide')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEndRide}
                style={styles.endButton}
              >
                <StopCircle size={20} color="white" />
                <Text style={styles.endButtonText}>
                  {t('ride.endRide')}
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
                {language === 'fr'
                  ? '⚠️ Pensez à porter un casque et à respecter le code de la route'
                  : '⚠️ Remember to wear a helmet and follow traffic rules'}
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
              {language === 'fr' ? 'Terminer le trajet ?' : 'End ride?'}
            </Text>
            <Text style={styles.dialogDescription}>
              {language === 'fr' ? (
                <>
                  <Text style={styles.dialogSummary}>Résumé de votre trajet :</Text>
                  <View style={styles.rideSummary}>
                    <Text style={styles.summaryItem}>• Durée : {formatTime(duration)}</Text>
                    <Text style={styles.summaryItem}>• Distance : {distance.toFixed(2)} km</Text>
                    <Text style={styles.summaryItem}>• Coût : {currentCost} {user?.wallet.currency}</Text>
                  </View>
                  <Text style={styles.dialogWarning}>
                    Le montant sera débité de votre portefeuille.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.dialogSummary}>Your ride summary:</Text>
                  <View style={styles.rideSummary}>
                    <Text style={styles.summaryItem}>• Duration: {formatTime(duration)}</Text>
                    <Text style={styles.summaryItem}>• Distance: {distance.toFixed(2)} km</Text>
                    <Text style={styles.summaryItem}>• Cost: {currentCost} {user?.wallet.currency}</Text>
                  </View>
                  <Text style={styles.dialogWarning}>
                    The amount will be deducted from your wallet.
                  </Text>
                </>
              )}
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogCancel}
                onPress={() => setShowEndDialog(false)}
              >
                <Text style={styles.dialogCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogConfirm}
                onPress={confirmEndRide}
              >
                <Text style={styles.dialogConfirmText}>
                  {t('ride.endRide')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  mapContainer: {
    height: '40%',
    backgroundColor: 'linear-gradient(135deg, #dbeafe 0%, #dcfce7 100%)',
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
    fontSize: 14,
    color: '#6b7280',
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