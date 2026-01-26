/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService, User } from '@/services/authService';
import { notificationService } from '@/services/notificationService';
import { Ride, rideService, RideStats } from '@/services/rideService';
import { userService } from '@/services/userService';
import { WalletBalance, walletService } from '@/services/walletService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { AlertTriangle, ChevronRight, Clock, MapPin, TrendingUp, Wallet, Zap, User as UserIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { MobileHeader } from '@/components/layout/MobileHeader';

interface MobileHomeProps {
  onNavigate: (screen: string, data?: unknown) => void;
}

export function MobileHome({ onNavigate }: MobileHomeProps) {
  const {user: contextUser, refreshUser } = useMobileAuth();
  const { t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  const [user, setUser] = useState<User | null>(null);
  const [depositInfo, setDepositInfo] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingDeposit, setIsLoadingDeposit] = useState(true);
  const [realNotificationCount, setRealNotificationCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({ 
    balance: 0, 
    currency: 'XAF' 
  });
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [rideStats, setRideStats] = useState<RideStats | null>(null);
  const [isLoadingRides, setIsLoadingRides] = useState(true);
  const [ridesError, setRidesError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotificationCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setRealNotificationCount(count);
      } catch (error) {
        setRealNotificationCount(0);
      }
    };

    if (user) {
      loadNotificationCount();
    }
  }, [user]);

  const refreshNotificationCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setRealNotificationCount(count);
    } catch (error) {
    }
  };

  useEffect(() => {
    const loadDepositInfo = async () => {
      if (!user) return;
      
      try {
        setIsLoadingDeposit(true);
        const depositData = await walletService.getDepositInfo();
        setDepositInfo(depositData);
      } catch (error) {
        console.error('Error loading deposit info:', error);
        setDepositInfo(null);
      } finally {
        setIsLoadingDeposit(false);
      }
    };

    loadDepositInfo();
  }, [user]);

  const loadDepositInfo = async () => {
    if (!user) return;
    
    try {
      setIsLoadingDeposit(true);
      const depositData = await walletService.getDepositInfo();
      setDepositInfo(depositData);
    } catch (error) {
      console.error('Error loading deposit info:', error);
      setDepositInfo(null);
    } finally {
      setIsLoadingDeposit(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoadingUser(true);
        
        if (contextUser && contextUser.firstName) {
          setUser(contextUser);
          return;
        }

        const storedUser = await authService.getUser();
        if (storedUser && storedUser.firstName) {
          setUser(storedUser);
          return;
        }

        const freshUser = await userService.getProfile();
        if (freshUser && freshUser.firstName) {
          setUser(freshUser);
          await refreshUser();
          return;
        }

        const currentUser = await authService.getCurrentUser();
        if (currentUser && currentUser.firstName) {
          setUser(currentUser);
          return;
        }

        setUser(null);

      } catch (error) {
        setUser(null);  
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserData();
  }, [contextUser, refreshUser]);

  const refreshUserData = async () => {
    try {
      setIsLoadingUser(true);
      
      const freshUser = await userService.getProfile();
      if (freshUser && freshUser.firstName) {
        setUser(freshUser);
        await refreshUser();
        return;
      }

      const currentUser = await authService.getCurrentUser();
      if (currentUser && currentUser.firstName) {
        setUser(currentUser);
        await refreshUser();
        return;
      }
    } catch (error) {
      const storedUser = await authService.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    const loadWalletBalance = async () => {
      if (!user) return;
      
      try {
        setIsLoadingWallet(true);
        setWalletError(null);
        const balance = await walletService.getBalance();
        setWalletBalance(balance);
      } catch (error: any) {
        setWalletError(error.message);
        setWalletBalance({ balance: 0, currency: 'XAF' });
      } finally {
        setIsLoadingWallet(false);
      }
    };

    loadWalletBalance();
  }, [user]);

  useEffect(() => {
    const loadRidesData = async () => {
      if (!user) return;
      
      try {
        setIsLoadingRides(true);
        setRidesError(null);
        
        const ridesResponse = await rideService.getUserRides({ 
          page: 1, 
          limit: 5,
          status: 'completed'
        });

        setRecentRides(ridesResponse.rides || []);
        
        const stats = await rideService.getRideStats();
        setRideStats(stats);
        
      } catch (error: any) {
        setRidesError(error.message);
        setRecentRides([]);
        setRideStats(null);
      } finally {
        setIsLoadingRides(false);
      }
    };

    loadRidesData();
  }, [user]);

  const refreshWallet = async () => {
    if (!user) return;
    
    try {
      setWalletError(null);
      const balance = await walletService.getBalance();
      setWalletBalance(balance);
    } catch (error: any) {
      setWalletError(error.message);
    }
  };

  const refreshRidesData = async () => {
    if (!user) return;
    
    try {
      setRidesError(null);
      const [ridesResponse, stats] = await Promise.all([
        rideService.getUserRides({ page: 1, limit: 5, status: 'completed' }),
        rideService.getRideStats()
      ]);
      setRecentRides(ridesResponse.rides || []);
      setRideStats(stats);
    } catch (error: any) {
      setRidesError(error.message);
      setRecentRides([]);
    }
  };

  const refreshAllData = async () => {
    await Promise.all([
      refreshUserData(),
      loadDepositInfo(),
      refreshWallet(),
      refreshRidesData(),
      refreshNotificationCount()
    ]);
  };

  const stats = [
    {
      label: t('home.myRides'),
      value: isLoadingRides ? '...' : (rideStats?.totalRides?.toString() || '0'),
      icon: MapPin,
      color: '#2563eb',
      bgColor: colorScheme === 'light' ? '#eff6ff' : '#1e3a8a',
    },
    {
      label: t('home.totalTime'),
      value: isLoadingRides ? '...' : `${Math.round((rideStats?.totalDuration || 0) / 60)} min`,
      icon: Clock,
      color: '#7c3aed',
      bgColor: colorScheme === 'light' ? '#f3e8ff' : '#581c87',
    },
    {
      label: t('home.distance'),
      value: isLoadingRides ? '...' : `${(rideStats?.totalDistance || 0).toFixed(1)} km`,
      icon: TrendingUp,
      color: '#16a34a',
      bgColor: colorScheme === 'light' ? '#f0fdf4' : '#14532d',
    },
  ];

  return (
    <View style={styles.container}>
      <MobileHeader
        showNotifications
        notificationCount={realNotificationCount}
        onNotifications={() => {
          haptics.light();
          onNavigate('notifications');
        }}
        showRefresh={true}
        onRefresh={refreshAllData}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContentPadded, styles.gap24]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.gap8}>
          {isLoadingUser ? (
            <Text variant="title" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {t('home.welcome')}, ...
            </Text>
          ) : user?.firstName ? (
            <Text variant="title" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {t('home.welcome')}, {user.firstName}!
            </Text>
          ) : (
            <Text variant="title" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {t('home.welcome')} !
            </Text>
          )}
          <Text variant="body" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
            {t('home.findBikeDescription')}
          </Text>
        </View>

        {/* Deposit Warning */}
        {!isLoadingDeposit && depositInfo && !depositInfo.canUseService && (
          <View style={[
            styles.p16, 
            styles.rounded8, 
            { 
              backgroundColor: '#fef3c7', 
              borderWidth: 1,
              borderColor: '#f59e0b'
            }
          ]}>
            <View style={[styles.row, styles.gap12, styles.alignCenter]}>
              <AlertTriangle size={20} color="#92400e" />
              <View style={styles.flex1}>
                <Text size="sm" color="#92400e" weight="bold">
                  {t('home.depositBlocked.title')}
                </Text>
                <Text size="sm" color="#92400e" style={styles.mt4}>
                  {t('home.depositBlocked.current', { amount: depositInfo.currentDeposit || 0 })}
                </Text>
                <Text size="sm" color="#92400e" style={styles.mt4}>
                  {t('home.depositBlocked.required', { amount: depositInfo.requiredDeposit || 0 })}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    onNavigate('account-management');
                  }}
                  style={[styles.mt8]}
                >
                  <Text size="sm" color="#92400e" weight="medium">
                    {t('home.depositBlocked.action')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Wallet Card */}
        <View style={[styles.card, styles.p16, { backgroundColor: '#16a34a' }]}>
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb16]}>
            <View style={[styles.row, styles.alignCenter, styles.gap8]}>
              <Wallet size={20} color="white" />
              <Text variant="body" color="white">{t('home.wallet')}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                haptics.light();
                refreshWallet();
              }}
              disabled={isLoadingWallet}
            >
              <Zap size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mb16}>
            <Text size="sm" color="rgba(255,255,255,0.9)" style={styles.mb4}>
              {t('home.balance')}
            </Text>
            
            {isLoadingWallet ? (
              <Text variant="title" color="white" size="xl">
                {t('home.loadingWallet')}
              </Text>
            ) : walletError ? (
              <View>
                <Text variant="title" color="white" size="xl">
                  -- {walletBalance.currency}
                </Text>
                <Text size="xs" color="rgba(255,255,255,0.7)" style={styles.mt4}>
                  {t('home.loadingError')}
                </Text>
              </View>
            ) : (
              <Text variant="title" color="white" size="xl">
                {(walletBalance.balance || 0).toLocaleString()} {walletBalance.currency}
              </Text>
            )}
          </View>
          
          <Button
            variant="secondary"
            fullWidth
            onPress={() => {
              haptics.light();
              onNavigate('wallet');
            }}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            disabled={isLoadingWallet}
          >
            {t('home.topUp')}
          </Button>
        </View>

        {/* Quick Actions */}
        <View style={[styles.row, styles.gap16]}>
          <View style={styles.flex1}>
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                onNavigate('map');
              }}
              style={[
                styles.h96,
                styles.alignCenter,
                styles.justifyCenter,
                styles.gap8,
                styles.rounded12,
                styles.shadow,
                { backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937' }
              ]}
            >
              <MapPin size={24} color="#16a34a" />
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {t('home.findBike')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.flex1}>
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                onNavigate('scan');
              }}
              style={[
                styles.h96,
                styles.alignCenter,
                styles.justifyCenter,
                styles.gap8,
                styles.rounded12,
                styles.shadow,
                { backgroundColor: '#16a34a' }
              ]}
            >
              <Zap size={24} color="white" />
              <Text variant="body" color="white">
                {t('home.scanQR')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.row, styles.gap12]}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <View key={stat.label} style={styles.flex1}>
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    if (stat.label === t('home.myRides')) {
                      onNavigate('rides');
                    }
                  }}
                  style={[styles.card, styles.p16, styles.alignCenter]}
                >
                  <View 
                    style={[
                      styles.w48,
                      styles.h48,
                      styles.rounded24,
                      styles.alignCenter,
                      styles.justifyCenter,
                      styles.mb8,
                      { backgroundColor: stat.bgColor }
                    ]}
                  >
                    <Icon size={20} color={stat.color} />
                  </View>
                  <Text 
                    size="sm" 
                    color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                    style={[styles.mb4, styles.textCenter]}
                  >
                    {stat.label}
                  </Text>
                  <Text 
                    variant="body" 
                    weight="medium"
                    color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                    style={styles.textCenter}
                  >
                    {stat.value}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View>
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb16]}>
            <Text variant="subtitle" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {t('home.recentRides')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                onNavigate('rides');
              }}
              style={[styles.row, styles.alignCenter, styles.gap4]}
            >
              <Text size="sm" color="#16a34a">
                {t('home.viewAll')}
              </Text>
              <ChevronRight size={16} color="#16a34a" />
            </TouchableOpacity>
          </View>

          {isLoadingRides ? (
            <View style={[styles.card, styles.p32, styles.alignCenter]}>
              <Text variant="body" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                {t('home.loadingRides')}
              </Text>
            </View>
          ) : ridesError ? (
            <View style={[styles.card, styles.p32, styles.alignCenter]}>
              <Text variant="body" color={colorScheme === 'light' ? '#ef4444' : '#f87171'}>
                {t('home.loadingError')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  refreshRidesData();
                }}
                style={styles.mt8}
              >
                <Text size="sm" color="#16a34a">
                  {t('common.retry')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : recentRides.length > 0 ? (
            <View style={styles.gap12}>
              {recentRides.slice(0, 3).map((ride) => (
                <TouchableOpacity
                  key={ride.id}
                  onPress={() => {
                    haptics.light();
                    onNavigate('ride-details', ride);
                  }}
                >
                  <View style={[styles.card, styles.p16]}>
                    <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb8]}>
                      <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                        {ride.bike?.code || `Trajet ${ride.id?.slice(-4) || '0000'}`}
                      </Text>
                      <Text variant="body" color="#16a34a">
                        {(ride.cost || 0).toFixed(0)} {walletBalance.currency}
                      </Text>
                    </View>
                    <View style={[styles.row, styles.gap16, styles.mb8]}>
                      <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                        <Clock size={16} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                        <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                          {Math.round((ride.duration || 0) / 60)} min
                        </Text>
                      </View>
                      <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                        <MapPin size={16} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                        <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                          {(ride.distance || 0).toFixed(1)} km
                        </Text>
                      </View>
                      <View style={styles.flex1}>
                        <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
                          {ride.startTime ? new Date(ride.startTime).toLocaleDateString() : '--'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={[styles.card, styles.p32, styles.alignCenter]}>
              <MapPin size={48} color={colorScheme === 'light' ? '#d1d5db' : '#4b5563'} style={styles.mb12} />
              <Text variant="body" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                {t('home.noRides')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  onNavigate('map');
                }}
                style={styles.mt8}
              >
                <Text size="sm" color="#16a34a">
                  {t('home.startRide')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Access to Account */}
        <TouchableOpacity
          onPress={() => {
            haptics.light();
            onNavigate('account-management');
          }}
          style={[styles.card, styles.p16, styles.row, styles.spaceBetween, styles.alignCenter]}
        >
          <View style={[styles.row, styles.alignCenter, styles.gap12]}>
            <View 
              style={[
                styles.w48,
                styles.h48,
                styles.rounded24,
                styles.alignCenter,
                styles.justifyCenter,
                { backgroundColor: colorScheme === 'light' ? '#eff6ff' : '#1e3a8a' }
              ]}
            >
              <UserIcon size={20} color="#3b82f6" />
            </View>
            <View>
              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {t('home.accountManagement')}
              </Text>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                {t('home.accountManagementDesc')}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}