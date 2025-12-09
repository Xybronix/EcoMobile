import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Circle, UrlTile } from 'react-native-maps';

// Définir le type Bike compatible avec votre service
interface Bike {
  id: string;
  latitude: number | null;
  longitude: number | null;
  batteryLevel: number;
  code: string;
  distance?: number;
  model?: string;
  locationName?: string;
}

interface OSMMapProps {
  userLocation?: { lat: number; lng: number } | null;
  bikes: Bike[];
  radius: number;
}

export function OSMMap({ userLocation, bikes, radius }: OSMMapProps) {
  const mapRef = useRef<MapView>(null);
  
  // URL OSM gratuite
  const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  
  // Filtrer les vélos avec coordonnées valides
  const bikesWithCoords = bikes.filter(b => 
    b.latitude !== null && 
    b.longitude !== null &&
    !isNaN(b.latitude) && 
    !isNaN(b.longitude)
  );
  
  // Coordonnées par défaut (Douala)
  const defaultLocation = {
    latitude: 4.0511,
    longitude: 9.7679,
  };
  
  // Centrer la carte
  useEffect(() => {
    if (userLocation && mapRef.current && userLocation.lat && userLocation.lng) {
      mapRef.current.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: Math.max(radius * 0.02, 0.01),
        longitudeDelta: Math.max(radius * 0.02, 0.01),
      }, 1000);
    }
  }, [userLocation, radius]);

  // Déterminer la région initiale
  const initialRegion = userLocation?.lat && userLocation?.lng 
    ? {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: defaultLocation.latitude,
        longitude: defaultLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={true}
        showsCompass={true}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
      >
        {/* Tuiles OSM */}
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
          flipY={false}
          zIndex={-1}
        />

        {/* Cercle de rayon */}
        {userLocation?.lat && userLocation?.lng && radius > 0 && (
          <Circle
            center={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
            radius={radius * 1000}
            strokeWidth={1}
            strokeColor="#3b82f6"
            fillColor="rgba(59, 130, 246, 0.1)"
          />
        )}

        {/* Marqueur utilisateur */}
        {userLocation?.lat && userLocation?.lng && (
          <Marker
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
            title="Vous êtes ici"
            pinColor="#3b82f6"
          />
        )}

        {/* Marqueurs vélos */}
        {bikesWithCoords.map((bike) => {
          if (bike.latitude === null || bike.longitude === null) return null;
          
          let batteryColor = '#16a34a';
          if (bike.batteryLevel <= 50) batteryColor = '#f59e0b';
          if (bike.batteryLevel <= 20) batteryColor = '#ef4444';
          
          return (
            <Marker
              key={bike.id}
              coordinate={{
                latitude: bike.latitude,
                longitude: bike.longitude,
              }}
              title={`Vélo ${bike.code}`}
              description={`Batterie: ${bike.batteryLevel}%`}
            >
              <View style={styles.bikeMarker}>
                <View style={[styles.bikeInner, { backgroundColor: batteryColor }]}>
                  <Text style={styles.batteryText}>{bike.batteryLevel}%</Text>
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bikeMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bikeInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batteryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});