// hooks/useUserData.ts
import { useState, useEffect } from 'react';
import { getUserData, storeUserData } from '@/utils/storage';
import { User } from '@/services/authService';

export function useUserData() {
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    loadStoredUserData();
  }, []);

  const loadStoredUserData = async () => {
    try {
      const storedUser = await getUserData<User>();
      setUserData(storedUser);
    } catch (error) {
      console.error('Error loading stored user data:', error);
    }
  };

  const updateStoredUserData = async (user: User) => {
    try {
      await storeUserData(user);
      setUserData(user);
    } catch (error) {
      console.error('Error updating stored user data:', error);
    }
  };

  return {
    userData,
    updateStoredUserData,
    refresh: loadStoredUserData,
  };
}