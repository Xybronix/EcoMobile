/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// components/ui/slider.tsx
import React from 'react';
import { View, PanResponder, Animated, StyleSheet, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { getGlobalStyles } from '@/styles/globalStyles';

interface SliderProps {
  className?: string;
  defaultValue?: number[];
  value?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function Slider({
  className,
  defaultValue = [0],
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  onValueCommit,
  disabled = false,
  orientation = 'horizontal',
  ...props
}: SliderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const globalStyles = getGlobalStyles(colorScheme);
  
  const [trackWidth, setTrackWidth] = React.useState(0);
  const [trackHeight, setTrackHeight] = React.useState(0);

  // Convert value to position
  const valueToPosition = (val: number) => {
    const percentage = (val - min) / (max - min);
    if (orientation === 'horizontal') {
      return percentage * trackWidth;
    }
    return percentage * trackHeight;
  };

  // Convert position to value
  const positionToValue = (position: number) => {
    let percentage;
    if (orientation === 'horizontal') {
      percentage = position / trackWidth;
    } else {
      percentage = position / trackHeight;
    }
    
    let value = min + percentage * (max - min);
    // Apply step
    if (step > 0) {
      value = Math.round(value / step) * step;
    }
    return Math.max(min, Math.min(max, value));
  };

  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min],
    [value, defaultValue, min]
  );

  const [internalValues, setInternalValues] = React.useState(_values);
  const [isSliding, setIsSliding] = React.useState(false);
  const trackRef = React.useRef<View>(null);

  // Créer les références Animated pour chaque thumb
  const thumbPositions = React.useRef(
    _values.map(val => new Animated.Value(0))
  ).current;

  const handleTrackLayout = () => {
    if (trackRef.current) {
      trackRef.current.measure((x, y, width, height) => {
        setTrackWidth(width);
        setTrackHeight(height);
        
        // Mettre à jour les positions initiales une fois que les dimensions sont connues
        internalValues.forEach((val, index) => {
          const position = valueToPosition(val);
          thumbPositions[index].setValue(position);
        });
      });
    }
  };

  const updateValue = (thumbIndex: number, newValue: number) => {
    const newValues = [...internalValues];
    newValues[thumbIndex] = newValue;
    setInternalValues(newValues);
    onValueChange?.(newValues);
  };

  const createThumbPanResponder = (thumbIndex: number) => {
    const currentPosition = thumbPositions[thumbIndex];
    let startValue = internalValues[thumbIndex];

    return PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        setIsSliding(true);
        startValue = internalValues[thumbIndex];
      },
      onPanResponderMove: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (!trackWidth && !trackHeight) return;
        
        let delta;
        if (orientation === 'horizontal') {
          delta = gestureState.dx / trackWidth;
        } else {
          delta = -gestureState.dy / trackHeight; // Inversé pour vertical
        }
        
        const newValue = Math.max(min, Math.min(max, startValue + delta * (max - min)));
        const steppedValue = step > 0 ? Math.round(newValue / step) * step : newValue;
        const boundedValue = Math.max(min, Math.min(max, steppedValue));
        
        const newPosition = valueToPosition(boundedValue);
        
        currentPosition.setValue(newPosition);
        updateValue(thumbIndex, boundedValue);
      },
      onPanResponderRelease: () => {
        setIsSliding(false);
        onValueCommit?.(internalValues);
      },
      onPanResponderTerminate: () => {
        setIsSliding(false);
        onValueCommit?.(internalValues);
      },
    });
  };

  const thumbPanResponders = React.useMemo(() => 
    internalValues.map((_, index) => createThumbPanResponder(index)),
    [internalValues, trackWidth, trackHeight, disabled, min, max, step, orientation]
  );

  // Mettre à jour les positions quand les valeurs changent de l'extérieur
  React.useEffect(() => {
    if (!isSliding && trackWidth > 0 && trackHeight > 0) {
      internalValues.forEach((val, index) => {
        const position = valueToPosition(val);
        Animated.spring(thumbPositions[index], {
          toValue: position,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }).start();
      });
    }
  }, [internalValues, trackWidth, trackHeight, isSliding]);

  // Calculer la plage pour l'affichage visuel
  const minPosition = valueToPosition(Math.min(...internalValues));
  const maxPosition = valueToPosition(Math.max(...internalValues));
  const rangeSize = maxPosition - minPosition;

  const rangeStyle = orientation === 'horizontal'
    ? [
        styles.rangeHorizontal,
        {
          backgroundColor: colors.primary,
          left: minPosition,
          width: rangeSize,
        }
      ]
    : [
        styles.rangeVertical,
        {
          backgroundColor: colors.primary,
          bottom: minPosition,
          height: rangeSize,
        }
      ];

  return (
    <View
      style={[
        globalStyles.alignCenter,
        globalStyles.justifyCenter,
        orientation === 'horizontal' ? styles.containerHorizontal : styles.containerVertical,
        disabled && globalStyles.buttonDisabled,
      ]}
      {...props}
    >
      <View
        ref={trackRef}
        style={[
          styles.track,
          orientation === 'horizontal' ? styles.trackHorizontal : styles.trackVertical,
          {
            backgroundColor: colors.border,
          },
          globalStyles.rounded8,
        ]}
        onLayout={handleTrackLayout}
      >
        <View style={[rangeStyle, globalStyles.rounded8]} />
      </View>

      {internalValues.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.thumb,
            orientation === 'horizontal' ? styles.thumbHorizontal : styles.thumbVertical,
            {
              backgroundColor: colors.background,
              borderColor: colors.primary,
              transform: [
                orientation === 'horizontal' 
                  ? { translateX: thumbPositions[index] }
                  : { translateY: thumbPositions[index] }
              ],
            },
            isSliding && styles.thumbActive,
            disabled && styles.thumbDisabled,
            globalStyles.roundedFull,
            globalStyles.shadow,
          ]}
          {...thumbPanResponders[index].panHandlers}
        />
      ))}
    </View>
  );
}

// Styles spécifiques au composant Slider
const styles = StyleSheet.create({
  containerHorizontal: {
    height: 40,
    width: '100%',
  },
  containerVertical: {
    width: 40,
    height: 200,
  },
  track: {
    position: 'relative',
  },
  trackHorizontal: {
    height: 6,
    width: '100%',
  },
  trackVertical: {
    width: 6,
    height: '100%',
  },
  rangeHorizontal: {
    position: 'absolute',
    height: '100%',
  },
  rangeVertical: {
    position: 'absolute',
    width: '100%',
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 3,
  },
  thumbHorizontal: {
    marginLeft: -12,
  },
  thumbVertical: {
    marginBottom: -12,
  },
  thumbActive: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    transform: [{ scale: 1.1 }],
  },
  thumbDisabled: {
    opacity: 0.5,
  },
});