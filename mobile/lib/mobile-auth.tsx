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
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inIndexGroup = !segments[0];
    const isAuthRoute = inAuthGroup && segments[1] && ['login', 'register', 'forgot-password', 'reset-password', 'welcome', 'verify-phone', 'submit-documents'].includes(segments[1]);
    const isDocumentRoute = inAuthGroup && segments[1] === 'submit-documents';
    const isPhoneVerificationRoute = inAuthGroup && segments[1] === 'verify-phone';

    if (!isLoading) {
      if (user && (inAuthGroup || inIndexGroup)) {
        // If account is not verified, redirect to document submission
        if (user.status === 'pending_verification' && !isDocumentRoute && !isPhoneVerificationRoute) {
          router.replace('/(auth)/submit-documents');
        } else if (!isAuthRoute) {
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
          setUser(freshUserData);
        } catch (apiError) {
          console.warn('API unavailable, using stored user data:', apiError);
          const storedUser = await getUserData<User>();
          if (storedUser) {
            setUser(storedUser);
          } else {
            await authService.logout();
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const authenticated = await authService.isAuthenticated();
      
      if (authenticated) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (apiError) {
          const storedUser = await getUserData<User>();
          setUser(storedUser);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
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
      setUser(userData);
      
      await storeUserData(userData);
    } catch (error) {
      const storedUser = await getUserData<User>();
      if (storedUser) {
        setUser(storedUser);
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