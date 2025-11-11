// components/mobile/MobileBikeMap.tsx
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
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { Battery, Building2, Filter, Home, MapPin, MapPinned, Navigation, Search, X, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useMobileI18n } from '../../lib/mobile-i18n';
import { mockBikes } from '../../lib/mobile-mock-data';
import type { Bike } from '../../lib/mobile-types';
import { MobileHeader } from '../layout/MobileHeader';

interface MobileBikeMapProps {
  onNavigate: (screen: string, data?: unknown) => void;
}

// Quartiers et villes d'Abidjan
const areaLocations: Record<string, { lat: number; lng: number; name: string }> = {
  'plateau': { lat: 5.3216, lng: -4.0114, name: 'Plateau' },
  'cocody': { lat: 5.3600, lng: -3.9800, name: 'Cocody' },
  'yopougon': { lat: 5.3458, lng: -4.0892, name: 'Yopougon' },
  'adjame': { lat: 5.3658, lng: -4.0217, name: 'Adjamé' },
  'treichville': { lat: 5.2833, lng: -3.9667, name: 'Treichville' },
  'marcory': { lat: 5.2800, lng: -3.9900, name: 'Marcory' },
  'koumassi': { lat: 5.2900, lng: -3.9300, name: 'Koumassi' },
  'abobo': { lat: 5.4167, lng: -4.0167, name: 'Abobo' },
  'attécoubé': { lat: 5.3333, lng: -4.0500, name: 'Attécoubé' },
  'port-bouët': { lat: 5.2500, lng: -3.9167, name: 'Port-Bouët' },
};

export function MobileBikeMap({ onNavigate }: MobileBikeMapProps) {
  const { t, language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [bikes, setBikes] = useState<Bike[]>(mockBikes);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState('');
  
  // États des filtres
  const [searchMode, setSearchMode] = useState<'proximity' | 'area'>('proximity');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(5); // km
  const [minBattery, setMinBattery] = useState<number>(0); // %
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);

  const areaInputRef = useRef<any>(null);
  const areaDropdownRef = useRef<View>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Silently use default location (Abidjan) when geolocation is not available
          setUserLocation({ lat: 5.345317, lng: -4.024429 });
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      // Use default location
      setUserLocation({ lat: 5.345317, lng: -4.024429 });
    }
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Déterminer la position de référence pour la recherche
  const referenceLocation = searchMode === 'area' && searchLocation 
    ? searchLocation 
    : userLocation;

  const availableBikes = bikes.filter((bike) => bike.status === 'available');

  const bikesWithDistance = availableBikes.map((bike) => ({
    ...bike,
    distance: referenceLocation
      ? calculateDistance(
          referenceLocation.lat,
          referenceLocation.lng,
          bike.location.lat,
          bike.location.lng
        )
      : 0,
  })).sort((a, b) => a.distance - b.distance);

  // Appliquer tous les filtres
  let filteredBikes = bikesWithDistance;
  
  // Filtre par batterie minimum
  filteredBikes = filteredBikes.filter((bike) => bike.battery >= minBattery);
  
  // Filtre par distance maximum
  filteredBikes = filteredBikes.filter((bike) => bike.distance <= maxDistance);
  
  // Filtre par recherche textuelle
  if (searchQuery) {
    filteredBikes = filteredBikes.filter(
      (bike) =>
        bike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.location.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filtrer les quartiers par recherche
  const filteredAreas = Object.entries(areaLocations).filter(([key, area]) =>
    area.name.toLowerCase().includes(areaSearchQuery.toLowerCase())
  );

  const centerOnUser = () => {
    if (userLocation) {
      haptics.light();
      toast.success(
        language === 'fr'
          ? 'Centrage sur votre position...'
          : 'Centering on your location...'
      );
    }
  };

  const applyAreaFilter = (areaKey: string) => {
    if (areaKey && areaLocations[areaKey]) {
      const area = areaLocations[areaKey];
      setSearchLocation({ lat: area.lat, lng: area.lng });
      setSelectedArea(areaKey);
      setSearchMode('area');
      setShowAreaDropdown(false);
      setAreaSearchQuery('');
      haptics.selection();
    }
  };

  const resetToProximity = () => {
    setSearchMode('proximity');
    setSearchLocation(null);
    setSelectedArea('');
    setShowAreaDropdown(false);
    setAreaSearchQuery('');
    haptics.light();
  };

  const getSearchModeLabel = () => {
    if (searchMode === 'area' && selectedArea) {
      return areaLocations[selectedArea]?.name || (language === 'fr' ? 'Zone sélectionnée' : 'Selected area');
    }
    return language === 'fr' ? 'À proximité' : 'Nearby';
  };

  const hasActiveFilters = maxDistance !== 5 || minBattery !== 0 || searchMode === 'area'; // Changé à 0%

  const resetAllFilters = () => {
    resetToProximity();
    setMaxDistance(5);
    setMinBattery(0); // Changé à 0%
    haptics.light();
  };

  const handleOutsideClick = () => {
    setShowAreaDropdown(false);
    setShowFilters(false);
    Keyboard.dismiss();
  };

  const openAreaDropdown = () => {
    setShowAreaDropdown(true);
    setTimeout(() => {
      areaInputRef.current?.focus();
    }, 100);
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsideClick}>
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
                {language === 'fr' ? 'Filtres de recherche' : 'Search Filters'}
              </SheetTitle>
              <SheetDescription>
                {language === 'fr' 
                  ? 'Personnalisez votre recherche de vélos' 
                  : 'Customize your bike search'}
              </SheetDescription>
            </SheetHeader>

            <View style={{ gap: 24, marginTop: 24 }}>
              {/* Mode de recherche */}
              <View style={{ gap: 12 }}>
                <Label>
                  {language === 'fr' ? 'Mode de recherche' : 'Search Mode'}
                </Label>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Button
                    variant={searchMode === 'proximity' ? 'primary' : 'secondary'}
                    onPress={resetToProximity}
                    style={{ flex: 1 }}
                  >
                    <MapPinned size={16} color="currentColor" />
                    <Text style={styles.ml8}>
                      {language === 'fr' ? 'À proximité' : 'Nearby'}
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
                      {language === 'fr' ? 'Par quartier' : 'By Area'}
                    </Text>
                  </Button>
                </View>
              </View>

              {/* Sélection de quartier avec dropdown amélioré */}
              {searchMode === 'area' && (
                <View style={{ gap: 12 }}>
                  <Label>
                    {language === 'fr' ? 'Sélectionner un quartier' : 'Select an Area'}
                  </Label>
                  <View ref={areaDropdownRef} style={styles.relative}>
                    <TouchableOpacity
                      onPress={openAreaDropdown}
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
                        {selectedArea ? areaLocations[selectedArea].name : (language === 'fr' ? 'Choisir un quartier...' : 'Choose an area...')}
                      </Text>
                      <Home size={16} color="#9ca3af" />
                    </TouchableOpacity>

                    {/* Dropdown pour les quartiers */}
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
                        {/* Barre de recherche dans le dropdown */}
                        <View style={[styles.relative, { padding: 8 }]}>
                          <View style={[styles.absolute, { left: 20, top: 20, zIndex: 10 }]}>
                            <Search size={16} color="#9ca3af" />
                          </View>
                          <Input
                            ref={areaInputRef}
                            value={areaSearchQuery}
                            onChangeText={setAreaSearchQuery}
                            placeholder={language === 'fr' ? 'Rechercher un quartier...' : 'Search for an area...'}
                            style={{ paddingLeft: 40 }}
                          />
                        </View>

                        <ScrollView 
                          style={{ maxHeight: 150 }}
                          showsVerticalScrollIndicator={false}
                        >
                          {filteredAreas.length === 0 ? (
                            <View style={[styles.py12, styles.px16, styles.alignCenter]}>
                              <Text color="#6b7280">
                                {language === 'fr' ? 'Aucun quartier trouvé' : 'No area found'}
                              </Text>
                            </View>
                          ) : (
                            filteredAreas.map(([key, area]) => (
                              <TouchableOpacity
                                key={key}
                                onPress={() => applyAreaFilter(key)}
                                style={[
                                  styles.py12,
                                  styles.px16,
                                  { 
                                    borderBottomWidth: 1, 
                                    borderBottomColor: colors.border,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    backgroundColor: selectedArea === key ? colors.primary + '20' : 'transparent',
                                  }
                                ]}
                              >
                                <Home size={16} color={selectedArea === key ? colors.primary : colors.text} />
                                <Text color={selectedArea === key ? colors.primary : colors.text}>
                                  {area.name}
                                </Text>
                              </TouchableOpacity>
                            ))
                          )}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                  
                  {selectedArea && (
                    <Text size="sm" color="#16a34a">
                      {language === 'fr' 
                        ? `Recherche dans le quartier ${areaLocations[selectedArea].name}` 
                        : `Searching in ${areaLocations[selectedArea].name} area`}
                    </Text>
                  )}
                </View>
              )}

              {/* Distance maximale - 0 à 20km */}
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Label>
                    {language === 'fr' ? 'Distance maximale' : 'Maximum Distance'}
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
                <View style={[styles.row, styles.spaceBetween]}>
                  <Text size="sm" color="#6b7280">0.5 km</Text>
                  <Text size="sm" color="#6b7280">20 km</Text>
                </View>
              </View>

              {/* Batterie minimale - 0% à 100% */}
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Label>
                    {language === 'fr' ? 'Batterie minimale' : 'Minimum Battery'}
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
                <View style={[styles.row, styles.spaceBetween]}>
                  <Text size="sm" color="#6b7280">0%</Text>
                  <Text size="sm" color="#6b7280">100%</Text>
                </View>
              </View>

              {/* Boutons d'action */}
              <View style={{ flexDirection: 'row', gap: 12, paddingTop: 16 }}>
                <Button 
                  variant="secondary" 
                  onPress={resetAllFilters}
                  style={{ flex: 1 }}
                >
                  <X size={16} color="currentColor" />
                  <Text style={styles.ml8}>
                    {language === 'fr' ? 'Réinitialiser' : 'Reset'}
                  </Text>
                </Button>
                <Button 
                  variant="primary"
                  onPress={() => {
                    setShowFilters(false);
                    haptics.success();
                  }}
                  style={{ flex: 1 }}
                >
                  <Filter size={16} color="currentColor" />
                  <Text style={styles.ml8}>
                    {language === 'fr' ? 'Appliquer' : 'Apply'}
                  </Text>
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
            {/* Map visualization placeholder */}
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
                    ? areaLocations[selectedArea].name
                    : (language === 'fr' ? 'Carte Interactive' : 'Interactive Map')}
                </Text>
                <Text size="sm" color="#6b7280" align="center">
                  {language === 'fr'
                    ? `${filteredBikes.length} vélos disponibles`
                    : `${filteredBikes.length} bikes available`}
                </Text>
                {searchMode === 'area' && selectedArea && (
                  <Badge variant="default">
                    <Text color="white">
                      {language === 'fr' ? 'Zone de recherche' : 'Search area'}
                    </Text>
                  </Badge>
                )}
              </View>
            </View>

            {/* Mock bike markers */}
            {filteredBikes.slice(0, 5).map((bike, index) => (
              <TouchableOpacity
                key={bike.id}
                onPress={() => {
                  haptics.selection();
                  setSelectedBike(bike);
                }}
                style={[
                  styles.absolute,
                  { width: 48, height: 48 },
                  styles.rounded24,
                  styles.alignCenter,
                  styles.justifyCenter,
                  styles.shadow,
                  { 
                    backgroundColor: '#16a34a',
                    top: `${20 + index * 15}%`,
                    left: `${30 + index * 10}%`,
                  }
                ]}
              >
                <Zap size={20} color="white" />
              </TouchableOpacity>
            ))}

            {/* User location marker */}
            {userLocation && (
              <View
                style={[
                  styles.absolute,
                  { width: 16, height: 16 },
                  styles.rounded8,
                  styles.shadow,
                  {
                    backgroundColor: '#3b82f6',
                    borderWidth: 2,
                    borderColor: 'white',
                    top: '50%',
                    left: '50%',
                    marginTop: -8,
                    marginLeft: -8,
                  }
                ]}
              />
            )}
          </View>

          {/* Map Controls */}
          <View style={[styles.absolute, { top: 16, right: 16 }, { gap: 8 }]}>
            <TouchableOpacity
              onPress={centerOnUser}
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
            <View style={styles.relative}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
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
              {hasActiveFilters && (
                <View 
                  style={[
                    styles.absolute,
                    { width: 16, height: 16 },
                    styles.rounded8,
                    { 
                      backgroundColor: '#ef4444',
                      borderWidth: 2,
                      borderColor: 'white',
                      top: -4,
                      right: -4
                    }
                  ]}
                />
              )}
            </View>
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
                placeholder={
                  language === 'fr' ? 'Rechercher un vélo...' : 'Search for a bike...'
                }
                style={[
                  { paddingLeft: 44 },
                  styles.shadow,
                ]}
              />
            </View>
          </View>
        </View>

        {/* Bike List */}
        <ScrollView 
          style={styles.flex1}
          contentContainerStyle={[styles.scrollContentPadded, { gap: 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
            <View>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {searchMode === 'area' && selectedArea
                  ? (language === 'fr' 
                      ? `Vélos dans ${areaLocations[selectedArea].name}` 
                      : `Bikes in ${areaLocations[selectedArea].name}`)
                  : (language === 'fr' ? 'Vélos à proximité' : 'Nearby Bikes')}
              </Text>
              {hasActiveFilters && (
                <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mt4}>
                  {language === 'fr' ? 'Filtres actifs' : 'Filters active'}
                </Text>
              )}
            </View>
            <Badge variant="secondary">
              <Text>{filteredBikes.length} {language === 'fr' ? 'disponibles' : 'available'}</Text>
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
                  <View style={styles.alignCenter}>
                    <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
                      {language === 'fr' 
                        ? 'Aucun vélo trouvé' 
                        : 'No bikes found'}
                    </Text>
                    <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mb16, { textAlign: 'center' }]}>
                      {language === 'fr' 
                        ? 'Essayez de modifier vos filtres de recherche' 
                        : 'Try adjusting your search filters'}
                    </Text>
                    <Button 
                      onPress={() => {
                        haptics.light();
                        setShowFilters(true);
                      }}
                      variant="secondary"
                    >
                      <Text>
                        {language === 'fr' ? 'Modifier les filtres' : 'Adjust Filters'}
                      </Text>
                    </Button>
                  </View>
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
                  <View 
                    style={[
                      styles.card,
                      { padding: 16 },
                      selectedBike?.id === bike.id && { borderWidth: 2, borderColor: '#16a34a' }
                    ]}
                  >
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
                              {bike.name}
                            </Text>
                            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                              {bike.model}
                            </Text>
                          </View>
                          <Badge variant={bike.battery > 50 ? 'default' : 'secondary'}>
                            <Battery size={12} color={bike.battery > 50 ? 'white' : '#111827'} />
                            <Text style={styles.ml4} color={bike.battery > 50 ? 'white' : '#111827'}>
                              {bike.battery}%
                            </Text>
                          </Badge>
                        </View>

                        <View style={[styles.row, { gap: 16 }, styles.mb8]}>
                          <View style={[styles.row, styles.alignCenter, { gap: 4 }]}>
                            <MapPin size={16} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                              {bike.distance.toFixed(1)} km
                            </Text>
                          </View>
                          <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} numberOfLines={1} style={styles.flex1}>
                            {bike.location.address}
                          </Text>
                        </View>

                        <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
                          <Text size="sm" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                            {bike.pricePerMinute} {language === 'fr' ? 'XOF/min' : 'XOF/min'}
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