'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import type { Employee } from '@/types/database';
import { Plus, UserCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*, users(full_name, email, phone, avatar_url)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your team members</p>
        </div>
        <Link
          href="/dashboard/employees/new"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Employee
        </Link>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No employees found.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {employees.map((employee) => {
              const user = employee.user as any;
              return (
                <Link
                  key={employee.id}
                  href={`/dashboard/employees/${employee.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="h-12 w-12 rounded-full" />
                        ) : (
                          <UserCircle className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user?.full_name || 'Unknown'}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          {user?.email && <span>{user.email}</span>}
                          {employee.employee_number && <span>#{employee.employee_number}</span>}
                          {employee.hourly_rate && (
                            <span>{formatCurrency(employee.hourly_rate)}/hr</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

