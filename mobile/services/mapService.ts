interface MapConfig {
  center: [number, number];
  zoom: number;
  style: string;
}

interface MapMarker {
  id: string;
  position: [number, number];
  popup?: string;
  color?: string;
  icon?: string;
}

export class MapService {
  private static readonly DOUALA_CENTER: [number, number] = [4.0511, 9.7679];
  private static readonly YAOUNDE_CENTER: [number, number] = [3.8480, 11.5021];

  /**
   * Obtenir la configuration de carte pour une ville
   */
  static getMapConfig(userLocation?: { lat: number; lng: number }): MapConfig {
    let center = this.DOUALA_CENTER;
    
    if (userLocation) {
      // Déterminer la ville la plus proche
      const distanceToDouala = this.calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        this.DOUALA_CENTER[0], 
        this.DOUALA_CENTER[1]
      );
      
      const distanceToYaounde = this.calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        this.YAOUNDE_CENTER[0], 
        this.YAOUNDE_CENTER[1]
      );
      
      center = distanceToDouala < distanceToYaounde ? this.DOUALA_CENTER : this.YAOUNDE_CENTER;
      
      // Si l'utilisateur est proche, utiliser sa position
      if (Math.min(distanceToDouala, distanceToYaounde) < 50) {
        center = [userLocation.lat, userLocation.lng];
      }
    }

    return {
      center,
      zoom: 12,
      style: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    };
  }

  /**
   * Créer les marqueurs pour les vélos
   */
  static createBikeMarkers(bikes: any[], userLocation?: { lat: number; lng: number }): MapMarker[] {
    const markers: MapMarker[] = [];

    // Marqueur utilisateur
    if (userLocation) {
      markers.push({
        id: 'user-location',
        position: [userLocation.lat, userLocation.lng],
        popup: 'Votre position',
        color: '#2563eb',
        icon: 'user'
      });
    }

    // Marqueurs des vélos
    bikes.forEach(bike => {
      if (bike.latitude && bike.longitude) {
        markers.push({
          id: bike.id,
          position: [bike.latitude, bike.longitude],
          popup: `${bike.code} - ${bike.model}<br>Batterie: ${bike.batteryLevel}%`,
          color: this.getBikeColor(bike.status, bike.isOnline),
          icon: 'bike'
        });
      }
    });

    return markers;
  }

  /**
   * Obtenir la couleur du marqueur selon le statut du vélo
   */
  private static getBikeColor(status: string, isOnline: boolean = false): string {
    if (!isOnline && status !== 'MAINTENANCE') return '#9ca3af';
    
    switch (status) {
      case 'AVAILABLE':
        return '#16a34a';
      case 'IN_USE':
        return '#2563eb';
      case 'MAINTENANCE':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  }

  /**
   * Calculer la distance entre deux points
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  }

  /**
   * Obtenir l'URL des tuiles OpenStreetMap
   */
  static getTileUrl(): string {
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }

  /**
   * Attribution pour OpenStreetMap
   */
  static getAttribution(): string {
    return '© OpenStreetMap contributors';
  }
}

export default MapService;