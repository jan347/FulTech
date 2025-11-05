import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Job, Customer, Employee, CostEntry, RevenueEntry } from '@/types/database';

interface ElectrotechDB extends DBSchema {
  jobs: {
    key: string;
    value: Job;
    indexes: { 'by-date': string; 'by-status': string };
  };
  customers: {
    key: string;
    value: Customer;
  };
  employees: {
    key: string;
    value: Employee;
  };
  costs: {
    key: string;
    value: CostEntry;
    indexes: { 'by-job': string; 'by-date': string };
  };
  revenue: {
    key: string;
    value: RevenueEntry;
    indexes: { 'by-job': string; 'by-date': string };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      table: string;
      action: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<ElectrotechDB>>;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ElectrotechDB>('electrotech-db', 1, {
      upgrade(db) {
        // Jobs store
        const jobsStore = db.createObjectStore('jobs', { keyPath: 'id' });
        jobsStore.createIndex('by-date', 'scheduled_start');
        jobsStore.createIndex('by-status', 'status');

        // Customers store
        db.createObjectStore('customers', { keyPath: 'id' });

        // Employees store
        db.createObjectStore('employees', { keyPath: 'id' });

        // Costs store
        const costsStore = db.createObjectStore('costs', { keyPath: 'id' });
        costsStore.createIndex('by-job', 'job_id');
        costsStore.createIndex('by-date', 'date');

        // Revenue store
        const revenueStore = db.createObjectStore('revenue', { keyPath: 'id' });
        revenueStore.createIndex('by-job', 'job_id');
        revenueStore.createIndex('by-date', 'date');

        // Sync queue store
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

// Offline data operations
export async function saveJobOffline(job: Job) {
  const db = await getDB();
  await db.put('jobs', job);
}

export async function getJobsOffline() {
  const db = await getDB();
  return db.getAll('jobs');
}

export async function saveCustomerOffline(customer: Customer) {
  const db = await getDB();
  await db.put('customers', customer);
}

export async function getCustomersOffline() {
  const db = await getDB();
  return db.getAll('customers');
}

export async function saveEmployeeOffline(employee: Employee) {
  const db = await getDB();
  await db.put('employees', employee);
}

export async function getEmployeesOffline() {
  const db = await getDB();
  return db.getAll('employees');
}

export async function saveCostOffline(cost: CostEntry) {
  const db = await getDB();
  await db.put('costs', cost);
}

export async function getCostsOffline() {
  const db = await getDB();
  return db.getAll('costs');
}

export async function saveRevenueOffline(revenue: RevenueEntry) {
  const db = await getDB();
  await db.put('revenue', revenue);
}

export async function getRevenueOffline() {
  const db = await getDB();
  return db.getAll('revenue');
}

// Queue operations for sync
export async function addToSyncQueue(table: string, action: 'create' | 'update' | 'delete', data: any) {
  const db = await getDB();
  const id = `${table}-${Date.now()}-${Math.random()}`;
  await db.put('syncQueue', {
    id,
    table,
    action,
    data,
    timestamp: Date.now(),
  });
}

export async function getSyncQueue() {
  const db = await getDB();
  return db.getAll('syncQueue');
}

export async function removeFromSyncQueue(id: string) {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

