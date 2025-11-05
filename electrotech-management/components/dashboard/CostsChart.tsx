'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function CostsChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCosts() {
      try {
        const { data: costData, error } = await supabase
          .from('cost_entries')
          .select('category, amount');

        if (error) {
          console.error('Error fetching costs:', error);
          setData([]);
          return;
        }

        const costDataToUse = costData || [];

        // Group by category
        const grouped = costDataToUse.reduce((acc: any, entry: any) => {
          const category = entry.category || 'other';
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += entry.amount || 0;
          return acc;
        }, {});

        const chartData = Object.entries(grouped).map(([category, amount]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          costs: amount,
        }));

        setData(chartData);
      } catch (error) {
        console.error('Error fetching costs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCosts();
  }, [supabase]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Costs by Category</h2>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Costs by Category</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Bar dataKey="costs" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

