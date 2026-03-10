import React, { useRef, useState, useCallback } from 'react';
import { View, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useMobileI18n } from '@/lib/mobile-i18n';

interface HorizontalSliderProps {
  value: number | null;       // 0–100 ou null si non évalué
  onChange: (value: number) => void;
  width?: number;             // largeur de la piste (défaut 200)
  label?: string;             // étiquette à gauche
  colorScheme?: 'light' | 'dark';
  showPercentage?: boolean;   // afficher le pourcentage à droite
}

function conditionColor(v: number): string {
  if (v <= 30) return '#ef4444';   // rouge — mauvais
  if (v <= 69) return '#f59e0b';   // orange — dégradé
  return '#16a34a';                 // vert — bon
}

function getConditionLabel(v: number | null, t: any): string {
  if (v === null) return '—';
  if (v <= 30) return t('inspection.condition.bad');
  if (v <= 69) return t('inspection.condition.degraded');
  return t('inspection.condition.good');
}

export function HorizontalSlider({ 
  value, 
  onChange, 
  width = 200, 
  label, 
  colorScheme = 'light',
  showPercentage = true 
}: HorizontalSliderProps) {
  const { t } = useMobileI18n();
  const trackRef = useRef<View>(null);
  const trackWidth = useRef(width);
  const trackX = useRef(0);
  const [localValue, setLocalValue] = useState<number | null>(value);

  const isDark = colorScheme === 'dark';
  const trackBg = isDark ? '#374151' : '#e5e7eb';
  const textColor = isDark ? '#d1d5db' : '#374151';
  const borderColor = isDark ? '#4b5563' : '#d1d5db';

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  const valueFromX = useCallback((pageX: number): number => {
    const relX = pageX - trackX.current;
    // relX=0 → left → 0%, relX=trackWidth → right → 100%
    const pct = relX / trackWidth.current;
    return clamp(pct * 100);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        trackRef.current?.measure((_x, _y, w, _h, px, _py) => {
          trackWidth.current = w || width;
          trackX.current = px;
          const v = valueFromX(e.nativeEvent.pageX);
          setLocalValue(v);
          onChange(v);
        });
      },
      onPanResponderMove: (e) => {
        const v = valueFromX(e.nativeEvent.pageX);
        setLocalValue(v);
        onChange(v);
      },
    }),
  ).current;

  const displayValue = localValue ?? value;
  const pct = displayValue ?? 50; // Pour le rendu de la piste, 50 si null
  const hasValue = displayValue !== null;
  const fillColor = hasValue ? conditionColor(pct) : (isDark ? '#4b5563' : '#d1d5db');
  const thumbColor = hasValue ? conditionColor(pct) : (isDark ? '#6b7280' : '#9ca3af');

  // Position du thumb (0% = left, 100% = right)
  const thumbLeft = hasValue ? (pct / 100) * width : width / 2;

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  return (
    <View style={[styles.container, { width: '100%' }]}>
      {/* Label à gauche */}
      {label && (
        <Text style={[styles.label, { color: textColor, width: 100 }]} numberOfLines={2}>
          {label}
        </Text>
      )}

      {/* Piste horizontale */}
      <View style={styles.sliderContainer}>
        <View
          ref={trackRef}
          style={[styles.track, { width, backgroundColor: trackBg }]}
          onLayout={onLayout}
          {...panResponder.panHandlers}
        >
          {/* Remplissage coloré de gauche jusqu'au thumb */}
          <View
            style={[
              styles.fill,
              {
                width: hasValue ? `${pct}%` as any : '50%',
                backgroundColor: fillColor,
                opacity: hasValue ? 1 : 0.3,
              },
            ]}
          />
          {/* Thumb */}
          <View
            style={[
              styles.thumb,
              {
                left: thumbLeft - 10,
                backgroundColor: thumbColor,
                borderColor: isDark ? '#1f2937' : '#fff',
              },
            ]}
          />
        </View>

        {/* Valeur en pourcentage */}
        {showPercentage && (
          <Text style={[styles.percentage, { color: hasValue ? conditionColor(pct) : (isDark ? '#6b7280' : '#9ca3af') }]}>
            {hasValue ? `${Math.round(pct)}%` : '—'}
          </Text>
        )}
      </View>

      {/* État (mauvais/dégradé/bon) */}
      <Text style={[styles.state, { color: hasValue ? conditionColor(pct) : (isDark ? '#6b7280' : '#9ca3af') }]}>
        {getConditionLabel(displayValue, t)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 20,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  track: {
    height: 12,
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    position: 'absolute',
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    minWidth: 40,
    textAlign: 'right',
  },
  state: {
    fontSize: 11,
    marginLeft: 8,
    minWidth: 60,
    textAlign: 'right',
  },
});