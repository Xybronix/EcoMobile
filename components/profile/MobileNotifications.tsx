import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/services/notificationService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { AlertCircle, ArrowLeft, Bell, Bike, Clock, CreditCard, Package } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface MobileNotificationsProps {
  onNavigate: (screen: string) => void;
}

export function MobileNotifications({ onNavigate }: MobileNotificationsProps) {
  const { language, t } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const result = await notificationService.getNotifications(1, 50);
      setNotifications(result.notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAllRead(true);
      await notificationService.markAllAsRead();
      
      // Mettre à jour les notifications localement
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      haptics.success();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        
        // Mettre à jour localement
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        
        haptics.light();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    } else {
      haptics.light();
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Bike size={20} color="#16a34a" />;
      case 'success':
        return <CreditCard size={20} color="#3b82f6" />;
      case 'promotional':
        return <Package size={20} color="#7c3aed" />;
      case 'warning':
        return <AlertCircle size={20} color="#f59e0b" />;
      case 'error':
        return <AlertCircle size={20} color="#dc2626" />;
      default:
        return <Bell size={20} color="#6b7280" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return colorScheme === 'light' ? '#f0fdf4' : '#14532d';
      case 'success':
        return colorScheme === 'light' ? '#eff6ff' : '#1e3a8a';
      case 'promotional':
        return colorScheme === 'light' ? '#f3e8ff' : '#581c87';
      case 'warning':
        return colorScheme === 'light' ? '#fef3c7' : '#92400e';
      case 'error':
        return colorScheme === 'light' ? '#fef2f2' : '#7f1d1d';
      default:
        return colorScheme === 'light' ? '#f3f4f6' : '#374151';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 60) {
      return language === 'fr' ? `Il y a ${diffMinutes} min` : `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return language === 'fr' ? `Il y a ${diffHours}h` : `${diffHours}h ago`;
    } else {
      return language === 'fr' ? `Il y a ${diffDays}j` : `${diffDays}d ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

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
                {t('nav.notifications')}
              </Text>
              {unreadCount > 0 && (
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                  {unreadCount} {t('notifications.unread')}
                </Text>
              )}
            </View>
          </View>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onPress={handleMarkAllAsRead}
              disabled={isMarkingAllRead}
            >
              {t('notifications.markAllRead')}
            </Button>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContentPadded, styles.gap12]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadNotifications}
            colors={['#16a34a']}
            tintColor="#16a34a"
          />
        }
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
              {t('notifications.empty.title')}
            </Text>
            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.textCenter}>
              {t('notifications.empty.description')}
            </Text>
          </Card>
        ) : (
          <>
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <View style={styles.mb24}>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mb12, styles.px8]}>
                  {t('notifications.sections.unread')}
                </Text>
                <View style={styles.gap12}>
                  {unreadNotifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      onPress={() => handleNotificationPress(notification)}
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
                                {t('notifications.new')}
                              </Badge>
                            </View>
                            <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb8}>
                              {notification.message}
                            </Text>
                            <View style={[styles.row, styles.alignCenter, styles.gap4]}>
                              <Clock size={12} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
                              <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                                {formatTime(notification.createdAt)}
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
            {readNotifications.length > 0 && (
              <View>
                <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={[styles.mb12, styles.px8]}>
                  {t('notifications.sections.previous')}
                </Text>
                <View style={[styles.gap12]}>
                  {readNotifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      onPress={() => handleNotificationPress(notification)}
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
                                {formatTime(notification.createdAt)}
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