# Bank Statement Upload - Setup Guide

## Overview
This feature allows you to upload bank statements in CSV format and automatically track costs and revenue for your electrotechnical business.

## Setup Steps

### 1. Run Database Migration

In your Supabase Dashboard:

1. Go to **SQL Editor**
2. Open the file: `electrotech-management/supabase/migrations/002_bank_statements.sql`
3. Copy all the SQL code
4. Paste it into the SQL Editor
5. Click **Run**

This will create:
- `bank_statements` table (stores uploaded files)
- `bank_transactions` table (stores individual transactions)
- `bank_transaction_summary` view (for financial reporting)
- Row Level Security policies
- Indexes for performance

### 2. Create Storage Bucket (Optional)

The API will automatically create the storage bucket when you upload your first file, but you can create it manually:

1. Go to **Storage** in Supabase Dashboard
2. Click **Create bucket**
3. Name: `bank-statements`
4. Make it **Private** (not public)
5. Click **Create**

### 3. Deploy to Vercel

Push your changes:

```bash
git push
```

Vercel will automatically deploy the new features.

---

## How to Use

### Uploading Bank Statements

1. **Navigate to Bank Statements page** (sidebar menu)
2. **Optional:** Enter bank name and account number
3. **Upload CSV file** by:
   - Dragging and dropping the file, OR
   - Clicking "Select File" to browse

### CSV Format Requirements

Your bank statement CSV must include:

**Required Columns:**
- `Date` (or `Datum`) - Transaction date
- `Description` (or `Details`, `Omschrijving`, `Naam`) - Transaction description

**Amount Columns (choose one):**
- **Option A:** Single `Amount` column (positive = credit, negative = debit)
- **Option B:** Separate `Debit` and `Credit` columns

**Supported Date Formats:**
- ISO: `2024-01-15`
- European: `15-01-2024` or `15/01/2024`
- US: `01/15/2024`

### Example CSV Format

```csv
Date,Description,Debit,Credit,Balance
2024-01-15,Customer Payment - Invoice #123,,5000.00,15000.00
2024-01-16,Electrical Supplies Store,250.50,,14749.50
2024-01-17,Employee Salary - John Doe,3000.00,,11749.50
2024-01-18,Fuel - Company Van,75.00,,11674.50
```

---

## Features

### Auto-Categorization

Transactions are automatically categorized based on description keywords:

| Category | Keywords |
|----------|----------|
| **Revenue** | payment received, invoice, customer |
| **Labor** | salary, payroll, wage |
| **Materials** | supplier, materials, hardware, electrical, cable |
| **Equipment** | equipment, tool, machinery |
| **Travel** | fuel, gas, petrol, parking, toll |
| **Utilities** | electric, water, gas, internet, phone |
| **Rent** | rent, lease |
| **Other** | Everything else → "uncategorized" |

### Bank Transactions Page

View and analyze all imported transactions:

- **Summary Cards:** Total revenue, expenses, and net profit
- **Filters:** By type (all/revenue/expenses) and category
- **Color-coded categories** for easy identification
- **Transaction details** with dates and descriptions

---

## Navigation

Two new pages have been added to your dashboard:

1. **Bank Statements** - Upload and manage statement files
2. **Transactions** - View and filter imported transactions

---

## Security

- **Management role required** to upload bank statements
- **All authenticated users** can view transactions
- **Row Level Security (RLS)** enforced on all tables
- **Files stored securely** in Supabase Storage (private bucket)

---

## Supported Banks

The CSV parser supports common formats from:
- Most US banks (Chase, Bank of America, Wells Fargo, etc.)
- European banks with standard CSV exports
- Any bank that exports to CSV with date and description columns

---

## Troubleshooting

### "Failed to parse CSV" Error

**Check your CSV file:**
1. Must have a header row with column names
2. Must include `Date` and `Description` columns
3. Must include amount information (Amount OR Debit/Credit columns)

### "Only management can upload" Error

**Solution:** Ensure you're logged in with a management role account.

### No transactions appearing

**Solution:** Check the bank statement status on the Bank Statements page. If status is "error", the CSV format may be incorrect.

---

## Next Steps

After uploading bank statements, you can:

1. **Review auto-categorization** - Verify transactions are categorized correctly
2. **Link to jobs** - Associate revenue with specific jobs (future enhancement)
3. **Export reports** - Use transaction data for financial reporting
4. **Track trends** - Monitor revenue and expenses over time

---

## Example Workflow

1. **Export monthly statement** from your bank as CSV
2. **Upload to Bank Statements page**
3. **Review transactions** on Transactions page
4. **Filter by category** to analyze spending
5. **Track net profit** using summary cards
6. **Compare months** by uploading multiple statements

This automation saves hours of manual data entry and provides instant financial insights! 📊
