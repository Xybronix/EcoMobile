/* eslint-disable @typescript-eslint/no-require-imports */
// utils/storage.ts
import { Platform } from 'react-native';

// Type pour définir l'interface de stockage
interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Implémentation pour le web (localStorage)
class WebStorage implements Storage {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item to localStorage:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

// Implémentation pour React Native (AsyncStorage)
class NativeStorage implements Storage {
  private AsyncStorage: any;

  constructor() {
    // Import dynamique d'AsyncStorage pour éviter les erreurs sur web
    if (Platform.OS !== 'web') {
      this.AsyncStorage = require('@react-native-async-storage/async-storage').default;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (!this.AsyncStorage) return null;
      return await this.AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (!this.AsyncStorage) return;
      await this.AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item to AsyncStorage:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (!this.AsyncStorage) return;
      await this.AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (!this.AsyncStorage) return;
      await this.AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  }
}

// Factory pour créer l'instance appropriée selon la plateforme
function createStorage(): Storage {
  if (Platform.OS === 'web') {
    return new WebStorage();
  } else {
    return new NativeStorage();
  }
}

// Instance singleton du stockage
export const storage = createStorage();

// Utilitaires helper pour les types communs
export const storageUtils = {
  // Stocker un objet JSON
  async setObject<T>(key: string, value: T): Promise<void> {
    await storage.setItem(key, JSON.stringify(value));
  },

  // Récupérer un objet JSON
  async getObject<T>(key: string): Promise<T | null> {
    const value = await storage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error parsing JSON from storage:', error);
      return null;
    }
  },

  // Stocker un booléen
  async setBoolean(key: string, value: boolean): Promise<void> {
    await storage.setItem(key, value.toString());
  },

  // Récupérer un booléen
  async getBoolean(key: string): Promise<boolean | null> {
    const value = await storage.getItem(key);
    if (value === null) return null;
    return value === 'true';
  },

  // Stocker un nombre
  async setNumber(key: string, value: number): Promise<void> {
    await storage.setItem(key, value.toString());
  },

  // Récupérer un nombre
  async getNumber(key: string): Promise<number | null> {
    const value = await storage.getItem(key);
    if (value === null) return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  },
};

// =============================================================================
// FONCTIONS DE STOCKAGE POUR L'AUTHENTIFICATION (Compatibilité avec le code existant)
// =============================================================================

/**
 * Stocke une donnée dans le stockage
 * @param key Clé de stockage
 * @param value Valeur à stocker
 */
export const storeData = async (key: string, value: string): Promise<void> => {
  try {
    await storage.setItem(key, value);
  } catch (error) {
    console.error('Error storing data:', error);
    throw error;
  }
};

/**
 * Récupère une donnée du stockage
 * @param key Clé de stockage
 * @returns La valeur stockée ou null
 */
export const getData = async (key: string): Promise<string | null> => {
  try {
    return await storage.getItem(key);
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

/**
 * Supprime une donnée du stockage
 * @param key Clé de stockage
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await storage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
    throw error;
  }
};

/**
 * Vide tout le stockage
 */
export const clearAll = async (): Promise<void> => {
  try {
    await storage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};

/**
 * Vérifie si une clé existe dans le stockage
 * @param key Clé à vérifier
 * @returns true si la clé existe
 */
export const hasData = async (key: string): Promise<boolean> => {
  const value = await getData(key);
  return value !== null;
};

/**
 * Stocke un objet en le sérialisant en JSON
 * @param key Clé de stockage
 * @param value Objet à stocker
 */
export const storeObject = async <T>(key: string, value: T): Promise<void> => {
  try {
    await storageUtils.setObject(key, value);
  } catch (error) {
    console.error('Error storing object:', error);
    throw error;
  }
};

/**
 * Récupère un objet désérialisé depuis le stockage
 * @param key Clé de stockage
 * @returns L'objet désérialisé ou null
 */
export const getObject = async <T>(key: string): Promise<T | null> => {
  try {
    return await storageUtils.getObject<T>(key);
  } catch (error) {
    console.error('Error retrieving object:', error);
    return null;
  }
};

// =============================================================================
// CONSTANTES POUR LES CLÉS DE STOCKAGE
// =============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'app_language',
  THEME: 'app_theme',
  NOTIFICATIONS: 'notifications_enabled',
  FIRST_LAUNCH: 'first_launch',
  BIOMETRIC_AUTH: 'biometric_auth_enabled',
  TWO_FACTOR_AUTH: 'two_factor_auth_enabled',
} as const;

// =============================================================================
// FONCTIONS SPÉCIFIQUES POUR L'AUTHENTIFICATION
// =============================================================================

/**
 * Stocke le token d'authentification
 * @param token Token JWT
 */
export const storeAuthToken = async (token: string): Promise<void> => {
  await storeData(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Récupère le token d'authentification
 * @returns Le token JWT ou null
 */
export const getAuthToken = async (): Promise<string | null> => {
  return await getData(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Supprime le token d'authentification
 */
export const removeAuthToken = async (): Promise<void> => {
  await removeData(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Stocke les données utilisateur
 * @param user Données utilisateur
 */
export const storeUserData = async (user: any): Promise<void> => {
  await storeObject(STORAGE_KEYS.USER_DATA, user);
};

/**
 * Récupère les données utilisateur
 * @returns Les données utilisateur ou null
 */
export const getUserData = async <T>(): Promise<T | null> => {
  return await getObject<T>(STORAGE_KEYS.USER_DATA);
};

/**
 * Supprime les données utilisateur
 */
export const removeUserData = async (): Promise<void> => {
  await removeData(STORAGE_KEYS.USER_DATA);
};

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns true si un token existe
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return token !== null && token !== '';
};

/**
 * Déconnecte l'utilisateur en supprimant toutes les données d'authentification
 */
export const clearAuthData = async (): Promise<void> => {
  await removeAuthToken();
  await removeUserData();
};

// =============================================================================
// FONCTIONS POUR LES PRÉFÉRENCES DE L'APPLICATION
// =============================================================================

/**
 * Stocke la langue de l'application
 * @param language Code de langue (fr, en, etc.)
 */
export const storeLanguage = async (language: string): Promise<void> => {
  await storeData(STORAGE_KEYS.LANGUAGE, language);
};

/**
 * Récupère la langue de l'application
 * @returns Le code de langue ou null
 */
export const getLanguage = async (): Promise<'fr' | 'en' | null> => {
  const lang = await getData(STORAGE_KEYS.LANGUAGE);
  return lang === 'fr' || lang === 'en' ? lang : null;
};

/**
 * Stocke le thème de l'application
 * @param theme Thème (light, dark, auto)
 */
export const storeTheme = async (theme: string): Promise<void> => {
  await storeData(STORAGE_KEYS.THEME, theme);
};

/**
 * Récupère le thème de l'application
 * @returns Le thème ou null
 */
export const getTheme = async (): Promise<string | null> => {
  return await getData(STORAGE_KEYS.THEME);
};

/**
 * Active ou désactive les notifications
 * @param enabled État des notifications
 */
export const storeNotificationsEnabled = async (enabled: boolean): Promise<void> => {
  await storageUtils.setBoolean(STORAGE_KEYS.NOTIFICATIONS, enabled);
};

/**
 * Récupère l'état des notifications
 * @returns true si les notifications sont activées
 */
export const getNotificationsEnabled = async (): Promise<boolean> => {
  return (await storageUtils.getBoolean(STORAGE_KEYS.NOTIFICATIONS)) ?? true;
};

/**
 * Marque le premier lancement de l'application
 */
export const markFirstLaunch = async (): Promise<void> => {
  await storageUtils.setBoolean(STORAGE_KEYS.FIRST_LAUNCH, false);
};

/**
 * Vérifie si c'est le premier lancement
 * @returns true si c'est le premier lancement
 */
export const isFirstLaunch = async (): Promise<boolean> => {
  return (await storageUtils.getBoolean(STORAGE_KEYS.FIRST_LAUNCH)) ?? true;
};

// =============================================================================
// FONCTIONS POUR LA SÉCURITÉ
// =============================================================================

/**
 * Active ou désactive l'authentification biométrique
 * @param enabled État de l'authentification biométrique
 */
export const storeBiometricAuth = async (enabled: boolean): Promise<void> => {
  await storageUtils.setBoolean(STORAGE_KEYS.BIOMETRIC_AUTH, enabled);
};

/**
 * Récupère l'état de l'authentification biométrique
 * @returns true si l'authentification biométrique est activée
 */
export const getBiometricAuth = async (): Promise<boolean> => {
  return (await storageUtils.getBoolean(STORAGE_KEYS.BIOMETRIC_AUTH)) ?? false;
};

/**
 * Active ou désactive l'authentification à deux facteurs
 * @param enabled État de l'authentification à deux facteurs
 */
export const storeTwoFactorAuth = async (enabled: boolean): Promise<void> => {
  await storageUtils.setBoolean(STORAGE_KEYS.TWO_FACTOR_AUTH, enabled);
};

/**
 * Récupère l'état de l'authentification à deux facteurs
 * @returns true si l'authentification à deux facteurs est activée
 */
export const getTwoFactorAuth = async (): Promise<boolean> => {
  return (await storageUtils.getBoolean(STORAGE_KEYS.TWO_FACTOR_AUTH)) ?? false;
};

// =============================================================================
// EXPORT PAR DÉFAUT POUR LA COMPATIBILITÉ
// =============================================================================

export default {
  // Fonctions de base
  storage,
  storeData,
  getData,
  removeData,
  clearAll,
  hasData,
  
  // Fonctions pour objets
  storeObject,
  getObject,
  
  // Fonctions d'authentification
  storeAuthToken,
  getAuthToken,
  removeAuthToken,
  storeUserData,
  getUserData,
  removeUserData,
  isAuthenticated,
  clearAuthData,
  
  // Fonctions de préférences
  storeLanguage,
  getLanguage,
  storeTheme,
  getTheme,
  storeNotificationsEnabled,
  getNotificationsEnabled,
  markFirstLaunch,
  isFirstLaunch,
  
  // Fonctions de sécurité
  storeBiometricAuth,
  getBiometricAuth,
  storeTwoFactorAuth,
  getTwoFactorAuth,
  
  // Clés de stockage
  STORAGE_KEYS,
};