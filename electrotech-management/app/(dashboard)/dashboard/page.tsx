import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentJobs from '@/components/dashboard/RecentJobs';
import RevenueChart from '@/components/dashboard/RevenueChart';
import CostsChart from '@/components/dashboard/CostsChart';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your business operations</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <CostsChart />
      </div>

      <RecentJobs />
    </div>
  );
}

