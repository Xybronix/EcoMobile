import { useState, useEffect } from 'react';
import { Unlock, Lock, Eye, Check, X, Clock } from 'lucide-react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { bikeActionService, type UnlockRequest, type LockRequest } from '../../../services/api/bikeAction.service';
import { toast } from 'sonner';

type BikeRequest = UnlockRequest | LockRequest;

export function BikeActionManagement() {
  const [requests, setRequests] = useState<{
    unlock: BikeRequest[];
    lock: BikeRequest[];
  }>({
    unlock: [],
    lock: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unlock' | 'lock'>('unlock');
  const [selectedRequest, setSelectedRequest] = useState<BikeRequest | null>(null);
  const [validationAction, setValidationAction] = useState<'approve' | 'reject' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [inspectionModal, setInspectionModal] = useState<{open: boolean; request: BikeRequest | null; type: 'unlock' | 'lock' | null;}>({open: false, request: null, type: null});

  const openInspectionModal = (request: BikeRequest, type: 'unlock' | 'lock') => {
    setInspectionModal({
      open: true,
      request,
      type
    });
  };

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'unlock') {
        const data = await bikeActionService.getUnlockRequests();
        setRequests(prev => ({ ...prev, unlock: data }));
      } else {
        const data = await bikeActionService.getLockRequests();
        setRequests(prev => ({ ...prev, lock: data }));
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des demandes');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateRequest = async () => {
    if (!selectedRequest || !validationAction) return;

    try {
      if (activeTab === 'unlock') {
        await bikeActionService.validateUnlockRequest(selectedRequest.id, {
          approved: validationAction === 'approve',
          adminNote
        });
      } else {
        await bikeActionService.validateLockRequest(selectedRequest.id, {
          approved: validationAction === 'approve',
          adminNote
        });
      }

      toast.success(`Demande ${validationAction === 'approve' ? 'approuvée' : 'rejetée'} avec succès`);
      setSelectedRequest(null);
      setValidationAction(null);
      setAdminNote('');
      loadRequests();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la validation');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'PENDING': { label: 'En attente', variant: 'outline' },
      'APPROVED': { label: 'Approuvée', variant: 'default' },
      'REJECTED': { label: 'Rejetée', variant: 'destructive' }
    };
    const config = variants[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const currentRequests = activeTab === 'unlock' ? requests.unlock : requests.lock;
  const pendingRequests = currentRequests.filter(r => r.status === 'PENDING');

  // Fonction pour obtenir les statistiques
  const getStats = () => {
    const pendingUnlock = requests.unlock.filter(r => r.status === 'PENDING').length;
    const pendingLock = requests.lock.filter(r => r.status === 'PENDING').length;
    const today = new Date().toDateString();
    
    const todayUnlock = requests.unlock.filter(r => 
      new Date(r.requestedAt).toDateString() === today
    ).length;
    
    const todayLock = requests.lock.filter(r => 
      new Date(r.requestedAt).toDateString() === today
    ).length;

    return {
      pendingUnlock,
      pendingLock,
      todayUnlock,
      todayLock
    };
  };

  const stats = getStats();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-green-600">Gestion des Actions Vélos</h1>
        <p className="text-gray-600">Validation des demandes de déverrouillage et verrouillage</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Déverrouillages en attente</p>
              <p className="text-gray-900">{stats.pendingUnlock}</p>
            </div>
            <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
              <Unlock className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verrouillages en attente</p>
              <p className="text-gray-900">{stats.pendingLock}</p>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <Lock className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actions aujourd'hui</p>
              <p className="text-gray-900">
                {activeTab === 'unlock' ? stats.todayUnlock : stats.todayLock}
              </p>
            </div>
            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('unlock')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'unlock'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Unlock className="w-4 h-4" />
          Déverrouillages ({stats.pendingUnlock})
        </button>
        <button
          onClick={() => setActiveTab('lock')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'lock'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          Verrouillages ({stats.pendingLock})
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-12">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 animate-spin" />
              </div>
              <p>Chargement des demandes...</p>
            </div>
          </Card>
        ) : pendingRequests.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                {activeTab === 'unlock' ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <p>Aucune demande de {activeTab === 'unlock' ? 'déverrouillage' : 'verrouillage'} en attente</p>
            </div>
          </Card>
        ) : (
          pendingRequests.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    activeTab === 'unlock' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activeTab === 'unlock' ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium">
                      {request.user?.firstName} {request.user?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">{request.user?.email}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Vélo: {request.bike?.code}</span>
                      <span>•</span>
                      <span>{new Date(request.requestedAt).toLocaleString('fr-FR')}</span>
                    </div>
                    
                    {/* Données d'inspection */}
                    {'metadata' in request && request.metadata?.inspectionData && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Inspection du vélo:</h5>
                        
                        {request.metadata.inspectionData.issues?.length > 0 ? (
                          <div className="mb-2">
                            <span className="text-xs text-red-600 font-medium">Problèmes signalés:</span>
                            <ul className="text-xs text-red-700 mt-1 ml-4">
                              {request.metadata.inspectionData.issues.map((issue: string, index: number) => (
                                <li key={index}>• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-xs text-green-600 mb-2">Aucun problème signalé</p>
                        )}
                        
                        {request.metadata.inspectionData.notes && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-600 font-medium">💬 Notes:</span>
                            <p className="text-xs text-gray-700 mt-1">{request.metadata.inspectionData.notes}</p>
                          </div>
                        )}
                        
                        {request.metadata.inspectionData.photos?.length > 0 && (
                          <div>
                            <span className="text-xs text-gray-600 font-medium">
                              Photos: {request.metadata.inspectionData.photos.length} image(s)
                            </span>
                          </div>
                        )}
                        
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-blue-600">
                            Paiement: {request.metadata.paymentMethod === 'SUBSCRIPTION' ? 'Forfait actif' : 'Paiement direct'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {'reservation' in request && request.reservation && (
                      <Badge variant="outline" className="mt-2">
                        Réservation: {new Date(request.reservation.startDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInspectionModal(request, activeTab)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir Détails
                </Button>
                {request.status === 'PENDING' && (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setValidationAction('reject');
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setValidationAction('approve');
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approuver
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Validation Dialog */}
      {selectedRequest && validationAction && (
        <Dialog open={!!validationAction} onOpenChange={() => {
          setValidationAction(null);
          setAdminNote('');
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {validationAction === 'approve' ? 'Approuver' : 'Rejeter'} la demande
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Utilisateur:</strong> {selectedRequest.user?.firstName} {selectedRequest.user?.lastName}</p>
                <p><strong>Vélo:</strong> {selectedRequest.bike?.code}</p>
                <p><strong>Date:</strong> {new Date(selectedRequest.requestedAt).toLocaleString('fr-FR')}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  Note administrative {validationAction === 'reject' && '*'}
                </label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    validationAction === 'approve' 
                      ? 'Note optionnelle...'
                      : 'Raison du rejet (obligatoire)'
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setValidationAction(null);
                setAdminNote('');
              }}>
                Annuler
              </Button>
              <Button
                variant={validationAction === 'approve' ? 'default' : 'destructive'}
                onClick={handleValidateRequest}
                disabled={validationAction === 'reject' && !adminNote.trim()}
              >
                {validationAction === 'approve' ? 'Approuver' : 'Rejeter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {inspectionModal.open && inspectionModal.request && (
        <Dialog open={inspectionModal.open} onOpenChange={(open) => 
          setInspectionModal(prev => ({ ...prev, open }))
        }>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Détails de la demande - {inspectionModal.type === 'unlock' ? 'Déverrouillage' : 'Verrouillage'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Utilisateur</p>
                  <p className="text-sm">
                    {inspectionModal.request.user?.firstName} {inspectionModal.request.user?.lastName}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Vélo</p>
                  <p className="text-sm">{inspectionModal.request.bike?.code}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm">
                    {new Date(inspectionModal.request.requestedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  <Badge variant={
                    inspectionModal.request.status === 'PENDING' ? 'outline' :
                    inspectionModal.request.status === 'APPROVED' ? 'default' : 'destructive'
                  }>
                    {inspectionModal.request.status}
                  </Badge>
                </div>
              </div>

              {/* Rapport d'inspection (si disponible) */}
              {'metadata' in inspectionModal.request && inspectionModal.request.metadata?.inspection && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">📋 Rapport d'inspection</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">État général</p>
                      <p className="text-sm">{inspectionModal.request.metadata.inspection.condition}</p>
                    </div>
                    
                    {inspectionModal.request.metadata.inspection.issues && inspectionModal.request.metadata.inspection.issues.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Problèmes identifiés</p>
                        <ul className="list-disc pl-5 text-sm">
                          {inspectionModal.request.metadata.inspection.issues.map((issue: string, idx: number) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {inspectionModal.request.metadata.inspection.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Notes</p>
                        <p className="text-sm">{inspectionModal.request.metadata.inspection.notes}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Méthode de paiement</p>
                      <Badge variant="secondary" className="mt-1">
                        {inspectionModal.request.metadata.inspection.paymentMethod || 'WALLET'}
                      </Badge>
                    </div>
                    
                    {inspectionModal.request.metadata.inspection.photos && inspectionModal.request.metadata.inspection.photos.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Photos</p>
                        <p className="text-sm">{inspectionModal.request.metadata.inspection.photos.length} photo(s)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informations de réservation (pour déverrouillage) */}
              {inspectionModal.type === 'unlock' && 'reservation' in inspectionModal.request && inspectionModal.request.reservation && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">📅 Réservation associée</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      Du {new Date(inspectionModal.request.reservation.startDate).toLocaleDateString()}
                      {' au '}
                      {new Date(inspectionModal.request.reservation.endDate).toLocaleDateString()}
                    </p>
                    <Badge variant="outline">
                      {inspectionModal.request.reservation.packageType}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Informations de trajet (pour verrouillage) */}
              {inspectionModal.type === 'lock' && 'ride' in inspectionModal.request && inspectionModal.request.ride && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">🚴 Trajet associé</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      Durée: {Math.round((inspectionModal.request.ride.duration || 0) / 60)} min
                    </p>
                    <p className="text-sm">
                      Coût: {inspectionModal.request.ride.cost || 0} XOF
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {inspectionModal.request.status === 'PENDING' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInspectionModal({ open: false, request: null, type: null });
                    }}
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setValidationAction('reject');
                      setSelectedRequest(inspectionModal.request);
                      setInspectionModal({ open: false, request: null, type: null });
                    }}
                    className="flex-1"
                  >
                    Rejeter
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      setValidationAction('approve');
                      setSelectedRequest(inspectionModal.request);
                      setInspectionModal({ open: false, request: null, type: null });
                    }}
                    className="flex-1"
                  >
                    Approuver
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}