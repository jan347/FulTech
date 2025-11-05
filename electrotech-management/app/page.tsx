import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const supabase = createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    // If there's an error or no session, redirect to login
    if (error || !session) {
      redirect('/login');
    }

    redirect('/dashboard');
  } catch (error) {
    // If Supabase initialization fails, redirect to login
    console.error('Error initializing Supabase:', error);
    redirect('/login');
  }
}

