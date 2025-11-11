// components/ui/DropdownMenu.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGlobalStyles } from '@/styles/globalStyles';
import { Colors } from '@/constants/theme';
import { Text } from './Text';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Types pour les props
interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  variant?: 'default' | 'destructive';
  onSelect?: () => void;
}

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<View>;
  contentPosition: { x: number; y: number; width: number };
  setContentPosition: (position: { x: number; y: number; width: number }) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined);

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu components must be used within a DropdownMenu');
  }
  return context;
}

export function DropdownMenu({ children, open, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<View>(null);
  const [contentPosition, setContentPosition] = useState({ x: 0, y: 0, width: 0 });

  const isControlled = open !== undefined;
  const actualOpen = isControlled ? open : internalOpen;

  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <DropdownMenuContext.Provider
      value={{
        open: actualOpen,
        setOpen,
        triggerRef,
        contentPosition,
        setContentPosition,
      }}
    >
      {children}
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const { setOpen, triggerRef, setContentPosition } = useDropdownMenu();

  const handlePress = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setContentPosition({
          x,
          y: y + height,
          width,
        });
        setOpen(true);
      });
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onPress: handlePress,
    });
  }

  return (
    <TouchableOpacity ref={triggerRef} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
}

export function DropdownMenuContent({
  children,
  className,
  sideOffset = 4,
  align = 'start',
}: DropdownMenuContentProps) {
  const { open, setOpen, contentPosition } = useDropdownMenu();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const getPositionStyle = () => {
    const contentWidth = 200; // Largeur approximative du contenu
    let left = contentPosition.x;

    if (align === 'end') {
      left = contentPosition.x + contentPosition.width - contentWidth;
    } else if (align === 'center') {
      left = contentPosition.x + (contentPosition.width - contentWidth) / 2;
    }

    // Assurer que le contenu ne dépasse pas de l'écran
    left = Math.max(8, Math.min(left, screenWidth - contentWidth - 8));

    return {
      position: 'absolute' as const,
      top: contentPosition.y + sideOffset,
      left,
      width: contentWidth,
    };
  };

  if (!open) return null;

  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable
        style={[StyleSheet.absoluteFill]}
        onPress={() => setOpen(false)}
      >
        <View style={getPositionStyle()}>
          <View
            style={[
              styles.card,
              styles.shadowLg,
              {
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 4,
                minWidth: 160,
              },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: screenHeight * 0.6 }}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

export function DropdownMenuItem({
  children,
  className,
  inset,
  variant = 'default',
  onSelect,
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu();
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const handlePress = () => {
    onSelect?.();
    setOpen(false);
  };

  const getVariantStyle = () => {
    if (variant === 'destructive') {
      return {
        backgroundColor: colorScheme === 'dark' ? '#7f1d1d' : '#fef2f2',
      };
    }
    return {};
  };

  const getTextColor = () => {
    if (variant === 'destructive') {
      return colorScheme === 'dark' ? '#fca5a5' : '#dc2626';
    }
    return colors.text;
  };

  return (
    <TouchableOpacity
      style={[
        styles.px12,
        styles.py8,
        styles.rounded4,
        {
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 4,
          marginVertical: 2,
        },
        inset && { paddingLeft: 32 },
        getVariantStyle(),
      ]}
      onPress={handlePress}
    >
      <Text
        size="sm"
        color={getTextColor()}
        style={{ flex: 1 }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <View style={{ marginVertical: 4 }}>{children}</View>;
}

export function DropdownMenuLabel({
  children,
  inset,
}: {
  children: React.ReactNode;
  inset?: boolean;
}) {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={[
        styles.px12,
        styles.py8,
        inset && { paddingLeft: 32 },
      ]}
    >
      <Text size="sm" weight="medium" color={colors.icon}>
        {children}
      </Text>
    </View>
  );
}

export function DropdownMenuSeparator() {
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={[
        styles.mx12,
        styles.my4,
        { height: 1, backgroundColor: colors.border },
      ]}
    />
  );
}

// Export des autres composants (simplifiés pour React Native)
export {
  DropdownMenu as default,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};