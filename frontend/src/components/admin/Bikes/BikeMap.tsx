import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { bikeService } from '../../../services/api/bike.service';
import { toast } from 'sonner';

export function BikeMap() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bikes, setBikes] = useState<any[]>([]);
  const [selectedBike, setSelectedBike] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleBack = () => {
    if (id) {
      navigate(`/admin/bikes/${id}`);
    } else {
      navigate('/admin/bikes');
    }
  };

  useEffect(() => {
    loadBikes();
  }, [id]);

  const loadBikes = async () => {
    try {
      setLoading(true);
      
      if (id) {
        // Charger un vélo spécifique
        const bike = await bikeService.getBikeById(id);
        setSelectedBike(bike);
        setBikes(bike ? [bike] : []);
      } else {
        // Charger tous les vélos
        const response = await bikeService.getAllBikes({ limit: 100 });
        setBikes(response.bikes || []);
      }
    } catch (error) {
      console.error('Error loading bikes for map:', error);
      toast.error('Erreur lors du chargement des vélos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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
      <div className="flex items-center gap-4">
        <Button onClick={handleBack} variant="ghost" size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-green-600">
            {selectedBike ? `Carte - ${selectedBike.code}` : 'Carte des Vélos'}
          </h1>
          <p className="text-gray-600">
            {selectedBike ? 'Position du vélo sélectionné' : 'Position de tous les vélos en temps réel'}
          </p>
        </div>
      </div>

      {/* Map Container */}
      <Card className="relative overflow-hidden" style={{ height: '600px' }}>
        {/* Placeholder for actual map implementation */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <MapPin className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">Carte Interactive</h3>
            <p className="text-gray-600 mb-4">
              Intégration de Google Maps ou Mapbox pour afficher la position en temps réel des vélos
            </p>
            <div className="space-y-2 text-left bg-white p-4 rounded-lg">
              <p className="text-sm">
                <strong>Vélos affichés:</strong> {bikes.length}
              </p>
              {selectedBike && (
                <>
                  <p className="text-sm">
                    <strong>Code:</strong> {selectedBike.code}
                  </p>
                  <p className="text-sm">
                    <strong>Coordonnées:</strong> {
                      selectedBike.latitude && selectedBike.longitude
                        ? `${selectedBike.latitude.toFixed(6)}, ${selectedBike.longitude.toFixed(6)}`
                        : 'Position non disponible'
                    }
                  </p>
                  <Badge variant={selectedBike.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                    {selectedBike.status}
                  </Badge>
                </>
              )}
              {!selectedBike && bikes.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm"><strong>Vélos par statut:</strong></p>
                  <p className="text-sm">
                    Disponibles: {bikes.filter(b => b.status === 'AVAILABLE').length}
                  </p>
                  <p className="text-sm">
                    En utilisation: {bikes.filter(b => b.status === 'IN_USE').length}
                  </p>
                  <p className="text-sm">
                    Maintenance: {bikes.filter(b => b.status === 'MAINTENANCE').length}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Controls (Placeholder) */}
        <div className="absolute top-4 right-4 space-y-2">
          <Button size="icon" className="bg-white text-gray-900 hover:bg-gray-100">
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
          <h4 className="mb-2">Légende</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 ${getStatusColor('AVAILABLE')} rounded-full`} />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 ${getStatusColor('IN_USE')} rounded-full`} />
              <span>En utilisation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 ${getStatusColor('MAINTENANCE')} rounded-full`} />
              <span>Maintenance</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Pour une implémentation complète, intégrez Google Maps API ou Mapbox avec les marqueurs en temps réel pour chaque vélo.
        </p>
      </Card>
    </div>
  );
}