// components/ui/Sheet.tsx
import React from 'react';
import { Modal, View, ViewStyle, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Text } from './Text';
import { X } from 'lucide-react-native';

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={true}
      onRequestClose={() => onOpenChange?.(false)}
    >
      {children}
    </Modal>
  );
}

interface SheetContentProps {
  side?: "top" | "right" | "bottom" | "left";
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  gap?: number;
  showCloseButton?: boolean;
  onClose?: () => void;
}

function SheetContent({ children, side = "bottom", className, style, gap, showCloseButton = true, onClose, ...props }: SheetContentProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  const getContentStyle = () => {
    const baseStyle = {
      backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    };

    switch (side) {
      case 'top':
        return {
          ...baseStyle,
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          paddingTop: showCloseButton ? 48 : 16,
        };
      case 'bottom':
        return {
          ...baseStyle,
          position: 'absolute' as const,
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '85%',
        };
      case 'left':
        return {
          ...baseStyle,
          position: 'absolute' as const,
          top: 0,
          bottom: 0,
          left: 0,
          width: '75%',
          maxWidth: 400,
          borderTopRightRadius: 16,
          borderBottomRightRadius: 16,
        };
      case 'right':
        return {
          ...baseStyle,
          position: 'absolute' as const,
          top: 0,
          bottom: 0,
          right: 0,
          width: '75%',
          maxWidth: 400,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        };
      default:
        return baseStyle;
    }
  };

  const contentStyle = {
    ...getContentStyle(),
    ...(gap !== undefined ? { gap } : styles.gap16),
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    const parent = props as any;
    if (parent.onOpenChange) {
      parent.onOpenChange(false);
    }
  };

  return (
    <View style={[styles.flex1, { backgroundColor: 'rgba(0,0,0,0.5)' }]} {...props}>
      <TouchableOpacity
        style={styles.flex1}
        activeOpacity={1}
        onPress={handleClose}
      />
      
      <View style={[contentStyle, style]}>
        {showCloseButton && (
          <TouchableOpacity
            style={[
              styles.absolute,
              {
                top: 12,
                right: 12,
                zIndex: 10,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151',
                alignItems: 'center',
                justifyContent: 'center',
              }
            ]}
            onPress={handleClose}
          >
            <X size={20} color={colorScheme === 'light' ? '#374151' : '#d1d5db'} />
          </TouchableOpacity>
        )}
        
        {children}
      </View>
    </View>
  );
}

interface SheetHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gap?: number;
}

function SheetHeader({ children, style, gap }: SheetHeaderProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  const headerStyle = {
    ...styles.p16,
    ...(gap !== undefined ? { gap } : styles.gap4),
  };

  return (
    <View style={[headerStyle, style]}>
      {children}
    </View>
  );
}

interface SheetTitleProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

function SheetTitle({ children, style }: SheetTitleProps) {
  const colorScheme = useColorScheme();
  return (
    <Text 
      size="lg" 
      weight="semibold" 
      color={colorScheme === 'light' ? '#111827' : '#f9fafb'}
      style={style as any}
    >
      {children}
    </Text>
  );
}

interface SheetDescriptionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

function SheetDescription({ children, style }: SheetDescriptionProps) {
  const colorScheme = useColorScheme();
  return (
    <Text 
      size="sm" 
      color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'}
      style={style as any}
    >
      {children}
    </Text>
  );
}

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};