// components/mobile/MobileChat.tsx
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { ArrowLeft, Info, MoreVertical, Paperclip, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useMobileAuth } from '../../lib/mobile-auth';
import { useMobileI18n } from '../../lib/mobile-i18n';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin' | 'support';
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface MobileChatProps {
  onNavigate: (screen: string) => void;
}

// Messages mock pour la conversation avec le support
const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'support-1',
    senderName: 'Support FreeBike',
    senderRole: 'admin',
    content: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: '2',
    senderId: 'current',
    senderName: 'Vous',
    senderRole: 'user',
    content: 'Bonjour, j\'ai un problème avec mon dernier trajet',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: '3',
    senderId: 'support-1',
    senderName: 'Support FreeBike',
    senderRole: 'admin',
    content: 'Je comprends. Pouvez-vous me donner plus de détails sur le problème rencontré ?',
    timestamp: new Date(Date.now() - 1.4 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: '4',
    senderId: 'current',
    senderName: 'Vous',
    senderRole: 'user',
    content: 'Le vélo ne s\'est pas déverrouillé correctement et j\'ai été facturé quand même',
    timestamp: new Date(Date.now() - 1.3 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: '5',
    senderId: 'support-1',
    senderName: 'Support FreeBike',
    senderRole: 'admin',
    content: 'Je vérifie votre compte et vos trajets récents. Un instant s\'il vous plaît...',
    timestamp: new Date(Date.now() - 1.2 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: '6',
    senderId: 'support-1',
    senderName: 'Support FreeBike',
    senderRole: 'admin',
    content: 'J\'ai trouvé le trajet en question. Je vais procéder au remboursement immédiatement. Vous recevrez 500 XOF dans votre portefeuille dans les 5 prochaines minutes.',
    timestamp: new Date(Date.now() - 1.1 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: '7',
    senderId: 'current',
    senderName: 'Vous',
    senderRole: 'user',
    content: 'Merci beaucoup pour votre réactivité !',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
];

export function MobileChat({ onNavigate }: MobileChatProps) {
  const { t, language } = useMobileI18n();
  const { user } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    haptics.light();
    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current',
      senderName: t('chat.you'),
      senderRole: 'user',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simuler la réponse du support après 2 secondes
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'support-1',
        senderName: t('chat.support'),
        senderRole: 'admin',
        content: t('chat.autoResponse'),
        timestamp: new Date().toISOString(),
        isRead: true,
      };
      setMessages(prev => [...prev, supportMessage]);
    }, 2000);
  };

  const formatTime = (timestamp: string) => {
    const time = new Date(timestamp);
    return time.toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'light' ? 'white' : '#111827' }]}>
      {/* Header */}
      <View 
        style={[
          styles.row,
          styles.alignCenter,
          styles.gap12,
          styles.p16,
          styles.shadowLg,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderBottomWidth: 1,
            borderBottomColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            haptics.light();
            onNavigate('home');
          }}
          style={[styles.p8, styles.rounded8]}
        >
          <ArrowLeft size={20} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
        </TouchableOpacity>
        
        <View style={[styles.row, styles.alignCenter, styles.gap12, styles.flex1]}>
          <View style={styles.relative}>
            <View 
              style={[
                styles.w40,
                styles.h40,
                styles.rounded20,
                styles.alignCenter,
                styles.justifyCenter,
                { backgroundColor: '#16a34a' }
              ]}
            >
              <Text size="sm" color="white" weight="medium">S</Text>
            </View>
            <View 
              style={[
                styles.absolute,
                { bottom: 0, right: 0 },
                styles.w12,
                styles.h12,
                { borderRadius: 6 },
                { backgroundColor: '#10b981', borderWidth: 2, borderColor: 'white' }
              ]}
            />
          </View>
          
          <View style={styles.flex1}>
            <Text variant="body" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
              {t('chat.support')}
            </Text>
            <Text size="xs" color="#10b981">
              {t('chat.online')}
            </Text>
          </View>
        </View>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TouchableOpacity style={[styles.p8, styles.rounded8]}>
              <MoreVertical size={20} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
            </TouchableOpacity>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowInfoDialog(true)}>
              <Info className="w-4 h-4 mr-2" />
              {t('chat.information')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.flex1}
        contentContainerStyle={[styles.p16, styles.gap16]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View 
          style={[
            styles.p12,
            styles.rounded8,
            styles.alignCenter,
            { 
              backgroundColor: colorScheme === 'light' ? '#f0fdf4' : '#14532d', 
              borderWidth: 1,
              borderColor: '#16a34a'
            }
          ]}
        >
          <Text size="xs" color="#16a34a" style={styles.textCenter}>
            {t('chat.secureNotice')}
          </Text>
        </View>

        {/* Messages */}
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === 'current';
          const showDate = index === 0 || 
            new Date(messages[index - 1].timestamp).toDateString() !== new Date(message.timestamp).toDateString();

          return (
            <View key={message.id}>
              {/* Date separator */}
              {showDate && (
                <View style={[styles.alignCenter, styles.my16]}>
                  <View 
                    style={[
                      styles.px12,
                      styles.py4,
                      styles.rounded16,
                      { backgroundColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563' }
                    ]}
                  >
                    <Text size="xs" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                      {new Date(message.timestamp).toLocaleDateString(
                        language === 'fr' ? 'fr-FR' : 'en-US',
                        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </Text>
                  </View>
                </View>
              )}

              {/* Message */}
              <View
                style={[
                  styles.row,
                  styles.gap8,
                  isCurrentUser && { flexDirection: 'row-reverse' }
                ]}
              >
                {!isCurrentUser && (
                  <View 
                    style={[
                      styles.w32,
                      styles.h32,
                      styles.rounded16,
                      styles.alignCenter,
                      styles.justifyCenter,
                      styles.shadow,
                      { backgroundColor: '#16a34a' }
                    ]}
                  >
                    <Text size="xs" color="white" weight="medium">S</Text>
                  </View>
                )}
                
                <View style={[{ maxWidth: '75%' }, isCurrentUser && styles.alignCenter]}>
                  <View
                    style={[
                      styles.px16,
                      styles.py12,
                      { borderRadius: 16 },
                      isCurrentUser
                        ? { 
                            backgroundColor: '#16a34a', 
                            borderBottomRightRadius: 4 
                          }
                        : { 
                            backgroundColor: colorScheme === 'light' ? 'white' : '#374151',
                            borderWidth: 1,
                            borderColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563',
                            borderBottomLeftRadius: 4 
                          }
                    ]}
                  >
                    <Text 
                      size="sm" 
                      color={isCurrentUser ? 'white' : (colorScheme === 'light' ? '#111827' : '#f9fafb')}
                    >
                      {message.content}
                    </Text>
                  </View>
                  <Text 
                    size="xs" 
                    color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} 
                    style={[styles.mt4, isCurrentUser && styles.textCenter]}
                  >
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <View style={[styles.row, styles.gap8]}>
            <View 
              style={[
                styles.w32,
                styles.h32,
                styles.rounded16,
                styles.alignCenter,
                styles.justifyCenter,
                styles.shadow,
                { backgroundColor: '#16a34a' }
              ]}
            >
              <Text size="xs" color="white" weight="medium">S</Text>
            </View>
            <View 
              style={[
                styles.px16,
                styles.py12,
                { borderRadius: 16, borderBottomLeftRadius: 4 },
                { 
                  backgroundColor: colorScheme === 'light' ? 'white' : '#374151',
                  borderWidth: 1,
                  borderColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563'
                }
              ]}
            >
              <View style={[styles.row, styles.gap4]}>
                <View style={[styles.w8, styles.h8, styles.rounded4, { backgroundColor: colorScheme === 'light' ? '#9ca3af' : '#6b7280' }]} />
                <View style={[styles.w8, styles.h8, styles.rounded4, { backgroundColor: colorScheme === 'light' ? '#9ca3af' : '#6b7280' }]} />
                <View style={[styles.w8, styles.h8, styles.rounded4, { backgroundColor: colorScheme === 'light' ? '#9ca3af' : '#6b7280' }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Message Input */}
      <View 
        style={[
          styles.p16,
          styles.shadowLg,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderTopWidth: 1,
            borderTopColor: colorScheme === 'light' ? '#e5e7eb' : '#374151'
          }
        ]}
      >
        <View style={[styles.row, styles.alignCenter, styles.gap8]}>
          <TouchableOpacity 
            style={[styles.p12, styles.rounded8]}
            onPress={() => haptics.light()}
          >
            <Paperclip size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
          </TouchableOpacity>
          <Input
            placeholder={t('chat.messagePlaceholder')}
            value={newMessage}
            onChangeText={setNewMessage}
            style={styles.flex1}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
            style={[
              styles.p12,
              styles.rounded8,
              { backgroundColor: newMessage.trim() ? '#16a34a' : (colorScheme === 'light' ? '#d1d5db' : '#4b5563') }
            ]}
          >
            <Send size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text size="xs" color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} style={[styles.mt8, styles.textCenter]}>
          {t('chat.averageResponse')}
        </Text>
      </View>

      {/* Information Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('chat.information')}</DialogTitle>
            <DialogDescription>
              {language === 'fr' ? 'Informations sur le support' : 'Support Information'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {language === 'fr' ? 'Service' : 'Service'}
              </p>
              <p className="text-gray-900">{t('chat.support')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {language === 'fr' ? 'Statut' : 'Status'}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <p className="text-gray-900">{t('chat.online')}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {language === 'fr' ? 'Temps de réponse' : 'Response Time'}
              </p>
              <p className="text-gray-900">
                {language === 'fr' ? '~5 minutes' : '~5 minutes'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {language === 'fr' ? 'Disponibilité' : 'Availability'}
              </p>
              <p className="text-gray-900">
                {language === 'fr' ? 'Lun-Dim 7h-22h' : 'Mon-Sun 7am-10pm'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </View>
  );
}