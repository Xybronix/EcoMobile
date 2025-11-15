import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { haptics } from '@/utils/haptics';
import { ArrowLeft, Info, Paperclip, Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, TouchableOpacity, View, RefreshControl } from 'react-native';
import { useMobileAuth } from '@/lib/mobile-auth';
import { useMobileI18n } from '@/lib/mobile-i18n';
import { chatService, ChatMessage } from '@/services/chatService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

interface MobileChatProps {
  onNavigate: (screen: string) => void;
}

export function MobileChat({ onNavigate }: MobileChatProps) {
  const { t, language } = useMobileI18n();
  const { user } = useMobileAuth();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const result = await chatService.getMessages(1, 100); // Charger plus de messages pour le contexte
      setMessages(result.messages.reverse()); // Inverser pour avoir les plus récents en bas
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    haptics.light();
    setIsSending(true);
    
    const messageContent = newMessage;
    setNewMessage(''); // Clear input immediately

    try {
      const sentMessage = await chatService.sendMessage(messageContent);
      setMessages(prev => [...prev, sentMessage]);
      
      // Simuler la réponse du support après 2 secondes
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const supportMessage: ChatMessage = {
          id: Date.now().toString(),
          userId: 'support-admin',
          message: t('chat.autoResponse'),
          isAdmin: true,
          createdAt: new Date().toISOString(),
          user: {
            id: 'support-admin',
            firstName: 'Support',
            lastName: 'FreeBike',
            role: 'admin'
          }
        };
        setMessages(prev => [...prev, supportMessage]);
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      // Revert message on error
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
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
            onNavigate('profile');
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

        <TouchableOpacity 
          style={[styles.p8, styles.rounded8]}
          onPress={() => {
            haptics.light();
            setShowInfoDialog(true);
          }}
        >
          <Info size={20} color={colorScheme === 'light' ? '#111827' : '#f9fafb'} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.flex1}
        contentContainerStyle={[styles.p16, styles.gap16]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadMessages}
            colors={['#16a34a']}
            tintColor="#16a34a"
          />
        }
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
          const isCurrentUser = message.userId === user?.id;
          const showDate = index === 0 || 
            new Date(messages[index - 1].createdAt).toDateString() !== new Date(message.createdAt).toDateString();

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
                      {new Date(message.createdAt).toLocaleDateString(
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
                      {message.message}
                    </Text>
                  </View>
                  <Text 
                    size="xs" 
                    color={colorScheme === 'light' ? '#9ca3af' : '#6b7280'} 
                    style={[styles.mt4, isCurrentUser && styles.textCenter]}
                  >
                    {formatTime(message.createdAt)}
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
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                {t('chat.typing')}
              </Text>
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
            editable={!isSending}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            style={[
              styles.p12,
              styles.rounded8,
              { backgroundColor: (newMessage.trim() && !isSending) ? '#16a34a' : (colorScheme === 'light' ? '#d1d5db' : '#4b5563') }
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
              {t('chat.supportInfo.description')}
            </DialogDescription>
          </DialogHeader>
          <View style={styles.gap16}>
            <View>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb8}>
                {t('chat.supportInfo.service')}
              </Text>
              <Text color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>{t('chat.support')}</Text>
            </View>
            <View>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb8}>
                {t('chat.supportInfo.status')}
              </Text>
              <View style={[styles.row, styles.alignCenter, styles.gap8]}>
                <View style={[styles.w8, styles.h8, styles.rounded4, { backgroundColor: '#10b981' }]} />
                <Text color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>{t('chat.online')}</Text>
              </View>
            </View>
            <View>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb8}>
                {t('chat.supportInfo.responseTime')}
              </Text>
              <Text color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {t('chat.supportInfo.responseTimeValue')}
              </Text>
            </View>
            <View>
              <Text size="sm" color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} style={styles.mb8}>
                {t('chat.supportInfo.availability')}
              </Text>
              <Text color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {t('chat.supportInfo.availabilityValue')}
              </Text>
            </View>
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
}