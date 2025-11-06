import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.d';

export const createServerClient = () => {
  // Check if we have valid environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build or if env vars are missing, return a basic client
  if (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    !supabaseUrl ||
    !supabaseAnonKey
  ) {
    // Return a client with valid URL format even if it's not functional
    return createClient<Database>(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'
    );
  }

  // At runtime, use the proper server component client with cookies
  return createServerComponentClient<Database>({ cookies });
};
