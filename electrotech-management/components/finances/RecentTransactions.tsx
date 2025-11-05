'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTransactions() {
      try {
        // Fetch recent costs
        const { data: costs } = await supabase
          .from('cost_entries')
          .select('*, jobs(title)')
          .order('date', { ascending: false })
          .limit(10);

        // Fetch recent revenue
        const { data: revenue } = await supabase
          .from('revenue_entries')
          .select('*, jobs(title)')
          .order('date', { ascending: false })
          .limit(10);

        // Combine and sort
        const all = [
          ...(costs || []).map((c) => ({ ...c, type: 'cost' as const })),
          ...(revenue || []).map((r) => ({ ...r, type: 'revenue' as const })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

        setTransactions(all);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [supabase]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No transactions found</div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'revenue' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'revenue' ? (
                    <ArrowUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.description || (transaction.jobs as any)?.title || 'Transaction'}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                </div>
              </div>
              <div className={`text-lg font-semibold ${
                transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'revenue' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

