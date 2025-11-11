// components/admin/Users/UserDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, DollarSign, Activity, Calendar, ArrowLeft, Ban, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import { useTranslation } from '../../../lib/i18n';
import { usePermissions } from '../../../hooks/usePermissions';
import { ProtectedAccess } from '../../shared/ProtectedAccess';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { userService, type User as UserType } from '../../../services/api/user.service';
import { ridesService, type Ride } from '../../../services/api/ride.service';
import { walletService, type Transaction } from '../../../services/api/wallet.service';


export function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const userId = id || null;
  
  const [user, setUser] = useState<UserType | null>(null);
  const [userRides, setUserRides] = useState<Ride[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [ridesLoading, setRidesLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const handleBack = () => {
    navigate('/admin/users');
  };

  // État pour la modale de confirmation
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'block' | 'unblock' | null;
    loading: boolean;
  }>({
    open: false,
    type: null,
    loading: false
  });

  // Vérifier les permissions
  const canViewUser = hasPermission('users', 'read');
  const canUpdateUser = hasPermission('users', 'update');
  const canViewWallet = hasPermission('wallet', 'read');
  const canViewRides = hasPermission('rides', 'read');

  useEffect(() => {
    if (userId && canViewUser) {
      loadUserData();
    } else if (!canViewUser) {
      toast.error('Vous n\'avez pas les permissions pour voir les détails de cet utilisateur');
    }
  }, [userId, canViewUser]);

  const loadUserData = async () => {
    if (!userId || !canViewUser) return;

    try {
      setLoading(true);
      const userData = await userService.getUserById(userId);
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du chargement de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRides = async () => {
    if (!userId || !canViewRides) {
      if (!canViewRides) {
        toast.error('Vous n\'avez pas les permissions pour voir l\'historique des trajets');
      }
      return;
    }

    try {
      setRidesLoading(true);
      const rides = await ridesService.getUserRides(userId);
      setUserRides(rides);
    } catch (error) {
      console.error('Erreur lors du chargement des trajets:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du chargement des trajets');
      setUserRides([]);
    } finally {
      setRidesLoading(false);
    }
  };

  const loadUserTransactions = async () => {
    if (!userId || !canViewWallet) {
      if (!canViewWallet) {
        toast.error('Vous n\'avez pas les permissions pour voir les transactions');
      }
      return;
    }

    try {
      setTransactionsLoading(true);
      // Note: Cette route n'existe pas dans le backend actuel
      // Il faudrait ajouter une route admin pour récupérer les transactions d'un utilisateur
      setUserTransactions([]);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du chargement des transactions');
      setUserTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const openConfirmDialog = (type: 'block' | 'unblock') => {
    if (!canUpdateUser) {
      toast.error(`Vous n'avez pas les permissions pour ${type === 'block' ? 'bloquer' : 'débloquer'} cet utilisateur`);
      return;
    }

    setConfirmDialog({
      open: true,
      type,
      loading: false
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      type: null,
      loading: false
    });
  };

  const handleConfirmAction = async () => {
    if (!user || !confirmDialog.type || !canUpdateUser) return;

    try {
      setConfirmDialog(prev => ({ ...prev, loading: true }));

      if (confirmDialog.type === 'block') {
        await userService.blockUser(user.id);
        toast.success(`Utilisateur ${[user.firstName, user.lastName].filter(Boolean).join(' ') || 'inconnu'} bloqué avec succès`);
        setUser({ ...user, status: 'blocked' });
      } else {
        await userService.unblockUser(user.id);
        toast.success(`Utilisateur ${[user.firstName, user.lastName].filter(Boolean).join(' ') || 'inconnu'} débloqué avec succès`);
        setUser({ ...user, status: 'active' });
      }

      closeConfirmDialog();
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'opération');
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Helper function to get user's first initial safely
  const getUserInitial = (userName: string | null | undefined): string => {
    if (!userName || typeof userName !== 'string' || userName.length === 0) {
      return '?';
    }
    return userName.charAt(0).toUpperCase();
  };

  // Helper function to format date safely
  const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'Date inconnue';
    try {
      return new Date(date).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date inconnue';
    }
  };

  // Si l'utilisateur n'a pas les permissions de base, afficher un accès refusé
  if (!canViewUser) {
    return (
      <div className="p-4 md:p-8">
        <Button onClick={handleBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>
        <Card className="p-12">
          <div className="text-center text-red-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Accès refusé</h3>
            <p>Vous n'avez pas les permissions nécessaires pour voir les détails de cet utilisateur.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <Button onClick={handleBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des détails de l'utilisateur...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 md:p-8">
        <Button onClick={handleBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Utilisateur non trouvé</p>
          </div>
        </Card>
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
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">{getUserInitial([user.firstName, user.lastName].filter(Boolean).join(' '))}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-600">{[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Utilisateur inconnu'}</h1>
              <p className="text-gray-600">{user.email || 'Email non disponible'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.status === 'active' ? (
            <Badge className="bg-green-100 text-green-800">Actif</Badge>
          ) : (
            <Badge variant="destructive">Bloqué</Badge>
          )}
          
          <ProtectedAccess mode="component" resource="users" action="update" fallback={null}>
            <Button
              variant={user.status === 'active' ? 'destructive' : 'default'}
              onClick={() => openConfirmDialog(user.status === 'active' ? 'block' : 'unblock')}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : user.status === 'active' ? (
                <Ban className="w-4 h-4 mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {user.status === 'active' ? 'Bloquer' : 'Débloquer'}
            </Button>
          </ProtectedAccess>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProtectedAccess mode="component" resource="wallet" action="read">
          <Card className="p-4 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Solde</p>
                <p className="text-2xl font-bold text-gray-900">{(user.accountBalance || 0).toLocaleString()} FCFA</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </Card>
        </ProtectedAccess>

        <ProtectedAccess mode="component" resource="wallet" action="read">
          <Card className="p-4 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Dépensé</p>
                <p className="text-2xl font-bold text-gray-900">{(user.totalSpent || 0).toLocaleString()} FCFA</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </ProtectedAccess>

        <Card className="p-4 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trajets</p>
              <p className="text-2xl font-bold text-gray-900">{user.totalTrips || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold text-gray-900">{(user.reliabilityScore || 0).toFixed(1)}</p>
            </div>
            <User className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        {/* Placeholder pour utilisateurs sans permissions wallet */}
        <ProtectedAccess 
          mode="component"
          resource="wallet"
          action="read"
          fallback={<Card className="p-4 border-l-4 border-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Information</p>
                <p className="text-sm text-gray-500">Non accessible</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
          </Card>}
          showFallback={false} 
        />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Informations Personnelles</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="text-gray-900 font-medium">{[user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900">{user.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="text-gray-900">{user.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Membre depuis</p>
                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Score de fiabilité</span>
                <span className="text-gray-900 font-medium">{(user.reliabilityScore || 0).toFixed(1)}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${((user.reliabilityScore || 0) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Activité</span>
                <span className="text-gray-900 font-medium">
                  {(user.totalTrips || 0) > 10 ? 'Élevée' : (user.totalTrips || 0) > 5 ? 'Moyenne' : 'Faible'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(((user.totalTrips || 0) / 20) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600">Statut du compte</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-gray-900 font-medium">
                  {user.status === 'active' ? 'Actif' : 'Bloqué'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trips" className="space-y-4">
        <TabsList>
          <ProtectedAccess mode="component" resource="rides" action="read">
            <TabsTrigger 
              value="trips" 
              onClick={() => !userRides.length && loadUserRides()}
            >
              Historique des Trajets
            </TabsTrigger>
          </ProtectedAccess>
          
          <ProtectedAccess mode="component" resource="wallet" action="read">
            <TabsTrigger 
              value="transactions" 
              onClick={() => !userTransactions.length && loadUserTransactions()}
            >
              Transactions
            </TabsTrigger>
          </ProtectedAccess>
        </TabsList>

        <ProtectedAccess 
          mode="component" 
          resource="rides" 
          action="read"
          fallback={
            <Card className="p-12">
              <div className="text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                <p>Vous n'avez pas les permissions pour voir l'historique des trajets</p>
              </div>
            </Card>
          }
        >
          <TabsContent value="trips">
            <Card>
              {ridesLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des trajets...</p>
                </div>
              ) : userRides.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Vélo</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Durée</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Distance</th>
                        <th className="text-right p-4 text-sm font-medium text-gray-600">Coût</th>
                        <th className="text-center p-4 text-sm font-medium text-gray-600">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userRides.map((ride) => (
                        <tr key={ride.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm text-gray-900">
                            {formatDate(ride.startTime)}
                          </td>
                          <td className="p-4 text-sm text-gray-900 font-medium">{ride.bikeName || 'N/A'}</td>
                          <td className="p-4 text-sm text-gray-900">
                            {ride.duration ? `${Math.floor(ride.duration / 60)}min` : '-'}
                          </td>
                          <td className="p-4 text-sm text-gray-900">
                            {ride.distance ? `${(ride.distance / 1000).toFixed(1)}km` : '-'}
                          </td>
                          <td className="p-4 text-sm text-gray-900 text-right font-medium">
                            {ride.cost ? `${ride.cost} FCFA` : '-'}
                          </td>
                          <td className="p-4 text-center">
                            <Badge 
                              className={
                                ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                                ride.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {ride.status === 'completed' ? 'Terminé' :
                               ride.status === 'ongoing' ? 'En cours' : 'Annulé'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">Aucun trajet trouvé</p>
                  <p className="text-sm">Cet utilisateur n'a encore effectué aucun trajet</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </ProtectedAccess>

        <ProtectedAccess 
          mode="component" 
          resource="wallet" 
          action="read"
          fallback={
            <Card className="p-12">
              <div className="text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                <p>Vous n'avez pas les permissions pour voir les transactions</p>
              </div>
            </Card>
          }
        >
          <TabsContent value="transactions">
            <Card>
              {transactionsLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des transactions...</p>
                </div>
              ) : userTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
                        <th className="text-right p-4 text-sm font-medium text-gray-600">Montant</th>
                        <th className="text-center p-4 text-sm font-medium text-gray-600">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm text-gray-900">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="p-4 text-sm text-gray-900">
                            {transaction.type === 'DEPOSIT' ? 'Dépôt' :
                             transaction.type === 'RIDE_PAYMENT' ? 'Paiement trajet' :
                             transaction.type === 'REFUND' ? 'Remboursement' : 'Retrait'}
                          </td>
                          <td className={`p-4 text-sm text-right font-medium ${
                            transaction.type === 'DEPOSIT' || transaction.type === 'REFUND' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'DEPOSIT' || transaction.type === 'REFUND' ? '+' : '-'}
                            {transaction.amount} FCFA
                          </td>
                          <td className="p-4 text-center">
                            <Badge 
                              className={
                                transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {transaction.status === 'COMPLETED' ? 'Complété' :
                               transaction.status === 'PENDING' ? 'En attente' :
                               transaction.status === 'FAILED' ? 'Échoué' : 'Annulé'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">Aucune transaction trouvée</p>
                  <p className="text-sm">Cet utilisateur n'a encore effectué aucune transaction</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </ProtectedAccess>
      </Tabs>

      {/* Dialog de confirmation pour bloquer/débloquer */}
      <Dialog open={confirmDialog.open} onOpenChange={closeConfirmDialog}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === 'block' ? 'Bloquer l\'utilisateur' : 'Débloquer l\'utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === 'block' 
                ? `Êtes-vous sûr de vouloir bloquer l'utilisateur "${[user.firstName, user.lastName].filter(Boolean).join(' ') || 'cet utilisateur'}" ? Cette action empêchera l'utilisateur d'accéder au service et d'effectuer des trajets.`
                : `Êtes-vous sûr de vouloir débloquer l'utilisateur "${[user.firstName, user.lastName].filter(Boolean).join(' ') || 'cet utilisateur'}" ? Cette action permettra à l'utilisateur d'accéder à nouveau au service et d'effectuer des trajets.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={closeConfirmDialog}
              disabled={confirmDialog.loading}
            >
              Annuler
            </Button>
            <Button 
              variant={confirmDialog.type === 'block' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
              disabled={confirmDialog.loading}
            >
              {confirmDialog.loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : confirmDialog.type === 'block' ? (
                <Ban className="w-4 h-4 mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {confirmDialog.type === 'block' ? 'Bloquer' : 'Débloquer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}