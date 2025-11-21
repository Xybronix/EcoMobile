// styles/globalStyles.ts
import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/theme';
import { Fonts } from '@/constants/fonts';

const { height: screenHeight } = Dimensions.get('window');

export const createGlobalStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    // Container styles avec keyboard handling
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    containerKeyboard: {
      flex: 1,
      backgroundColor: colors.background,
    },
    containerSafe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    containerCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    containerPadded: {
      flex: 1,
      padding: 24,
    },
    
    // Scroll view styles
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      minHeight: screenHeight * 0.8,
    },
    scrollContentPadded: {
      flexGrow: 1,
      padding: 24,
      paddingBottom: 100,
    },
    
    // Text base styles avec police personnalisée
    text: {
      color: colors.text,
      fontSize: 16,
      fontFamily: Fonts.regular,
    },
    textLeft: {
      textAlign: 'left',
    },
    textCenter: {
      textAlign: 'center',
    },
    textRight: {
      textAlign: 'right',
    },
    textBold: {
      fontFamily: Fonts.bold,
      fontWeight: '700',
    },
    textSemiBold: {
      fontFamily: Fonts.semiBold,
      fontWeight: '600',
    },
    textMedium: {
      fontFamily: Fonts.medium,
      fontWeight: '500',
    },
    
    // Button base styles
    button: {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      minHeight: 44,
    },
    buttonPrimary: {
      backgroundColor: colors.primary,
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    
    // Input base styles avec police
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
      fontSize: 16,
      color: colors.text,
      fontFamily: Fonts.regular,
    },
    inputFocused: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    inputError: {
      borderColor: '#ef4444',
      borderWidth: 2,
    },
    
    // Form styles
    formContainer: {
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    
    // Layout styles
    row: {
      flexDirection: 'row',
    },
    column: {
      flexDirection: 'column',
    },
    flex1: {
      flex: 1,
    },
    alignCenter: {
      alignItems: 'center',
    },
    alignEnd: {
      alignItems: 'flex-end',
    },
    justifyStart: {
      justifyContent: 'flex-start',
    },
    justifyCenter: {
      justifyContent: 'center',
    },
    justifyEnd: {
      justifyContent: 'flex-end',
    },
    spaceBetween: {
      justifyContent: 'space-between',
    },
    
    // Card styles
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    // Spacing utilities
    gap4: { gap: 4 },
    gap8: { gap: 8 },
    gap12: { gap: 12 },
    gap16: { gap: 16 },
    gap20: { gap: 20 },
    gap24: { gap: 24 },
    gap32: { gap: 32 },
    
    // Margin utilities
    m4: { margin: 4 },
    m8: { margin: 8 },
    m12: { margin: 12 },
    m16: { margin: 16 },
    m20: { margin: 20 },
    m24: { margin: 24 },
    m32: { margin: 32 },
    
    mt4: { marginTop: 4 },
    mt8: { marginTop: 8 },
    mt12: { marginTop: 12 },
    mt16: { marginTop: 16 },
    mt20: { marginTop: 20 },
    mt24: { marginTop: 24 },
    mt32: { marginTop: 32 },
    
    mb4: { marginBottom: 4 },
    mb8: { marginBottom: 8 },
    mb12: { marginBottom: 12 },
    mb16: { marginBottom: 16 },
    mb20: { marginBottom: 20 },
    mb24: { marginBottom: 24 },
    mb32: { marginBottom: 32 },
    
    ml4: { marginLeft: 4 },
    ml8: { marginLeft: 8 },
    ml12: { marginLeft: 12 },
    ml16: { marginLeft: 16 },
    ml20: { marginLeft: 20 },
    ml24: { marginLeft: 24 },
    ml32: { marginLeft: 32 },
    
    mr4: { marginRight: 4 },
    mr8: { marginRight: 8 },
    mr12: { marginRight: 12 },
    mr16: { marginRight: 16 },
    mr20: { marginRight: 20 },
    mr24: { marginRight: 24 },
    mr32: { marginRight: 32 },

    mx4: { marginHorizontal: 4 },
    mx8: { marginHorizontal: 8 },
    mx12: { marginHorizontal: 12 },
    mx16: { marginHorizontal: 16 },
    mx20: { marginHorizontal: 20 },
    mx24: { marginHorizontal: 24 },
    mx32: { marginHorizontal: 32 },

    my4: { marginVertical: 4 },
    my8: { marginVertical: 8 },
    my12: { marginVertical: 12 },
    my16: { marginVertical: 16 },
    my20: { marginVertical: 20 },
    my24: { marginVertical: 24 },
    my32: { marginVertical: 32 },
    
    // Padding utilities
    p4: { padding: 4 },
    p8: { padding: 8 },
    p12: { padding: 12 },
    p16: { padding: 16 },
    p20: { padding: 20 },
    p24: { padding: 24 },
    p32: { padding: 32 },
    p48: { padding: 48 },
    
    pt4: { paddingTop: 4 },
    pt8: { paddingTop: 8 },
    pt12: { paddingTop: 12 },
    pt16: { paddingTop: 16 },
    pt20: { paddingTop: 20 },
    pt24: { paddingTop: 24 },
    pt32: { paddingTop: 32 },
    pt80: { paddingTop: 80 },
    
    pb4: { paddingBottom: 4 },
    pb8: { paddingBottom: 8 },
    pb12: { paddingBottom: 12 },
    pb16: { paddingBottom: 16 },
    pb20: { paddingBottom: 20 },
    pb24: { paddingBottom: 24 },
    pb32: { paddingBottom: 32 },
    
    pl4: { paddingLeft: 4 },
    pl8: { paddingLeft: 8 },
    pl12: { paddingLeft: 12 },
    pl16: { paddingLeft: 16 },
    pl20: { paddingLeft: 20 },
    pl24: { paddingLeft: 24 },
    pl32: { paddingLeft: 32 },
    
    pr4: { paddingRight: 4 },
    pr8: { paddingRight: 8 },
    pr12: { paddingRight: 12 },
    pr16: { paddingRight: 16 },
    pr20: { paddingRight: 20 },
    pr24: { paddingRight: 24 },
    pr32: { paddingRight: 32 },

    px4: { paddingHorizontal: 4 },
    px8: { paddingHorizontal: 8 },
    px12: { paddingHorizontal: 12 },
    px16: { paddingHorizontal: 16 },
    px20: { paddingHorizontal: 20 },
    px24: { paddingHorizontal: 24 },
    px32: { paddingHorizontal: 32 },

    py4: { paddingVertical: 4 },
    py8: { paddingVertical: 8 },
    py12: { paddingVertical: 12 },
    py16: { paddingVertical: 16 },
    py20: { paddingVertical: 20 },
    py24: { paddingVertical: 24 },
    py32: { paddingVertical: 32 },
    
    // Border radius utilities
    rounded4: { borderRadius: 4 },
    rounded8: { borderRadius: 8 },
    rounded12: { borderRadius: 12 },
    rounded16: { borderRadius: 16 },
    rounded20: { borderRadius: 20 },
    rounded24: { borderRadius: 24 },
    rounded32: { borderRadius: 32 },
    roundedFull: { borderRadius: 50 },
    
    // Position utilities
    absolute: { position: 'absolute' },
    relative: { position: 'relative' },
    
    // Size utilities
    w100: { width: 100 },
    w96: { width: 96 },
    w80: { width: 80 },
    w64: { width: 64 },
    w56: { width: 56 },
    w48: { width: 48 },
    w40: { width: 40 },
    w32: { width: 32 },
    w20: { width: 20 },
    w24: { width: 24 },
    w16: { width: 16 },
    w12: { width: 12 },
    w8: { width: 8 },
    w4: { width: 4 },
    h100: { height: 100 },
    h96: { height: 96 },
    h80: { height: 80 },
    h64: { height: 64 },
    h56: { height: 56 },
    h48: { height: 48 },
    h40: { height: 40 },
    h32: { height: 32 },
    h24: { height: 24 },
    h20: { height: 20 },
    h16: { height: 16 },
    h12: { height: 12 },
    h8: { height: 8 },
    h4: { height: 4 },

    wT100: { width: '100%' },
    wT96: { width: '96%' },
    wT80: { width: '80%' },
    wT64: { width: '64%' },
    wT56: { width: '56%' },
    wT48: { width: '48%' },
    wT20: { width: '20%' },
    hT100: { height: '100%' },
    hT96: { height: '96%' },
    hT80: { height: '80%' },
    hT64: { height: '64%' },
    hT56: { height: '56%' },
    hT48: { height: '48%' },
    hT20: { height: '20%' },
    hT10: { height: '13%' },
    
    // Shadow utilities
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    shadowLg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });
};

export const getGlobalStyles = (colorScheme: 'light' | 'dark' | null | undefined) => {
  const safeColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  return createGlobalStyles(safeColorScheme);
};