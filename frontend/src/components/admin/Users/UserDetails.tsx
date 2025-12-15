import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, DollarSign, Activity, Calendar, ArrowLeft, Ban, 
  CheckCircle, AlertCircle, Shield, MapPin, Bike, CreditCard,
  TrendingUp, AlertTriangle, Lock, Unlock, History } from 'lucide-react';
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
import { type Ride } from '../../../services/api/ride.service';
import { type Transaction } from '../../../services/api/wallet.service';
import { type Incident } from '../../../services/api/incident.service';

export function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const userId = id || null;
  
  const [user, setUser] = useState<UserType & {
    _incidents?: Incident[];
    _rides?: Ride[];
    _transactions?: Transaction[];
    _requests?: any[];
    stats?: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  const handleBack = () => {
    navigate('/admin/users');
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'block' | 'unblock' | null;
    loading: boolean;
  }>({
    open: false,
    type: null,
    loading: false
  });

  const canViewUser = hasPermission('users', 'read');
  const canUpdateUser = hasPermission('users', 'update');
  const canViewWallet = hasPermission('wallet', 'read');
  const canViewRides = hasPermission('rides', 'read');
  const canViewIncidents = hasPermission('incidents', 'read');

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
      
      const stats = userData.stats || {};
      
      setIncidents(userData.incidents || []);
      setRides(userData.rides || []);
      setTransactions(userData.transactions || []);
      setRequests(userData.requests || []);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
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

  const getUserInitial = (userName: string | null | undefined): string => {
    if (!userName || typeof userName !== 'string' || userName.length === 0) {
      return '?';
    }
    return userName.charAt(0).toUpperCase();
  };

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'Date inconnue';
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date inconnue';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const stats = user?.stats || {};
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(i => i.status === 'OPEN').length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;

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
              <span className="text-white text-2xl font-semibold">{getUserInitial(fullName)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-600">{fullName}</h1>
              <p className="text-gray-600">{user.email || 'Email non disponible'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(user.status)}>
                  {user.status === 'active' ? 'Actif' : user.status === 'blocked' ? 'Bloqué' : 'En attente'}
                </Badge>
                <Badge variant="outline">
                  {user.role || 'Utilisateur'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <ProtectedAccess mode="component" resource="wallet" action="read">
          <Card className="p-4 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Solde Wallet</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency( user?.stats?.wallet?.balance || user?.accountBalance || 0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </Card>
        </ProtectedAccess>

        <ProtectedAccess mode="component" resource="wallet" action="read">
          <Card className="p-4 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Caution</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(user.depositBalance || 0)}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </ProtectedAccess>

        <Card className="p-4 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trajets</p>
              <p className="text-2xl font-bold text-gray-900">{user.totalTrips || 0}</p>
              <p className="text-sm text-gray-500">{formatCurrency(user.totalSpent || 0)} dépensés</p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{totalIncidents}</p>
              <p className="text-sm text-gray-500">{openIncidents} ouverts</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Demandes</p>
              <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
              <p className="text-sm text-gray-500">{pendingRequests} en attente</p>
            </div>
            <History className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations Personnelles
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="text-gray-900 font-medium">{fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900">{user.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="text-gray-900">{user.phone || 'N/A'}</p>
              </div>
            </div>
            {user.address && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="text-gray-900">{user.address}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Membre depuis</p>
                <p className="text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
            </div>
            {user.subscription && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Abonnement actif</p>
                  <p className="text-gray-900 font-medium">{user.subscription.planName} - {user.subscription.packageType}</p>
                  <p className="text-sm text-gray-500">Expire le {formatDate(user.subscription.endDate)}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Statistiques et Scores
          </h3>
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
                <span className="text-gray-600">Nombre de trajets</span>
                <span className="text-gray-900 font-medium">{user.totalTrips || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(((user.totalTrips || 0) / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600 mb-2">Statut du compte</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-gray-900 font-medium">
                  {user.status === 'active' ? 'Compte actif' : user.status === 'blocked' ? 'Compte bloqué' : 'En attente de validation'}
                </p>
              </div>
              {user.isActive !== undefined && (
                <p className="text-sm text-gray-500 mt-1">
                  {user.isActive ? 'Compte activé' : 'Compte désactivé'}
                </p>
              )}
            </div>

            {user.negativeBalance && user.negativeBalance > 0 && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-2">Solde négatif</p>
                <p className="text-red-600 font-medium">{formatCurrency(user.negativeBalance)}</p>
                <p className="text-xs text-red-500 mt-1">Ce montant doit être remboursé</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trips" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="trips">
            <Bike className="w-4 h-4 mr-2" />
            Historique des Trajets ({rides.length})
          </TabsTrigger>
          
          <ProtectedAccess mode="component" resource="wallet" action="read">
            <TabsTrigger value="transactions">
              <CreditCard className="w-4 h-4 mr-2" />
              Transactions ({transactions.length})
            </TabsTrigger>
          </ProtectedAccess>
          
          <TabsTrigger value="incidents">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Incidents ({incidents.length})
          </TabsTrigger>
          
          <TabsTrigger value="requests">
            <History className="w-4 h-4 mr-2" />
            Demandes ({requests.length})
          </TabsTrigger>
        </TabsList>

        {/* Historique des Trajets */}
        <TabsContent value="trips">
          <Card>
            {rides.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Vélo</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Durée</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Distance</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Coût</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rides.map((ride) => (
                      <tr key={ride.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-900">
                          {formatDate(ride.startTime)}
                        </td>
                        <td className="p-4 text-sm text-gray-900 font-medium">
                          {ride.bikeName || 'N/A'}
                        </td>
                        <td className="p-4 text-sm text-gray-900">
                          {ride.duration ? `${Math.floor(ride.duration / 60)}min ${ride.duration % 60}s` : '-'}
                        </td>
                        <td className="p-4 text-sm text-gray-900">
                          {ride.distance ? `${(ride.distance / 1000).toFixed(1)}km` : '-'}
                        </td>
                        <td className="p-4 text-sm text-gray-900 font-medium">
                          {ride.cost ? formatCurrency(ride.cost) : '-'}
                        </td>
                        <td className="p-4">
                          <Badge 
                            className={
                              ride.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              ride.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {ride.status === 'COMPLETED' ? 'Terminé' :
                             ride.status === 'IN_PROGRESS' ? 'En cours' : 'Annulé'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Bike className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">Aucun trajet trouvé</p>
                <p className="text-sm">Cet utilisateur n'a encore effectué aucun trajet</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Transactions */}
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
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Description</th>
                        <th className="text-right p-4 text-sm font-medium text-gray-600">Montant</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Statut</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Validateur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm text-gray-900">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="p-4 text-sm text-gray-900">
                            <Badge variant="outline">
                              {transaction.type === 'DEPOSIT' ? 'Dépôt' :
                               transaction.type === 'WITHDRAWAL' ? 'Retrait' :
                               transaction.type === 'RIDE_PAYMENT' ? 'Trajet' :
                               transaction.type === 'REFUND' ? 'Remboursement' :
                               transaction.type === 'DEPOSIT_RECHARGE' ? 'Recharge caution' :
                               transaction.type === 'DAMAGE_CHARGE' ? 'Frais dégâts' :
                               transaction.type === 'SUBSCRIPTION_PAYMENT' ? 'Abonnement' : 'Autre'}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-gray-900">
                            {transaction.metadata?.description || 
                             (transaction.type === 'RIDE_PAYMENT' ? 'Paiement trajet' :
                              transaction.type === 'DEPOSIT' ? 'Recharge wallet' : 'Transaction')}
                          </td>
                          <td className={`p-4 text-sm text-right font-medium ${
                            transaction.type === 'DEPOSIT' || transaction.type === 'REFUND' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'DEPOSIT' || transaction.type === 'REFUND' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="p-4">
                            <Badge 
                              className={
                                transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                transaction.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {transaction.status === 'COMPLETED' ? 'Complété' :
                               transaction.status === 'PENDING' ? 'En attente' :
                               transaction.status === 'FAILED' ? 'Échoué' : 'Annulé'}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-gray-900">
                            {transaction.validatedBy || '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">Aucune transaction trouvée</p>
                <p className="text-sm">Cet utilisateur n'a encore effectué aucune transaction</p>
              </div>
            )}
          </Card>
        </TabsContent>
        </ProtectedAccess>

        {/* Incidents */}
        <TabsContent value="incidents">
          <Card>
            {incidents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Description</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Vélo</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Statut</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-600">Remboursement</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((incident) => (
                      <tr key={incident.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-900">
                          {formatDate(incident.createdAt)}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {incident.type === 'technical' ? 'Technique' :
                             incident.type === 'accident' ? 'Accident' :
                             incident.type === 'damaged' ? 'Endommagé' :
                             incident.type === 'payment' ? 'Paiement' :
                             incident.type === 'theft' ? 'Vol' : incident.type}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-900">
                          {incident.description}
                        </td>
                        <td className="p-4 text-sm text-gray-900">
                          {incident.bikeName || incident.bike?.code || 'N/A'}
                        </td>
                        <td className="p-4">
                          <Badge 
                            className={
                              incident.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                              incident.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              incident.status === 'CLOSED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {incident.status === 'OPEN' ? 'En attente' :
                             incident.status === 'IN_PROGRESS' ? 'En traitement' :
                             incident.status === 'RESOLVED' ? 'Résolu' : 'Fermé'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-900 text-right font-medium">
                          {incident.refundAmount ? formatCurrency(incident.refundAmount) : '-'}
                        </td>
                        <td className="p-4 text-sm text-gray-900">
                          {incident.resolvedBy || incident.adminNote ? 'Oui' : 'Non'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">Aucun incident trouvé</p>
                <p className="text-sm">Cet utilisateur n'a signalé aucun incident</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Demandes */}
        <TabsContent value="requests">
          <Card>
            {requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Vélo</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Statut</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Validateur</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-900">
                          {formatDate(request.createdAt || request.requestedAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {request.type === 'unlock' ? (
                              <Unlock className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-green-500" />
                            )}
                            <Badge variant="outline">
                              {request.type === 'unlock' ? 'Déverrouillage' : 'Verrouillage'}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-900 font-medium">
                          {request.bike?.code || request.bikeName || 'N/A'}
                        </td>
                        <td className="p-4">
                          <Badge 
                            className={
                              request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {request.status === 'PENDING' ? 'En attente' :
                             request.status === 'APPROVED' ? 'Approuvé' : 'Rejeté'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-900">
                          {request.validatedBy || '-'}
                        </td>
                        <td className="p-4 text-sm text-gray-900">
                          {request.adminNote || request.rejectionReason || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">Aucune demande trouvée</p>
                <p className="text-sm">Cet utilisateur n'a fait aucune demande</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmation */}
      <Dialog open={confirmDialog.open} onOpenChange={closeConfirmDialog}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.type === 'block' ? 'Bloquer l\'utilisateur' : 'Débloquer l\'utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.type === 'block' 
                ? `Êtes-vous sûr de vouloir bloquer l'utilisateur "${fullName}" ? Cette action empêchera l'utilisateur d'accéder au service et d'effectuer des trajets.`
                : `Êtes-vous sûr de vouloir débloquer l'utilisateur "${fullName}" ? Cette action permettra à l'utilisateur d'accéder à nouveau au service et d'effectuer des trajets.`
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