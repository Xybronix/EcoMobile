// components/ui/Sheet.tsx
import React from 'react';
import { Modal, View, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Text } from './Text';

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
}

function SheetContent({ children, side = "bottom", className, style, gap, ...props }: SheetContentProps) {
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

  return (
    <View style={[styles.flex1, { backgroundColor: 'rgba(0,0,0,0.5)' }]} {...props}>
      <View style={[contentStyle, style]}>
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