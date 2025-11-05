'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import CostsRevenueChart from '@/components/finances/CostsRevenueChart';
import RecentTransactions from '@/components/finances/RecentTransactions';

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'costs' | 'revenue'>('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Costs & Revenue</h1>
        <p className="mt-1 text-sm text-gray-500">Track your financial performance</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4 border-b border-gray-200">
          {(['overview', 'costs', 'revenue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            <CostsRevenueChart />
            <RecentTransactions />
          </>
        )}
        {activeTab === 'costs' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Cost Management</h2>
            <p className="text-gray-500">Cost entry form and list will go here</p>
          </div>
        )}
        {activeTab === 'revenue' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Tracking</h2>
            <p className="text-gray-500">Revenue entry form and list will go here</p>
          </div>
        )}
      </div>
    </div>
  );
}

