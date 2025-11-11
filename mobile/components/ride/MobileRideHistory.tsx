// components/mobile/MobileRideHistory.tsx
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Text } from '@/components/ui/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { Calendar, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileAuth } from '../../lib/mobile-auth';
import { useMobileI18n } from '../../lib/mobile-i18n';
import { mockRides } from '../../lib/mobile-mock-data';
import type { Ride } from '../../lib/mobile-types';
import { MobileHeader } from '../layout/MobileHeader';

interface MobileRideHistoryProps {
  onRideDetails: (ride: Ride) => void;
  onNavigate?: (screen: string) => void;
}

export function MobileRideHistory({ onRideDetails, onNavigate }: MobileRideHistoryProps) {
  const { t, language } = useMobileI18n();
  const { user } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const filteredRides = selectedFilter === 'all'
    ? mockRides
    : mockRides.filter((ride) => ride.status === selectedFilter);

  const totalDistance = mockRides.reduce((acc, ride) => acc + ride.distance, 0);
  const totalDuration = mockRides.reduce((acc, ride) => acc + ride.duration, 0);
  const totalCost = mockRides.reduce((acc, ride) => acc + ride.cost, 0);

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
      >
        {/* Stats Summary */}
        <View style={[styles.row, styles.gap12, styles.mb24]}>
          <Card style={[styles.flex1, styles.alignCenter, styles.p16]}>
            <MapPin size={20} color="#7c3aed" style={styles.mb8} />
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
              {language === 'fr' ? 'Distance' : 'Distance'}
            </Text>
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {totalDistance.toFixed(1)} km
            </Text>
          </Card>

          <Card style={[styles.flex1, styles.alignCenter, styles.p16]}>
            <Clock size={20} color="#2563eb" style={styles.mb8} />
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
              {language === 'fr' ? 'Temps' : 'Time'}
            </Text>
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {totalDuration} min
            </Text>
          </Card>

          <Card style={[styles.flex1, styles.alignCenter, styles.p16]}>
            <Calendar size={20} color="#16a34a" style={styles.mb8} />
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb4}>
              {language === 'fr' ? 'Dépenses' : 'Spent'}
            </Text>
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {totalCost} {user?.wallet.currency}
            </Text>
          </Card>
        </View>

        {/* Filters */}
        <Tabs value={selectedFilter} onValueChange={(v) => setSelectedFilter(v as typeof selectedFilter)}>
          <TabsList>
            <TabsTrigger value="all">
              {language === 'fr' ? 'Tous' : 'All'}
            </TabsTrigger>
            <TabsTrigger value="completed">
              {language === 'fr' ? 'Terminés' : 'Completed'}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              {language === 'fr' ? 'Annulés' : 'Cancelled'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedFilter}>
            <View style={[styles.gap12, styles.mt16]}>
              {filteredRides.length > 0 ? (
                filteredRides.map((ride) => (
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
                            {ride.bikeName}
                          </Text>
                          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                            {new Date(ride.startTime).toLocaleDateString(
                              language === 'fr' ? 'fr-FR' : 'en-US',
                              {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </Text>
                        </View>
                        <Badge
                          variant={ride.status === 'completed' ? 'default' : 'secondary'}
                          style={ride.status === 'completed' ? { backgroundColor: '#16a34a' } : {}}
                        >
                          {ride.status === 'completed' ? t('ride.completed') : t('ride.cancelled')}
                        </Badge>
                      </View>

                      <View style={[styles.row, styles.alignCenter, styles.gap16, styles.mb12]}>
                        <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                          <Clock size={16} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                            {ride.duration} min
                          </Text>
                        </View>
                        <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                          <MapPin size={16} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                            {ride.distance} km
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.pt12, { borderTopWidth: 1, borderTopColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }]}>
                        <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                          <View style={styles.flex1}>
                            <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                              {language === 'fr' ? 'De' : 'From'}
                            </Text>
                            <Text 
                              size="sm" 
                              color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                              numberOfLines={1}
                              style={{ maxWidth: 180 }}
                            >
                              {ride.startLocation.address}
                            </Text>
                          </View>
                          <View>
                            <Text variant="body" color="#16a34a">
                              {ride.cost} {user?.wallet.currency}
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.row, { justifyContent: 'flex-end' }, styles.mt8]}>
                          <ChevronRight size={20} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} />
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))
              ) : (
                <Card style={[styles.p32, styles.alignCenter]}>
                  <Calendar size={48} color={colorScheme === 'light' ? '#d1d5db' : '#4b5563'} style={styles.mb12} />
                  <Text variant="body" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                    {language === 'fr'
                      ? 'Aucun trajet dans cette catégorie'
                      : 'No rides in this category'}
                  </Text>
                </Card>
              )}
            </View>
          </TabsContent>
        </Tabs>

        {/* Month Summary */}
        {mockRides.length > 0 && (
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
              {language === 'fr' ? 'Ce mois-ci' : 'This Month'}
            </Text>
            <View style={[styles.row, styles.spaceBetween]}>
              <View>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {language === 'fr' ? 'Nombre de trajets' : 'Number of rides'}
                </Text>
                <Text variant="title" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} size="xl">
                  {mockRides.length}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {language === 'fr' ? 'Dépense totale' : 'Total spent'}
                </Text>
                <Text variant="title" color="#16a34a" size="xl">
                  {totalCost} <Text size="sm">{user?.wallet.currency}</Text>
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}