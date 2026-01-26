import React, { useEffect, useState } from 'react';
import { View, Animated } from 'react-native';
import { Text } from '@/components/ui/Text';
import { getGlobalStyles } from '@/styles/globalStyles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { internetService } from '@/lib/internetService';

interface InternetStatusBarProps {
  showInAllScreens?: boolean;
  position?: 'top' | 'bottom';
}

export function InternetStatusBar({ 
  showInAllScreens = false,
  position = 'top' 
}: InternetStatusBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const colorScheme = useColorScheme();
  const styles = getGlobalStyles(colorScheme);

  useEffect(() => {
    const unsubscribe = internetService.subscribe((connected: boolean) => {
      if (!connected) {
        setIsVisible(true);
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
        });
      }
    });

    return unsubscribe;
  }, [slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: position === 'top' ? [-50, 0] : [50, 0]
  });

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.absolute,
        position === 'top' ? { top: 0 } : { bottom: 0 },
        { left: 0, right: 0 },
        {
          backgroundColor: '#ef4444',
          paddingVertical: 12,
          paddingHorizontal: 16,
          zIndex: 1000,
          transform: [{ translateY }]
        }
      ]}
    >
      <View style={[styles.row, styles.alignCenter, styles.justifyCenter]}>
        <Text color="white" weight="medium" style={styles.textCenter}>
          🔌 Pas de connexion Internet - Veuillez vous connecter
        </Text>
      </View>
    </Animated.View>
  );
}