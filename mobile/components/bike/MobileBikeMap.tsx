import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { Slider } from '@/components/ui/Slider';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { bikeService } from '@/services/bikeService';
import type { Bike, Area } from '@/services/bikeService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { Battery, Building2, Filter, Home, MapPin, Navigation, Search, X, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, RefreshControl, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { MobileHeader } from '@/components/layout/MobileHeader';

interface MobileBikeMapProps {
  onNavigate: (screen: string, data?: unknown) => void;
}

export function MobileBikeMap({ onNavigate }: MobileBikeMapProps) {
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // États des filtres
  const [searchMode, setSearchMode] = useState<'proximity' | 'area'>('proximity');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(5);
  const [minBattery, setMinBattery] = useState<number>(0);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);

  const areaInputRef = useRef<any>(null);

  useEffect(() => {
    getUserLocation();
    loadAreas();
    loadBikes();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 4.0511, lng: 9.7679 }); // Douala par défaut
        }
      );
    } else {
      setUserLocation({ lat: 4.0511, lng: 9.7679 });
    }
  };

  const loadAreas = async () => {
    try {
      const defaultAreas = await bikeService.getDefaultAreas();
      setAreas(defaultAreas);
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const loadBikes = async () => {
    try {
      setIsLoading(true);
      const referenceLocation = searchMode === 'area' && searchLocation 
        ? searchLocation 
        : userLocation;

      const filters: any = {
        minBatteryLevel: minBattery,
      };

      if (referenceLocation) {
        filters.latitude = referenceLocation.lat;
        filters.longitude = referenceLocation.lng;
        filters.radius = maxDistance;
      }

      const result = await bikeService.getAvailableBikes(filters, 1, 50);
      setBikes(result.bikes || []);
    } catch (error) {
      console.error('Error loading bikes:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const referenceLocation = searchMode === 'area' && searchLocation 
    ? searchLocation 
    : userLocation;

  let filteredBikes = bikes;

  // Ajouter la distance pour chaque vélo
  if (referenceLocation) {
    filteredBikes = bikes.map(bike => ({
      ...bike,
      distance: bike.latitude && bike.longitude
        ? calculateDistance(referenceLocation.lat, referenceLocation.lng, bike.latitude, bike.longitude)
        : 999
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  // Filtre par recherche textuelle
  if (searchQuery) {
    filteredBikes = filteredBikes.filter(
      (bike) =>
        bike.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bike.locationName && bike.locationName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(areaSearchQuery.toLowerCase())
  );

  const applyAreaFilter = (area: Area) => {
    setSearchLocation({ lat: area.location.lat, lng: area.location.lng });
    setSelectedArea(area.key);
    setSearchMode('area');
    setShowAreaDropdown(false);
    setAreaSearchQuery('');
    haptics.selection();
    loadBikes();
  };

  const resetToProximity = () => {
    setSearchMode('proximity');
    setSearchLocation(null);
    setSelectedArea('');
    setShowAreaDropdown(false);
    setAreaSearchQuery('');
    haptics.light();
    loadBikes();
  };

  const hasActiveFilters = maxDistance !== 5 || minBattery !== 0 || searchMode === 'area';

  const resetAllFilters = () => {
    resetToProximity();
    setMaxDistance(5);
    setMinBattery(0);
    haptics.light();
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      setShowAreaDropdown(false);
      setShowFilters(false);
      Keyboard.dismiss();
    }}>
      <View style={styles.container}>
        <MobileHeader 
          title={t('nav.map')} 
          showNotifications
          notificationCount={2}
          onNotifications={() => {
            haptics.light();
            onNavigate('notifications');
          }}
        />

        {/* Filter Sheet */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side="bottom" style={{ height: '85%' }}>
            <SheetHeader>
              <SheetTitle>
                {t('map.filters.title')}
              </SheetTitle>
              <SheetDescription>
                {t('map.filters.description')}
              </SheetDescription>
            </SheetHeader>

            <View style={{ gap: 24, marginTop: 24 }}>
              {/* Mode de recherche */}
              <View style={{ gap: 12 }}>
                <Label>
                  {t('map.filters.searchMode')}
                </Label>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Button
                    variant={searchMode === 'proximity' ? 'primary' : 'secondary'}
                    onPress={resetToProximity}
                    style={{ flex: 1 }}
                  >
                    <Navigation size={16} color="currentColor" />
                    <Text style={styles.ml8}>
                      {t('map.filters.nearby')}
                    </Text>
                  </Button>
                  <Button
                    variant={searchMode === 'area' ? 'primary' : 'secondary'}
                    onPress={() => {
                      setSearchMode('area');
                      haptics.light();
                    }}
                    style={{ flex: 1 }}
                  >
                    <Building2 size={16} color="currentColor" />
                    <Text style={styles.ml8}>
                      {t('map.filters.byArea')}
                    </Text>
                  </Button>
                </View>
              </View>

              {/* Sélection de quartier */}
              {searchMode === 'area' && (
                <View style={{ gap: 12 }}>
                  <Label>
                    {t('map.filters.selectArea')}
                  </Label>
                  <View style={styles.relative}>
                    <TouchableOpacity
                      onPress={() => setShowAreaDropdown(true)}
                      style={[
                        styles.input,
                        { 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          paddingRight: 12,
                        }
                      ]}
                    >
                      <Text>
                        {selectedArea 
                          ? areas.find(a => a.key === selectedArea)?.name 
                          : t('map.filters.chooseArea')}
                      </Text>
                      <Home size={16} color="#9ca3af" />
                    </TouchableOpacity>

                    {showAreaDropdown && (
                      <View 
                        style={[
                          styles.absolute,
                          styles.card,
                          styles.shadowLg,
                          { 
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            marginTop: 4,
                            maxHeight: 200,
                          }
                        ]}
                      >
                        <View style={[styles.relative, { padding: 8 }]}>
                          <View style={[styles.absolute, { left: 20, top: 20, zIndex: 10 }]}>
                            <Search size={16} color="#9ca3af" />
                          </View>
                          <Input
                            ref={areaInputRef}
                            value={areaSearchQuery}
                            onChangeText={setAreaSearchQuery}
                            placeholder={t('map.filters.searchArea')}
                            style={{ paddingLeft: 40 }}
                          />
                        </View>

                        <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={false}>
                          {filteredAreas.length === 0 ? (
                            <View style={[styles.py12, styles.px16, styles.alignCenter]}>
                              <Text color="#6b7280">
                                {t('map.filters.noAreaFound')}
                              </Text>
                            </View>
                          ) : (
                            filteredAreas.map((area) => (
                              <TouchableOpacity
                                key={area.key}
                                onPress={() => applyAreaFilter(area)}
                                style={[
                                  styles.py12,
                                  styles.px16,
                                  { 
                                    borderBottomWidth: 1, 
                                    borderBottomColor: colors.border,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    backgroundColor: selectedArea === area.key ? colors.primary + '20' : 'transparent',
                                  }
                                ]}
                              >
                                <Home size={16} color={selectedArea === area.key ? colors.primary : colors.text} />
                                <Text color={selectedArea === area.key ? colors.primary : colors.text}>
                                  {area.name}
                                </Text>
                              </TouchableOpacity>
                            ))
                          )}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Distance et batterie */}
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Label>
                    {t('map.filters.maxDistance')}
                  </Label>
                  <Badge variant="secondary">
                    <Text>{maxDistance} km</Text>
                  </Badge>
                </View>
                <Slider
                  value={[maxDistance]}
                  onValueChange={(value: number[]) => setMaxDistance(value[0])}
                  min={0.5}
                  max={20}
                  step={0.5}
                />
              </View>

              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Label>
                    {t('map.filters.minBattery')}
                  </Label>
                  <Badge variant="secondary">
                    <Battery size={12} color="currentColor" />
                    <Text style={styles.ml4}>{minBattery}%</Text>
                  </Badge>
                </View>
                <Slider
                  value={[minBattery]}
                  onValueChange={(value: number[]) => setMinBattery(value[0])}
                  min={0}
                  max={100}
                  step={10}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, paddingTop: 16 }}>
                <Button 
                  variant="secondary" 
                  onPress={resetAllFilters}
                  style={{ flex: 1 }}
                >
                  <X size={16} color="currentColor" />
                  <Text style={styles.ml8}>{t('common.reset')}</Text>
                </Button>
                <Button 
                  variant="primary"
                  onPress={() => {
                    setShowFilters(false);
                    loadBikes();
                    haptics.success();
                  }}
                  style={{ flex: 1 }}
                >
                  <Filter size={16} color="currentColor" />
                  <Text style={styles.ml8}>{t('common.apply')}</Text>
                </Button>
              </View>
            </View>
          </SheetContent>
        </Sheet>

        <View style={styles.relative}>
          {/* Map Placeholder */}
          <View 
            style={[
              styles.wT100,
              { height: 300, backgroundColor: colorScheme === 'light' ? '#f0f9ff' : '#0c4a6e' }
            ]}
          >
            <View style={[styles.absolute, { top: 0, left: 0, right: 0, bottom: 0 }, styles.alignCenter, styles.justifyCenter]}>
              <View 
                style={[
                  styles.alignCenter,
                  { gap: 16, padding: 24 },
                  styles.rounded12,
                  { backgroundColor: 'rgba(255,255,255,0.9)' }
                ]}
              >
                {searchMode === 'area' && selectedArea ? (
                  <Building2 size={48} color="#16a34a" />
                ) : (
                  <MapPin size={48} color="#16a34a" />
                )}
                <Text variant="body" color="#111827" align="center">
                  {searchMode === 'area' && selectedArea
                    ? areas.find(a => a.key === selectedArea)?.name
                    : t('map.interactive')}
                </Text>
                <Text size="sm" color="#6b7280" align="center">
                  {`${t('map.available')} ${filteredBikes.length}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Map Controls */}
          <View style={[styles.absolute, { top: 16, right: 16 }, { gap: 8 }]}>
            <TouchableOpacity
              onPress={() => {
                getUserLocation();
                haptics.light();
              }}
              style={[
                { width: 48, height: 48 },
                styles.rounded24,
                styles.alignCenter,
                styles.justifyCenter,
                styles.shadow,
                {
                  backgroundColor: colorScheme === 'light' ? 'white' : '#374151',
                }
              ]}
            >
              <Navigation size={20} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                setShowFilters(!showFilters);
              }}
              style={[
                { width: 48, height: 48 },
                styles.rounded24,
                styles.alignCenter,
                styles.justifyCenter,
                styles.shadow,
                {
                  backgroundColor: hasActiveFilters
                    ? '#16a34a'
                    : (colorScheme === 'light' ? 'white' : '#374151'),
                }
              ]}
            >
              <Filter 
                size={20} 
                color={hasActiveFilters
                  ? 'white'
                  : (colorScheme === 'light' ? '#111827' : '#f9fafb')
                } 
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.absolute, { top: 16, left: 16, right: 80 }]}>
            <View style={styles.relative}>
              <View style={[styles.absolute, { left: 12, top: 14, zIndex: 10 }]}>
                <Search size={20} color="#9ca3af" />
              </View>
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('map.searchPlaceholder')}
                style={[{ paddingLeft: 44 }, styles.shadow]}
              />
            </View>
          </View>
        </View>

        {/* Bike List */}
        <ScrollView 
          style={styles.flex1}
          contentContainerStyle={[styles.scrollContentPadded, { gap: 16 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadBikes}
              colors={['#16a34a']}
              tintColor="#16a34a"
            />
          }
        >
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {searchMode === 'area' && selectedArea
                ? `${t('map.bikesInArea')} ${areas.find(a => a.key === selectedArea)?.name}`
                : t('map.nearbyBikes')}
            </Text>
            <Badge variant="secondary">
              <Text>{filteredBikes.length} {t('map.available')}</Text>
            </Badge>
          </View>

          <View style={{ gap: 12 }}>
            {filteredBikes.length === 0 ? (
              <View style={[styles.card, { padding: 32 }, styles.alignCenter]}>
                <View style={[styles.alignCenter, { gap: 16 }]}>
                  <View 
                    style={[
                      { width: 64, height: 64 },
                      styles.rounded24,
                      styles.alignCenter,
                      styles.justifyCenter,
                      { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }
                    ]}
                  >
                    <Search size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} />
                  </View>
                  <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
                    {t('map.noBikesFound')}
                  </Text>
                  <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mb16, { textAlign: 'center' }]}>
                    {t('map.adjustFilters')}
                  </Text>
                  <Button onPress={() => setShowFilters(true)} variant="secondary">
                    <Text>{t('map.modifyFilters')}</Text>
                  </Button>
                </View>
              </View>
            ) : (
              filteredBikes.map((bike) => (
                <TouchableOpacity
                  key={bike.id}
                  onPress={() => {
                    haptics.light();
                    onNavigate('bike-details', bike);
                  }}
                >
                  <View style={[styles.card, { padding: 16 }]}>
                    <View style={[styles.row, { gap: 12 }]}>
                      <View 
                        style={[
                          { width: 48, height: 48 },
                          styles.rounded12,
                          styles.alignCenter,
                          styles.justifyCenter,
                          { backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#14532d' }
                        ]}
                      >
                        <Zap size={24} color="#16a34a" />
                      </View>

                      <View style={styles.flex1}>
                        <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb4]}>
                          <View>
                            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                              {bike.code}
                            </Text>
                            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                              {bike.model}
                            </Text>
                          </View>
                          <Badge variant={bike.batteryLevel > 50 ? 'default' : 'secondary'}>
                            <Battery size={12} color={bike.batteryLevel > 50 ? 'white' : '#111827'} />
                            <Text style={styles.ml4} color={bike.batteryLevel > 50 ? 'white' : '#111827'}>
                              {bike.batteryLevel}%
                            </Text>
                          </Badge>
                        </View>

                        <View style={[styles.row, { gap: 16 }, styles.mb8]}>
                          <View style={[styles.row, styles.alignCenter, { gap: 4 }]}>
                            <MapPin size={16} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                              {bike.distance ? `${bike.distance.toFixed(1)} km` : '--'}
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                          <Text size="sm" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                            {bike.currentPricing 
                              ? `${bike.currentPricing.hourlyRate} XOF/h`
                              : t('map.priceUnavailable')}
                          </Text>
                          <Button
                            size="sm"
                            variant="primary"
                            onPress={(e) => {
                              e?.stopPropagation?.();
                              haptics.success();
                              onNavigate('bike-details', bike);
                            }}
                          >
                            <Text color="white">{t('map.unlock')}</Text>
                          </Button>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}