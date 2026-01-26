// components/ui/Card.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import { Text } from './Text';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle | ViewStyle[];
}

export function Card({ 
  children, 
  variant = 'default', 
  padding = 'md',
  style,
  ...props 
}: CardProps) {
  const colorScheme = useColorScheme();

  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return {};
      case 'sm':
        return { padding: 12 };
      case 'md':
        return { padding: 16 };
      case 'lg':
        return { padding: 24 };
      default:
        return { padding: 16 };
    }
  };

  const getVariantStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colorScheme === 'light' ? 'white' : '#1f2937',
      borderRadius: 12,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colorScheme === 'light' ? '#e5e7eb' : '#374151',
        };
      case 'elevated':
        return {
          ...baseStyle,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: colorScheme === 'light' ? 0.1 : 0.2,
          shadowRadius: 8,
          elevation: 4,
        };
      default:
        return {
          ...baseStyle,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: colorScheme === 'light' ? 0.05 : 0.1,
          shadowRadius: 4,
          elevation: 2,
        };
    }
  };

  const cardStyle: ViewStyle = {
    ...getVariantStyle(),
    ...getPaddingStyle(),
  };

  // Gérer les styles comme array ou objet simple
  const combinedStyle = Array.isArray(style) 
    ? [cardStyle, ...style] 
    : [cardStyle, style];

  return (
    <View style={combinedStyle} {...props}>
      {children}
    </View>
  );
}

// Composants d'aide pour Card
export function CardHeader({ 
  children, 
  style,
  ...props 
}: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  
  return (
    <View 
      style={[
        { 
          paddingBottom: 16,
          gap: 4 
        }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

export function CardTitle({ 
  children, 
  style,
  ...props 
}: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Text 
      size="xl" 
      weight="semibold" 
      color={colors.text}
      style={style as any}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardDescription({ 
  children, 
  style,
  ...props 
}: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Text 
      size="sm" 
      color={colors.icon}
      style={style as any}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardContent({ 
  children, 
  style,
  ...props 
}: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ 
  children, 
  style,
  ...props 
}: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  
  return (
    <View 
      style={[
        styles.row,
        styles.alignCenter,
        { paddingTop: 16 },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

export function CardAction({ 
  children, 
  style,
  ...props 
}: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return (
    <View 
      style={[
        { alignSelf: 'flex-start' }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}