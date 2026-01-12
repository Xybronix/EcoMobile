import { authService } from '@/services/authService';
import { ApiError } from '@/lib/api/config';
import { User } from '@/services/authService';

/**
 * Vérifie si une erreur indique que le compte est désactivé
 */
export function isAccountDeactivatedError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Vérifier les messages d'erreur liés à la désactivation
  const deactivationKeywords = [
    'auth.account.deactivated',
    'account.deactivated',
    'account is deactivated',
    'compte désactivé',
    'compte bloqué',
    'account blocked',
    'account suspended',
    'compte suspendu',
    'account banned',
    'compte banni'
  ];
  
  return deactivationKeywords.some(keyword => 
    errorMessage.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Vérifie si le statut utilisateur indique un compte désactivé
 */
export function isAccountDeactivatedStatus(user: User | null): boolean {
  if (!user) return false;
  
  // Statuts qui indiquent un compte désactivé
  const deactivatedStatuses = ['inactive', 'suspended', 'banned', 'deleted'];
  
  return deactivatedStatuses.includes(user.status) || user.isActive === false;
}

/**
 * Déconnecte l'utilisateur et redirige vers la page de connexion
 */
export async function handleAccountDeactivation(): Promise<void> {
  try {
    // Déconnecter l'utilisateur (supprime les données locales)
    await authService.logout();
    
    // La redirection sera gérée automatiquement par mobile-auth.tsx
    // qui détectera que user est null et redirigera vers la page de connexion
    console.log('Account deactivated - user logged out');
  } catch (error) {
    console.error('Error during account deactivation handling:', error);
    // Forcer la déconnexion même en cas d'erreur
    try {
      await authService.logout();
    } catch (logoutError) {
      console.error('Error during forced logout:', logoutError);
    }
  }
}

/**
 * Vérifie et gère la désactivation du compte dans une réponse API
 */
export async function checkAndHandleAccountDeactivation(
  error: any,
  user?: User | null
): Promise<boolean> {
  // Vérifier si c'est une erreur de compte désactivé
  if (isAccountDeactivatedError(error)) {
    await handleAccountDeactivation();
    return true;
  }
  
  // Vérifier si l'utilisateur a un statut désactivé
  if (user && isAccountDeactivatedStatus(user)) {
    await handleAccountDeactivation();
    return true;
  }
  
  return false;
}
