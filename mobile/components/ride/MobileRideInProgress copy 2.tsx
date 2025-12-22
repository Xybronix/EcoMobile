/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { AlertTriangle, Clock, DollarSign, MapPin, Pause, Play, Lock, Navigation, Battery, Gauge } from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { toast } from 'sonner';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { rideService } from '@/services/rideService';
import { bikeRequestService } from '@/services/bikeRequestService';
import { walletService } from '@/services/walletService';
import type { Bike, Ride } from '@/lib/mobile-types';
import { OSMMap, OSMMapRef } from '@/components/maps/OSMMap';
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
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRide, setIsLoadingRide] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [priceInfo, setPriceInfo] = useState<{
    currentCost: number;
    willBeCharged: boolean;
    message: string;
    isOvertime: boolean;
  } | null>(null);
  const [bikePosition, setBikePosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  // Remplacement de MapView par OSMMapRef
  const mapRef = useRef<OSMMapRef>(null);

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
        
        // Initialiser la position du vélo
        if (activeRide.bike?.latitude && activeRide.bike?.longitude) {
          setBikePosition({
            latitude: activeRide.bike.latitude,
            longitude: activeRide.bike.longitude
          });
        } else if (bike.latitude && bike.longitude) {
          setBikePosition({
            latitude: bike.latitude,
            longitude: bike.longitude
          });
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
        setDistance((prev) => prev + 0.002); // Simulation
        updatePriceInfo();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused, currentRide, duration, currentSubscription]);

  // Actualiser la position du vélo toutes les 30 secondes
  useEffect(() => {
    if (currentRide) {
      const positionInterval = setInterval(async () => {
        try {
          const updatedRide = await rideService.getActiveRide();
          if (updatedRide?.bike?.latitude && updatedRide?.bike?.longitude) {
            setBikePosition({
              latitude: updatedRide.bike.latitude,
              longitude: updatedRide.bike.longitude
            });
          }
        } catch (error) {
          console.warn('Failed to update bike position:', error);
        }
      }, 30000);

      return () => clearInterval(positionInterval);
    }
  }, [currentRide]);

  const updatePriceInfo = () => {
    if (!currentRide) return;

    const hourlyRate = bike.pricingPlan?.hourlyRate || 200;
    const durationHours = duration / 3600;
    let calculatedCost = Math.ceil(durationHours * hourlyRate);

    if (currentSubscription) {
      const isOvertime = checkIfOvertime(currentRide.startTime, currentSubscription.packageType);
      
      if (isOvertime) {
        const reductionPercentage = 50;
        const finalCost = Math.round(calculatedCost * (1 - reductionPercentage / 100));
        setPriceInfo({
          currentCost: finalCost,
          willBeCharged: finalCost > 0,
          message: `Hors forfait - Réduction ${reductionPercentage}%`,
          isOvertime: true
        });
      } else {
        setPriceInfo({
          currentCost: calculatedCost,
          willBeCharged: false,
          message: `Inclus dans ${currentSubscription.planName}`,
          isOvertime: false
        });
      }
    } else {
      setPriceInfo({
        currentCost: calculatedCost,
        willBeCharged: true,
        message: 'Tarif standard',
        isOvertime: false
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
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

  const handleRequestLock = async () => {
    if (!currentRide) return;

    try {
      setIsLoading(true);
      
      const currentLocation = bikePosition || {
        latitude: bike.latitude || 0,
        longitude: bike.longitude || 0
      };

      await bikeRequestService.createLockRequest(
        bike.id, 
        currentRide.id, 
        currentLocation
      );
      
      toast.success(t('lock.requestSent'));
      
      onNavigate?.('account-management', { initialTab: 'requests' });
      
    } catch (error: any) {
      toast.error(error.message || t('lock.requestError'));
    } finally {
      setIsLoading(false);
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

  const centerOnBike = () => {
    if (bikePosition && mapRef.current) {
      mapRef.current.centerOnUser();
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
          <TouchableOpacity
            onPress={() => onNavigate?.('home')}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Préparer les données pour OSMMap
  const bikeForMap = {
    id: bike.id,
    latitude: bikePosition?.latitude || bike.latitude || 0,
    longitude: bikePosition?.longitude || bike.longitude || 0,
    batteryLevel: bike.batteryLevel,
    code: bike.code,
    model: bike.model,
    distance: 0 // Vous pouvez calculer la distance réelle ici si nécessaire
  };

  const userLocation = bikePosition ? {
    lat: bikePosition.latitude,
    lng: bikePosition.longitude
  } : undefined;

  return (
    <View style={styles.container}>
      <MobileHeader title={t('ride.inProgress')} />

      <View style={styles.content}>
        {/* Carte OSM avec position du vélo */}
        <View style={styles.mapContainer}>
          {bikePosition ? (
            <OSMMap
              ref={mapRef}
              userLocation={userLocation}
              bikes={[bikeForMap]}
              radius={0.5} // Rayon de 500 mètres
              onBikePress={(selectedBike) => {
                // Gérer le clic sur le vélo si nécessaire
                console.log('Bike selected:', selectedBike);
              }}
              onMapReady={() => {
                console.log('OSM Map ready');
              }}
              colorScheme={Platform.OS === 'web' ? 'light' : 'light'}
            />
          ) : (
            <View style={styles.mapPlaceholder}>
              <MapPin size={64} color="#16a34a" />
              <Text style={styles.mapTitle}>{t('ride.inProgressMessage')}</Text>
              <Text style={styles.mapSubtitle}>{t('ride.gpsActive')}</Text>
            </View>
          )}

          {/* Bouton centrer sur le vélo */}
          {bikePosition && (
            <TouchableOpacity style={styles.centerButton} onPress={centerOnBike}>
              <Navigation size={20} color="#16a34a" />
            </TouchableOpacity>
          )}

          {/* Overlay si pause */}
          {isPaused && (
            <View style={styles.pauseOverlay}>
              <Pause size={64} color="white" />
              <Text style={styles.pauseText}>{t('ride.pausedMessage')}</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.details}>
            {/* Bike Info Card */}
            <View style={styles.card}>
              <View style={styles.bikeInfo}>
                <View style={styles.bikeInfoLeft}>
                  <Text style={styles.cardLabel}>{t('ride.currentBike')}</Text>
                  <Text style={styles.bikeName}>{bike.code}</Text>
                  <Text style={styles.bikeModel}>{bike.model}</Text>
                </View>
                <View style={styles.bikeInfoRight}>
                  <View style={styles.batteryContainer}>
                    <Battery size={20} color={bike.batteryLevel > 20 ? '#16a34a' : '#dc2626'} />
                    <Text style={[styles.batteryLevel, { color: bike.batteryLevel > 20 ? '#16a34a' : '#dc2626' }]}>
                      {bike.batteryLevel}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Subscription Status */}
            {currentSubscription && (
              <View style={[styles.card, styles.subscriptionCard]}>
                <Text style={styles.subscriptionLabel}>
                  Forfait actif: {currentSubscription.planName}
                </Text>
                <Text style={[styles.subscriptionInfo, { color: priceInfo?.isOvertime ? '#f59e0b' : '#16a34a' }]}>
                  {priceInfo?.message || 'Couvert par le forfait'}
                </Text>
              </View>
            )}

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Clock size={24} color="#2563eb" />
                <Text style={styles.statLabel}>{t('ride.duration')}</Text>
                <Text style={styles.statValue}>{formatTime(duration)}</Text>
              </View>

              <View style={styles.statCard}>
                <Gauge size={24} color="#7c3aed" />
                <Text style={styles.statLabel}>{t('ride.distance')}</Text>
                <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
              </View>

              <View style={styles.statCard}>
                <DollarSign size={24} color={priceInfo?.willBeCharged ? "#f59e0b" : "#16a34a"} />
                <Text style={styles.statLabel}>{t('ride.currentCost')}</Text>
                <Text style={[styles.statValue, { color: priceInfo?.willBeCharged ? "#f59e0b" : "#16a34a" }]}>
                  {priceInfo?.currentCost || 0} XOF
                </Text>
                <Text style={[styles.statNote, { color: priceInfo?.willBeCharged ? "#f59e0b" : "#16a34a" }]}>
                  {priceInfo?.willBeCharged ? 'À payer' : 'Inclus'}
                </Text>
              </View>
            </View>

            {/* Ride Details Card */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Détails du trajet</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Début du trajet</Text>
                <Text style={styles.detailValue}>
                  {new Date(currentRide.startTime).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tarif horaire</Text>
                <Text style={styles.detailValue}>
                  {bike.pricingPlan?.hourlyRate || 200} XOF/h
                </Text>
              </View>

              {priceInfo?.isOvertime && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Réduction overtime</Text>
                  <Text style={[styles.detailValue, { color: '#16a34a' }]}>-50%</Text>
                </View>
              )}

              <View style={[styles.detailRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>
                  {priceInfo?.willBeCharged ? 'À déduire du wallet' : 'Économies réalisées'}
                </Text>
                <Text style={[styles.totalValue, { color: priceInfo?.willBeCharged ? '#111827' : '#16a34a' }]}>
                  {priceInfo?.willBeCharged 
                    ? `${priceInfo.currentCost} XOF`
                    : `${priceInfo?.currentCost || 0} XOF`
                  }
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
                    <Text style={styles.pauseButtonText}>{t('ride.resume')}</Text>
                  </>
                ) : (
                  <>
                    <Pause size={20} color="#374151" />
                    <Text style={styles.pauseButtonText}>{t('ride.pause')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRequestLock}
                style={styles.endButton}
                disabled={isLoading}
              >
                <Lock size={20} color="white" />
                <Text style={styles.endButtonText}>
                  {isLoading ? 'Envoi en cours...' : t('lock.requestButton')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReportIssue}
                style={styles.reportButton}
              >
                <AlertTriangle size={20} color="#d97706" />
                <Text style={styles.reportButtonText}>{t('ride.reportIssue')}</Text>
              </TouchableOpacity>
            </View>

            {/* Info Cards */}
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                💡 Le paiement sera effectué uniquement après validation du verrouillage par l'administrateur.
              </Text>
            </View>

            <View style={styles.safetyCard}>
              <Text style={styles.safetyText}>{t('ride.safetyReminder')}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

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
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    height: '35%',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#dbeafe',
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
  centerButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
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
    zIndex: 1001,
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
  bikeInfoLeft: {
    flex: 1,
  },
  bikeInfoRight: {
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  bikeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  bikeModel: {
    fontSize: 14,
    color: '#6b7280',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  batteryLevel: {
    fontSize: 18,
    fontWeight: '600',
  },
  subscriptionCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  subscriptionLabel: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  subscriptionInfo: {
    fontSize: 12,
    marginTop: 4,
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
    fontSize: 11,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  statNote: {
    fontSize: 10,
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: 'white',
  },
  pauseButtonText: {
    fontSize: 16,
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
    fontSize: 16,
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
    fontSize: 14,
    fontWeight: '500',
    color: '#d97706',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
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