import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { notificationService } from '@/services/notificationService';
import { userService } from '@/services/userService';
import type { UserStats } from '@/services/userService';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { storeLanguage } from '@/utils/storage';
import { Bell, ChevronRight, FileText, Globe, HelpCircle, LogOut, MessageCircle, Shield, User, Wallet, Mail, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { authService } from '@/services/authService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface MobileProfileProps {
  onNavigate: (screen: string) => void;
}

export default function MobileProfile({ onNavigate }: MobileProfileProps) {
  const { user, logout } = useMobileAuth();
  const { t, language, setLanguage } = useMobileI18n();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      const [stats, unreadCount, notificationsEnabled] = await Promise.all([
        userService.getStats(),
        userService.getUnreadNotificationsCount(),
        notificationService.areNotificationsEnabled()
      ]);

      setUserStats(stats);
      setUnreadNotifications(unreadCount);
      setNotifications(notificationsEnabled);
      
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      haptics.light();
      
      if (newLanguage !== 'fr' && newLanguage !== 'en') {
        console.error('Invalid language:', newLanguage);
        return;
      }
      
      setLanguage(newLanguage);
      await storeLanguage(newLanguage);
      
      await userService.updateProfile({ language: newLanguage });
      
      toast.success(t('profile.languageUpdated'));
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error(t('common.error'));
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    try {
      haptics.light();
      setNotifications(enabled);
      
      await notificationService.updatePreferences({
        pushNotifications: enabled,
        emailNotifications: enabled,
      });
      
      toast.success(enabled ? t('profile.notificationsEnabled') : t('profile.notificationsDisabled'));
    } catch (error) {
      console.error('Error updating notifications:', error);
      setNotifications(!enabled);
      toast.error(t('common.error'));
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  const menuSections = [
    {
      title: t('profile.sections.account'),
      items: [
        {
          icon: User,
          label: t('profile.editProfile'),
          onPress: () => {
            haptics.light();
            onNavigate('edit-profile');
          },
          color: '#2563eb',
        },
        {
          icon: Wallet,
          label: t('profile.accountManagement'),
          onPress: () => {
            haptics.light();
            onNavigate('account-management');
          },
          color: '#16a34a',
          badge: unreadNotifications > 0 ? unreadNotifications : undefined,
        },
        {
          icon: Shield,
          label: t('profile.security'),
          onPress: () => {
            haptics.light();
            onNavigate('security');
          },
          color: '#16a34a',
        },
      ],
    },
    {
      title: t('profile.sections.preferences'),
      items: [
        {
          icon: Globe,
          label: t('profile.language'),
          onPress: () => {
            haptics.light();
          },
          color: '#7c3aed',
          rightElement: (
            <View style={[styles.row, styles.gap8]}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleLanguageChange('fr');
                }}
                style={[
                  styles.px12,
                  styles.py4,
                  styles.roundedFull,
                  {
                    backgroundColor: language === 'fr' ? '#16a34a' : 
                      colorScheme === 'light' ? '#e5e7eb' : '#374151',
                  }
                ]}
              >
                <Text 
                  size="sm" 
                  color={language === 'fr' ? 'white' : 
                    colorScheme === 'light' ? '#4b5563' : '#9ca3af'}
                >
                  FR
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleLanguageChange('en');
                }}
                style={[
                  styles.px12,
                  styles.py4,
                  styles.roundedFull,
                  {
                    backgroundColor: language === 'en' ? '#16a34a' : 
                      colorScheme === 'light' ? '#e5e7eb' : '#374151',
                  }
                ]}
              >
                <Text 
                  size="sm" 
                  color={language === 'en' ? 'white' : 
                    colorScheme === 'light' ? '#4b5563' : '#9ca3af'}
                >
                  EN
                </Text>
              </TouchableOpacity>
            </View>
          ),
        },
        {
          icon: Bell,
          label: t('profile.notifications'),
          onPress: () => {
            haptics.light();
          },
          color: '#d97706',
          rightElement: (
            <Switch
              value={notifications}
              onValueChange={(value) => {
                haptics.light();
                handleNotificationsToggle(value);
              }}
              trackColor={{ false: colorScheme === 'light' ? '#d1d5db' : '#4b5563', true: '#16a34a' }}
              thumbColor="white"
              ios_backgroundColor={colorScheme === 'light' ? '#d1d5db' : '#4b5563'}
            />
          ),
        },
      ],
    },
    {
      title: t('profile.sections.support'),
      items: [
        {
          icon: MessageCircle,
          label: t('profile.chatSupport'),
          onPress: () => {
            haptics.light();
            onNavigate('chat');
          },
          color: '#16a34a',
        },
        {
          icon: HelpCircle,
          label: t('profile.help'),
          onPress: () => {
            haptics.light();
            toast.info(t('profile.helpComingSoon'));
          },
          color: '#ea580c',
        },
        {
          icon: FileText,
          label: t('profile.legal'),
          onPress: () => {
            haptics.light();
            toast.info(t('profile.legalComingSoon'));
          },
          color: '#6b7280',
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <MobileHeader 
        title={t('profile.title')} 
        showNotifications
        notificationCount={unreadNotifications}
        onNotifications={() => {
          haptics.light();
          onNavigate('notifications');
        }}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.p24, styles.pb32]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadProfileData}
            colors={['#16a34a']}
            tintColor="#16a34a"
          />
        }
      >
        {/* Profile Card */}
        <View style={[styles.card, styles.p24, styles.mb24]}>
          <View style={[styles.row, styles.alignCenter, styles.gap16]}>
            <View 
              style={[
                styles.w48,
                styles.h48,
                styles.roundedFull,
                styles.alignCenter,
                styles.justifyCenter,
                { backgroundColor: '#16a34a' }
              ]}
            >
              <Text variant="title" color="white" size="lg">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Text>
            </View>
            <View style={styles.flex1}>
              <Text 
                variant="body" 
                color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                style={styles.mb4}
              >
                {user?.firstName} {user?.lastName}
              </Text>
              <Text 
                size="sm" 
                color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                style={styles.mb8}
              >
                {user?.email}
              </Text>
              <View style={[styles.row, styles.gap8]}>
                {user?.emailVerified ? (
                  <View 
                    style={[
                      styles.px8,
                      styles.py4,
                      styles.rounded4,
                      { backgroundColor: '#dcfce7' }
                    ]}
                  >
                    <Text size="xs" color="#166534">
                      ✓ {t('profile.emailVerified')}
                    </Text>
                  </View>
                ) : (
                  <View 
                    style={[
                      styles.px8,
                      styles.py4,
                      styles.rounded4,
                      { backgroundColor: '#fef3c7' }
                    ]}
                  >
                    <Text size="xs" color="#92400e">
                      ⚠ {t('profile.emailNotVerified')}
                    </Text>
                  </View>
                )}
                {user?.phoneVerified ? (
                  <View 
                    style={[
                      styles.px8,
                      styles.py4,
                      styles.rounded4,
                      { backgroundColor: '#dbeafe' }
                    ]}
                  >
                    <Text size="xs" color="#1e40af">
                      ✓ {t('profile.phoneVerified')}
                    </Text>
                  </View>
                ) : (
                  <View 
                    style={[
                      styles.px8,
                      styles.py4,
                      styles.rounded4,
                      { backgroundColor: '#fef3c7' }
                    ]}
                  >
                    <Text size="xs" color="#92400e">
                      ⚠ {t('profile.phoneNotVerified')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Verification Status Card */}
        <Card style={[styles.p6, styles.mb6]}>
          <Text style={[styles.textLg, styles.fontBold, styles.mb4]}>
            {t('profile.verificationStatus')}
          </Text>
          
          {/* Email Verification */}
          <View style={[styles.mb4, styles.p4, { backgroundColor: '#f3f4f6', borderRadius: 8 }]}>
            <View style={[styles.row, styles.alignCenter, styles.justifyBetween, styles.mb2]}>
              <View style={[styles.row, styles.alignCenter]}>
                <Mail size={20} color={user?.emailVerified ? '#16a34a' : '#d97706'} />
                <Text style={[styles.text, styles.fontSemibold, styles.ml2]}>
                  {t('profile.emailVerification')}
                </Text>
              </View>
              {user?.emailVerified ? (
                <Badge variant="success"><CheckCircle size={14} /> {t('common.verified')}</Badge>
              ) : (
                <Badge variant="warning"><AlertCircle size={14} /> {t('common.notVerified')}</Badge>
              )}
            </View>
            {!user?.emailVerified && (
              <TouchableOpacity
                onPress={async () => {
                  try {
                    haptics.light();
                    await authService.resendEmailVerification();
                    toast.success(t('auth.email.verificationSent'));
                  } catch (error: any) {
                    haptics.error();
                    toast.error(error.message || t('common.error'));
                  }
                }}
                style={[styles.mt2]}
              >
                <Text style={[styles.text, styles.textPrimary, styles.fontSemibold]}>
                  {t('auth.email.resendVerification')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Phone Verification */}
          <View style={[styles.mb4, styles.p4, { backgroundColor: '#f3f4f6', borderRadius: 8 }]}>
            <View style={[styles.row, styles.alignCenter, styles.justifyBetween, styles.mb2]}>
              <View style={[styles.row, styles.alignCenter]}>
                <Phone size={20} color={user?.phoneVerified ? '#16a34a' : '#d97706'} />
                <Text style={[styles.text, styles.fontSemibold, styles.ml2]}>
                  {t('profile.phoneVerification')}
                </Text>
              </View>
              {user?.phoneVerified ? (
                <Badge variant="success"><CheckCircle size={14} /> {t('common.verified')}</Badge>
              ) : (
                <Badge variant="warning"><AlertCircle size={14} /> {t('common.notVerified')}</Badge>
              )}
            </View>
            {!user?.phoneVerified && (
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  onNavigate('verify-phone');
                }}
                style={[styles.mt2]}
              >
                <Text style={[styles.text, styles.textPrimary, styles.fontSemibold]}>
                  {t('auth.phone.verifyNow')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Account Status */}
          {user?.status === 'pending_verification' && (
            <View style={[styles.p4, { backgroundColor: '#fef3c7', borderRadius: 8 }]}>
              <View style={[styles.row, styles.alignCenter, styles.mb2]}>
                <AlertCircle size={20} color="#d97706" />
                <Text style={[styles.text, styles.fontSemibold, styles.ml2, { color: '#92400e' }]}>
                  {t('profile.accountPendingVerification')}
                </Text>
              </View>
              <Text style={[styles.textSm, { color: '#78350f' }, styles.mb2]}>
                {t('profile.submitDocumentsToActivate')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  onNavigate('submit-documents');
                }}
                style={[styles.mt2]}
              >
                <Text style={[styles.text, styles.textPrimary, styles.fontSemibold]}>
                  {t('profile.submitDocuments')} →
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Menu Sections */}
        <View style={styles.gap24}>
          {menuSections.map((section) => (
            <View key={section.title}>
              <Text 
                size="sm" 
                color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                style={[styles.mb12, styles.px8]}
              >
                {section.title}
              </Text>
              <View style={[styles.card, styles.rounded12]}>
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.label}
                      onPress={item.onPress}
                      style={[
                        styles.row,
                        styles.alignCenter,
                        styles.gap12,
                        styles.p16,
                        index > 0 && {
                          borderTopWidth: 1,
                          borderTopColor: colorScheme === 'light' ? '#f3f4f6' : '#374151'
                        }
                      ]}
                    >
                      <View 
                        style={[
                          styles.roundedFull,
                          styles.alignCenter,
                          styles.justifyCenter
                        ]}
                      >
                        <Icon size={20} color={item.color} />
                      </View>
                      <Text 
                        variant="body" 
                        color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                        style={styles.flex1}
                      >
                        {item.label}
                      </Text>
                      {('rightElement' in item) ? item.rightElement : <ChevronRight size={20} color="#9ca3af" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Stats */}
        {userStats && (
          <View 
            style={[
              styles.card, 
              styles.p24, 
              styles.mt24,
              { 
                backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#14532d',
              }
            ]}
          >
            <Text 
              variant="body" 
              color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
              style={styles.mb16}
            >
              {t('profile.yourStats')}
            </Text>
            <View style={[styles.row, styles.gap16]}>
              <View style={[styles.flex1, styles.alignCenter]}>
                <Text 
                  variant="title" 
                  color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                  style={styles.mb4}
                >
                  {userStats.rides?.total || 0}
                </Text>
                <Text 
                  size="sm" 
                  color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                  style={styles.textCenter}
                >
                  {t('profile.stats.rides')}
                </Text>
              </View>
              <View style={[styles.flex1, styles.alignCenter]}>
                <Text 
                  variant="title" 
                  color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                  style={styles.mb4}
                >
                  {(userStats.rides?.totalDistance || 0).toFixed(1)}
                </Text>
                <Text 
                  size="sm" 
                  color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                  style={styles.textCenter}
                >
                  {t('profile.stats.km')}
                </Text>
              </View>
              <View style={[styles.flex1, styles.alignCenter]}>
                <Text 
                  variant="title" 
                  color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                  style={styles.mb4}
                >
                  {(userStats.carbonSaved || 0).toFixed(1)}
                </Text>
                <Text 
                  size="sm" 
                  color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                  style={styles.textCenter}
                >
                  {t('profile.stats.carbonSaved')}
                </Text>
              </View>
            </View>
            {userStats.averageRating > 0 && (
              <View style={[styles.row, styles.alignCenter, styles.justifyCenter, styles.mt16]}>
                <Text 
                  size="sm" 
                  color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
                  style={styles.mr8}
                >
                  {t('profile.stats.averageRating')}:
                </Text>
                <Text 
                  variant="body" 
                  color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                  weight="medium"
                >
                  {`${t('profile.stats.rating')}: ${(userStats.averageRating || 0).toFixed(1)}`}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Logout Button */}
        <Button
          onPress={() => {
            haptics.light();
            setShowLogoutDialog(true);
          }}
          variant="outline"
          style={[
            styles.mt24,
            styles.mb16,
            {
              borderColor: '#fca5a5',
              backgroundColor: 'transparent',
            }
          ]}
        >
          <View style={[styles.row, styles.alignCenter, styles.justifyCenter]}>
            <LogOut size={20} color="#dc2626" style={styles.mr8} />
            <Text color="#dc2626" weight="medium">
              {t('auth.logout')}
            </Text>
          </View>
        </Button>

        {/* Version */}
        <Text 
          size="sm" 
          color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'}
          style={styles.textCenter}
        >
          {t('profile.version')} 1.0.0
        </Text>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('profile.logoutConfirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('profile.logoutConfirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onPress={() => setShowLogoutDialog(false)}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={handleLogout}
              style={{ backgroundColor: '#dc2626' }}
            >
              {t('auth.logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}