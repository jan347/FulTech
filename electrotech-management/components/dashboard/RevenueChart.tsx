'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { format, subDays } from 'date-fns';

export default function RevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const { data: revenueData, error } = await supabase
          .from('revenue_entries')
          .select('date, amount')
          .gte('date', format(subDays(new Date(), 30), 'yyyy-MM-dd'))
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching revenue:', error);
          setData([]);
          return;
        }

        let revenueDataToUse = revenueData || [];

        // Filter last 30 days
        const thirtyDaysAgo = subDays(new Date(), 30);
        revenueDataToUse = revenueDataToUse.filter((entry: any) => {
          const entryDate = new Date(entry.date);
          return entryDate >= thirtyDaysAgo;
        });

        // Group by date
        const grouped = revenueDataToUse.reduce((acc: any, entry: any) => {
          const date = format(new Date(entry.date), 'MMM dd');
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += entry.amount || 0;
          return acc;
        }, {});

        const chartData = Object.entries(grouped).map(([date, amount]) => ({
          date,
          revenue: amount,
        }));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching revenue:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenue();
  }, [supabase]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue (Last 30 Days)</h2>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Revenue (Last 30 Days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

