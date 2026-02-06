/**
 * Utilitaire de debouncing pour réduire les appels de fonction
 * Utile pour optimiser les requêtes API lors de changements fréquents (filtres, recherche, etc.)
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Utilitaire de throttling pour limiter la fréquence d'exécution d'une fonction
 * Utile pour les événements qui se déclenchent très fréquemment (scroll, resize, etc.)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Note: useDebounce hook doit être dans un fichier séparé avec les imports React appropriés
