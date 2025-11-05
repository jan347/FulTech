import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      redirect('/login');
    }
  } catch (error) {
    // If Supabase initialization fails, redirect to login
    console.error('Error in dashboard layout:', error);
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

