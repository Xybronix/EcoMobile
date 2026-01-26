/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { ScrollView, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, Calendar, DollarSign, Battery, Gauge, Navigation, AlertTriangle, CheckCircle, XCircle, Bike as BikeIcon, ArrowLeft } from 'lucide-react-native';
import { OSMMap } from '@/components/maps/OSMMap';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { rideService } from '@/services/rideService';
import type { Ride, Bike } from '@/lib/mobile-types';
import { toast } from 'sonner';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Text } from '@/components/ui/Text';

export default function MobileRideDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, language } = useMobileI18n();
  const { user } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    loadRideDetails();
  }, []);

  const loadRideDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const rideData = params.rideData ? JSON.parse(params.rideData as string) : null;
      
      if (rideData && rideData.id) {
        if (rideData.distance && rideData.duration && rideData.cost) {
          setRide(rideData);
        } else {
          const detailedRide = await rideService.getRideDetails(rideData.id);
          setRide(detailedRide);
        }
      } else {
        setError(t('ride.notFound'));
      }
    } catch (err: any) {
      console.error('Failed to load ride details:', err);
      setError(err.message || t('common.error'));
      toast.error(t('ride.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'fr' ? 'fr-FR' : 'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: '#16a34a',
          text: t('ride.completed'),
          icon: <CheckCircle size={20} color="#16a34a" />,
          bgColor: '#dcfce7',
        };
      case 'CANCELLED':
        return {
          color: '#dc2626',
          text: t('ride.cancelled'),
          icon: <XCircle size={20} color="#dc2626" />,
          bgColor: '#fee2e2',
        };
      case 'IN_PROGRESS':
        return {
          color: '#2563eb',
          text: t('ride.inProgress'),
          icon: <Navigation size={20} color="#2563eb" />,
          bgColor: '#dbeafe',
        };
      default:
        return {
          color: '#6b7280',
          text: status,
          icon: null,
          bgColor: '#f3f4f6',
        };
    }
  };

  const getLocationName = (latitude?: number, longitude?: number) => {
    if (latitude && longitude) {
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
    return t('ride.unknownLocation');
  };

  if (isLoading) {
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
            onPress={() => router.back()}
            style={[
              styles.p8,
              styles.roundedFull,
              { backgroundColor: colorScheme === 'light' ? 'transparent' : '#374151' }
            ]}
          >
            <ArrowLeft size={24} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
          </TouchableOpacity>
          <Text variant="subtitle" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
            {t('ride.details')}
          </Text>
        </View>
        
        <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter]}>
          <ActivityIndicator size="large" color="#5D5CDE" />
          <Text style={[styles.text, styles.mt16, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
            {t('ride.loadingDetails')}
          </Text>
        </View>
      </View>
    );
  }

  if (error || !ride) {
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
            onPress={() => router.back()}
            style={[
              styles.p8,
              styles.roundedFull,
              { backgroundColor: colorScheme === 'light' ? 'transparent' : '#374151' }
            ]}
          >
            <ArrowLeft size={24} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
          </TouchableOpacity>
          <Text variant="subtitle" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
            {t('ride.details')}
          </Text>
        </View>
        
        <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter, styles.p24]}>
          <AlertTriangle size={64} color="#dc2626" />
          <Text variant="body" color="#dc2626" style={[styles.mt16, styles.textCenter]}>
            {error || t('ride.notFound')}
          </Text>
          <TouchableOpacity
            style={[
              styles.row,
              styles.alignCenter,
              styles.mt20,
              styles.px24,
              styles.py12,
              styles.rounded8,
              { backgroundColor: '#5D5CDE' }
            ]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="white" />
            <Text style={[styles.text, styles.ml8, { color: 'white', fontWeight: '600' }]}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusInfo = getStatusInfo(ride.status);
  const startLocation = getLocationName(ride.startLatitude, ride.startLongitude);
  const endLocation = ride.endLatitude && ride.endLongitude 
    ? getLocationName(ride.endLatitude, ride.endLongitude)
    : t('ride.notAvailable');

  const bikeForMap: Bike = ride.bike ? {
    id: ride.bike.id,
    code: ride.bike.code,
    model: ride.bike.model,
    status: ride.bike.status,
    batteryLevel: ride.bike.batteryLevel,
    latitude: ride.endLatitude || ride.startLatitude || undefined,
    longitude: ride.endLongitude || ride.startLongitude || undefined,
    locationName: ride.bike.locationName,
    equipment: ride.bike.equipment,
    qrCode: ride.bike.qrCode,
    gpsDeviceId: ride.bike.gpsDeviceId,
    pricingPlan: ride.bike.pricingPlan,
    currentPricing: ride.bike.currentPricing,
    lastMaintenanceAt: ride.bike.lastMaintenanceAt,
    createdAt: ride.bike.createdAt,
    updatedAt: ride.bike.updatedAt,
  } : {
    id: 'unknown',
    code: 'N/A',
    model: 'Unknown',
    status: 'UNAVAILABLE',
    batteryLevel: 0,
    latitude: ride.endLatitude || ride.startLatitude || undefined,
    longitude: ride.endLongitude || ride.startLongitude || undefined,
    qrCode: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827' }]}>
      {/* Header personnalisé avec bouton retour */}
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
          onPress={() => router.back()}
          style={[
            styles.p8,
            styles.roundedFull,
            { backgroundColor: colorScheme === 'light' ? 'transparent' : '#374151' }
          ]}
        >
          <ArrowLeft size={24} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
        </TouchableOpacity>
        <Text variant="subtitle" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
          {t('ride.details')}
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Carte avec le parcours */}
        <View style={{ height: 250, position: 'relative' }}>
          {mapLoading && (
            <View style={[styles.flex1, styles.alignCenter, styles.justifyCenter, { backgroundColor: '#f3f4f6' }]}>
              <ActivityIndicator size="large" color="#5D5CDE" />
            </View>
          )}
          
          <OSMMap
            userLocation={{ lat: ride.startLatitude, lng: ride.startLongitude }}
            bikes={[bikeForMap]}
            radius={0.5}
            onMapReady={() => setMapLoading(false)}
            colorScheme="light"
          />
          
          {/* Overlay avec les informations de base */}
          <View style={[styles.absolute, { top: 16, left: 16, right: 16, zIndex: 2 }]}>
            <View style={[styles.row, styles.spaceBetween]}>
              <View style={[
                styles.row,
                styles.alignCenter,
                styles.px12,
                styles.py8,
                styles.roundedFull,
                { 
                  backgroundColor: statusInfo.bgColor,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  gap: 6 
                }
              ]}>
                {statusInfo.icon}
                <Text variant="caption" weight="semibold" style={{ color: statusInfo.color }}>
                  {statusInfo.text}
                </Text>
              </View>
              
              <View style={[
                styles.row,
                styles.alignCenter,
                styles.px12,
                styles.py12,
                styles.roundedFull,
                { 
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  gap: 6 
                }
              ]}>
                <DollarSign size={16} color="#16a34a" />
                <Text variant="body" weight="bold" style={{ color: '#16a34a' }}>
                  {ride.cost?.toFixed(2) || '0.00'} {user?.wallet?.currency || 'XAF'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Informations principales */}
        <View style={[
          styles.p20,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            marginTop: -24
          }
        ]}>
          <View style={styles.mb20}>
            <View style={[styles.row, styles.alignCenter]}>
              <View style={[
                styles.w40,
                styles.h40,
                styles.roundedFull,
                styles.alignCenter,
                styles.justifyCenter,
                { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }
              ]}>
                <BikeIcon size={20} color="#5D5CDE" />
              </View>
              <View style={[styles.ml12, styles.flex1]}>
                <Text variant="caption" color="muted">
                  {t('ride.bike')}
                </Text>
                <Text variant="body" weight="medium">
                  {ride.bike?.code || t('ride.unknownBike')} • {ride.bike?.model || ''}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.mb20}>
            <View style={[styles.row, styles.alignCenter]}>
              <View style={[
                styles.w40,
                styles.h40,
                styles.roundedFull,
                styles.alignCenter,
                styles.justifyCenter,
                { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }
              ]}>
                <Calendar size={20} color="#5D5CDE" />
              </View>
              <View style={[styles.ml12, styles.flex1]}>
                <Text variant="caption" color="muted">
                  {t('ride.dateTime')}
                </Text>
                <Text variant="body" weight="medium">
                  {formatDate(ride.startTime)}
                </Text>
              </View>
            </View>
          </View>

          <View style={[{ backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151', marginVertical: 20 }]} />

          {/* Statistiques du trajet */}
          <View style={[styles.row, styles.spaceBetween, styles.mb20, styles.gap12]}>
            <View style={[
              styles.flex1,
              styles.alignCenter,
              styles.p16,
              { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827', borderRadius: 12 }
            ]}>
              <View style={[
                styles.w48,
                styles.h48,
                styles.roundedFull,
                styles.alignCenter,
                styles.justifyCenter,
                { backgroundColor: '#eff6ff' }
              ]}>
                <Clock size={24} color="#2563eb" />
              </View>
              <Text variant="caption" color="muted" style={styles.mt8}>
                {t('ride.duration')}
              </Text>
              <Text variant="body" weight="semibold" style={styles.mt4}>
                {formatTime(ride.duration)}
              </Text>
            </View>

            <View style={[
              styles.flex1,
              styles.alignCenter,
              styles.p16,
              { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827', borderRadius: 12 }
            ]}>
              <View style={[
                styles.w48,
                styles.h48,
                styles.roundedFull,
                styles.alignCenter,
                styles.justifyCenter,
                { backgroundColor: '#f5f3ff' }
              ]}>
                <Gauge size={24} color="#7c3aed" />
              </View>
              <Text variant="caption" color="muted" style={styles.mt8}>
                {t('ride.distance')}
              </Text>
              <Text variant="body" weight="semibold" style={styles.mt4}>
                {ride.distance?.toFixed(2) || '0.00'} km
              </Text>
            </View>

            <View style={[
              styles.flex1,
              styles.alignCenter,
              styles.p16,
              { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827', borderRadius: 12 }
            ]}>
              <View style={[
                styles.w48,
                styles.h48,
                styles.roundedFull,
                styles.alignCenter,
                styles.justifyCenter,
                { backgroundColor: '#f0f9ff' }
              ]}>
                <Battery size={24} color="#0ea5e9" />
              </View>
              <Text variant="caption" color="muted" style={styles.mt8}>
                {t('bike.battery')}
              </Text>
              <Text variant="body" weight="semibold" style={styles.mt4}>
                {ride.bike?.batteryLevel || '0'}%
              </Text>
            </View>
          </View>

          <View style={[{ backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151', marginVertical: 20 }]} />

          {/* Localisations */}
          <View style={styles.mb24}>
            <Text variant="subtitle" style={styles.mb16}>
              {t('ride.route')}
            </Text>
            
            <View style={{ position: 'relative' }}>
              <View style={styles.mb20}>
                <View style={[styles.row, styles.alignStart]}>
                  <View style={[
                    styles.w12,
                    styles.h12,
                    styles.roundedFull,
                    styles.mt4,
                    { backgroundColor: '#16a34a' }
                  ]} />
                  <View style={[styles.ml12, styles.flex1]}>
                    <Text variant="body" weight="semibold" style={styles.mb4}>
                      {new Date(ride.startTime).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <Text variant="caption" color="muted" style={styles.mb4}>
                      {t('ride.start')}
                    </Text>
                    <Text variant="caption" color={colorScheme === 'light' ? '#374151' : '#d1d5db'} numberOfLines={2}>
                      {startLocation}
                    </Text>
                  </View>
                </View>
              </View>

              {ride.endTime && ride.endLatitude && ride.endLongitude && (
                <>
                  <View style={[
                    styles.absolute,
                    { 
                      left: 5, 
                      top: 16, 
                      bottom: 16, 
                      width: 2,
                      backgroundColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563'
                    }
                  ]} />
                  
                  <View style={styles.mb20}>
                    <View style={[styles.row, styles.alignStart]}>
                      <View style={[
                        styles.w12,
                        styles.h12,
                        styles.roundedFull,
                        styles.mt4,
                        { backgroundColor: '#dc2626' }
                      ]} />
                      <View style={[styles.ml12, styles.flex1]}>
                        <Text variant="body" weight="semibold" style={styles.mb4}>
                          {new Date(ride.endTime).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Text variant="caption" color="muted" style={styles.mb4}>
                          {t('ride.end')}
                        </Text>
                        <Text variant="caption" color={colorScheme === 'light' ? '#374151' : '#d1d5db'} numberOfLines={2}>
                          {endLocation}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Informations de paiement */}
          <View style={styles.mb24}>
            <Text variant="subtitle" style={styles.mb16}>
              {t('ride.paymentDetails')}
            </Text>
            
            <View style={[
              styles.p16,
              styles.rounded12,
              { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827' }
            ]}>
              <View style={[styles.row, styles.spaceBetween, styles.py8]}>
                <Text variant="caption" color="muted">
                  {t('ride.baseCost')}
                </Text>
                <Text variant="caption" weight="medium">
                  {ride.cost?.toFixed(2) || '0.00'} {user?.wallet?.currency || 'XAF'}
                </Text>
              </View>
              
              <View style={[
                styles.row, 
                styles.spaceBetween, 
                styles.pt12, 
                styles.mt8,
                { borderTopWidth: 1, borderTopColor: '#e5e7eb' }
              ]}>
                <Text variant="body" weight="semibold">
                  {t('ride.total')}
                </Text>
                <Text variant="body" weight="bold" color="#16a34a">
                  {ride.cost?.toFixed(2) || '0.00'} {user?.wallet?.currency || 'XAF'}
                </Text>
              </View>
            </View>
          </View>

          {/* Bouton pour rapporter un problème */}
          {ride.status === 'COMPLETED' && (
            <TouchableOpacity
              style={[
                styles.row,
                styles.alignCenter,
                styles.justifyCenter,
                styles.py16,
                styles.rounded12,
                { 
                  backgroundColor: colorScheme === 'light' ? '#fffbeb' : '#78350f',
                  borderWidth: 1,
                  borderColor: colorScheme === 'light' ? '#fde68a' : '#d97706',
                  gap: 8 
                }
              ]}
              onPress={() => {
                router.navigate({
                  pathname: '/(modals)/report-issue',
                  params: {
                    rideId: ride.id,
                    bikeId: ride.bike?.id,
                  }
                });
              }}
            >
              <AlertTriangle size={20} color="#d97706" />
              <Text variant="body" weight="semibold" color="#d97706">
                {t('ride.reportIssue')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}