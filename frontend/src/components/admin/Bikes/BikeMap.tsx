import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, RefreshCw, Zap, Battery, Signal, Clock, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { bikeService } from '../../../services/api/bike.service';
import { toast } from 'sonner';

interface BikeMarker {
  id: string;
  code: string;
  gpsDeviceId?: string;
  model: string;
  status: string;
  isActive?: boolean;
  latitude: number | null;
  longitude: number | null;
  battery: number;
  gpsSignal?: number;
  gsmSignal?: number;
  speed?: number;
  direction?: number;
  isOnline?: boolean;
  lastUpdate?: string;
  locationName?: string;
  equipment?: string[];
  deviceStatus?: string;
  syncError?: string;
  pricingPlan?: any;
}

export function BikeMap() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bikes, setBikes] = useState<BikeMarker[]>([]);
  const [selectedBike, setSelectedBike] = useState<BikeMarker | null>(null);
  const [hoveredBike, setHoveredBike] = useState<BikeMarker | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 4.0511, lng: 9.7679 });
  const [mapZoom, setMapZoom] = useState(13);
  const mapRef = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const handleBack = () => {
    if (id) {
      navigate(`/admin/bikes/${id}`);
    } else {
      navigate('/admin/bikes');
    }
  };

  useEffect(() => {
    loadBikes();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      if (!loading) {
        refreshPositions();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [id]);

  const loadBikes = async () => {
    try {
      setLoading(true);
      
      if (id) {
        // Charger un vélo spécifique
        const bike = await bikeService.getBikeById(id);
        if (bike && bike.latitude && bike.longitude) {
          setSelectedBike(bike as BikeMarker);
          setBikes([bike as BikeMarker]);
          setMapCenter({ lat: bike.latitude, lng: bike.longitude });
          setMapZoom(16);
        }
      } else {
        // Charger les positions temps réel de tous les vélos
        const positions = await bikeService.getRealtimePositions();
        setBikes(positions);
        
        // Centrer la carte sur les vélos avec GPS
        const gpsEnabledBikes = positions.filter(bike => bike.latitude && bike.longitude);
        if (gpsEnabledBikes.length > 0) {
          const avgLat = gpsEnabledBikes.reduce((sum, bike) => sum + bike.latitude!, 0) / gpsEnabledBikes.length;
          const avgLng = gpsEnabledBikes.reduce((sum, bike) => sum + bike.longitude!, 0) / gpsEnabledBikes.length;
          setMapCenter({ lat: avgLat, lng: avgLng });
        }
      }
    } catch (error) {
      console.error('Error loading bikes for map:', error);
      toast.error('Erreur lors du chargement des vélos');
    } finally {
      setLoading(false);
    }
  };

  const refreshPositions = async () => {
    try {
      setIsRefreshing(true);
      
      // Forcer la synchronisation GPS
      await bikeService.syncGpsData();
      
      // Recharger les positions
      if (id) {
        const bike = await bikeService.getBikeById(id);
        if (bike) {
          setSelectedBike(bike as BikeMarker);
          setBikes([bike as BikeMarker]);
        }
      } else {
        const positions = await bikeService.getRealtimePositions();
        setBikes(positions);
      }
      
      toast.success('Positions mises à jour');
    } catch (error) {
      console.error('Error refreshing positions:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string, isOnline: boolean = false) => {
    if (!isOnline && status !== 'MAINTENANCE') {
      return 'bg-gray-500'; // Hors ligne
    }
    
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-600';
      case 'IN_USE':
        return 'bg-blue-600';
      case 'MAINTENANCE':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSignalColor = (level: number) => {
    if (level > 80) return 'text-green-600';
    if (level > 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleMarkerHover = (bike: BikeMarker, event: React.MouseEvent) => {
    setHoveredBike(bike);
    setHoverPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMarkerLeave = () => {
    setHoveredBike(null);
  };

  const bikesWithGps = bikes.filter(bike => bike.latitude && bike.longitude && bike.gpsDeviceId);
  const bikesWithoutGps = bikes.filter(bike => !bike.gpsDeviceId);

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-green-600">Chargement de la carte...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-green-600">
              {selectedBike ? `Carte - ${selectedBike.code}` : 'Carte des Vélos GPS'}
            </h1>
            <p className="text-gray-600">
              Position en temps réel des vélos connectés ({bikesWithGps.length} vélos GPS)
            </p>
          </div>
        </div>
        <Button 
          onClick={refreshPositions} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Mise à jour...' : 'Actualiser GPS'}
        </Button>
      </div>

      {/* GPS Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vélos GPS</p>
              <p className="text-gray-900">{bikesWithGps.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En ligne</p>
              <p className="text-gray-900">{bikesWithGps.filter(b => b.isOnline).length}</p>
            </div>
            <Signal className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hors ligne</p>
              <p className="text-gray-900">{bikesWithGps.filter(b => !b.isOnline).length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sans GPS</p>
              <p className="text-gray-900">{bikesWithoutGps.length}</p>
            </div>
            <Zap className="w-8 h-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Interactive Map */}
      <Card className="relative overflow-hidden" style={{ height: '600px' }}>
        <div 
          ref={mapRef}
          className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50"
          style={{
            backgroundImage: `radial-gradient(circle at ${mapCenter.lng * 10}% ${mapCenter.lat * 10}%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)`
          }}
        >
          {/* Bike Markers */}
          {bikesWithGps.map((bike, index) => {
            if (!bike.latitude || !bike.longitude) return null;
            
            // Calculer la position relative sur la carte (simulation)
            const relativeX = 50 + (bike.longitude - mapCenter.lng) * 1000;
            const relativeY = 50 + (mapCenter.lat - bike.latitude) * 1000;
            
            // S'assurer que le marqueur reste dans la zone visible
            const clampedX = Math.max(5, Math.min(95, relativeX));
            const clampedY = Math.max(5, Math.min(95, relativeY));

            return (
              <div
                key={bike.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                style={{
                  left: `${clampedX}%`,
                  top: `${clampedY}%`,
                }}
                onMouseEnter={(e) => handleMarkerHover(bike, e)}
                onMouseLeave={handleMarkerLeave}
                onClick={() => navigate(`/admin/bikes/${bike.id}`)}
              >
                {/* Marker Circle */}
                <div className="relative">
                  <div 
                    className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${getStatusColor(bike.status, bike.isOnline)} flex items-center justify-center`}
                  >
                    {!bike.isOnline && (
                      <div className="w-2 h-2 bg-white rounded-full opacity-50" />
                    )}
                  </div>
                  
                  {/* Online/Offline indicator */}
                  <div 
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
                      bike.isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`}
                  />
                  
                  {/* Code Label */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs shadow-md whitespace-nowrap">
                    {bike.code}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Center Marker */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 text-gray-400"
            style={{ left: '50%', top: '50%' }}
          >
            <MapPin className="w-8 h-8" />
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <Button 
            size="icon" 
            className="bg-white text-gray-900 hover:bg-gray-100"
            onClick={() => {
              setMapCenter({ lat: 4.0511, lng: 9.7679 });
              setMapZoom(13);
            }}
          >
            <Navigation className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            className="bg-white text-gray-900 hover:bg-gray-100"
            onClick={refreshPositions}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
          <h4 className="text-sm font-medium mb-3">Légende</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full border border-white" />
              <span>Disponible (en ligne)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full border border-white" />
              <span>En utilisation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full border border-white" />
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full border border-white" />
              <span>Hors ligne</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>Connecté GPS</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Hover Popup */}
      {hoveredBike && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: hoverPosition.x + 10,
            top: hoverPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <Card className="p-4 shadow-xl bg-white border max-w-sm">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{hoveredBike.code}</h4>
                  <p className="text-sm text-gray-600">{hoveredBike.model}</p>
                </div>
                <Badge 
                  variant={hoveredBike.status === 'AVAILABLE' ? 'default' : 'secondary'}
                  className={hoveredBike.isOnline ? '' : 'opacity-50'}
                >
                  {hoveredBike.status} {!hoveredBike.isOnline && '(Hors ligne)'}
                </Badge>
              </div>

              {/* GPS Info */}
              {hoveredBike.gpsDeviceId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Signal className="w-3 h-3" />
                      GPS ID:
                    </span>
                    <span className="font-mono text-xs">{hoveredBike.gpsDeviceId}</span>
                  </div>
                  
                  {hoveredBike.lastUpdate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Dernière MAJ:
                      </span>
                      <span className="text-xs">
                        {new Date(hoveredBike.lastUpdate).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Battery className={`w-3 h-3 ${getBatteryColor(hoveredBike.battery)}`} />
                  <span>{hoveredBike.battery}%</span>
                </div>
                
                {hoveredBike.gpsSignal !== undefined && (
                  <div className="flex items-center gap-1">
                    <Signal className={`w-3 h-3 ${getSignalColor(hoveredBike.gpsSignal)}`} />
                    <span>GPS {hoveredBike.gpsSignal}%</span>
                  </div>
                )}
                
                {hoveredBike.speed !== undefined && hoveredBike.speed > 0 && (
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-blue-600" />
                    <span>{hoveredBike.speed} km/h</span>
                  </div>
                )}
                
                {hoveredBike.direction !== undefined && (
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-purple-600" />
                    <span>{hoveredBike.direction}°</span>
                  </div>
                )}
              </div>

              {/* Location */}
              {hoveredBike.locationName && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {hoveredBike.locationName}
                  </p>
                </div>
              )}

              {/* Coordinates */}
              <div className="text-xs text-gray-500 font-mono">
                {hoveredBike.latitude !== null && hoveredBike.longitude !== null ? (
                  `${hoveredBike.latitude.toFixed(6)}, ${hoveredBike.longitude.toFixed(6)}`
                ) : (
                  'Coordonnées indisponibles'
                )}
              </div>

              {/* Pricing Plan */}
              {hoveredBike.pricingPlan && (
                <div className="text-xs text-blue-600">
                  Plan: {hoveredBike.pricingPlan.name} - {hoveredBike.pricingPlan.hourlyRate} FCFA/h
                </div>
              )}

              {/* Error indicator */}
              {hoveredBike.syncError && (
                <div className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {hoveredBike.syncError}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Bikes without GPS Warning */}
      {bikesWithoutGps.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-amber-900 font-medium">Vélos sans GPS</h4>
              <p className="text-sm text-amber-700">
                {bikesWithoutGps.length} vélo(s) n'ont pas de dispositif GPS configuré : {' '}
                {bikesWithoutGps.map(b => b.code).join(', ')}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Pour le suivi temps réel, configurez un GPS Device ID pour ces vélos.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-900 font-medium">Utilisation de la carte</h4>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Survolez un marqueur pour voir les détails du vélo</li>
              <li>• Cliquez sur un marqueur pour aller aux détails du vélo</li>
              <li>• Les positions se mettent à jour automatiquement toutes les 30 secondes</li>
              <li>• Le point vert indique que le GPS est connecté</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}