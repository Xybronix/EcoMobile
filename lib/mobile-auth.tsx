/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginCredentials, RegisterData } from '@/services/authService';
import { userService, UpdateProfileData } from '@/services/userService';
import { useRouter, useSegments } from 'expo-router';
import { getUserData, storeUserData } from '@/utils/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: UpdateProfileData) => Promise<User>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function MobileAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadStoredUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inIndexGroup = !segments[0];
    const currentRoute = inAuthGroup ? segments[1] : null;
    const isDocumentRoute = currentRoute === 'submit-documents';
    const isPhoneVerificationRoute = currentRoute === 'verify-phone';
    const isLoginOrRegisterRoute = currentRoute === 'login' || currentRoute === 'register';
    const isOtherAuthRoute = inAuthGroup && currentRoute && ['forgot-password', 'reset-password', 'welcome'].includes(currentRoute);

    if (!isLoading) {
      if (user && (inAuthGroup || inIndexGroup)) {
        // If account is not verified, redirect to document submission
        if (user.status === 'pending_verification' && !isDocumentRoute && !isPhoneVerificationRoute) {
          router.replace('/(auth)/submit-documents');
          return;
        } else if (user.status === 'pending_verification' && (isDocumentRoute || isPhoneVerificationRoute)) {
          // Already on document submission or phone verification page, stay there
          return;
        } else if (user.status !== 'pending_verification' && (isLoginOrRegisterRoute || isOtherAuthRoute || inIndexGroup)) {
          // User is authenticated and verified, redirect to home
          router.replace('/(tabs)/home');
        }
      } 
      else if (!user && !inAuthGroup && !inIndexGroup) {
        router.replace('/');
      }
    }
  }, [user, segments, isLoading, router]);

  const loadStoredUser = async () => {
    try {
      setIsLoading(true);
      
      const authenticated = await authService.isAuthenticated();
      
      if (authenticated) {
        try {
          const freshUserData = await authService.getCurrentUser();
          
          // Vérifier si le compte est désactivé
          const { checkAndHandleAccountDeactivation } = await import('@/utils/accountDeactivationHandler');
          const isDeactivated = await checkAndHandleAccountDeactivation(null, freshUserData);
          if (isDeactivated) {
            setUser(null);
            return;
          }
          
          setUser(freshUserData);
          
          // Vérifier le statut après récupération des données
          if (freshUserData.status === 'pending_verification') {
            const currentPath = segments[0] === '(auth)' ? segments[1] : null;
            if (currentPath !== 'submit-documents' && currentPath !== 'verify-phone') {
              router.replace('/(auth)/submit-documents');
            }
          }
        } catch (apiError: any) {
          // Si erreur d'autorisation (401, 403), déconnecter l'utilisateur
          if (apiError instanceof Error && (apiError.message.includes('401') || apiError.message.includes('403') || apiError.message === 'not_authenticated')) {
            console.warn('Unauthorized access, logging out:', apiError);
            await authService.logout();
            setUser(null);
            return;
          }
          
          // Si erreur réseau ou autre, utiliser les données stockées mais vérifier le statut
          console.warn('API unavailable, using stored user data:', apiError);
          const storedUser = await getUserData<User>();
          if (storedUser) {
            // Vérifier si le compte stocké est désactivé
            const { checkAndHandleAccountDeactivation } = await import('@/utils/accountDeactivationHandler');
            const isDeactivated = await checkAndHandleAccountDeactivation(null, storedUser);
            if (isDeactivated) {
              setUser(null);
              return;
            }
            
            setUser(storedUser);
            
            // Vérifier le statut même avec les données stockées
            if (storedUser.status === 'pending_verification') {
              const currentPath = segments[0] === '(auth)' ? segments[1] : null;
              if (currentPath !== 'submit-documents' && currentPath !== 'verify-phone') {
                router.replace('/(auth)/submit-documents');
              }
            }
          } else {
            await authService.logout();
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };


  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);
      
      await storeUserData(authResponse.user);
    } catch (error: any) {
      if (error.message === 'email_not_verified') {
        const storedUser = await getUserData<User>();
        if (storedUser && storedUser.email === credentials.email) {
          throw new Error('email_not_verified');
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const authResponse = await authService.register(userData);
      setUser(authResponse.user);
      
      await storeUserData(authResponse.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      router.replace('/');
    } catch (error) {
      setUser(null);
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: UpdateProfileData) => {
    try {
      const updatedUser = await userService.updateProfile(profileData);
      setUser(updatedUser);
      
      await storeUserData(updatedUser);
      
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      
      // Vérifier si le compte est désactivé
      const { checkAndHandleAccountDeactivation } = await import('@/utils/accountDeactivationHandler');
      const isDeactivated = await checkAndHandleAccountDeactivation(null, userData);
      if (isDeactivated) {
        setUser(null);
        return;
      }
      
      setUser(userData);
      await storeUserData(userData);
      
      // Vérifier le statut après rafraîchissement
      if (userData.status === 'pending_verification') {
        const currentPath = segments[0] === '(auth)' ? segments[1] : null;
        if (currentPath !== 'submit-documents' && currentPath !== 'verify-phone') {
          router.replace('/(auth)/submit-documents');
        }
      }
    } catch (error: any) {
      // Si erreur d'autorisation, déconnecter
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403') || error.message === 'not_authenticated')) {
        await logout();
        return;
      }
      
      // Sinon, utiliser les données stockées
      const storedUser = await getUserData<User>();
      if (storedUser) {
        // Vérifier si le compte stocké est désactivé
        const { checkAndHandleAccountDeactivation } = await import('@/utils/accountDeactivationHandler');
        const isDeactivated = await checkAndHandleAccountDeactivation(null, storedUser);
        if (isDeactivated) {
          setUser(null);
          return;
        }
        
        setUser(storedUser);
        
        // Vérifier le statut même avec les données stockées
        if (storedUser.status === 'pending_verification') {
          const currentPath = segments[0] === '(auth)' ? segments[1] : null;
          if (currentPath !== 'submit-documents' && currentPath !== 'verify-phone') {
            router.replace('/(auth)/submit-documents');
          }
        }
      } else {
        await logout();
      }
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await authService.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<void> => {
    try {
      await authService.resetPassword(token, password);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useMobileAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useMobileAuth must be used within a MobileAuthProvider');
  }
  return context;
}