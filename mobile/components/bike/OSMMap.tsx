/* eslint-disable react-hooks/exhaustive-deps */
// components/bike/OSMMap.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions } from 'react-native';
import { Svg, Circle, G, Text as SvgText } from 'react-native-svg';

interface Bike {
  id: string;
  latitude: number | null;
  longitude: number | null;
  batteryLevel: number;
  code: string;
  distance?: number;
}

interface OSMMapProps {
  userLocation?: { lat: number; lng: number } | null;
  bikes: Bike[];
  radius: number;
}

export function OSMMap({ userLocation, bikes, radius }: OSMMapProps) {
  const { width, height } = Dimensions.get('window');
  
  // Coordonnées par défaut
  const center = userLocation || { lat: 4.0511, lng: 9.7679 };
  
  // Filtrer les vélos avec coordonnées valides
  const bikesWithCoords = bikes.filter(b => 
    b.latitude !== null && 
    b.longitude !== null &&
    !isNaN(b.latitude) && 
    !isNaN(b.longitude)
  );

  // Convertir les coordonnées GPS en coordonnées SVG (simplifié)
  const scale = 10000; // Facteur d'échelle
  
  const userPos = {
    x: width / 2,
    y: height / 2,
  };

  // Calculer les positions des vélos
  const bikePositions = useMemo(() => {
    return bikesWithCoords.map(bike => {
      if (!bike.latitude || !bike.longitude) return null;
      
      // Conversion simplifiée (pour une vraie app, utiliser une vraie projection)
      const dx = (bike.longitude - center.lng) * scale;
      const dy = (center.lat - bike.latitude) * scale;
      
      return {
        id: bike.id,
        x: userPos.x + dx,
        y: userPos.y + dy,
        batteryLevel: bike.batteryLevel,
        code: bike.code,
      };
    }).filter(Boolean);
  }, [bikesWithCoords, center, userPos, scale]);

  return (
    <View style={styles.container}>
      {/* Carte SVG simplifiée */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ width: width * 2, height: height * 2 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ width: width * 2, height: height * 2 }}
        >
          <Svg width={width * 2} height={height * 2}>
            {/* Fond de la carte */}
            <G>
              <Circle
                cx={userPos.x}
                cy={userPos.y}
                r={radius * 500} // Cercle de recherche
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth="1"
              />
              
              {/* Marqueur utilisateur */}
              <Circle
                cx={userPos.x}
                cy={userPos.y}
                r="12"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
              
              <SvgText
                x={userPos.x}
                y={userPos.y - 15}
                textAnchor="middle"
                fill="#3b82f6"
                fontSize="12"
                fontWeight="bold"
              >
                Vous
              </SvgText>
              
              {/* Marqueurs vélos */}
              {bikePositions.map(bike => {
                if (!bike) return null;
                
                let batteryColor = '#16a34a';
                if (bike.batteryLevel <= 50) batteryColor = '#f59e0b';
                if (bike.batteryLevel <= 20) batteryColor = '#ef4444';
                
                return (
                  <G key={bike.id}>
                    <Circle
                      cx={bike.x}
                      cy={bike.y}
                      r="15"
                      fill={batteryColor}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <SvgText
                      x={bike.x}
                      y={bike.y + 5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {bike.batteryLevel}%
                    </SvgText>
                    <SvgText
                      x={bike.x}
                      y={bike.y - 20}
                      textAnchor="middle"
                      fill="#111827"
                      fontSize="9"
                    >
                      {bike.code}
                    </SvgText>
                  </G>
                );
              })}
              
              {/* Grille de fond */}
              {Array.from({ length: 10 }).map((_, i) => (
                <React.Fragment key={`grid-${i}`}>
                  <SvgText
                    x={i * 100}
                    y={20}
                    fill="#9ca3af"
                    fontSize="10"
                  >
                    {(i * 0.01).toFixed(2)}°
                  </SvgText>
                  <SvgText
                    y={i * 100}
                    x={20}
                    fill="#9ca3af"
                    fontSize="10"
                  >
                    {(i * 0.01).toFixed(2)}°
                  </SvgText>
                </React.Fragment>
              ))}
            </G>
          </Svg>
        </ScrollView>
      </ScrollView>
      
      {/* Légende */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>Votre position</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#16a34a' }]} />
          <Text style={styles.legendText}>Batterie &gt; 50%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Batterie 20-50%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Batterie &lt; 20%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
  },
});