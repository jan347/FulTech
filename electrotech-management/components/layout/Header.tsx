'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/app/providers';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const supabase = createClient();
  const { isOnline, syncStatus } = useApp();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <div className="flex items-center space-x-4">
          {!isOnline && (
            <div className="flex items-center text-yellow-600">
              <WifiOff className="h-5 w-5 mr-1" />
              <span className="text-sm">Offline</span>
            </div>
          )}
          {isOnline && syncStatus === 'syncing' && (
            <div className="flex items-center text-blue-600">
              <Loader2 className="h-5 w-5 mr-1 animate-spin" />
              <span className="text-sm">Syncing...</span>
            </div>
          )}
          {isOnline && syncStatus === 'synced' && (
            <div className="flex items-center text-green-600">
              <Wifi className="h-5 w-5 mr-1" />
              <span className="text-sm">Online</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

