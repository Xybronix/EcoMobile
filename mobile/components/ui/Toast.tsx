// components/ui/Toast.tsx
import React, { useEffect, useState } from 'react';
import { Text, Animated } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onHide: () => void;
}

export function Toast({ message, type, duration = 3000, onHide }: ToastProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'info':
        return '#3b82f6';
      default:
        return colors.primary;
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, duration, onHide]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        backgroundColor: getBackgroundColor(),
        borderRadius: 8,
        padding: 16,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <Text style={{ color: 'white', fontSize: 16, fontWeight: '500', fontFamily: 'Aptos', }}>
        {message}
      </Text>
    </Animated.View>
  );
}

// Toast Manager
interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastQueue: ToastData[] = [];
let toastSubscribers: ((toasts: ToastData[]) => void)[] = [];

export const toast = {
  success: (message: string) => showToast(message, 'success'),
  error: (message: string) => showToast(message, 'error'),
  info: (message: string) => showToast(message, 'info'),
};

function showToast(message: string, type: 'success' | 'error' | 'info') {
  const id = Math.random().toString(36).substring(7);
  toastQueue = [...toastQueue, { id, message, type }];
  notifySubscribers();
}

function hideToast(id: string) {
  toastQueue = toastQueue.filter(toast => toast.id !== id);
  notifySubscribers();
}

function notifySubscribers() {
  toastSubscribers.forEach(callback => callback(toastQueue));
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastData[]>(toastQueue);

  useEffect(() => {
    toastSubscribers.push(setToasts);
    return () => {
      toastSubscribers = toastSubscribers.filter(callback => callback !== setToasts);
    };
  }, []);

  return { toasts, hideToast };
}