'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { addToSyncQueue, saveJobOffline } from '@/lib/offline/db';
import { useApp } from '@/app/providers';

export default function NewJobPage() {
  const router = useRouter();
  const supabase = createClient();
  const { isOnline } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    description: '',
    scheduled_start: '',
    scheduled_end: '',
    location_address: '',
    estimated_cost: '',
  });

  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCustomers() {
      const { data } = await supabase.from('customers').select('id, name').order('name', { ascending: true });
      setCustomers(data || []);
    }
    fetchCustomers();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const jobData = {
        ...formData,
        customer_id: formData.customer_id,
        scheduled_start: formData.scheduled_start,
        scheduled_end: formData.scheduled_end || null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        status: 'scheduled',
        created_by: user?.id || '',
      };

      if (isOnline) {
        const { data, error } = await supabase.from('jobs').insert(jobData).select().single();
        if (error) throw error;
        router.push(`/dashboard/jobs/${data.id}`);
      } else {
        // Offline mode
        const tempId = `temp-${Date.now()}`;
        await saveJobOffline({ ...jobData, id: tempId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any);
        await addToSyncQueue('jobs', 'create', jobData);
        router.push('/dashboard/jobs');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Job</h1>
        <p className="mt-1 text-sm text-gray-500">Schedule a new electrical job</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-2">
            Customer *
          </label>
          <select
            id="customer_id"
            required
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Electrical Panel Upgrade"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Job details and requirements..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="scheduled_start" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              id="scheduled_start"
              required
              value={formData.scheduled_start}
              onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="scheduled_end" className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              id="scheduled_end"
              value={formData.scheduled_end}
              onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location_address" className="block text-sm font-medium text-gray-700 mb-2">
            Location Address
          </label>
          <input
            type="text"
            id="location_address"
            value={formData.location_address}
            onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="123 Main St, City, State ZIP"
          />
        </div>

        <div>
          <label htmlFor="estimated_cost" className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Cost
          </label>
          <input
            type="number"
            step="0.01"
            id="estimated_cost"
            value={formData.estimated_cost}
            onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="0.00"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  );
}

