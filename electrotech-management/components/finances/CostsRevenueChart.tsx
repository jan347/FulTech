'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export default function CostsRevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

        // Fetch costs
        const { data: costData } = await supabase
          .from('cost_entries')
          .select('date, amount')
          .gte('date', thirtyDaysAgo);

        // Fetch revenue
        const { data: revenueData } = await supabase
          .from('revenue_entries')
          .select('date, amount')
          .gte('date', thirtyDaysAgo);

        // Group by date
        const days = eachDayOfInterval({
          start: subDays(new Date(), 30),
          end: new Date(),
        });

        const chartData = days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayLabel = format(day, 'MMM dd');

          const dayCosts = costData?.filter((c) => c.date === dateStr).reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
          const dayRevenue = revenueData?.filter((r) => r.date === dateStr).reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

          return {
            date: dayLabel,
            costs: dayCosts,
            revenue: dayRevenue,
            profit: dayRevenue - dayCosts,
          };
        });

        setData(chartData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Costs vs Revenue (Last 30 Days)</h2>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Costs vs Revenue (Last 30 Days)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
          <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} name="Costs" />
          <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Profit" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

