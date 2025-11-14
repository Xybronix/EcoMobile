// components/mobile/MobileNotifications.tsx
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { AlertCircle, ArrowLeft, Bell, Bike, Clock, CreditCard, Package } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '../../lib/mobile-i18n';

interface MobileNotificationsProps {
  onNavigate: (screen: string) => void;
}

interface Notification {
  id: string;
  type: 'ride' | 'payment' | 'promotion' | 'alert' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export function MobileNotifications({ onNavigate }: MobileNotificationsProps) {
  const { language } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'ride',
      title: language === 'fr' ? 'Trajet terminé' : 'Ride completed',
      message: language === 'fr' 
        ? 'Votre trajet de 15 min s\'est terminé. 750 XOF ont été débités.'
        : 'Your 15 min ride has ended. 750 XOF has been charged.',
      time: language === 'fr' ? 'Il y a 5 min' : '5 min ago',
      isRead: false,
    },
    {
      id: '2',
      type: 'promotion',
      title: language === 'fr' ? '🎉 Promotion spéciale' : '🎉 Special promotion',
      message: language === 'fr'
        ? '20% de réduction sur votre prochain trajet ! Code: BIKE20'
        : '20% off your next ride! Code: BIKE20',
      time: language === 'fr' ? 'Il y a 1h' : '1h ago',
      isRead: false,
    },
    {
      id: '3',
      type: 'payment',
      title: language === 'fr' ? 'Recharge réussie' : 'Top-up successful',
      message: language === 'fr'
        ? 'Votre compte a été rechargé de 10 000 XOF.'
        : 'Your account has been topped up with 10,000 XOF.',
      time: language === 'fr' ? 'Il y a 2h' : '2h ago',
      isRead: true,
    },
    {
      id: '4',
      type: 'alert',
      title: language === 'fr' ? 'Vélo bientôt déchargé' : 'Bike battery low',
      message: language === 'fr'
        ? 'Le vélo a 15% de batterie. Pensez à le recharger bientôt.'
        : 'Bike has 15% battery. Consider recharging soon.',
      time: language === 'fr' ? 'Il y a 1j' : '1d ago',
      isRead: true,
    },
    {
      id: '5',
      type: 'system',
      title: language === 'fr' ? 'Mise à jour disponible' : 'Update available',
      message: language === 'fr'
        ? 'Une nouvelle version de l\'application est disponible.'
        : 'A new version of the app is available.',
      time: language === 'fr' ? 'Il y a 2j' : '2d ago',
      isRead: true,
    },
  ];

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ride':
        return <Bike size={20} color="#16a34a" />;
      case 'payment':
        return <CreditCard size={20} color="#3b82f6" />;
      case 'promotion':
        return <Package size={20} color="#7c3aed" />;
      case 'alert':
        return <AlertCircle size={20} color="#f59e0b" />;
      case 'system':
        return <Bell size={20} color="#6b7280" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'ride':
        return colorScheme === 'light' ? '#f0fdf4' : '#14532d';
      case 'payment':
        return colorScheme === 'light' ? '#eff6ff' : '#1e3a8a';
      case 'promotion':
        return colorScheme === 'light' ? '#f3e8ff' : '#581c87';
      case 'alert':
        return colorScheme === 'light' ? '#fef3c7' : '#92400e';
      case 'system':
        return colorScheme === 'light' ? '#f3f4f6' : '#374151';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View 
        style={[
          styles.p16,
          styles.shadowLg,
          styles.hT10,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderBottomWidth: 1,
            borderBottomColor: colorScheme === 'light' ? '#e5e7eb' : '#374151',
            justifyContent: 'flex-end',
          }
        ]}
      >
        <View style={[styles.row, styles.spaceBetween, styles.alignCenter]}>
          <View style={[styles.row, styles.alignCenter, styles.gap12]}>
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                onNavigate('home');
              }}
              style={[styles.p8, styles.rounded8]}
            >
              <ArrowLeft size={24} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
            </TouchableOpacity>
            <View>
              <Text size='xl' weight='bold' color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {language === 'fr' ? 'Notifications' : 'Notifications'}
              </Text>
              {unreadCount > 0 && (
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {unreadCount} {language === 'fr' ? 'non lues' : 'unread'}
                </Text>
              )}
            </View>
          </View>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onPress={() => haptics.light()}
            >
              {language === 'fr' ? 'Tout marquer lu' : 'Mark all read'}
            </Button>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContentPadded, styles.gap12]}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <Card style={[styles.p48, styles.alignCenter]}>
            <View 
              style={[
                styles.w64,
                styles.h64,
                styles.rounded32,
                styles.alignCenter,
                styles.justifyCenter,
                styles.mb16,
                { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151' }
              ]}
            >
              <Bell size={32} color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} />
            </View>
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb8}>
              {language === 'fr' ? 'Aucune notification' : 'No notifications'}
            </Text>
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
              {language === 'fr'
                ? 'Vous n\'avez aucune notification pour le moment'
                : 'You have no notifications at the moment'}
            </Text>
          </Card>
        ) : (
          <>
            {/* Unread Notifications */}
            {unreadCount > 0 && (
              <View style={styles.mb24}>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mb12, styles.px8]}>
                  {language === 'fr' ? 'Non lues' : 'Unread'}
                </Text>
                <View style={styles.gap12}>
                  {notifications
                    .filter(n => !n.isRead)
                    .map((notification) => (
                      <TouchableOpacity
                        key={notification.id}
                        onPress={() => haptics.light()}
                      >
                        <Card 
                          style={[
                            styles.p16, 
                            { 
                              backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#14532d',
                              borderColor: '#16a34a'
                            }
                          ]}
                        >
                          <View style={[styles.row, styles.gap12]}>
                            <View 
                              style={[
                                styles.w40,
                                styles.h40,
                                styles.rounded20,
                                styles.alignCenter,
                                styles.justifyCenter,
                                { backgroundColor: getNotificationBgColor(notification.type) }
                              ]}
                            >
                              {getNotificationIcon(notification.type)}
                            </View>
                            <View style={styles.flex1}>
                              <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb4]}>
                                <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                                  {notification.title}
                                </Text>
                                <Badge variant="default" size="sm">
                                  {language === 'fr' ? 'Nouveau' : 'New'}
                                </Badge>
                              </View>
                              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb8}>
                                {notification.message}
                              </Text>
                              <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                                <Clock size={12} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                                <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                                  {notification.time}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </Card>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}

            {/* Read Notifications */}
            {notifications.some(n => n.isRead) && (
              <View>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mb12, styles.px8]}>
                  {language === 'fr' ? 'Précédentes' : 'Previous'}
                </Text>
                <View style={[styles.gap12]}>
                  {notifications
                    .filter(n => n.isRead)
                    .map((notification) => (
                      <TouchableOpacity
                        key={notification.id}
                        onPress={() => haptics.light()}
                        style={{ opacity: 0.8 }}
                      >
                        <Card>
                          <View style={[styles.row, styles.gap12]}>
                            <View 
                              style={[
                                styles.w40,
                                styles.h40,
                                styles.rounded20,
                                styles.alignCenter,
                                styles.justifyCenter,
                                { backgroundColor: getNotificationBgColor(notification.type) }
                              ]}
                            >
                              {getNotificationIcon(notification.type)}
                            </View>
                            <View style={styles.flex1}>
                              <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'} style={styles.mb4}>
                                {notification.title}
                              </Text>
                              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb8}>
                                {notification.message}
                              </Text>
                              <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                                <Clock size={12} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                                <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                                  {notification.time}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </Card>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}