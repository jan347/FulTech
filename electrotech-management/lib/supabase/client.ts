import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

let client: ReturnType<typeof createClientComponentClient> | null = null;

export const createClient = () => {
  // Lazy initialization - only create client when actually needed (at runtime)
  if (!client) {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
      // Return a mock client that will fail gracefully at runtime
      throw new Error('Supabase client not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }
    client = createClientComponentClient();
  }
  return client;
};
