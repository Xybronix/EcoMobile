// components/ui/Text.tsx
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Fonts, FontWeights } from '@/constants/fonts';

interface TextProps extends RNTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'white' | 'error' | 'success' | string;
  align?: 'left' | 'center' | 'right';
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
  lineHeight?: number;
}

const sizeMap = {
  xs: 12,
  sm: 14,
  md: 16,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export function Text({
  children,
  size = 'base',
  weight = 'normal',
  color,
  align = 'left',
  variant,
  lineHeight,
  style,
  ...props
}: TextProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const getFontFamily = () => {
    switch (weight) {
      case 'medium': return Fonts.medium;
      case 'semibold': return Fonts.semiBold;
      case 'bold': return Fonts.bold;
      default: return Fonts.regular;
    }
  };

  const getColor = () => {
    if (color === 'primary') return colors.primary;
    if (color === 'secondary') return colors.icon;
    if (color === 'muted') return colors.icon;
    if (color === 'white') return 'white';
    if (color === 'error') return '#ef4444';
    if (color === 'success') return '#10b981';
    if (color && color.startsWith('#')) return color;
    return colors.text;
  };

  const getVariantStyles = (): TextStyle => {
    switch (variant) {
      case 'title':
        return {
          fontSize: sizeMap['2xl'],
          fontFamily: Fonts.bold,
          fontWeight: FontWeights.bold,
          marginBottom: 8,
        };
      case 'subtitle':
        return {
          fontSize: sizeMap.lg,
          fontFamily: Fonts.semiBold,
          fontWeight: FontWeights.semibold,
          color: colors.icon,
        };
      case 'body':
        return {
          fontSize: sizeMap.base,
          fontFamily: Fonts.regular,
          lineHeight: 24,
        };
      case 'caption':
        return {
          fontSize: sizeMap.sm,
          fontFamily: Fonts.regular,
          color: colors.icon,
        };
      default:
        return {};
    }
  };

  const textStyle: TextStyle = {
    fontSize: sizeMap[size],
    fontFamily: getFontFamily(),
    fontWeight: FontWeights[weight],
    color: getColor(),
    textAlign: align,
    ...getVariantStyles(),
  };

  if (lineHeight) {
    textStyle.lineHeight = lineHeight;
  }

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
}