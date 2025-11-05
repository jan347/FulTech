'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { syncOfflineData } from '@/lib/offline/sync';

interface AppContextType {
  isOnline: boolean;
  syncStatus: 'synced' | 'syncing' | 'pending';
}

const AppContext = createContext<AppContextType>({
  isOnline: true,
  syncStatus: 'synced',
});

export function useApp() {
  return useContext(AppContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'pending'>('synced');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      await syncOfflineData();
      setSyncStatus('synced');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('pending');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync check
    if (navigator.onLine) {
      syncOfflineData().then(() => setSyncStatus('synced'));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider value={{ isOnline, syncStatus }}>
      {children}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center text-sm z-50">
          Offline Mode - Changes will sync when connection is restored
        </div>
      )}
    </AppContext.Provider>
  );
}

