import { storage } from '../utils/storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Service de cache global pour réduire les requêtes API
 * Utilise AsyncStorage pour persister le cache entre les sessions
 */
class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes par défaut
  private readonly MAX_MEMORY_ENTRIES = 100; // Limiter la taille du cache mémoire

  private constructor() {
    // Nettoyer le cache mémoire périodiquement
    setInterval(() => {
      this.cleanupMemoryCache();
    }, 60000); // Toutes les minutes
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    // Vérifier d'abord le cache mémoire
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.data as T;
    }

    // Si expiré en mémoire, le retirer
    if (memoryEntry) {
      this.memoryCache.delete(key);
    }

    // Vérifier le cache persistant
    try {
      const cached = await storage.getItem(`cache_${key}`);
      if (cached) {
        const entry: CacheEntry<T> = JSON.parse(cached);
        
        if (entry.expiresAt > Date.now()) {
          // Mettre en cache mémoire aussi
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          // Expiré, le supprimer
          await storage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.error(`[Cache] Error reading cache for key ${key}:`, error);
    }

    return null;
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const expiresAt = Date.now() + ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt,
    };

    // Mettre en cache mémoire
    this.memoryCache.set(key, entry);

    // Limiter la taille du cache mémoire
    if (this.memoryCache.size > this.MAX_MEMORY_ENTRIES) {
      // Supprimer les entrées les plus anciennes
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, entries.length - this.MAX_MEMORY_ENTRIES);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }

    // Mettre en cache persistant
    try {
      await storage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error(`[Cache] Error writing cache for key ${key}:`, error);
    }
  }

  /**
   * Supprime une clé du cache
   */
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await storage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error(`[Cache] Error removing cache for key ${key}:`, error);
    }
  }

  /**
   * Supprime toutes les clés correspondant à un pattern
   */
  async removePattern(pattern: string): Promise<void> {
    const keysToRemove: string[] = [];

    // Supprimer du cache mémoire
    this.memoryCache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach(key => this.memoryCache.delete(key));

    // Supprimer du cache persistant (nécessite de lister toutes les clés)
    // Note: AsyncStorage ne supporte pas les patterns, on doit gérer ça différemment
    // Pour l'instant, on se contente du cache mémoire
  }

  /**
   * Vide tout le cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    // Note: Pour vider AsyncStorage, on devrait avoir une liste des clés
    // Pour l'instant, on se contente du cache mémoire
  }

  /**
   * Vérifie si une clé existe et n'est pas expirée
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Nettoie le cache mémoire des entrées expirées
   */
  private cleanupMemoryCache(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    this.memoryCache.forEach((entry, key) => {
      if (entry.expiresAt <= now) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => this.memoryCache.delete(key));
  }

  /**
   * Récupère ou met en cache le résultat d'une fonction asynchrone
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }
}

export const cacheService = CacheService.getInstance();
