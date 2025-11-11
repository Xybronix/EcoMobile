// components/ui/AlertDialog.tsx
import React from "react";
import { Modal, View, TouchableOpacity } from "react-native";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Text } from './Text';
import { haptics } from '@/utils/haptics';

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function AlertDialog({ open, onOpenChange, children, ...props }: AlertDialogProps) {
  return (
    <Modal
      visible={open}
      animationType="fade"
      transparent={true}
      onRequestClose={() => onOpenChange?.(false)}
      {...props}
    >
      {children}
    </Modal>
  );
}

function AlertDialogContent({ children, ...props }: any) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  return (
    <View 
      style={[
        styles.flex1, 
        styles.justifyCenter, 
        styles.alignCenter,
        { backgroundColor: 'rgba(0,0,0,0.5)' }
      ]} 
      {...props}
    >
      <View 
        style={[
          styles.p24,
          styles.rounded12,
          styles.shadow,
          { 
            backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
            maxWidth: 320,
            width: '90%'
          }
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function AlertDialogHeader({ children, ...props }: any) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  return (
    <View style={styles.mb16} {...props}>
      {children}
    </View>
  );
}

function AlertDialogTitle({ children, ...props }: any) {
  const colorScheme = useColorScheme();
  return (
    <Text 
      size="lg" 
      weight="semibold" 
      color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
      {...props}
    >
      {children}
    </Text>
  );
}

function AlertDialogDescription({ children, ...props }: any) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  return (
    <Text 
      size="sm" 
      color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
      style={styles.mt4}
      {...props}
    >
      {children}
    </Text>
  );
}

function AlertDialogFooter({ children, ...props }: any) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  return (
    <View style={[styles.row, styles.gap8, { justifyContent: 'flex-end' }, styles.mt24]} {...props}>
      {children}
    </View>
  );
}

function AlertDialogAction({ children, onPress, style, ...props }: any) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  return (
    <TouchableOpacity
      onPress={() => {
        haptics.light();
        onPress?.();
      }}
      style={[
        styles.px16,
        styles.py8,
        styles.rounded8,
        { backgroundColor: '#ef4444' },
        style
      ]}
      {...props}
    >
      <Text size="sm" color="white" weight="medium">{children}</Text>
    </TouchableOpacity>
  );
}

function AlertDialogCancel({ children, onPress, ...props }: any) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  return (
    <TouchableOpacity
      onPress={() => {
        haptics.light();
        onPress?.();
      }}
      style={[
        styles.px16,
        styles.py8,
        styles.rounded8,
        { 
          borderWidth: 1, 
          borderColor: colorScheme === 'light' ? '#d1d5db' : '#4b5563',
          backgroundColor: 'transparent'
        }
      ]}
      {...props}
    >
      <Text size="sm" color={colorScheme === 'light' ? '#374151' : '#d1d5db'} weight="medium">
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};