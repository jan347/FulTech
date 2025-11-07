// Bank Statement Parser
// Supports CSV format from common banks

export interface ParsedTransaction {
  date: string; // ISO date string
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

export interface ParsedStatement {
  transactions: ParsedTransaction[];
  accountNumber?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Parse CSV bank statement
 * Supports common formats with columns: Date, Description, Debit, Credit, Balance
 */
export function parseCSVStatement(csvContent: string): ParsedStatement {
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }

  // Get header row (first non-empty line)
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());

  // Find column indexes
  const dateIndex = header.findIndex(h => h.includes('date') || h.includes('datum'));
  const descIndex = header.findIndex(h =>
    h.includes('description') || h.includes('details') || h.includes('omschrijving') || h.includes('naam')
  );
  const debitIndex = header.findIndex(h => h.includes('debit') || h.includes('af') || h.includes('withdrawal'));
  const creditIndex = header.findIndex(h => h.includes('credit') || h.includes('bij') || h.includes('deposit'));
  const amountIndex = header.findIndex(h => h.includes('amount') || h.includes('bedrag'));

  if (dateIndex === -1 || descIndex === -1) {
    throw new Error('Invalid CSV format: Missing required columns (Date, Description)');
  }

  const transactions: ParsedTransaction[] = [];
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV with quoted values
    const values = parseCSVLine(line);

    if (values.length <= Math.max(dateIndex, descIndex)) continue;

    const dateStr = values[dateIndex]?.trim();
    const description = values[descIndex]?.trim();

    if (!dateStr || !description) continue;

    // Parse date (supports multiple formats)
    const date = parseDate(dateStr);
    if (!date) continue;

    // Update date range
    if (!minDate || date < minDate) minDate = date;
    if (!maxDate || date > maxDate) maxDate = date;

    // Parse amount
    let amount = 0;
    let type: 'debit' | 'credit' = 'debit';

    if (amountIndex !== -1 && values[amountIndex]) {
      // Single amount column (positive = credit, negative = debit)
      const amountStr = values[amountIndex].replace(/[^\d.,-]/g, '').replace(',', '.');
      amount = Math.abs(parseFloat(amountStr) || 0);
      type = parseFloat(amountStr) >= 0 ? 'credit' : 'debit';
    } else if (debitIndex !== -1 && creditIndex !== -1) {
      // Separate debit/credit columns
      const debitStr = values[debitIndex]?.replace(/[^\d.,-]/g, '').replace(',', '.') || '0';
      const creditStr = values[creditIndex]?.replace(/[^\d.,-]/g, '').replace(',', '.') || '0';

      const debitAmount = parseFloat(debitStr) || 0;
      const creditAmount = parseFloat(creditStr) || 0;

      if (debitAmount > 0) {
        amount = debitAmount;
        type = 'debit';
      } else if (creditAmount > 0) {
        amount = creditAmount;
        type = 'credit';
      }
    }

    if (amount === 0) continue;

    transactions.push({
      date: date.toISOString().split('T')[0],
      description,
      amount,
      type,
    });
  }

  return {
    transactions,
    dateFrom: minDate?.toISOString().split('T')[0],
    dateTo: maxDate?.toISOString().split('T')[0],
  };
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): Date | null {
  // Try ISO format first (YYYY-MM-DD)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;

  // Try European format (DD-MM-YYYY or DD/MM/YYYY)
  const europeanMatch = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (europeanMatch) {
    const [, day, month, year] = europeanMatch;
    date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(date.getTime())) return date;
  }

  // Try US format (MM/DD/YYYY)
  const usMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

/**
 * Auto-categorize transaction based on description
 */
export function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();

  // Revenue patterns
  if (desc.includes('payment received') || desc.includes('invoice') || desc.includes('customer')) {
    return 'revenue';
  }

  // Labor/payroll patterns
  if (desc.includes('salary') || desc.includes('payroll') || desc.includes('wage')) {
    return 'labor';
  }

  // Materials patterns
  if (desc.includes('supplier') || desc.includes('materials') || desc.includes('hardware') ||
      desc.includes('electrical') || desc.includes('cable') || desc.includes('wire')) {
    return 'materials';
  }

  // Equipment patterns
  if (desc.includes('equipment') || desc.includes('tool') || desc.includes('machinery')) {
    return 'equipment';
  }

  // Travel patterns
  if (desc.includes('fuel') || desc.includes('gas') || desc.includes('petrol') ||
      desc.includes('parking') || desc.includes('toll')) {
    return 'travel';
  }

  // Utilities patterns
  if (desc.includes('electric') || desc.includes('water') || desc.includes('gas') ||
      desc.includes('internet') || desc.includes('phone')) {
    return 'utilities';
  }

  // Rent patterns
  if (desc.includes('rent') || desc.includes('lease')) {
    return 'rent';
  }

  return 'uncategorized';
}
