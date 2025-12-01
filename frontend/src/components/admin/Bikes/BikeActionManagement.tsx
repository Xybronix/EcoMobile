import { useState, useEffect } from 'react';
import { Unlock, Lock, Eye, Check, X, Clock } from 'lucide-react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { bikeActionService } from '../../../services/api/bikeAction.service';
import { toast } from 'sonner';

export function BikeActionManagement() {
  const [unlockRequests, setUnlockRequests] = useState<any[]>([]);
  const [lockRequests, setLockRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unlock' | 'lock'>('unlock');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [validationAction, setValidationAction] = useState<'approve' | 'reject' | null>(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'unlock') {
        const data = await bikeActionService.getUnlockRequests();
        setUnlockRequests(data);
      } else {
        const data = await bikeActionService.getLockRequests();
        setLockRequests(data);
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

  const currentRequests = activeTab === 'unlock' ? unlockRequests : lockRequests;
  const pendingRequests = currentRequests.filter(r => r.status === 'PENDING');

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
              <p className="text-gray-900">{unlockRequests.filter(r => r.status === 'PENDING').length}</p>
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
              <p className="text-gray-900">{lockRequests.filter(r => r.status === 'PENDING').length}</p>
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
                {currentRequests.filter(r => {
                  const today = new Date().toDateString();
                  return new Date(r.requestedAt).toDateString() === today;
                }).length}
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
          Déverrouillages ({unlockRequests.filter(r => r.status === 'PENDING').length})
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
          Verrouillages ({lockRequests.filter(r => r.status === 'PENDING').length})
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {pendingRequests.length === 0 ? (
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
                    {request.reservation && (
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
                  onClick={() => setSelectedRequest(request)}
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
    </div>
  );
}