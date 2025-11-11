import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { MobileUser } from './mobile-types';
import { authApi, setAuthToken, removeAuthToken } from '../services/api-client';
import { toast } from 'sonner@2.0.3';

interface MobileAuthContextType {
  user: MobileUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<MobileUser>) => Promise<void>;
  updateWalletBalance: (amount: number) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  language: 'fr' | 'en';
}

const MobileAuthContext = createContext<MobileAuthContextType | undefined>(undefined);

export function MobileAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = () => {
      const savedUser = localStorage.getItem('freebike_mobile_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser({
            ...userData,
            createdAt: new Date(userData.createdAt),
          });
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('freebike_mobile_user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      // Save token
      setAuthToken(response.data.token);

      // Map backend user to MobileUser
      const userData = response.data.user;
      const mappedUser: MobileUser = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName || userData.first_name,
        lastName: userData.lastName || userData.last_name,
        phone: userData.phone,
        language: userData.language || 'fr',
        wallet: {
          balance: userData.wallet?.balance || 0,
          currency: 'FCFA',
        },
        verificationStatus: {
          email: userData.emailVerified || userData.email_verified || false,
          phone: userData.phoneVerified || userData.phone_verified || false,
          identity: userData.identityVerified || userData.identity_verified || false,
        },
        createdAt: new Date(userData.createdAt || userData.created_at),
      };

      setUser(mappedUser);
      localStorage.setItem('freebike_mobile_user', JSON.stringify(mappedUser));
      
      toast.success(
        mappedUser.language === 'fr' ? 'Connexion réussie' : 'Login successful'
      );
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Registration failed');
      }

      // Save token
      setAuthToken(response.data.token);

      // Map backend user to MobileUser
      const userData = response.data.user;
      const mappedUser: MobileUser = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName || userData.first_name,
        lastName: userData.lastName || userData.last_name,
        phone: userData.phone,
        language: data.language,
        wallet: {
          balance: 0,
          currency: 'FCFA',
        },
        verificationStatus: {
          email: false,
          phone: false,
          identity: false,
        },
        createdAt: new Date(),
      };

      setUser(mappedUser);
      localStorage.setItem('freebike_mobile_user', JSON.stringify(mappedUser));
      
      toast.success(
        data.language === 'fr' 
          ? 'Inscription réussie ! Vérifiez votre email.' 
          : 'Registration successful! Check your email.'
      );
    } catch (error) {
      toast.error(
        data.language === 'fr'
          ? 'Erreur lors de l\'inscription'
          : 'Registration error'
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    localStorage.removeItem('freebike_mobile_user');
  };

  const updateProfile = async (data: Partial<MobileUser>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('freebike_mobile_user', JSON.stringify(updatedUser));
  };

  const updateWalletBalance = (amount: number) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      wallet: {
        ...user.wallet,
        balance: user.wallet.balance + amount,
      },
    };
    setUser(updatedUser);
    localStorage.setItem('freebike_mobile_user', JSON.stringify(updatedUser));
  };

  return (
    <MobileAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updateWalletBalance,
      }}
    >
      {children}
    </MobileAuthContext.Provider>
  );
}

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);
  if (context === undefined) {
    throw new Error('useMobileAuth must be used within a MobileAuthProvider');
  }
  return context;
}
