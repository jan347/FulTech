import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

// Force dynamic rendering to prevent build-time errors when env vars are missing
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  redirect('/dashboard');
}

