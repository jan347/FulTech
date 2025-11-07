-- Bank Statements and Transactions Schema
-- This allows uploading bank statements and automatically tracking costs/revenue

-- Bank statements table (stores uploaded statement files)
CREATE TABLE IF NOT EXISTS public.bank_statements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  statement_date_from DATE,
  statement_date_to DATE,
  uploaded_by UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  total_transactions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank transactions table (stores individual transaction entries from statements)
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  statement_id UUID REFERENCES public.bank_statements(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  category TEXT CHECK (category IN ('revenue', 'labor', 'materials', 'equipment', 'travel', 'utilities', 'rent', 'other_expense', 'uncategorized')),
  is_business BOOLEAN DEFAULT true,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bank_statements_uploaded_by ON public.bank_statements(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_bank_statements_status ON public.bank_statements(status);
CREATE INDEX IF NOT EXISTS idx_bank_statements_statement_date ON public.bank_statements(statement_date_from, statement_date_to);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_statement_id ON public.bank_transactions(statement_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_category ON public.bank_transactions(category);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_job_id ON public.bank_transactions(job_id);

-- Create triggers for updated_at
CREATE TRIGGER update_bank_statements_updated_at BEFORE UPDATE ON public.bank_statements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_transactions_updated_at BEFORE UPDATE ON public.bank_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

-- Bank Statements: Authenticated users can view, management can upload/manage
CREATE POLICY "Authenticated users can view bank statements" ON public.bank_statements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Management can upload bank statements" ON public.bank_statements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

CREATE POLICY "Management can update bank statements" ON public.bank_statements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

CREATE POLICY "Management can delete bank statements" ON public.bank_statements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

-- Bank Transactions: Authenticated users can view, management can manage
CREATE POLICY "Authenticated users can view bank transactions" ON public.bank_transactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Management can manage bank transactions" ON public.bank_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'management'
    )
  );

-- Create a view for financial summary from bank transactions
CREATE OR REPLACE VIEW public.bank_transaction_summary AS
SELECT
  DATE_TRUNC('month', transaction_date) AS month,
  category,
  transaction_type,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_amount
FROM public.bank_transactions
WHERE is_business = true
GROUP BY DATE_TRUNC('month', transaction_date), category, transaction_type
ORDER BY month DESC, category;

-- Grant access to the view
GRANT SELECT ON public.bank_transaction_summary TO authenticated;
