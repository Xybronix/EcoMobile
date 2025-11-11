// components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import { Text } from './Text';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: 12,
        };
      case 'md':
        return {
          height: 48,
          paddingHorizontal: 16,
        };
      case 'lg':
        return {
          height: 56,
          paddingHorizontal: 20,
        };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    if (variant === 'primary') return 'white';
    if (variant === 'outline') return colors.primary;
    return colors.text;
  };

  const buttonStyle: ViewStyle = {
    ...styles.button,
    ...getVariantStyle(),
    ...getSizeStyle(),
    ...(fullWidth && { width: '100%' }),
    ...(disabled && styles.buttonDisabled),
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          color={getTextColor()}
          weight="semibold"
          size={size === 'sm' ? 'sm' : 'base'}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}