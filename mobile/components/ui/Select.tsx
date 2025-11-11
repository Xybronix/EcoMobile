// components/ui/Select.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Text } from './Text';
import { haptics } from '@/utils/haptics';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      {children}
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  children: React.ReactNode;
  placeholder?: string;
}

function SelectTrigger({ children, placeholder }: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  if (!context) throw new Error('SelectTrigger must be used within Select');

  return (
    <TouchableOpacity
      onPress={() => {
        haptics.light();
        context.setIsOpen(true);
      }}
      style={[
        styles.input,
        styles.row,
        styles.alignCenter,
        styles.spaceBetween,
        { height: 48 }
      ]}
    >
      <Text color={context.value ? (colorScheme === 'light' ? '#111827' : '#f9fafb') : '#9ca3af'}>
        {children || placeholder}
      </Text>
      <ChevronDown size={16} color={colorScheme === 'light' ? '#6b7280' : '#9ca3af'} />
    </TouchableOpacity>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

function SelectValue({ placeholder }: SelectValueProps) {
  const context = React.useContext(SelectContext);
  const colorScheme = useColorScheme();

  if (!context) throw new Error('SelectValue must be used within Select');

  return (
    <Text color={context.value ? (colorScheme === 'light' ? '#111827' : '#f9fafb') : '#9ca3af'}>
      {context.value || placeholder}
    </Text>
  );
}

interface SelectContentProps {
  children: React.ReactNode;
}

function SelectContent({ children }: SelectContentProps) {
  const context = React.useContext(SelectContext);
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  if (!context) throw new Error('SelectContent must be used within Select');

  return (
    <Modal
      visible={context.isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => context.setIsOpen(false)}
    >
      <TouchableOpacity
        style={[styles.flex1, { backgroundColor: 'rgba(0,0,0,0.5)' }, styles.justifyCenter, styles.alignCenter]}
        onPress={() => context.setIsOpen(false)}
        activeOpacity={1}
      >
        <View 
          style={[
            styles.p4,
            styles.rounded12,
            styles.shadow,
            { 
              backgroundColor: colorScheme === 'light' ? 'white' : '#374151',
              maxHeight: 300,
              minWidth: 200,
              maxWidth: '80%'
            }
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

function SelectItem({ value, children }: SelectItemProps) {
  const context = React.useContext(SelectContext);
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  if (!context) throw new Error('SelectItem must be used within Select');

  const isSelected = context.value === value;

  return (
    <TouchableOpacity
      onPress={() => {
        haptics.selection();
        context.onValueChange?.(value);
        context.setIsOpen(false);
      }}
      style={[
        styles.row,
        styles.alignCenter,
        styles.p12,
        styles.rounded8,
        isSelected && { backgroundColor: colorScheme === 'light' ? '#f3f4f6' : '#4b5563' }
      ]}
    >
      <View style={styles.flex1}>
        {children}
      </View>
      {isSelected && (
        <Check size={16} color={colorScheme === 'light' ? '#16a34a' : '#10b981'} />
      )}
    </TouchableOpacity>
  );
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};