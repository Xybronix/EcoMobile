import { useEffect, useState } from 'react';
import { internetService } from '@/lib/internetService';

export function useInternet() {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = internetService.subscribe((connected: boolean) => {
      setIsConnected(connected);
    });

    // Vérifier l'état initial
    internetService.checkConnection();

    return unsubscribe;
  }, []);

  return {
    isConnected,
    requireConnection: internetService.requireConnection.bind(internetService),
    checkConnection: internetService.checkConnection.bind(internetService)
  };
}