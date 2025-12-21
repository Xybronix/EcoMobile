import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { AlertTriangle, X } from 'lucide-react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  type = 'info'
}: ConfirmModalProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const { width } = Dimensions.get('window');

  const getTypeColors = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: '#dc2626',
          confirmBg: '#dc2626',
          confirmText: 'white'
        };
      case 'warning':
        return {
          iconColor: '#f59e0b',
          confirmBg: '#f59e0b',
          confirmText: 'white'
        };
      default:
        return {
          iconColor: '#3b82f6',
          confirmBg: '#3b82f6',
          confirmText: 'white'
        };
    }
  };

  const typeColors = getTypeColors();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[
        styles.flex1,
        styles.justifyCenter,
        styles.alignCenter,
        {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          paddingHorizontal: 20
        }
      ]}>
        <Card style={[
          {
            width: Math.min(width - 40, 400),
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937'
          },
          styles.p24
        ]}>
          {/* Header */}
          <View style={[styles.row, styles.alignCenter, styles.mb16]}>
            <View style={[
              styles.p12,
              styles.rounded12,
              styles.mr16,
              {
                backgroundColor: type === 'danger' ? '#fef2f2' : 
                               type === 'warning' ? '#fef3c7' : '#eff6ff'
              }
            ]}>
              <AlertTriangle size={24} color={typeColors.iconColor} />
            </View>
            <View style={styles.flex1}>
              <Text variant="subtitle" color={colorScheme === 'light' ? '#111827' : '#f9fafb'}>
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.p8}>
              <X size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
            </TouchableOpacity>
          </View>

          {/* Message */}
          <Text 
            size="sm" 
            color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
            style={styles.mb24}
          >
            {message}
          </Text>

          {/* Actions */}
          <View style={[styles.row, styles.gap12]}>
            <Button
              variant="outline"
              onPress={onCancel}
              style={styles.flex1}
            >
              <Text color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}>
                {cancelText}
              </Text>
            </Button>
            <Button
              onPress={onConfirm}
              style={[
                styles.flex1,
                { backgroundColor: typeColors.confirmBg }
              ]}
            >
              <Text color={typeColors.confirmText}>
                {confirmText}
              </Text>
            </Button>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

interface InfoModalProps {
  visible: boolean;
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}

export function InfoModal({ visible, title, content, onClose }: InfoModalProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const { width, height } = Dimensions.get('window');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[
        styles.flex1,
        styles.justifyEnd,
        {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }
      ]}>
        {/* Overlay cliquable pour fermer */}
        <TouchableOpacity
          style={styles.flex1}
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Contenu du modal */}
        <Card style={[
          {
            width: width,
            maxHeight: height * 0.85,
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            marginTop: 'auto',
          },
          styles.p24
        ]}>
          {/* Header */}
          <View style={[styles.row, styles.spaceBetween, styles.alignCenter, styles.mb16]}>
            <View style={[styles.flex1, styles.mr12]}>
              <Text 
                variant="subtitle" 
                color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flexShrink: 1 }}
              >
                {title}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              style={[
                styles.p8, 
                styles.rounded8,
                {
                  backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151',
                  flexShrink: 0
                }
              ]}
            >
              <X size={20} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
            </TouchableOpacity>
          </View>

          {/* Contenu scrollable */}
          <ScrollView 
            style={{ maxHeight: height * 0.7 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {content}
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
}

// Hook personnalisé pour gérer les modals
export function useCustomModals() {
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    content: React.ReactNode;
  }>({
    visible: false,
    title: '',
    content: null
  });

  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'info'
  ) => {
    setConfirmModal({
      visible: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  const hideConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, visible: false }));
  };

  const showInfoModal = (title: string, content: React.ReactNode) => {
    setInfoModal({
      visible: true,
      title,
      content
    });
  };

  const hideInfoModal = () => {
    setInfoModal(prev => ({ ...prev, visible: false }));
  };

  return {
    // Confirm Modal
    ConfirmModalComponent: () => (
      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => {
          confirmModal.onConfirm();
          hideConfirmModal();
        }}
        onCancel={hideConfirmModal}
        type={confirmModal.type}
      />
    ),
    showConfirmModal,
    hideConfirmModal,

    // Info Modal
    InfoModalComponent: () => (
      <InfoModal
        visible={infoModal.visible}
        title={infoModal.title}
        content={infoModal.content}
        onClose={hideInfoModal}
      />
    ),
    showInfoModal,
    hideInfoModal
  };
}