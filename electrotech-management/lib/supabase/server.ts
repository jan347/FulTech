import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.d';

export const createServerClient = () => {
  // During build, we need to avoid calling cookies() which can hang
  // Since we're using force-dynamic, pages won't be prerendered, but
  // Next.js still analyzes the code during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Use a direct Supabase client during build to avoid cookie access
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    );
  }

  // At runtime, use the proper server component client with cookies
  return createServerComponentClient<Database>({ cookies });
};
