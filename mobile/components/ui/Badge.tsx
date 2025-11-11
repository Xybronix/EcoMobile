// components/ui/Badge.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import { Text } from './Text';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  style,
  ...props 
}: BadgeProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { 
          paddingHorizontal: 6, 
          paddingVertical: 2, 
          borderRadius: 4,
          minHeight: 20 
        };
      case 'md':
        return { 
          paddingHorizontal: 8, 
          paddingVertical: 4, 
          borderRadius: 6,
          minHeight: 24 
        };
      case 'lg':
        return { 
          paddingHorizontal: 12, 
          paddingVertical: 6, 
          borderRadius: 8,
          minHeight: 32 
        };
      default:
        return {};
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151',
        };
      case 'destructive':
        return {
          backgroundColor: '#ef4444',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colorScheme === 'light' ? '#d1d5db' : '#4b5563',
        };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'default':
      case 'destructive':
        return 'white';
      case 'secondary':
        return colorScheme === 'light' ? '#111827' : '#f9fafb';
      case 'outline':
        return colors.text;
      default:
        return 'white';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'xs' as const;
      case 'md':
        return 'sm' as const;
      case 'lg':
        return 'base' as const;
      default:
        return 'sm' as const;
    }
  };

  const badgeStyle = {
    ...styles.alignCenter,
    ...styles.justifyCenter,
    ...getSizeStyle(),
    ...getVariantStyle(),
    flexDirection: 'row' as const,
  };

  return (
    <View style={[badgeStyle, style]} {...props}>
      <Text 
        size={getTextSize()} 
        weight="medium" 
        color={getTextColor()}
        style={{ textAlign: 'center' }}
      >
        {children}
      </Text>
    </View>
  );
}