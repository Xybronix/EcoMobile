import { ApiError } from '@/lib/api/config';
import { useMobileI18n } from '@/lib/mobile-i18n';

/**
 * Extrait le message d'erreur à afficher à l'utilisateur
 * Priorité : message du backend > codes de traduction > message par défaut
 */
export function getErrorMessage(error: any, t: (key: string) => string): string {
  // Si c'est une ApiError, utiliser son message directement
  if (error instanceof ApiError) {
    return error.message || t('common.error');
  }

  // Si c'est une Error avec un message
  if (error instanceof Error && error.message) {
    const message = error.message;
    
    // Si le message ne contient pas de point, c'est probablement un message direct du backend
    // (les codes de traduction contiennent généralement des points comme 'error.something')
    if (!message.includes('.')) {
      return message;
    }
    
    // Sinon, c'est un code de traduction, on essaie de le traduire
    // Si la traduction n'existe pas, on retourne le message tel quel
    try {
      const translated = t(message);
      // Si la traduction retourne le même texte, c'est que la clé n'existe pas
      if (translated === message) {
        return message;
      }
      return translated;
    } catch {
      return message;
    }
  }

  // Message par défaut
  return t('common.error');
}

/**
 * Codes d'erreur communs qui nécessitent une traduction spéciale
 */
const ERROR_CODE_TRANSLATIONS: Record<string, string> = {
  'network_error': 'error.networkError',
  'invalid_credentials': 'error.invalidCredentials',
  'user_already_exists': 'error.userAlreadyExists',
  'validation_error': 'error.validationError',
  'server_error': 'error.serverError',
  'service_unavailable': 'error.serviceUnavailable',
  'invalid_token': 'error.invalidToken',
  'email_not_verified': 'error.emailNotVerified',
};

/**
 * Extrait le message d'erreur avec support des codes de traduction spéciaux
 */
export function getErrorMessageWithFallback(error: any, t: (key: string) => string): string {
  // Si c'est une ApiError, utiliser son message directement
  if (error instanceof ApiError) {
    const message = error.message;
    
    // Vérifier si c'est un code de traduction connu
    if (ERROR_CODE_TRANSLATIONS[message]) {
      return t(ERROR_CODE_TRANSLATIONS[message]);
    }
    
    // Si le message ne contient pas de point, c'est probablement un message direct du backend
    if (!message.includes('.')) {
      return message;
    }
    
    return message;
  }

  // Si c'est une Error avec un message
  if (error instanceof Error && error.message) {
    const message = error.message;
    
    // Vérifier si c'est un code de traduction connu
    if (ERROR_CODE_TRANSLATIONS[message]) {
      return t(ERROR_CODE_TRANSLATIONS[message]);
    }
    
    // Si le message ne contient pas de point, c'est probablement un message direct du backend
    if (!message.includes('.')) {
      return message;
    }
    
    // Sinon, essayer de traduire
    try {
      return t(message);
    } catch {
      return message;
    }
  }

  // Message par défaut
  return t('common.error');
}
