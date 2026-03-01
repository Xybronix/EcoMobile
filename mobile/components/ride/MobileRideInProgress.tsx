/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { AlertTriangle, Clock, DollarSign, MapPin, Pause, Play, Lock, Navigation, Battery, Gauge, ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, TouchableOpacity, View, ActivityIndicator, Platform } from 'react-native';
import { Text } from '../ui/Text';
import { toast } from 'sonner';
import { Colors } from '@/constants/theme';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { rideService } from '@/services/rideService';
import { bikeRequestService } from '@/services/bikeRequestService';
import { walletService } from '@/services/walletService';
import type { Bike, Ride } from '@/lib/mobile-types';
import { OSMMap, OSMMapRef } from '@/components/maps/OSMMap';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';

interface MobileRideInProgressProps {
  bike: Bike;
  onEndRide: () => void;
  onReportIssue: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function MobileRideInProgress({
  bike,
  onReportIssue,
  onNavigate,
}: MobileRideInProgressProps) {
  const { t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
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
  
  const mapRef = useRef<OSMMapRef>(null);
  const lockRequestInFlightRef = useRef(false);

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
        setDistance((prev) => prev + 0.002);
        updatePriceInfo();
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [isPaused, currentRide, duration, currentSubscription]);

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
    return undefined;
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
    if (lockRequestInFlightRef.current) return;
    lockRequestInFlightRef.current = true;

    try {
      setIsLoading(true);
      
      // Vérifier si une demande de verrouillage est déjà en attente pour ce vélo
      const existingRequests = await bikeRequestService.getUserLockRequests(1, 10);
      const pendingLockRequest = existingRequests.data?.find(
        (req: any) => req.bikeId === bike.id && req.status === 'PENDING'
      );
      
      if (pendingLockRequest) {
        toast.info(t('lock.requestAlreadyPending') || 'Une demande de verrouillage est déjà en attente pour ce vélo');
        onNavigate?.('account-management', { initialTab: 'requests' });
        return;
      }
      
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
      // Gérer le cas où le backend retourne une erreur de demande existante
      if (error.message?.includes('déjà en attente') || error.message?.includes('already pending')) {
        toast.info(t('lock.requestAlreadyPending') || 'Une demande de verrouillage est déjà en attente pour ce vélo');
        onNavigate?.('account-management', { initialTab: 'requests' });
      } else {
        toast.error(error.message || t('lock.requestError'));
      }
    } finally {
      setIsLoading(false);
      lockRequestInFlightRef.current = false;
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
        {/* Header avec bouton de retour */}
        <View style={[
          styles.px16, 
          styles.py16, 
          styles.row, 
          styles.alignCenter,
          styles.gap12,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderBottomWidth: 1,
            borderBottomColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
          }
        ]}>
          <TouchableOpacity
            onPress={() => onNavigate?.('rides')}
            style={[
              styles.p8,
              styles.roundedFull,
              { backgroundColor: colorScheme === 'light' ? 'transparent' : '#374151' }
            ]}
          >
            <ArrowLeft size={24} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
          </TouchableOpacity>
          <Text variant="subtitle" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
            {t('ride.inProgress')}
          </Text>
        </View>
        
        <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter]}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={[styles.text, styles.mt16, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
            {t('ride.loading')}
          </Text>
        </View>
      </View>
    );
  }

  if (!currentRide) {
    return (
      <View style={styles.container}>
        {/* Header avec bouton de retour */}
        <View style={[
          styles.px16, 
          styles.py16, 
          styles.row, 
          styles.alignCenter,
          styles.gap12,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderBottomWidth: 1,
            borderBottomColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
          }
        ]}>
          <TouchableOpacity
            onPress={() => onNavigate?.('home')}
            style={[
              styles.p8,
              styles.roundedFull,
              { backgroundColor: colorScheme === 'light' ? 'transparent' : '#374151' }
            ]}
          >
            <ArrowLeft size={24} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
          </TouchableOpacity>
          <Text variant="subtitle" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
            {t('ride.inProgress')}
          </Text>
        </View>
        
        <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter, styles.p24]}>
          <Text style={[styles.text, styles.textCenter, { color: '#ef4444', marginBottom: 16 }]}>
            {t('ride.noActiveRide')}
          </Text>
          <TouchableOpacity
            onPress={() => onNavigate?.('home')}
            style={[
              styles.px24,
              styles.py12,
              styles.rounded8,
              { backgroundColor: '#16a34a' }
            ]}
          >
            <Text style={[styles.text, { color: 'white', fontWeight: '600' }]}>
              Retour à l'accueil
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const bikeForMap = {
    id: bike.id,
    latitude: bikePosition?.latitude || bike.latitude || 0,
    longitude: bikePosition?.longitude || bike.longitude || 0,
    batteryLevel: bike.batteryLevel,
    code: bike.code,
    model: bike.model,
    distance: 0
  };

  const userLocation = bikePosition ? {
    lat: bikePosition.latitude,
    lng: bikePosition.longitude
  } : undefined;

  return (
    <View style={styles.container}>
      {/* Header avec bouton de retour */}
      <View style={[
        styles.px16, 
        styles.py16, 
        styles.row, 
        styles.alignCenter,
        styles.gap12,
        { 
          backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
          borderBottomWidth: 1,
          borderBottomColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
        }
      ]}>
        <TouchableOpacity
          onPress={() => onNavigate?.('home')}
          style={[
            styles.p8,
            styles.roundedFull,
            { backgroundColor: colorScheme === 'light' ? 'transparent' : '#374151' }
          ]}
        >
          <ArrowLeft size={24} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
        </TouchableOpacity>
        <Text variant="subtitle" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
          {t('ride.inProgress')}
        </Text>
      </View>

      <View style={styles.flex1}>
        {/* Carte OSM */}
        <View style={{ height: 280, position: 'relative' }}>
          {bikePosition ? (
            <OSMMap
              ref={mapRef}
              userLocation={userLocation}
              bikes={[bikeForMap]}
              radius={0.5}
              onBikePress={(selectedBike) => {
                console.log('Bike selected:', selectedBike);
              }}
              onMapReady={() => {
                console.log('OSM Map ready');
              }}
              colorScheme={Platform.OS === 'web' ? 'light' : 'light'}
            />
          ) : (
            <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter, { backgroundColor: '#dbeafe' }]}>
              <MapPin size={64} color="#16a34a" />
              <Text style={[styles.text, styles.mt16, styles.textCenter, { fontSize: 18, fontWeight: '600', color: '#111827' }]}>
                {t('ride.inProgressMessage')}
              </Text>
              <Text style={[styles.text, styles.mt4, styles.textCenter, { color: '#6b7280' }]}>
                {t('ride.gpsActive')}
              </Text>
            </View>
          )}

          {/* Bouton centrer sur le vélo */}
          {bikePosition && (
            <TouchableOpacity 
              style={[
                styles.absolute, 
                styles.p12, 
                styles.roundedFull,
                { 
                  bottom: 16, 
                  right: 16, 
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                  zIndex: 1000 
                }
              ]} 
              onPress={centerOnBike}
            >
              <Navigation size={20} color="#16a34a" />
            </TouchableOpacity>
          )}

          {/* Overlay si pause */}
          {isPaused && (
            <View style={[
              styles.absolute, 
              styles.flex1, 
              styles.alignCenter, 
              styles.justifyCenter,
              { 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1001 
              }
            ]}>
              <Pause size={64} color="white" />
              <Text style={[styles.text, styles.mt16, { fontSize: 20, color: 'white', fontWeight: '600' }]}>
                {t('ride.pausedMessage')}
              </Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.p16, styles.gap16]}>
            {/* Info Vélo */}
            <View style={[styles.card, styles.rounded12]}>
              <View style={[styles.row, styles.spaceBetween, styles.alignStart]}>
                <View style={styles.flex1}>
                  <Text variant="caption" color="muted">
                    {t('ride.currentBike')}
                  </Text>
                  <Text variant="body" weight="semibold" style={styles.mt4}>
                    {bike.code}
                  </Text>
                  <Text variant="caption" color="muted" style={styles.mt4}>
                    {bike.model}
                  </Text>
                </View>
                <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                  <Battery size={20} color={bike.batteryLevel > 20 ? '#16a34a' : '#dc2626'} />
                  <Text variant="body" weight="semibold" 
                    style={{ color: bike.batteryLevel > 20 ? '#16a34a' : '#dc2626' }}>
                    {bike.batteryLevel}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Statut Forfait */}
            {currentSubscription && (
              <View style={[
                styles.card, 
                styles.rounded12,
                { backgroundColor: '#eff6ff', borderColor: '#3b82f6', borderWidth: 1 }
              ]}>
                <Text variant="caption" weight="semibold" style={{ color: '#1e40af' }}>
                  Forfait actif: {currentSubscription.planName}
                </Text>
                <Text variant="caption" style={[
                  styles.mt4,
                  { color: priceInfo?.isOvertime ? '#f59e0b' : '#16a34a' }
                ]}>
                  {priceInfo?.message || 'Couvert par le forfait'}
                </Text>
              </View>
            )}

            {/* Grille de Statistiques */}
            <View style={[styles.row, styles.gap12]}>
              <View style={[styles.flex1, styles.card, styles.rounded12, styles.alignCenter]}>
                <Clock size={24} color="#2563eb" />
                <Text variant="caption" color="muted" style={styles.mt8}>
                  {t('ride.duration')}
                </Text>
                <Text variant="body" weight="semibold" style={styles.mt4}>
                  {formatTime(duration)}
                </Text>
              </View>

              <View style={[styles.flex1, styles.card, styles.rounded12, styles.alignCenter]}>
                <Gauge size={24} color="#7c3aed" />
                <Text variant="caption" color="muted" style={styles.mt8}>
                  {t('ride.distance')}
                </Text>
                <Text variant="body" weight="semibold" style={styles.mt4}>
                  {distance.toFixed(2)} km
                </Text>
              </View>

              {/** 
                <View style={[styles.flex1, styles.card, styles.rounded12, styles.alignCenter]}>
                  <DollarSign size={24} color={priceInfo?.willBeCharged ? "#f59e0b" : "#16a34a"} />
                  <Text variant="caption" color="muted" style={styles.mt8}>
                    {t('ride.currentCost')}
                  </Text>
                  <Text variant="body" weight="semibold" 
                    style={[styles.mt4, { color: priceInfo?.willBeCharged ? "#f59e0b" : "#16a34a" }]}>
                    {priceInfo?.currentCost || 0} XOF
                  </Text>
                  <Text variant="caption" 
                    style={[styles.mt4, { color: priceInfo?.willBeCharged ? "#f59e0b" : "#16a34a" }]}>
                    {priceInfo?.willBeCharged ? 'À payer' : 'Inclus'}
                  </Text>
                </View>
              */}
            </View>

            {/* Détails du Trajet */}
            <View style={[styles.card, styles.rounded12]}>
              <Text variant="body" weight="semibold" style={styles.mb12}>
                Détails du trajet
              </Text>
              
              <View style={[styles.row, styles.spaceBetween, styles.py8]}>
                <Text variant="caption" color="muted">Début du trajet</Text>
                <Text variant="caption" weight="medium">
                  {new Date(currentRide.startTime).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              
              <View style={[styles.row, styles.spaceBetween, styles.py8]}>
                <Text variant="caption" color="muted">Tarif horaire</Text>
                <Text variant="caption" weight="medium">
                  {bike.pricingPlan?.hourlyRate || 200} XOF/h
                </Text>
              </View>

              {priceInfo?.isOvertime && (
                <View style={[styles.row, styles.spaceBetween, styles.py8]}>
                  <Text variant="caption" color="muted">Réduction overtime</Text>
                  <Text variant="caption" weight="medium" style={{ color: '#16a34a' }}>
                    -50%
                  </Text>
                </View>
              )}

              <View style={[
                styles.row, 
                styles.spaceBetween, 
                styles.pt12, 
                styles.mt8,
                { borderTopWidth: 1, borderTopColor: '#e5e7eb' }
              ]}>
                <Text variant="body" weight="semibold">
                  {priceInfo?.willBeCharged ? 'À déduire du wallet' : 'Économies réalisées'}
                </Text>
                <Text variant="body" weight="bold"
                  style={{ color: priceInfo?.willBeCharged ? '#e5e7eb' : '#16a34a' }}>
                  {priceInfo?.willBeCharged 
                    ? `${priceInfo.currentCost} XOF`
                    : `${priceInfo?.currentCost || 0} XOF`
                  }
                </Text>
              </View>
            </View>

            {/* Boutons d'Action */}
            <View style={styles.gap12}>
              {/**
              <TouchableOpacity
                onPress={handlePauseResume}
                style={[
                  styles.row,
                  styles.alignCenter,
                  styles.justifyCenter,
                  styles.py16,
                  styles.rounded12,
                  { 
                    borderWidth: 1, 
                    borderColor: '#d1d5db',
                    backgroundColor: 'white',
                    gap: 8 
                  }
                ]}
              >
                {isPaused ? (
                  <>
                    <Play size={20} color="#374151" />
                    <Text variant="body" weight="semibold" color="#374151">
                      {t('ride.resume')}
                    </Text>
                  </>
                ) : (
                  <>
                    <Pause size={20} color="#374151" />
                    <Text variant="body" weight="semibold" color="#374151">
                      {t('ride.pause')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              */}
              
              <TouchableOpacity
                onPress={handleRequestLock}
                style={[
                  styles.row,
                  styles.alignCenter,
                  styles.justifyCenter,
                  styles.py16,
                  styles.rounded12,
                  { 
                    backgroundColor: '#dc2626',
                    gap: 8 
                  }
                ]}
                disabled={isLoading}
              >
                <Lock size={20} color="white" />
                <Text variant="body" weight="semibold" color="white">
                  {isLoading ? 'Envoi en cours...' : t('lock.requestButton')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReportIssue}
                style={[
                  styles.row,
                  styles.alignCenter,
                  styles.justifyCenter,
                  styles.py12,
                  styles.rounded12,
                  { 
                    backgroundColor: 'transparent',
                    gap: 8 
                  }
                ]}
              >
                <AlertTriangle size={20} color="#d97706" />
                <Text variant="body" weight="medium" color="#d97706">
                  {t('ride.reportIssue')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cartes d'Information */}
            <View style={[
              styles.p16, 
              styles.rounded12,
              { 
                backgroundColor: '#eff6ff', 
                borderLeftWidth: 4, 
                borderLeftColor: '#3b82f6' 
              }
            ]}>
              <Text variant="caption" style={{ color: '#1e40af' }}>
                💡 Le paiement sera effectué uniquement après validation du verrouillage par l'administrateur.
              </Text>
            </View>

            <View style={[
              styles.p16, 
              styles.rounded12,
              { 
                backgroundColor: '#f3f4f6'
              }
            ]}>
              <Text variant="caption" color="muted" style={styles.textCenter}>
                {t('ride.safetyReminder')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}