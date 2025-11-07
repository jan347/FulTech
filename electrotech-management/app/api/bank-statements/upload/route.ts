import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parseCSVStatement, categorizeTransaction } from '@/lib/parsers/bankStatement';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is management
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (user?.role !== 'management') {
      return NextResponse.json(
        { error: 'Only management can upload bank statements' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bankName = formData.get('bankName') as string;
    const accountNumber = formData.get('accountNumber') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV
    let parsedStatement;
    try {
      parsedStatement = parseCSVStatement(fileContent);
    } catch (parseError: any) {
      return NextResponse.json(
        { error: `Failed to parse CSV: ${parseError.message}` },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('bank-statements')
      .upload(fileName, file);

    if (uploadError) {
      // Create bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage.createBucket('bank-statements', {
        public: false,
      });

      if (!bucketError) {
        // Retry upload
        const { data: retryUpload, error: retryError } = await supabase.storage
          .from('bank-statements')
          .upload(fileName, file);

        if (retryError) {
          return NextResponse.json(
            { error: `Failed to upload file: ${retryError.message}` },
            { status: 500 }
          );
        }
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('bank-statements')
      .getPublicUrl(fileName);

    // Create bank statement record
    const { data: statement, error: statementError } = await supabase
      .from('bank_statements')
      .insert({
        file_name: file.name,
        file_url: urlData.publicUrl,
        bank_name: bankName || null,
        account_number: accountNumber || null,
        statement_date_from: parsedStatement.dateFrom,
        statement_date_to: parsedStatement.dateTo,
        uploaded_by: session.user.id,
        status: 'processing',
        total_transactions: parsedStatement.transactions.length,
      })
      .select()
      .single();

    if (statementError) {
      return NextResponse.json(
        { error: `Failed to create statement record: ${statementError.message}` },
        { status: 500 }
      );
    }

    // Insert transactions
    const transactionsToInsert = parsedStatement.transactions.map((tx) => ({
      statement_id: statement.id,
      transaction_date: tx.date,
      description: tx.description,
      amount: tx.amount,
      transaction_type: tx.type,
      category: categorizeTransaction(tx.description),
      is_business: true,
    }));

    const { error: transactionsError } = await supabase
      .from('bank_transactions')
      .insert(transactionsToInsert);

    if (transactionsError) {
      // Update statement status to error
      await supabase
        .from('bank_statements')
        .update({ status: 'error' })
        .eq('id', statement.id);

      return NextResponse.json(
        { error: `Failed to insert transactions: ${transactionsError.message}` },
        { status: 500 }
      );
    }

    // Update statement status to completed
    await supabase
      .from('bank_statements')
      .update({ status: 'completed' })
      .eq('id', statement.id);

    return NextResponse.json({
      success: true,
      statement: {
        id: statement.id,
        fileName: file.name,
        transactionCount: parsedStatement.transactions.length,
        dateFrom: parsedStatement.dateFrom,
        dateTo: parsedStatement.dateTo,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
