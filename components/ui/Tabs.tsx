// components/ui/Tabs.tsx
import React, { createContext, useContext } from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Text } from './Text';
import { haptics } from '@/utils/haptics';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  gap?: number;
}

function Tabs({ value, onValueChange, children, gap = 8 }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View style={{ gap }}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

function TabsList({ children, className, style }: TabsListProps) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  return (
    <View style={[
      styles.row,
      styles.alignCenter,
      { 
        backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#374151',
        borderRadius: 12,
        padding: 3,
        height: 50
      },
      style
    ]}>
      {children}
    </View>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

function TabsTrigger({ value, children, className, style }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <TouchableOpacity
      onPress={() => {
        haptics.light();
        context.onValueChange(value);
      }}
      style={[
        styles.flex1,
        styles.alignCenter,
        styles.justifyCenter,
        styles.px12,
        styles.py8,
        styles.rounded8,
        { 
          backgroundColor: isActive 
            ? (colorScheme === 'light' ? 'white' : '#1f2937')
            : 'transparent',
          borderWidth: isActive ? 1 : 0,
          borderColor: colorScheme === 'light' ? '#e5e7eb' : '#4b5563'
        },
        style
      ]}
    >
      {typeof children === 'string' ? (
        <Text 
          size="sm" 
          weight="medium"
          color={isActive 
            ? (colorScheme === 'light' ? '#111827' : '#f9fafb')
            : (colorScheme === 'light' ? '#6b7280' : '#9ca3af')
          }
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  gap?: number;
}

function TabsContent({ value, children, className, style, gap }: TabsContentProps) {
  const context = useContext(TabsContext);
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return (
    <View style={[styles.flex1, { marginTop: 16, gap }, style]}>
      {children}
    </View>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };