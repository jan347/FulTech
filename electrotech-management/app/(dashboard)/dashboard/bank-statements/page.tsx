'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface BankStatement {
  id: string;
  file_name: string;
  bank_name: string | null;
  account_number: string | null;
  statement_date_from: string | null;
  statement_date_to: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  total_transactions: number;
  created_at: string;
}

export default function BankStatementsPage() {
  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const supabase = createClient();

  // Form state
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    fetchStatements();
  }, []);

  const fetchStatements = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bank_statements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStatements(data || []);
    } catch (error) {
      console.error('Error fetching statements:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, [bankName, accountNumber]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bankName', bankName);
      formData.append('accountNumber', accountNumber);

      setUploadProgress('Processing transactions...');

      const response = await fetch('/api/bank-statements/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadProgress('Upload completed!');
      alert(`Success! Processed ${result.statement.transactionCount} transactions`);

      // Reset form
      setBankName('');
      setAccountNumber('');

      // Refresh statements list
      await fetchStatements();
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const getStatusIcon = (status: BankStatement['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: BankStatement['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bank Statements</h1>
        <p className="mt-1 text-sm text-gray-500">Upload and manage bank statements</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Bank Statement</h2>

        {/* Bank Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name (Optional)
            </label>
            <input
              type="text"
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Chase, Wells Fargo"
            />
          </div>
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Account Number (Optional)
            </label>
            <input
              type="text"
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Last 4 digits"
            />
          </div>
        </div>

        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drag and drop your bank statement
          </p>
          <p className="text-sm text-gray-500 mb-4">or click to browse (CSV files only)</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <span className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors">
              {uploading ? uploadProgress : 'Select File'}
            </span>
          </label>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium mb-2">CSV Format Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Must include columns: Date, Description</li>
            <li>Include either: Amount column OR separate Debit/Credit columns</li>
            <li>Supports common formats from major banks</li>
          </ul>
        </div>
      </div>

      {/* Statements List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Uploaded Statements</h2>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : statements.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No statements uploaded yet. Upload your first statement to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {statements.map((statement) => (
              <div key={statement.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <FileText className="h-10 w-10 text-primary-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{statement.file_name}</h3>
                      <div className="mt-1 space-y-1 text-sm text-gray-600">
                        {statement.bank_name && (
                          <p>
                            <span className="font-medium">Bank:</span> {statement.bank_name}
                          </p>
                        )}
                        {statement.account_number && (
                          <p>
                            <span className="font-medium">Account:</span> ****{statement.account_number}
                          </p>
                        )}
                        {statement.statement_date_from && statement.statement_date_to && (
                          <p>
                            <span className="font-medium">Period:</span>{' '}
                            {formatDate(statement.statement_date_from)} -{' '}
                            {formatDate(statement.statement_date_to)}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Transactions:</span> {statement.total_transactions}
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded {formatDate(statement.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(statement.status)}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          statement.status
                        )}`}
                      >
                        {statement.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
