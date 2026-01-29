/* eslint-disable react-hooks/exhaustive-deps */
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Text } from '@/components/ui/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { Calendar, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { rideService } from '@/services/rideService';
import type { Ride, RideStats } from '@/lib/mobile-types';
import { MobileHeader } from '@/components/layout/MobileHeader';

interface MobileRideHistoryProps {
  onRideDetails: (ride: Ride) => void;
  onNavigate?: (screen: string) => void;
}

export function MobileRideHistory({ onRideDetails, onNavigate }: MobileRideHistoryProps) {
  const { t, language } = useMobileI18n();
  const { user } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'COMPLETED' | 'CANCELLED'>('all');
  const [rides, setRides] = useState<Ride[]>([]);
  const [stats, setStats] = useState<RideStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadRides(true);
    loadStats();
  }, [selectedFilter]);

  const loadRides = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setRides([]);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }
      
      const page = reset ? 1 : pagination.page + 1;
      const filters = {
        page,
        limit: pagination.limit,
        ...(selectedFilter !== 'all' && { status: selectedFilter })
      };

      const result = await rideService.getUserRides(filters);
      
      if (reset) {
        setRides(result.rides);
      } else {
        setRides(prev => [...prev, ...result.rides]);
      }
      
      setPagination(result.pagination);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'ride.loadError';
      setError(errorMessage);
      console.error('Failed to load rides:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const rideStats = await rideService.getRideStats();
      setStats(rideStats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRides(true);
    loadStats();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'fr' ? 'fr-FR' : 'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="default" style={{ backgroundColor: '#16a34a' }}>
            {t('ride.completed')}
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="secondary">
            {t('ride.cancelled')}
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge style={{ backgroundColor: '#2563eb' }}>
            {t('ride.inProgress')}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading && rides.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827' }]}>
        <MobileHeader title={t('ride.history')} />
        <View style={[styles.flex1, styles.justifyCenter, styles.alignCenter]}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={[styles.mt16, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
            {t('ride.loadingHistory')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'light' ? '#f9fafb' : '#111827' }]}>
      <MobileHeader 
        title={t('ride.history')}
        showNotifications
        notificationCount={2}
        onNotifications={() => {
          haptics.light();
          onNavigate?.('notifications');
        }}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContentPadded, { paddingVertical: 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#16a34a"
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          
          if (isCloseToBottom && !isLoadingMore && pagination.page < pagination.totalPages) {
            loadRides(false);
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Stats Summary */}
        {stats && (
          <View style={[styles.row, styles.gap12, styles.mb24]}>
            <Card style={[styles.flex1, styles.alignCenter, styles.p16]}>
              <MapPin size={20} color="#7c3aed" style={styles.mb8} />
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
                {t('ride.totalDistance')}
              </Text>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {stats.totalDistance} km
              </Text>
            </Card>

            <Card style={[styles.flex1, styles.alignCenter, styles.p16]}>
              <Clock size={20} color="#2563eb" style={styles.mb8} />
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
                {t('ride.totalTime')}
              </Text>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {stats.totalDuration} {t('common.minutes')}
              </Text>
            </Card>

            <Card style={[styles.flex1, styles.alignCenter, styles.p16]}>
              <Calendar size={20} color="#16a34a" style={styles.mb8} />
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
                {t('ride.totalSpent')}
              </Text>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {stats.totalCost} {user?.wallet?.currency || 'XAF'}
              </Text>
            </Card>
          </View>
        )}

        {/* Filters */}
        <Tabs value={selectedFilter} onValueChange={(v) => setSelectedFilter(v as typeof selectedFilter)}>
          <TabsList>
            <TabsTrigger value="all">
              {t('ride.filterAll')}
            </TabsTrigger>
            <TabsTrigger value="COMPLETED">
              {t('ride.filterCompleted')}
            </TabsTrigger>
            <TabsTrigger value="CANCELLED">
              {t('ride.filterCancelled')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedFilter}>
            <View style={[styles.gap12, styles.mt16]}>
              {error ? (
                <Card style={[styles.p32, styles.alignCenter]}>
                  <Text variant="body" color="#ef4444" style={styles.mb12}>
                    {t(error)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => loadRides(true)}
                    style={[styles.p12, { backgroundColor: '#16a34a', borderRadius: 8 }]}
                  >
                    <Text style={{ color: 'white', fontWeight: '500' }}>
                      {t('common.retry')}
                    </Text>
                  </TouchableOpacity>
                </Card>
              ) : rides.length > 0 ? (
                <>
                  {rides.map((ride) => (
                    <TouchableOpacity
                      key={ride.id}
                      onPress={() => {
                        haptics.light();
                        onRideDetails(ride);
                      }}
                    >
                      <Card style={styles.p16}>
                        <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb12]}>
                          <View style={styles.flex1}>
                            <Text 
                              variant="body" 
                              color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                              style={styles.mb4}
                            >
                              {ride.bike?.code || t('ride.unknownBike')}
                            </Text>
                            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                              {formatDate(ride.startTime)}
                            </Text>
                          </View>
                          {getStatusBadge(ride.status)}
                        </View>

                        <View style={[styles.row, styles.alignCenter, styles.gap16, styles.mb12]}>
                          <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                            <Clock size={16} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                              {ride.duration || 0} {t('common.minutes')}
                            </Text>
                          </View>
                          <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                            <MapPin size={16} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                              {ride.distance?.toFixed(2) || '0.0'} km
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.pt12, { borderTopWidth: 1, borderTopColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }]}>
                          <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                            <View style={styles.flex1}>
                              <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                                {t('ride.startLocation')}
                              </Text>
                              <Text 
                                size="sm" 
                                color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                                numberOfLines={1}
                                style={{ maxWidth: 180 }}
                              >
                                {ride.bike?.locationName || t('ride.unknownLocation')}
                              </Text>
                            </View>
                            <View>
                              <Text variant="body" color="#16a34a">
                                {ride.cost?.toFixed(2) || '0.00'} {user?.wallet?.currency || 'XAF'}
                              </Text>
                            </View>
                          </View>

                          <View style={[styles.row, { justifyContent: 'flex-end' }, styles.mt8]}>
                            <ChevronRight size={20} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} />
                          </View>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  ))}

                  {/* Load More Button */}
                  {isLoadingMore && (
                    <View style={[styles.p16, styles.alignCenter]}>
                      <ActivityIndicator size="small" color="#16a34a" />
                      <Text style={[styles.mt8, { color: colorScheme === 'light' ? '#6b7280' : '#9ca3af' }]}>
                        {t('ride.loadingMore')}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <Card style={[styles.p32, styles.alignCenter]}>
                  <Calendar size={48} color={colorScheme === 'light' ? '#d1d5db' : '#4b5563'} style={styles.mb12} />
                  <Text variant="body" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                    {t('ride.noRidesInCategory')}
                  </Text>
                </Card>
              )}
            </View>
          </TabsContent>
        </Tabs>

        {/* Month Summary */}
        {stats && stats.totalRides > 0 && (
          <Card style={[
            styles.p16, 
            styles.mt24,
            { 
              backgroundColor: colorScheme === 'light' 
                ? 'rgba(240, 253, 244, 0.8)' 
                : 'rgba(6, 78, 59, 0.3)'
            }
          ]}>
            <Text 
              variant="subtitle" 
              color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
              style={styles.mb12}
            >
              {t('ride.monthSummary')}
            </Text>
            <View style={[styles.row, styles.spaceBetween]}>
              <View>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {t('ride.numberOfRides')}
                </Text>
                <Text variant="title" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} size="xl">
                  {stats.totalRides}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {t('ride.totalSpent')}
                </Text>
                <Text variant="title" color="#16a34a" size="xl">
                  {stats.totalCost} <Text size="sm">{user?.wallet?.currency || 'XAF'}</Text>
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}