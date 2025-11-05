import { createClient } from '@/lib/supabase/client';
import { getSyncQueue, removeFromSyncQueue } from './db';

export async function syncOfflineData() {
  if (typeof window === 'undefined') return;
  
  if (!navigator.onLine) {
    console.log('Offline - skipping sync');
    return;
  }

  const supabase = createClient();
  const queue = await getSyncQueue();

  for (const item of queue) {
    try {
      const { table, action, data } = item;
      let result;

      switch (action) {
        case 'create':
          result = await supabase.from(table).insert(data).select();
          break;
        case 'update':
          result = await supabase.from(table).update(data).eq('id', data.id).select();
          break;
        case 'delete':
          result = await supabase.from(table).delete().eq('id', data.id);
          break;
      }

      if (result && !result.error) {
        await removeFromSyncQueue(item.id);
      }
    } catch (error) {
      console.error(`Failed to sync ${item.table} ${item.action}:`, error);
    }
  }
}

// Call sync when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineData);
}

