'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserCircle, Mail, Phone } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          setUser({ ...authUser, ...data });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Your account information</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="h-20 w-20 rounded-full" />
            ) : (
              <UserCircle className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.full_name || 'User'}</h2>
            <p className="text-sm text-gray-500 capitalize">{user?.role || 'user'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{user?.email || 'Not set'}</p>
            </div>
          </div>

          {user?.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

