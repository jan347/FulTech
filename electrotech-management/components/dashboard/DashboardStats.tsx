'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalRevenue: 0,
    totalCosts: 0,
    employees: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch active jobs
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('id')
          .in('status', ['scheduled', 'in_progress']);

        // Fetch revenue entries
        const { data: revenueData } = await supabase
          .from('revenue_entries')
          .select('amount');

        // Fetch cost entries
        const { data: costData } = await supabase
          .from('cost_entries')
          .select('amount');

        // Fetch active employees
        const { data: employeesData } = await supabase
          .from('employees')
          .select('id')
          .eq('status', 'active');

        const activeJobs = jobsData?.length || 0;
        const totalRevenue = revenueData?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
        const totalCosts = costData?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
        const employees = employeesData?.length || 0;

        setStats({
          activeJobs,
          totalRevenue,
          totalCosts,
          employees,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const profit = stats.totalRevenue - stats.totalCosts;

  const statCards = [
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Total Costs',
      value: formatCurrency(stats.totalCosts),
      icon: TrendingUp,
      color: 'bg-red-500',
    },
    {
      title: 'Profit',
      value: formatCurrency(profit),
      icon: DollarSign,
      color: profit >= 0 ? 'bg-green-500' : 'bg-red-500',
    },
    {
      title: 'Active Employees',
      value: stats.employees,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-full`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

